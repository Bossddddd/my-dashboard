"use server"; // บังคับทำงานบน Server เท่านั้น

import { prisma } from "../lib/prisma";

// 1. ฟังก์ชันค้นหาข้อมูลรถ
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

// 2. ฟังก์ชันดึงสถิติภาพรวม + สถิติรายเดือน (อัปเดตเพิ่มกราฟรายเดือน)
export async function getDashboardStats() {
  try {
    const totalVehicles = await prisma.vehicle.count();
    const totalLogs = await prisma.maintenanceLog.count();
    
    const statusGroups = await prisma.maintenanceLog.groupBy({ by: ['status'], _count: { id: true } });
    const priorityGroups = await prisma.maintenanceLog.groupBy({ by: ['priority'], _count: { id: true } });
    const costAgg = await prisma.maintenanceLog.aggregate({ _sum: { cost: true } });

    // 🚀 คำนวณสถิติย้อนหลัง 6 เดือนล่าสุดสำหรับทำกราฟ
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentLogs = await prisma.maintenanceLog.findMany({
      where: { reportedAt: { gte: sixMonthsAgo } },
      select: { reportedAt: true, cost: true }
    });

    // เตรียมโครงสร้างเดือนย้อนหลัง 6 เดือน
    const monthlyMap = new Map();
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleString('th-TH', { month: 'short' });
      const yearLabel = d.getFullYear() + 543; // แปลงเป็น พ.ศ. ให้คนไทยอ่านง่าย
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, { label: `${monthLabel} ${String(yearLabel).substring(2)}`, count: 0, cost: 0 });
    }

    // นำข้อมูลใบแจ้งซ่อมจริงลงล็อกเดือน
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

    // แปลง Map กลับเป็น Array และเรียงจากเดือนเก่าไปเดือนใหม่
    const monthlyStats = Array.from(monthlyMap.values()).reverse();

    return {
      totalVehicles,
      totalLogs,
      statusCounts: statusGroups.map((s: any) => ({ status: s.status, count: s._count.id })),
      priorityCounts: priorityGroups.map((p: any) => ({ priority: p.priority, count: p._count.id })),
      totalCost: costAgg._sum.cost || 0,
      monthlyStats // ส่งข้อมูลนี้ไปวาดกราฟ
    };
  } catch (error) {
    console.error("Stats Error:", error);
    return null;
  }
}

// 3. ฟังก์ชันนำเข้าข้อมูล (Bulk Insert)
export async function importMaintenanceData(rows: any[]) {
  try {
    const validRows = rows.filter(r => r.plate);
    if (validRows.length === 0) return { success: false, message: "ไม่พบข้อมูลรถในไฟล์" };

    const uniquePlates = [...new Set(validRows.map(r => String(r.plate).trim()))];

    let existingVehicles = await prisma.vehicle.findMany({
      where: { plate: { in: uniquePlates } }
    });
    
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
        
        reportedAt: row.reportedAt ? new Date(row.reportedAt) : new Date(),
        assignedAt: row.assignedAt ? new Date(row.assignedAt) : null,
        acceptedAt: row.acceptedAt ? new Date(row.acceptedAt) : null,
        startedAt: row.startedAt ? new Date(row.startedAt) : null,
        completedAt: row.completedAt ? new Date(row.completedAt) : null,
        dueDate: row.dueDate ? new Date(row.dueDate) : null,
      });
    }

    if (logsToCreate.length > 0) {
      await prisma.maintenanceLog.createMany({ data: logsToCreate });
    }

    return { success: true, message: `นำเข้าข้อมูลสำเร็จ` };
  } catch (error) {
    console.error("Import Error:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล" };
  }
}