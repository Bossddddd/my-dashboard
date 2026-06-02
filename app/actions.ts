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

// 2. ฟังก์ชันดึงสถิติ
export async function getDashboardStats() {
  try {
    const totalVehicles = await prisma.vehicle.count();
    const totalLogs = await prisma.maintenanceLog.count();
    
    const statusGroups = await prisma.maintenanceLog.groupBy({ by: ['status'], _count: { id: true } });
    const priorityGroups = await prisma.maintenanceLog.groupBy({ by: ['priority'], _count: { id: true } });
    const costAgg = await prisma.maintenanceLog.aggregate({ _sum: { cost: true } });

    return {
      totalVehicles,
      totalLogs,
      statusCounts: statusGroups.map((s: any) => ({ status: s.status, count: s._count.id })),
      priorityCounts: priorityGroups.map((p: any) => ({ priority: p.priority, count: p._count.id })),
      totalCost: costAgg._sum.cost || 0,
    };
  } catch (error) {
    console.error("Stats Error:", error);
    return null;
  }
}

// 3. ฟังก์ชันนำเข้าข้อมูล (Bulk Insert)
export async function importMaintenanceData(rows: any[]) {
  try {
    // 1. กรองแถวที่ว่างทิ้งไป
    const validRows = rows.filter(r => r.plate);
    if (validRows.length === 0) return { success: false, message: "ไม่พบข้อมูลรถในไฟล์" };

    // 2. ดึงเลขทะเบียนที่ไม่ซ้ำกันทั้งหมดในไฟล์ Excel
    const uniquePlates = [...new Set(validRows.map(r => String(r.plate).trim()))];

    // 3. ค้นหาว่าใน Database มีรถคันไหนอยู่แล้วบ้าง
    let existingVehicles = await prisma.vehicle.findMany({
      where: { plate: { in: uniquePlates } }
    });
    
    // 🛠️ แก้ไข: เติม (v: any) เพื่อเคลียร์ตัวแดง
    const existingPlates = new Set(existingVehicles.map((v: any) => v.plate));

    // 4. แยกเฉพาะรถคันใหม่ที่ยังไม่เคยมีใน Database
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
        seenNewPlates.add(plate); // กันใส่รถซ้ำซ้อน
      }
    }

    // 5. บันทึกรถคันใหม่ทั้งหมดรวดเดียว (Bulk Insert)
    if (vehiclesToCreate.length > 0) {
      await prisma.vehicle.createMany({
        data: vehiclesToCreate,
        skipDuplicates: true,
      });
      // ดึงข้อมูลรถทั้งหมดอีกรอบ เพื่อให้ได้ ID ของรถคันใหม่
      existingVehicles = await prisma.vehicle.findMany({
        where: { plate: { in: uniquePlates } }
      });
    }

    // 6. ทำสมุดหน้าเหลือง (Map) จับคู่ทะเบียนรถ กับ ID รถ
    const plateToIdMap = new Map();
    // 🛠️ แก้ไข: เติม as any[] เพื่อเคลียร์ตัวแดงในลูป
    for (const v of existingVehicles as any[]) {
      plateToIdMap.set(v.plate, v.id);
    }

    // 7. เตรียมข้อมูลประวัติแจ้งซ่อม ให้เป็นก้อนเดียว
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

    // 8. สั่งบันทึกประวัติการซ่อมรวดเดียวจบ!
    if (logsToCreate.length > 0) {
      await prisma.maintenanceLog.createMany({
        data: logsToCreate,
      });
    }

    return { success: true, message: `นำเข้าข้อมูลสำเร็จ` };
  } catch (error) {
    console.error("Import Error:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล" };
  }
}