"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import ImportButton from "../components/ImportButton"; // นำเข้า Component ปุ่ม Import
import { searchVehicleByPlate } from "./actions";

// === 1. Types & Interfaces ===
type MaintenanceStatus = 'reported' | 'assigned' | 'in_progress' | 'blocked' | 'awaiting_qa' | 'completed' | 'cancelled';
type MaintenancePriority = 'low' | 'normal' | 'high' | 'urgent';

interface MaintenanceLog {
  maintenanceLogId: number;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  description: string;
  symptoms?: string[];
  reportedAt: string;
  completedAt?: string;
  cost?: number;
  technicianName?: string;
}

interface VehicleRecord {
  vehicleId: number;
  vehiclePlate: string;
  brand?: string;
  model?: string;
  maintenanceHistory: MaintenanceLog[];
}

// === 2. ฟังก์ชันแปลสถานะเป็นสี (Tailwind) ===
const getStatusBadge = (status: MaintenanceStatus | string) => {
  const statusConfig: Record<string, { text: string, color: string }> = {
    reported: { text: "แจ้งแล้ว", color: "bg-gray-100 text-gray-700" },
    assigned: { text: "มอบหมายแล้ว", color: "bg-blue-100 text-blue-700" },
    in_progress: { text: "กำลังซ่อม", color: "bg-yellow-100 text-yellow-800" },
    blocked: { text: "ติดปัญหา", color: "bg-red-100 text-red-700" },
    awaiting_qa: { text: "รอตรวจ", color: "bg-purple-100 text-purple-700" },
    completed: { text: "เสร็จสิ้น", color: "bg-green-100 text-green-700" },
    cancelled: { text: "ยกเลิก", color: "bg-gray-200 text-gray-500" },
  };
  
  const config = statusConfig[status as string] || { text: status, color: "bg-gray-100 text-gray-700" };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>{config.text}</span>;
};

// === 3. Component หลัก ===
export default function Home() {
  const [vehicleData, setVehicleData] = useState<VehicleRecord | null | undefined>(undefined);

  // === 4. ฟังก์ชันค้นหาข้อมูลจาก Database จริง ===
  const handleSearchData = async (plate: string) => {
    // เคลียร์ข้อมูลเดิมออกก่อนระหว่างรอ Database โหลด
    setVehicleData(undefined); 
    
    // เรียกใช้ Server Action เพื่อค้นหาจาก SQLite
    const foundData = await searchVehicleByPlate(plate);

    if (foundData) {
      // แปลงข้อมูลที่ได้จาก Prisma ให้อยู่ในรูปแบบ Interface ของเรา
      setVehicleData({
        vehicleId: foundData.id,
        vehiclePlate: foundData.plate,
        brand: foundData.brand || undefined,
        model: foundData.model || undefined,
        maintenanceHistory: foundData.logs.map((log: any) => ({
          maintenanceLogId: log.id,
          priority: log.priority as MaintenancePriority,
          status: log.status as MaintenanceStatus,
          description: log.description,
          // SQLite เก็บ array ไม่ได้ มักจะเก็บเป็น string คั่นด้วยลูกน้ำ เราจึงนำมา split กลับเป็น Array
          symptoms: log.symptoms ? log.symptoms.split(',') : [],
          reportedAt: log.reportedAt.toISOString(),
          completedAt: log.completedAt ? log.completedAt.toISOString() : undefined,
          cost: log.cost || undefined,
          technicianName: log.technicianName || undefined,
        }))
      });
    } else {
      setVehicleData(null); // หาไม่เจอ
    }
  };

  // === 5. ฟังก์ชันแสดงผลเนื้อหาตรงกลาง ===
  const renderContent = () => {
    // กรณีที่ 1: หน้าจอเริ่มต้น (ยังไม่ได้ค้นหา)
    if (vehicleData === undefined) {
      return (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
          <div className="mb-3 text-4xl">🚗</div>
          <h2 className="text-xl font-medium text-gray-600">ยินดีต้อนรับสู่ระบบแจ้งซ่อม</h2>
          <p className="mt-2 text-gray-400">กรุณาพิมพ์เลขทะเบียนรถในช่องค้นหาด้านบน</p>
        </div>
      );
    }

    // กรณีที่ 2: ค้นหาแล้ว แต่ไม่พบข้อมูล
    if (vehicleData === null) {
      return (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50 p-10 text-center shadow-sm">
          <div className="mb-3 text-4xl">❌</div>
          <h2 className="text-xl font-medium text-red-600">ไม่พบข้อมูลรถคันนี้ในระบบ</h2>
          <p className="mt-2 text-red-400">ตรวจสอบเลขทะเบียนอีกครั้ง หรือทำการเพิ่มข้อมูลรถใหม่</p>
        </div>
      );
    }

    // กรณีที่ 3: ค้นพบข้อมูล (แสดงประวัติการซ่อม)
    return (
      <div className="flex flex-col gap-6">
        {/* กล่องข้อมูลรถ */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{vehicleData.vehiclePlate}</h2>
            <p className="mt-1 text-gray-500">
              {vehicleData.brand} {vehicleData.model} (รหัสรถ: {vehicleData.vehicleId})
            </p>
          </div>
          
          {/* นำ ImportButton มาวางคู่กับปุ่มสร้างใบแจ้งซ่อม */}
          <div className="flex gap-2">
            <ImportButton />
            <button className="rounded-lg bg-blue-50 px-4 py-2 font-medium text-blue-700 transition hover:bg-blue-100">
              + สร้างใบแจ้งซ่อมใหม่
            </button>
          </div>
        </div>

        {/* รายการประวัติการซ่อม */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-800">ประวัติการซ่อมบำรุง</h3>
          
          {vehicleData.maintenanceHistory.length === 0 ? (
             <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400">
               รถคันนี้ยังไม่มีประวัติการแจ้งซ่อม
             </div>
          ) : (
            <div className="flex flex-col gap-4">
              {vehicleData.maintenanceHistory.map((log) => (
                <div key={log.maintenanceLogId} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-gray-500">#{log.maintenanceLogId}</span>
                      {getStatusBadge(log.status)}
                    </div>
                    <span className="text-sm text-gray-500">
                      แจ้งเมื่อ: {new Date(log.reportedAt).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  
                  <h4 className="mb-2 text-lg font-medium text-gray-900">{log.description}</h4>
                  
                  {log.symptoms && log.symptoms.length > 0 && (
                    <div className="mb-4 flex gap-2">
                      {log.symptoms.map((sym, index) => (
                        <span key={index} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          {sym.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex items-end justify-between border-t border-gray-100 pt-3 text-sm text-gray-600">
                    <div>
                      ช่างผู้รับผิดชอบ: <span className="font-medium">{log.technicianName || "ยังไม่ระบุ"}</span>
                    </div>
                    {log.cost !== undefined && (
                      <div className="font-bold text-gray-900">
                        ค่าใช้จ่าย: {log.cost.toLocaleString()} ฿
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col antialiased bg-gray-50">
      {/* 6. เรียกใช้งาน Navbar และส่งฟังก์ชันดึงข้อมูลเข้าไป */}
      <Navbar onSearch={handleSearchData} />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}