"use server"; // บังคับทำงานบน Server เท่านั้น

import { prisma } from "../lib/prisma";

const parseSafeDate = (val: any) => {
  if (!val || String(val).trim() === "") return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

export async function searchVehicleByPlate(plate: string) {
  try {
    return await prisma.vehicle.findUnique({
      where: { plate: plate },
      include: { logs: { orderBy: { reportedAt: 'desc' } } }
    });
  } catch (error) {
    console.error("Database Error:", error);
    return null;
  }
}

// 🚀 ฟังก์ชันดึงสถิติภาพรวม + วิเคราะห์ข้อมูลแยกรายอู่/ศูนย์ซ่อม
export async function getDashboardStats() {
  try {
    const totalVehicles = await prisma.vehicle.count();
    const totalLogs = await prisma.maintenanceLog.count();
    
    const statusGroups = await prisma.maintenanceLog.groupBy({ by: ['status'], _count: { id: true } });
    const priorityGroups = await prisma.maintenanceLog.groupBy({ by: ['priority'], _count: { id: true } });
    const costAgg = await prisma.maintenanceLog.aggregate({ _sum: { cost: true } });

    // สถิติรายเดือนย้อนหลัง 6 เดือน
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentLogs = await prisma.maintenanceLog.findMany({
      where: { reportedAt: { gte: sixMonthsAgo } },
      select: { reportedAt: true, cost: true }
    });

    const monthlyMap = new Map();
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleString('th-TH', { month: 'short' });
      const yearLabel = d.getFullYear() + 543;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, { label: `${monthLabel} ${String(yearLabel).substring(2)}`, count: 0, cost: 0 });
    }

    for (const log of recentLogs) {
      if (!log.reportedAt) continue;
      const logDate = new Date(log.reportedAt);
      const key = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap.has(key)) {
        const current = monthlyMap.get(key);
        current.count += 1;
        current.cost += log.cost || 0;
        monthlyMap.set(key, current);
      }
    }
    const monthlyStats = Array.from(monthlyMap.values()).reverse();

    // ดึงข้อมูลประวัติทั้งหมดเพื่อนำมาคำนวณระดับประสิทธิภาพทั่วไปและคัดแยกตามอู่
    const allLogs = await prisma.maintenanceLog.findMany({
      select: { 
        id: true, status: true, priority: true, description: true, technicianName: true,
        reportedAt: true, assignedAt: true, startedAt: true, completedAt: true, dueDate: true, workshopName: true,
        vehicle: { select: { plate: true } }
      }
    });

    let totalCompleted = 0;
    let onTimeCompleted = 0;
    let totalResponseTimeMs = 0;
    let responseCount = 0;
    let totalRepairTimeMs = 0;
    let repairCount = 0;
    let overdueActiveCount = 0;
    
    const overdueTasks = [];
    const workshopMap = new Map(); // 🚀 Map สำหรับจัดกลุ่มตามชื่ออู่
    const now = new Date();

    for (const log of allLogs) {
      // 1. คำนวณภาพรวมระบบ
      if (log.status === 'completed' && log.completedAt) {
        totalCompleted++;
        if (log.dueDate && new Date(log.completedAt) <= new Date(log.dueDate)) {
          onTimeCompleted++;
        }
      }
      if (log.reportedAt && log.assignedAt) {
        const diff = new Date(log.assignedAt).getTime() - new Date(log.reportedAt).getTime();
        if (diff >= 0) { totalResponseTimeMs += diff; responseCount++; }
      }
      if (log.status === 'completed' && log.startedAt && log.completedAt) {
        const diff = new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime();
        if (diff >= 0) { totalRepairTimeMs += diff; repairCount++; }
      }
      if (log.status !== 'completed' && log.status !== 'cancelled' && log.dueDate) {
        if (now > new Date(log.dueDate)) { 
          overdueActiveCount++; 
          overdueTasks.push({
            id: log.id, plate: log.vehicle?.plate, description: log.description,
            technicianName: log.technicianName, status: log.status, priority: log.priority, dueDate: log.dueDate
          });
        }
      }

      // 🚀 2. คัดแยกและคำนวณสถิติละเอียดรายอู่/ศูนย์ซ่อม
      const rawWorkshop = log.workshopName ? log.workshopName.trim() : "";
      if (rawWorkshop !== "") { // นับเฉพาะข้อมูลที่มีระบุชื่ออู่ชัดเจน
        if (!workshopMap.has(rawWorkshop)) {
          workshopMap.set(rawWorkshop, {
            name: rawWorkshop,
            totalJobs: 0,
            completedOnTime: 0,   // ซ่อมสำเร็จทันกำหนด
            completedLate: 0,     // ซ่อมสำเร็จแต่ล่าช้ากว่ากำหนด
            inProgress: 0,         // กำลังซ่อมอยู่
            overdueActive: 0,     // งานค้างดองเค็มจนเลยกำหนดส่ง
            totalRepairTimeMs: 0,
            repairCount: 0
          });
        }

        const wStats = workshopMap.get(rawWorkshop);
        wStats.totalJobs++;

        if (log.status === 'completed') {
          if (log.dueDate && log.completedAt) {
            if (new Date(log.completedAt) <= new Date(log.dueDate)) {
              wStats.completedOnTime++;
            } else {
              wStats.completedLate++;
            }
          } else {
            wStats.completedOnTime++; // fallback
          }

          if (log.startedAt && log.completedAt) {
            const diff = new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime();
            if (diff >= 0) { wStats.totalRepairTimeMs += diff; wStats.repairCount++; }
          }
        } else if (log.status === 'in_progress') {
          wStats.inProgress++;
        }

        // งานคงค้างที่ดองเกินกำหนดส่งของอู่นั้นๆ
        if (log.status !== 'completed' && log.status !== 'cancelled' && log.dueDate) {
          if (now > new Date(log.dueDate)) {
            wStats.overdueActive++;
          }
        }
      }
    }

    overdueTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const avgResponseHours = responseCount > 0 ? (totalResponseTimeMs / (1000 * 60 * 60)) / responseCount : 0;
    const avgRepairHours = repairCount > 0 ? (totalRepairTimeMs / (1000 * 60 * 60)) / repairCount : 0;
    const onTimeRate = totalCompleted > 0 ? (onTimeCompleted / totalCompleted) * 100 : 0;

    // 🚀 แปลงโครงสร้างข้อมูลอู่เพื่อส่งออกไปวาดหน้า Dashboard รายอู่
    const workshopsData = Array.from(workshopMap.values()).map((w: any) => {
      const totalClosed = w.completedOnTime + w.completedLate;
      const efficiencyRate = totalClosed > 0 ? (w.completedOnTime / totalClosed) * 100 : 0;
      const avgRepairHoursW = w.repairCount > 0 ? (w.totalRepairTimeMs / (1000 * 60 * 60)) / w.repairCount : 0;

      return {
        name: w.name,
        totalJobs: w.totalJobs,
        successCount: w.completedOnTime, // สำเร็จ (ในเวลา)
        lateCount: w.completedLate + w.overdueActive, // ล่าช้า (ส่งเลท + ค้างเน่า)
        inProgressCount: w.inProgress, // กำลังซ่อมอยู่
        efficiencyRate: Math.round(efficiencyRate * 10) / 10, // ประสิทธิภาพ SLA อู่
        avgRepairHours: Math.round(avgRepairHoursW * 10) / 10  // ความเร็วเฉลี่ยในการซ่อม
      };
    });

    return {
      totalVehicles,
      totalLogs,
      statusCounts: statusGroups.map((s: any) => ({ status: s.status, count: s._count.id })),
      priorityCounts: priorityGroups.map((p: any) => ({ priority: p.priority, count: p._count.id })),
      totalCost: costAgg._sum.cost || 0,
      monthlyStats,
      efficiency: {
        onTimeRate: Math.round(onTimeRate * 10) / 10,
        avgResponseHours: Math.round(avgResponseHours * 10) / 10,
        avgRepairHours: Math.round(avgRepairHours * 10) / 10,
        overdueActiveCount
      },
      overdueTasks,
      workshopsData // 🚀 ส่งข้อมูลสรุปสถิติมัดรวมของแต่ละอู่ออกไป
    };
  } catch (error) {
    console.error("Stats Error:", error);
    return null;
  }
}

