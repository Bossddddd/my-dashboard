"use server"; // บังคับทำงานบน Server เท่านั้น

import { prisma } from "../lib/prisma";

// ฟังก์ชันค้นหาข้อมูลรถและประวัติการซ่อมทั้งหมด
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

// ฟังก์ชันนำเข้าข้อมูลจาก Excel / CSV (บันทึกครบทุกฟิลด์ตาม Schema)
export async function importMaintenanceData(rows: any[]) {
  try {
    for (const row of rows) {
      if (!row.plate) continue; // ถ้าไม่มีเลขทะเบียนให้ข้ามแถวนั้นไป

      // 1. ค้นหาหรือสร้างข้อมูลรถ (Upsert)
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

      // 2. บันทึกข้อมูลใบแจ้งซ่อมอย่างละเอียดถ้ามีรายละเอียดอาการ (description)
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
            
            // ตรวจสอบและแปลงค่าวันที่ (หากมีระบุใน Excel ให้ใช้ค่านั้น หรือถ้าไม่มีให้ใช้เวลาปัจจุบัน)
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