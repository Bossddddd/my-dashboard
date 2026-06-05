"use server";

import { prisma } from "../lib/prisma";

const parseSafeDate = (val: any) => {
  if (!val || String(val).trim() === "") return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const calculateSlaRate = (onTimeCount: number, lateCount: number) => {
  const slaTotal = onTimeCount + lateCount;
  return slaTotal > 0 ? (onTimeCount / slaTotal) * 100 : 0;
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

export async function getDashboardStats() {
  try {
    const totalVehicles = await prisma.vehicle.count();
    const totalLogs = await prisma.maintenanceLog.count();
    
    const statusGroups = await prisma.maintenanceLog.groupBy({ by: ['status'], _count: { id: true } });
    const priorityGroups = await prisma.maintenanceLog.groupBy({ by: ['priority'], _count: { id: true } });
    const costAgg = await prisma.maintenanceLog.aggregate({ _sum: { cost: true } });

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
    const workshopMap = new Map(); 
    const now = new Date();

    for (const log of allLogs) {
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

      const rawWorkshop = log.workshopName ? log.workshopName.trim() : "";
      if (rawWorkshop !== "") {
        if (!workshopMap.has(rawWorkshop)) {
          workshopMap.set(rawWorkshop, {
            name: rawWorkshop, totalJobs: 0, completedOnTime: 0, completedLate: 0, 
            inProgress: 0, overdueActive: 0, totalRepairTimeMs: 0, repairCount: 0,
            techsMap: new Map(),
            logs: [] 
          });
        }
        const wStats = workshopMap.get(rawWorkshop);
        wStats.totalJobs++;

        const logDataForList = {
          maintenanceLogId: log.id,
          vehiclePlate: log.vehicle?.plate || "ไม่ระบุ",
          description: log.description,
          technicianName: log.technicianName || "ยังไม่ระบุ",
          workshopName: log.workshopName || "ไม่ระบุ",
          status: log.status,
          priority: log.priority,
          reportedAt: log.reportedAt ? log.reportedAt.toISOString() : "",
          dueDate: log.dueDate ? log.dueDate.toISOString() : ""
        };

        wStats.logs.push(logDataForList);

        if (log.status === 'completed') {
          if (log.dueDate && log.completedAt) {
            if (new Date(log.completedAt) <= new Date(log.dueDate)) { wStats.completedOnTime++; } 
            else { wStats.completedLate++; }
          } else {
            wStats.completedOnTime++; 
          }
          if (log.startedAt && log.completedAt) {
            const diff = new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime();
            if (diff >= 0) { wStats.totalRepairTimeMs += diff; wStats.repairCount++; }
          }
        } else if (log.status === 'in_progress') {
          wStats.inProgress++;
        }
        if (log.status !== 'completed' && log.status !== 'cancelled' && log.dueDate) {
          if (now > new Date(log.dueDate)) { wStats.overdueActive++; }
        }

        const rawTech = log.technicianName ? log.technicianName.trim() : "";
        if (rawTech !== "") {
          if (!wStats.techsMap.has(rawTech)) {
            wStats.techsMap.set(rawTech, {
              name: rawTech, totalJobs: 0, completedOnTime: 0, completedLate: 0, inProgress: 0, overdueActive: 0,
              logs: [] 
            });
          }
          const tStats = wStats.techsMap.get(rawTech);
          tStats.totalJobs++;
          tStats.logs.push(logDataForList); 

          if (log.status === 'completed') {
            if (log.dueDate && log.completedAt) {
              if (new Date(log.completedAt) <= new Date(log.dueDate)) { tStats.completedOnTime++; }
              else { tStats.completedLate++; }
            } else {
              tStats.completedOnTime++;
            }
          } else if (log.status === 'in_progress') {
            tStats.inProgress++;
          }
          if (log.status !== 'completed' && log.status !== 'cancelled' && log.dueDate && now > new Date(log.dueDate)) {
            tStats.overdueActive++;
          }
        }
      }
    }

    overdueTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const avgResponseHours = responseCount > 0 ? (totalResponseTimeMs / (1000 * 60 * 60)) / responseCount : 0;
    const avgRepairHours = repairCount > 0 ? (totalRepairTimeMs / (1000 * 60 * 60)) / repairCount : 0;
    const completedLateCount = totalCompleted - onTimeCompleted;
    const onTimeRate = calculateSlaRate(onTimeCompleted, completedLateCount + overdueActiveCount);

    const workshopsData = Array.from(workshopMap.values()).map((w: any) => {
      const lateCount = w.completedLate + w.overdueActive;
      const efficiencyRate = calculateSlaRate(w.completedOnTime, lateCount);
      const avgRepairHoursW = w.repairCount > 0 ? (w.totalRepairTimeMs / (1000 * 60 * 60)) / w.repairCount : 0;
      return {
        name: w.name, totalJobs: w.totalJobs, successCount: w.completedOnTime, 
        lateCount, inProgressCount: w.inProgress, 
        efficiencyRate: Math.round(efficiencyRate * 10) / 10, avgRepairHours: Math.round(avgRepairHoursW * 10) / 10,
        logs: w.logs, 
        technicians: Array.from(w.techsMap.values()).map((t: any) => {
          const tLateCount = t.completedLate + t.overdueActive;
          const tEfficiency = calculateSlaRate(t.completedOnTime, tLateCount);
          return {
            name: t.name, totalJobs: t.totalJobs, successCount: t.completedOnTime,
            inProgressCount: t.inProgress, lateCount: tLateCount,
            efficiencyRate: Math.round(tEfficiency * 10) / 10,
            logs: t.logs 
          };
        })
      };
    });

    return {
      totalVehicles, totalLogs,
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
      overdueTasks, workshopsData
    };
  } catch (error) {
    console.error("Stats Error:", error);
    return null;
  }
}

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
        vehiclesToCreate.push({ plate: plate, brand: row.brand ? String(row.brand).trim() : null, model: row.model ? String(row.model).trim() : null });
        seenNewPlates.add(plate);
      }
    }

    if (vehiclesToCreate.length > 0) {
      await prisma.vehicle.createMany({ data: vehiclesToCreate, skipDuplicates: true });
      existingVehicles = await prisma.vehicle.findMany({ where: { plate: { in: uniquePlates } } });
    }

    const plateToIdMap = new Map();
    for (const v of existingVehicles as any[]) { plateToIdMap.set(v.plate, v.id); }

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
    return { success: false, message: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}

