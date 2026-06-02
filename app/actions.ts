"use server"; // บังคับทำงานบน Server เท่านั้น

import { prisma } from "../lib/prisma";

// 1. ฟังก์ชันค้นหาข้อมูลรถและประวัติการซ่อมทั้งหมด (ใช้ค้นหา)
export async function searchVehicleByPlate(plate: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { 
        plate: plate 
      },
      include: {
        logs: {
          orderBy: { reportedAt: 'desc' } // เรียงประวัติจากใหม่ล่าสุดไปเก่า
        }
      }
    });

    return vehicle;
  } catch (error) {
    console.error("Database Error:", error);
    return null;
  }
}

// 2. ฟังก์ชันนำเข้าข้อมูลจาก Excel / CSV
export async function importMaintenanceData(rows: any[]) {
  try {
    for (const row of rows) {
      if (!row.plate) continue; // ถ้าไม่มีเลขทะเบียนให้ข้ามแถวนั้นไป

      // ค้นหาหรือสร้างข้อมูลรถ (Upsert)
      const vehicle = await prisma.vehicle.upsert({
        where: { plate: String(row.plate).trim() },
        update: {
          brand: row.brand ? String(row.brand).trim() : undefined,
          model: row.model ? String(row.model).trim() : undefined,
        },
        create: {
          plate: String(row.plate).trim(),
          brand: row.brand ? String(row.brand).trim() : undefined,
          model: row.model ? String(row.model).trim() : undefined,
        },
      });

      // บันทึกข้อมูลใบแจ้งซ่อมอย่างละเอียด
      if (row.description) {
        await prisma.maintenanceLog.create({
          data: {
            vehicleId: vehicle.id,
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
          },
        });
      }
    }
    return { success: true, message: "นำเข้าข้อมูลสำเร็จ" };
  } catch (error) {
    console.error("Import Error:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล" };
  }
}

// 3. ฟังก์ชันดึงสถิติภาพรวมสำหรับหน้า Home (แก้ไขจุดตัวแดง s และ p)
export async function getDashboardStats() {
  try {
    const totalVehicles = await prisma.vehicle.count();
    const totalLogs = await prisma.maintenanceLog.count();
    
    // จัดกลุ่มตามสถานะ และระบุเจาะจงให้ระบุจำนวนนับจาก id
    const statusGroups = await prisma.maintenanceLog.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    
    // จัดกลุ่มตามความเร่งด่วน และระบุเจาะจงให้ระบุจำนวนนับจาก id
    const priorityGroups = await prisma.maintenanceLog.groupBy({
      by: ['priority'],
      _count: { id: true },
    });

    // รวมยอดค่าใช้จ่ายทั้งหมด
    const costAgg = await prisma.maintenanceLog.aggregate({
      _sum: { cost: true },
    });

    return {
      totalVehicles,
      totalLogs,
      // ใส่ : any เพื่อเคลียร์ปัญหาเรื่องประเภทข้อมูลให้กับมาร์กอัปโค้ด
      statusCounts: statusGroups.map((s: any) => ({ status: s.status, count: s._count.id })),
      priorityCounts: priorityGroups.map((p: any) => ({ priority: p.priority, count: p._count.id })),
      totalCost: costAgg._sum.cost || 0,
    };
  } catch (error) {
    console.error("Stats Error:", error);
    return null;
  }
}