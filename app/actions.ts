"use server"; // คำสั่งบังคับให้ไฟล์นี้ทำงานบน Server เท่านั้น

import { prisma } from "../lib/prisma";

export async function searchVehicleByPlate(plate: string) {
  try {
    // ให้ Prisma ไปค้นหารถที่มีทะเบียนตรงกับที่ค้นหา
    const vehicle = await prisma.vehicle.findUnique({
      where: { 
        plate: plate 
      },
      // ให้ดึงข้อมูลประวัติการซ่อม (logs) ของรถคันนี้มาด้วย
      include: {
        logs: {
          orderBy: { reportedAt: 'desc' } // เรียงลำดับจากงานใหม่ล่าสุดไปเก่า
        }
      }
    });

    return vehicle;
  } catch (error) {
    console.error("Database Error:", error);
    return null;
  }
}
export async function importMaintenanceData(rows: any[]) {
  try {
    for (const row of rows) {
      if (!row.plate) continue; // ข้ามบรรทัดที่ไม่มีเลขทะเบียน

      // 1. ตรวจสอบและสร้างรถ (Upsert)
      const vehicle = await prisma.vehicle.upsert({
        where: { plate: String(row.plate) },
        update: {
          brand: row.brand ? String(row.brand) : undefined,
          model: row.model ? String(row.model) : undefined,
        },
        create: {
          plate: String(row.plate),
          brand: row.brand ? String(row.brand) : undefined,
          model: row.model ? String(row.model) : undefined,
        },
      });

      // 2. ถ้ามีข้อมูลการซ่อม (description) ให้บันทึกประวัติการซ่อมด้วย
      if (row.description) {
        await prisma.maintenanceLog.create({
          data: {
            vehicleId: vehicle.id,
            priority: row.priority ? String(row.priority) : "normal",
            status: row.status ? String(row.status) : "reported",
            description: String(row.description),
            symptoms: row.symptoms ? String(row.symptoms) : null,
            cost: row.cost ? parseFloat(row.cost) : null,
            technicianName: row.technicianName ? String(row.technicianName) : null,
            // ถ้าในไฟล์มีคอลัมน์ reportedAt ให้ใช้ค่านั้น ถ้าไม่มีให้ใช้วันนี้
            reportedAt: row.reportedAt ? new Date(row.reportedAt) : new Date(),
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