// -------------------------------------------------------------
// 🔥 ฟังก์ชันใหม่: สำหรับค้นหาข้อมูลแบบครอบคลุม (ทะเบียนรถ, ช่าง, อู่)
// -------------------------------------------------------------
export async function searchDashboardData(query: string) {
  try {
    if (!query || query.trim() === "") return null;

    const searchTerm = query.trim();

    // 1. ค้นหาประวัติจากตาราง MaintenanceLog ที่ตรงกับคำค้นหา
    const logs = await prisma.maintenanceLog.findMany({
      where: {
        OR: [
          { vehicle: { plate: { contains: searchTerm, mode: 'insensitive' } } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { technicianName: { contains: searchTerm, mode: 'insensitive' } },
          { workshopName: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      include: {
        vehicle: { select: { plate: true } }
      },
      orderBy: { reportedAt: 'desc' }
    });

    // 2. จัดรูปแบบใบแจ้งซ่อมให้ตรงกับ Props ของ DashboardSearchResults
    const formattedLogs = logs.map(log => ({
      id: log.id,
      maintenanceLogId: log.id,
      vehiclePlate: log.vehicle?.plate || "ไม่ระบุ",
      description: log.description,
      technicianName: log.technicianName || "ไม่ระบุ",
      workshopName: log.workshopName || "ไม่ระบุ",
      status: log.status,
      priority: log.priority,
      reportedAt: log.reportedAt ? log.reportedAt.toISOString() : null,
      dueDate: log.dueDate ? log.dueDate.toISOString() : null,
    }));

    // 3. จัดกลุ่ม อู่ และ ช่าง จากผลลัพธ์ที่ค้นเจอ (เพื่อแสดงเป็นแท็บอู่/แท็บช่าง)
    const workshopMap = new Map();
    const technicianMap = new Map();

    formattedLogs.forEach(log => {
      // นับข้อมูลอู่
      if (log.workshopName !== "ไม่ระบุ") {
        if (!workshopMap.has(log.workshopName)) {
          workshopMap.set(log.workshopName, { name: log.workshopName, totalJobs: 0, successCount: 0, lateCount: 0, efficiencyRate: 100 });
        }
        workshopMap.get(log.workshopName).totalJobs++;
      }
      
      // นับข้อมูลช่าง
      if (log.technicianName !== "ไม่ระบุ") {
        if (!technicianMap.has(log.technicianName)) {
          technicianMap.set(log.technicianName, { name: log.technicianName, totalJobs: 0, successCount: 0, lateCount: 0, efficiencyRate: 100 });
        }
        technicianMap.get(log.technicianName).totalJobs++;
      }
    });

    return {
      query: searchTerm,
      workshops: Array.from(workshopMap.values()),
      technicians: Array.from(technicianMap.values()),
      logs: formattedLogs,
      total: formattedLogs.length
    };

  } catch (error) {
    console.error("Search Error:", error);
    return null;
  }
}