// ฟังก์ชันนำเข้าข้อมูล (เหมือนเดิม)
export async function importMaintenanceData(rows: any[]) {
  try {
    const cleanRows = rows.map(row => {
      const cleanRow: any = {};
      for (const key of Object.keys(row)) {
        const cleanKey = key.replace(/^\uFEFF/, '').trim();
        cleanRow[cleanKey] = row[key];
      }
      return cleanRow;
    });

    const validRows = cleanRows.filter(r => r.plate);
    if (validRows.length === 0) return { success: false, message: "ไม่พบข้อมูลรถในไฟล์" };

    const uniquePlates = [...new Set(validRows.map(r => String(r.plate).trim()))];
    let existingVehicles = await prisma.vehicle.findMany({ where: { plate: { in: uniquePlates } } });
    const existingPlates = new Set(existingVehicles.map((v: any) => v.plate));

    const vehiclesToCreate = [];
    const seenNewPlates = new Set(); 
    for (const row of validRows) {
      const plate = String(row.plate).trim();
      if (!existingPlates.has(plate) && !seenNewPlates.has(plate)) {
        vehiclesToCreate.push({
          plate: plate,
          brand: row.brand ? String(row.brand).trim() : null,
          model: row.model ? String(row.model).trim() : null,
        });
        seenNewPlates.add(plate);
      }
    }

    if (vehiclesToCreate.length > 0) {
      await prisma.vehicle.createMany({ data: vehiclesToCreate, skipDuplicates: true });
      existingVehicles = await prisma.vehicle.findMany({ where: { plate: { in: uniquePlates } } });
    }

    const plateToIdMap = new Map();
    for (const v of existingVehicles as any[]) {
      plateToIdMap.set(v.plate, v.id);
    }

    const logsToCreate = [];
    for (const row of validRows) {
      if (!row.description) continue; 
      const vehicleId = plateToIdMap.get(String(row.plate).trim());
      if (!vehicleId) continue; 

      logsToCreate.push({
        vehicleId: vehicleId,
        projectId: row.projectId ? parseInt(row.projectId) : null,
        projectName: row.projectName ? String(row.projectName).trim() : null,
        workshopName: row.workshopName ? String(row.workshopName).trim() : null,
        technicianName: row.technicianName ? String(row.technicianName).trim() : null,
        priority: row.priority ? String(row.priority).trim() : "normal",
        status: row.status ? String(row.status).trim() : "reported",
        category: row.category ? String(row.category).trim() : null,
        description: String(row.description).trim(),
        symptoms: row.symptoms ? String(row.symptoms).trim() : null,
        locationLabel: row.locationLabel ? String(row.locationLabel).trim() : null,
        cost: row.cost ? parseFloat(row.cost) : null,
        reportedAt: parseSafeDate(row.reportedAt) || new Date(),
        assignedAt: parseSafeDate(row.assignedAt),
        acceptedAt: parseSafeDate(row.acceptedAt),
        startedAt: parseSafeDate(row.startedAt),
        completedAt: parseSafeDate(row.completedAt),
        dueDate: parseSafeDate(row.dueDate),
      });
    }

    if (logsToCreate.length > 0) {
      await prisma.maintenanceLog.createMany({ data: logsToCreate });
    }

    return { success: true, message: `นำเข้าข้อมูลสำเร็จ` };
  } catch (error) {
    console.error("Import Error:", error);
    return { success: false, message: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}