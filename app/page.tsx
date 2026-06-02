"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import { searchVehicleByPlate } from "./actions"; // นำเข้า Server Action

// === 1. Types & Interfaces ตาม Schema ทุกประการ ===
type MaintenanceStatus = 'reported' | 'assigned' | 'in_progress' | 'blocked' | 'awaiting_qa' | 'completed' | 'cancelled';
type MaintenancePriority = 'low' | 'normal' | 'high' | 'urgent';

interface MaintenanceLog {
  maintenanceLogId: number;
  vehicleId: number;
  vehiclePlate?: string;
  projectId?: number;
  projectName?: string;
  workshopName?: string;
  technicianName?: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  category?: string;
  description: string;
  symptoms?: string[];
  reportedAt: string;
  assignedAt?: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;
  cost?: number;
  locationLabel?: string;
}

interface VehicleRecord {
  vehicleId: number;
  vehiclePlate: string;
  brand?: string;
  model?: string;
  maintenanceHistory: MaintenanceLog[];
}

// === 2. ฟังก์ชันแปลสถานะเป็นสี (Tailwind) ===
const getStatusBadge = (status: MaintenanceStatus) => {
  const statusConfig: Record<MaintenanceStatus, { text: string, color: string }> = {
    reported: { text: "แจ้งแล้ว", color: "bg-gray-100 text-gray-700 border-gray-200" },
    assigned: { text: "มอบหมายแล้ว", color: "bg-blue-100 text-blue-700 border-blue-200" },
    in_progress: { text: "กำลังซ่อม", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    blocked: { text: "ติดปัญหา (รออะไหล่)", color: "bg-red-100 text-red-700 border-red-200" },
    awaiting_qa: { text: "รอตรวจงาน", color: "bg-purple-100 text-purple-700 border-purple-200" },
    completed: { text: "เสร็จสิ้น", color: "bg-green-100 text-green-700 border-green-200" },
    cancelled: { text: "ยกเลิก", color: "bg-gray-200 text-gray-500 border-gray-300" },
  };
  const config = statusConfig[status] || { text: status, color: "bg-gray-100 text-gray-700 border-gray-200" };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>{config.text}</span>;
};

// === 3. ฟังก์ชันแปลระดับความสำคัญ (Priority) ===
const getPriorityBadge = (priority: MaintenancePriority) => {
  const priorityConfig: Record<MaintenancePriority, { text: string, color: string }> = {
    low: { text: "ต่ำ", color: "bg-slate-50 text-slate-600 border-slate-200" },
    normal: { text: "ปกติ", color: "bg-blue-50 text-blue-600 border-blue-200" },
    high: { text: "สูง", color: "bg-orange-50 text-orange-700 border-orange-200" },
    urgent: { text: "ด่วนที่สุด", color: "bg-red-50 text-red-700 border-red-200 font-bold" },
  };
  const config = priorityConfig[priority] || { text: priority, color: "bg-gray-50 text-gray-600 border-gray-200" };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${config.color}`}>{config.text}</span>;
};

// === 4. ฟังก์ชันจัดฟอร์แมตวันที่และเวลาสำหรับแสดงผล ===
const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return <span className="text-gray-400">ยังไม่มีข้อมูล</span>;
  return new Date(dateStr).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) + " น.";
};

// ======================================================

export default function Home() {
  const [vehicleData, setVehicleData] = useState<VehicleRecord | null | undefined>(undefined);

  // === ฟังก์ชันค้นหาข้อมูลและ Map ข้อมูลทุกฟิลด์จาก Database ===
  const handleSearchData = async (plate: string) => {
    setVehicleData(undefined); 
    const foundData = await searchVehicleByPlate(plate);

    if (foundData) {
      setVehicleData({
        vehicleId: foundData.id,
        vehiclePlate: foundData.plate,
        brand: foundData.brand || undefined,
        model: foundData.model || undefined,
        maintenanceHistory: foundData.logs.map((log: any) => ({
          maintenanceLogId: log.id,
          vehicleId: foundData.id,
          vehiclePlate: foundData.plate,
          projectId: log.projectId || undefined,
          projectName: log.projectName || undefined,
          workshopName: log.workshopName || undefined,
          technicianName: log.technicianName || undefined,
          priority: log.priority as MaintenancePriority,
          status: log.status as MaintenanceStatus,
          category: log.category || undefined,
          description: log.description,
          symptoms: log.symptoms ? log.symptoms.split(',') : [],
          reportedAt: log.reportedAt ? log.reportedAt.toISOString() : "",
          assignedAt: log.assignedAt ? log.assignedAt.toISOString() : undefined,
          acceptedAt: log.acceptedAt ? log.acceptedAt.toISOString() : undefined,
          startedAt: log.startedAt ? log.startedAt.toISOString() : undefined,
          completedAt: log.completedAt ? log.completedAt.toISOString() : undefined,
          dueDate: log.dueDate ? log.dueDate.toISOString() : undefined,
          cost: log.cost || undefined,
          locationLabel: log.locationLabel || undefined,
        }))
      });
    } else {
      setVehicleData(null);
    }
  };

  // === ฟังก์ชันเรนเดอร์เนื้อหาหลักตรงกลาง ===
  const renderContent = () => {
    if (vehicleData === undefined) {
      return (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
          <div className="mb-3 text-4xl">🚗</div>
          <h2 className="text-xl font-medium text-gray-600">ยินดีต้อนรับสู่ระบบแจ้งซ่อม</h2>
          <p className="mt-2 text-gray-400">กรุณาพิมพ์เลขทะเบียนรถในช่องค้นหาด้านบน หรือ นำเข้าไฟล์ข้อมูล</p>
        </div>
      );
    }

    if (vehicleData === null) {
      return (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50 p-10 text-center shadow-sm">
          <div className="mb-3 text-4xl">❌</div>
          <h2 className="text-xl font-medium text-red-600">ไม่พบข้อมูลรถคันนี้ในระบบ</h2>
          <p className="mt-2 text-red-400">ตรวจสอบเลขทะเบียนอีกครั้ง หรือทำการเพิ่มข้อมูลรถใหม่</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        {/* กล่องข้อมูลรถหลัก */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">{vehicleData.vehiclePlate}</h2>
          <p className="mt-1 text-gray-500">
            ยี่ห้อ/รุ่น: {vehicleData.brand || "-"} {vehicleData.model || "-"} (รหัสภายในรถ: {vehicleData.vehicleId})
          </p>
        </div>

        {/* รายการประวัติการซ่อมอย่างละเอียด */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-800">ประวัติการซ่อมบำรุงทั้งหมด</h3>
          
          {vehicleData.maintenanceHistory.length === 0 ? (
             <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400">
               รถคันนี้ยังไม่มีประวัติการแจ้งซ่อมในระบบ
             </div>
          ) : (
            <div className="flex flex-col gap-6">
              {vehicleData.maintenanceHistory.map((log) => (
                <div key={log.maintenanceLogId} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                  
                  {/* หัวการ์ด: เลขใบแจ้งซ่อม, สถานะ, ความเร่งด่วน, ประเภท */}
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-gray-800 px-2 py-0.5 font-mono text-xs font-bold text-white">
                        LOG-#{log.maintenanceLogId}
                      </span>
                      {getStatusBadge(log.status)}
                      {getPriorityBadge(log.priority)}
                      {log.category && (
                        <span className="rounded bg-purple-50 border border-purple-200 px-2 py-0.5 text-xs font-medium text-purple-700">
                          ประเภท: {log.category}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      ID รถอ้างอิง: {log.vehicleId} {log.vehiclePlate && `(${log.vehiclePlate})`}
                    </div>
                  </div>
                  
                  {/* อาการและรายละเอียดหลัก */}
                  <div className="mb-4">
                    <h4 className="text-base font-semibold text-gray-900 mb-1">อาการ / รายละเอียดที่แจ้ง:</h4>
                    <p className="text-gray-700 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                      {log.description}
                    </p>
                  </div>
                  
                  {/* Tags อาการเสีย */}
                  {log.symptoms && log.symptoms.length > 0 && log.symptoms[0] !== "" && (
                    <div className="mb-5">
                      <span className="text-xs text-gray-500 block mb-1.5 font-medium">แท็กอาการเสีย:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {log.symptoms.map((sym, index) => (
                          <span key={index} className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs text-amber-800 font-medium">
                            ⚠️ {sym.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ตารางข้อมูลหน่วยงานและสถานที่ (Grid Layout) */}
                  <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                    <div>
                      <span className="text-gray-400 block text-xs">โครงการ / จุดให้บริการ:</span>
                      <span className="text-gray-800 font-medium">{log.projectName || "-"} {log.projectId && `(ID: ${log.projectId})`}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">อู่ / ศูนย์ซ่อม:</span>
                      <span className="text-gray-800 font-medium">{log.workshopName || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">จุดที่แจ้ง / ที่จอดซ่อม:</span>
                      <span className="text-gray-800 font-medium">{log.locationLabel || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">ช่างผู้รับผิดชอบงาน:</span>
                      <span className="text-gray-800 font-medium text-blue-700">{log.technicianName || "ยังไม่ระบุช่าง"}</span>
                    </div>
                  </div>

                  {/* ส่วนจัดการประทับเวลา (Timeline / Time tracking) */}
                  <div className="mb-4 border-t border-gray-100 pt-4">
                    <span className="text-xs font-semibold text-gray-700 block mb-2">⏱️ บันทึกไทม์ไลน์เวลา:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-600">
                      <div className="p-2 bg-white rounded border border-gray-100 shadow-2xs">
                        <span className="text-gray-400 block">เวลาที่รับแจ้ง (Reported):</span>
                        <span className="font-medium text-gray-800">{formatDateTime(log.reportedAt)}</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-100 shadow-2xs">
                        <span className="text-gray-400 block">เวลามอบหมายช่าง (Assigned):</span>
                        <span className="font-medium text-gray-800">{formatDateTime(log.assignedAt)}</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-100 shadow-2xs">
                        <span className="text-gray-400 block">เวลาช่างรับงาน (Accepted):</span>
                        <span className="font-medium text-gray-800">{formatDateTime(log.acceptedAt)}</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-100 shadow-2xs">
                        <span className="text-gray-400 block">เวลาเริ่มซ่อม (Started):</span>
                        <span className="font-medium text-gray-800">{formatDateTime(log.startedAt)}</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-100 shadow-2xs">
                        <span className="text-gray-400 block">เวลาซ่อมเสร็จ (Completed):</span>
                        <span className="font-medium text-emerald-700">{formatDateTime(log.completedAt)}</span>
                      </div>
                      <div className="p-2 bg-orange-50/50 rounded border border-orange-100 shadow-2xs">
                        <span className="text-orange-500 block font-medium">กำหนดเสร็จสิ้น (Due Date):</span>
                        <span className="font-medium text-gray-800">{formatDateTime(log.dueDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* ท้ายการ์ด: สรุปค่าใช้จ่ายเฉพาะงานเสร็จสิ้น */}
                  {log.cost !== undefined && (
                    <div className="mt-4 flex justify-end items-center border-t border-gray-100 pt-3 bg-emerald-50/40 -mx-6 -mb-6 p-4 rounded-b-xl border border-emerald-100/50">
                      <div className="text-sm text-emerald-800 font-medium mr-2">สรุปค่าซ่อมรวมสุทธิ:</div>
                      <div className="text-xl font-bold text-emerald-700 font-mono">
                        {log.cost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                      </div>
                    </div>
                  )}

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
      <Navbar onSearch={handleSearchData} />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}