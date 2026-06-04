"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ImportButton from "../components/ImportButton";
import toast from "react-hot-toast";
import { searchVehicleByPlate, getDashboardStats } from "./actions";

interface MaintenanceLog {
  maintenanceLogId: number;
  vehicleId: number;
  vehiclePlate?: string;
  projectId?: number;
  projectName?: string;
  workshopName?: string;
  technicianName?: string;
  priority: string; 
  status: string;   
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

const STATUS_CONFIG: Record<string, { text: string, color: string }> = {
  reported: { text: "แจ้งแล้ว", color: "bg-blue-50 text-blue-600 border-blue-200" },
  assigned: { text: "มอบหมายแล้ว", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  in_progress: { text: "กำลังซ่อม", color: "bg-amber-50 text-amber-600 border-amber-200" },
  blocked: { text: "ติดปัญหา (รออะไหล่)", color: "bg-rose-50 text-rose-600 border-rose-200" },
  awaiting_qa: { text: "รอตรวจงาน", color: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200" },
  awaiting_q: { text: "รอตรวจงาน", color: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200" }, 
  completed: { text: "เสร็จสิ้น", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  cancelled: { text: "ยกเลิก", color: "bg-gray-100 text-gray-800 border-gray-300" },
};

const PRIORITY_CONFIG: Record<string, { text: string, color: string }> = {
  low: { text: "ต่ำ", color: "bg-blue-50 text-blue-600 border-blue-200" },
  normal: { text: "ปกติ", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  high: { text: "สูง", color: "bg-orange-50 text-orange-700 border-orange-200" },
  urgent: { text: "ด่วนที่สุด", color: "bg-rose-50 text-rose-700 border-rose-200" },
};

const getStatusBadge = (status: string) => {
  const config = STATUS_CONFIG[status] || { text: status || "-", color: "bg-gray-100 border-gray-200" };
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
      {config.text}
    </div>
  );
};

const getPriorityBadge = (priority: string) => {
  const config = PRIORITY_CONFIG[priority] || { text: priority || "-", color: "bg-gray-50 border-gray-200" };
  return <span className={`px-2 py-0.5 rounded text-xs font-bold border ${config.color}`}>{config.text}</span>;
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return <span className="text-gray-400">-</span>;
  return new Date(dateStr).toLocaleString('th-TH', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) + " น.";
};

export default function Home() {
  const [vehicleData, setVehicleData] = useState<VehicleRecord | null | undefined>(undefined);
  const [stats, setStats] = useState<any>(null);
  const [searchInput, setSearchInput] = useState("");
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workshops' | 'technicians'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // 🚀 ตั้งค่า default เป็น "all" เพื่อแสดงผลรวมทุกอู่
  const [selectedWorkshop, setSelectedWorkshop] = useState("all");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTechPage, setCurrentTechPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const loadStats = async () => {
      const data = await getDashboardStats();
      if (data) {
        setStats(data);
      }
    };
    loadStats();
  }, []);

  const executeSearch = async () => {
    if (!searchInput.trim()) {
      setVehicleData(undefined);
      return;
    }
    const searchToast = toast.loading(`กำลังค้นหา ${searchInput}...`);
    
    setVehicleData(undefined); 
    const foundData = await searchVehicleByPlate(searchInput.trim());

    if (foundData) {
      toast.success(`พบประวัติรถ ${foundData.plate}`, { id: searchToast });
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
          priority: log.priority,
          status: log.status,
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
      toast.error(`ไม่พบข้อมูล ${searchInput}`, { id: searchToast });
      setVehicleData(null);
    }
  };

  const renderContent = () => {
    if (!stats) return <div className="text-center p-10 text-gray-500 font-medium flex items-center justify-center gap-2"><span className="animate-spin text-xl">⏳</span> กำลังโหลดข้อมูล...</div>;

    if (vehicleData !== undefined) {
      if (vehicleData === null) {
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <h2 className="text-lg font-bold text-gray-800">ไม่พบข้อมูลยานพาหนะ</h2>
            <p className="text-gray-500 text-sm mt-1">ไม่พบเลขทะเบียน <span className="font-bold text-gray-800">"{searchInput}"</span> ในระบบ</p>
            <button onClick={() => {setSearchInput(""); setVehicleData(undefined);}} className="mt-4 text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-200">กลับหน้าหลัก</button>
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-6">
          <button onClick={() => {setSearchInput(""); setVehicleData(undefined);}} className="text-xs font-bold text-gray-500 hover:text-[#0B603A] flex items-center gap-1 transition-colors">
            ← กลับหน้าแดชบอร์ดหลัก
          </button>
          <h2 className="text-xl font-black text-[#0B603A]">ประวัติแจ้งซ่อมรถทะเบียน {vehicleData.vehiclePlate}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 text-xs shadow-xs">
              <h3 className="font-bold text-sm text-gray-800 mb-4 pb-2 border-b">ข้อมูลทั่วไปยานพาหนะ</h3>
              <div className="space-y-3">
                <div><span className="text-gray-400 block mb-0.5">หมายเลขทะเบียน</span><span className="font-bold text-gray-900 text-sm">{vehicleData.vehiclePlate}</span></div>
                <div><span className="text-gray-400 block mb-0.5">ยี่ห้อ / รุ่น</span><span className="font-medium text-gray-800">{vehicleData.brand || "-"} {vehicleData.model || "-"}</span></div>
              </div>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-4">
              {vehicleData.maintenanceHistory.map((log) => (
                <div key={log.maintenanceLogId} className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-[#0B603A]">ใบงานรหัส: #{log.maintenanceLogId}</span>
                    {getStatusBadge(log.status)}
                  </div>
                  <p className="text-xs text-gray-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">{log.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 text-[11px] text-gray-500">
                    <div><span>ช่างรับผิดชอบ:</span> <span className="font-bold text-gray-800 block mt-0.5">{log.technicianName || "-"}</span></div>
                    <div><span>อู่/ศูนย์ซ่อม:</span> <span className="font-medium text-gray-800 block mt-0.5">{log.workshopName || "-"}</span></div>
                    <div><span>วันที่แจ้ง:</span> <span className="font-medium text-gray-800 block mt-0.5">{formatDateTime(log.reportedAt)}</span></div>
                    <div><span>กำหนดเสร็จ:</span> <span className="font-bold text-rose-600 block mt-0.5">{formatDateTime(log.dueDate)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'dashboard') {
      const maxCount = Math.max(...stats.monthlyStats.map((m: any) => m.count), 1);
      const maxCost = Math.max(...stats.monthlyStats.map((m: any) => m.cost), 1);

      const totalOverdueItems = stats.overdueTasks?.length || 0;
      const totalPages = Math.ceil(totalOverdueItems / ITEMS_PER_PAGE);
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const currentOverdueTasks = stats.overdueTasks?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

      return (
        <div className="flex flex-col gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex w-full sm:max-w-md relative">
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input 
                type="text" 
                placeholder="ค้นหาทะเบียนรถ (ตัวอย่าง: 34-3276)" 
                className="w-full pl-10 pr-24 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-600 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B603A] transition-all"
                value={searchInput} 
                onChange={(e) => setSearchInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
              />
              <button 
                onClick={executeSearch} 
                className="absolute right-1.5 top-1.5 bg-[#0B603A] hover:bg-[#08482b] text-white px-4 py-1 rounded-md text-xs font-bold transition-colors"
              >
                ค้นหา
              </button>
            </div>
            <div className="w-full sm:w-auto flex-shrink-0">
               <ImportButton />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs border-t-4 border-t-[#0B603A]">
              <div className="text-gray-400 text-xs font-bold mb-0.5">รถยนต์ในระบบทั้งหมด</div>
              <div className="text-2xl font-black text-[#0B603A]">{stats.totalVehicles} <span className="text-xs font-normal text-gray-400">คัน</span></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs border-t-4 border-t-amber-500">
              <div className="text-gray-400 text-xs font-bold mb-0.5">ใบแจ้งซ่อมทั้งหมด</div>
              <div className="text-2xl font-black text-amber-600">{stats.totalLogs} <span className="text-xs font-normal text-gray-400">รายการ</span></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs border-t-4 border-t-emerald-600">
              <div className="text-gray-400 text-xs font-bold mb-0.5">ยอดค่าซ่อมรวมสุทธิ</div>
              <div className="text-2xl font-black text-emerald-600">{stats.totalCost.toLocaleString('th-TH')} <span className="text-xs font-normal text-gray-400">บาท</span></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-800 mb-4 flex items-center gap-2">⚡ ประสิทธิภาพการดำเนินงานและความเร็วในการบริการ (KPI Metrics)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between">
                <div>
                  <span className="text-gray-500 block mb-1">ซ่อมเสร็จตามกำหนด (SLA)</span>
                  <span className="text-xl font-bold text-emerald-600 font-mono">{stats.efficiency.onTimeRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div style={{ width: `${stats.efficiency.onTimeRate}%` }} className="bg-emerald-500 h-1 rounded-full"></div>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-gray-500 block mb-1">เวลาเฉลี่ยในการจ่ายงานให้ช่าง</span>
                <span className="text-xl font-bold text-blue-600 font-mono">{stats.efficiency.avgResponseHours}</span>
                <span className="text-xs text-gray-400 ml-1">ชั่วโมง / งาน</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-gray-500 block mb-1">เวลาเฉลี่ยที่ใช้ในการซ่อมจริง</span>
                <span className="text-xl font-bold text-purple-600 font-mono">{stats.efficiency.avgRepairHours}</span>
                <span className="text-xs text-gray-400 ml-1">ชั่วโมง / งาน</span>
              </div>
              <div className={`p-4 rounded-lg border flex flex-col justify-between ${stats.efficiency.overdueActiveCount > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                <div>
                  <span className="text-gray-500 block mb-1">งานคงค้างที่เลยกำหนดส่ง</span>
                  <span className={`text-xl font-bold font-mono ${stats.efficiency.overdueActiveCount > 0 ? 'text-rose-600' : 'text-gray-700'}`}>{stats.efficiency.overdueActiveCount}</span>
                  <span className="text-xs text-gray-400 ml-1">รายการ</span>
                </div>
                {stats.efficiency.overdueActiveCount > 0 && <span className="text-[10px] font-bold text-rose-500 animate-pulse mt-1">⚠️ เกินกำหนดเวลาส่งมอบ</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <h3 className="text-xs font-bold text-gray-800 mb-6">📈 จำนวนใบแจ้งซ่อมแยกรายเดือน (6 เดือนล่าสุด)</h3>
              <div className="flex h-40 items-end justify-between gap-2 border-b border-gray-200 pb-2 px-2">
                {stats.monthlyStats.map((item: any, idx: number) => {
                  const heightPercent = (item.count / maxCount) * 100;
                  return (
                    <div key={idx} className="flex flex-1 flex-col items-center h-full justify-end group">
                      <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 px-1.5 py-0.5 rounded mb-0.5 whitespace-nowrap">{item.count} งาน</span>
                      <div style={{ height: `${Math.max(heightPercent, 6)}%` }} className="w-full rounded-t bg-blue-500 hover:bg-blue-600 transition-all group-hover:scale-x-105"></div>
                      <span className="text-[10px] text-gray-500 truncate max-w-full font-medium mt-1">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <h3 className="text-xs font-bold text-gray-800 mb-6">💰 ยอดค่าใช้จ่ายรวมสุทธิรายเดือน (6 เดือนล่าสุด)</h3>
              <div className="flex h-40 items-end justify-between gap-2 border-b border-gray-200 pb-2 px-2">
                {stats.monthlyStats.map((item: any, idx: number) => {
                  const heightPercent = (item.cost / maxCost) * 100;
                  return (
                    <div key={idx} className="flex flex-1 flex-col items-center h-full justify-end group">
                      <span className="text-[9px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-50 px-1 py-0.5 rounded mb-0.5 truncate max-w-[110%]">{item.cost.toLocaleString()} ฿</span>
                      <div style={{ height: `${Math.max(heightPercent, 6)}%` }} className="w-full rounded-t bg-emerald-500 hover:bg-emerald-600 transition-all group-hover:scale-x-105"></div>
                      <span className="text-[10px] text-gray-500 truncate max-w-full font-medium mt-1">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {totalOverdueItems > 0 && (
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-rose-50/40">
                <h3 className="font-bold text-sm text-rose-700 flex items-center gap-2">🚨 รายการแจ้งซ่อมที่เกินกำหนด ({totalOverdueItems} รายการ)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-gray-500 bg-gray-50 border-b border-gray-200 text-xs">
                    <tr>
                      <th className="px-6 py-3 font-semibold">ลำดับ</th>
                      <th className="px-6 py-3 font-semibold">ทะเบียนรถ</th>
                      <th className="px-6 py-3 font-semibold">รายละเอียด / อาการ</th>
                      <th className="px-6 py-3 font-semibold">ช่างที่รับผิดชอบ</th>
                      <th className="px-6 py-3 font-semibold">สถานะ</th>
                      <th className="px-6 py-3 font-semibold">กำหนดส่งเดิม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white text-xs">
                    {currentOverdueTasks.map((task: any, idx: number) => (
                      <tr key={task.id} className="hover:bg-rose-50/30 transition-colors">
                        <td className="px-6 py-3.5 text-gray-400">{startIndex + idx + 1}</td>
                        <td className="px-6 py-3.5 font-bold text-gray-900">{task.plate || "-"}</td>
                        <td className="px-6 py-3.5 text-gray-600 max-w-[220px] truncate">{task.description}</td>
                        <td className="px-6 py-3.5 text-blue-600 font-medium">{task.technicianName || "ยังไม่จ่ายงาน"}</td>
                        <td className="px-6 py-3.5">{getStatusBadge(task.status)}</td>
                        <td className="px-6 py-3.5 font-bold text-rose-600">{formatDateTime(task.dueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
                  <span>แสดง {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, totalOverdueItems)} จาก {totalOverdueItems} รายการ</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-2.5 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50">ก่อนหน้า</button>
                    <span className="px-2 py-1 text-gray-700 font-semibold">หน้า {currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-2.5 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50">ถัดไป</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <h3 className="text-sm font-bold text-gray-800 mb-3 border-b pb-2">สรุปตามสถานะงานซ่อม (Status)</h3>
              <div className="flex flex-col gap-2">
                {stats.statusCounts.map((item: any) => (
                  <div key={item.status} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    {getStatusBadge(item.status)}
                    <span className="font-bold text-gray-800">{item.count} <span className="text-xs font-normal text-gray-500 ml-1">รายการ</span></span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <h3 className="text-sm font-bold text-gray-800 mb-3 border-b pb-2">สรุปตามความเร่งด่วน (Priority)</h3>
              <div className="flex flex-col gap-2">
                {stats.priorityCounts.map((item: any) => (
                  <div key={item.priority} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    {getPriorityBadge(item.priority)}
                    <span className="font-bold text-gray-800">{item.count} <span className="text-xs font-normal text-gray-500 ml-1">รายการ</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'workshops') {
      const totalWorkshops = stats.workshopsData?.length || 0;
      return (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs border-t-4 border-t-[#0B603A]">
              <div className="text-gray-400 text-xs font-bold mb-0.5">จำนวนอู่ในระบบทั้งหมด</div>
              <div className="text-2xl font-black text-[#0B603A]">{totalWorkshops} <span className="text-xs font-normal text-gray-400">อู่</span></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs border-t-4 border-t-blue-500">
              <div className="text-gray-400 text-xs font-bold mb-0.5">อู่ที่มีประสิทธิภาพ SLA สูงสุด (&gt;=80%)</div>
              <div className="text-2xl font-black text-blue-600">
                {stats.workshopsData.filter((w: any) => w.efficiencyRate >= 80).length} <span className="text-xs font-normal text-gray-400">อู่</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs border-t-4 border-t-rose-500">
              <div className="text-gray-400 text-xs font-bold mb-0.5">อู่ที่ตรวจพบงานล่าช้าสะสม</div>
              <div className="text-2xl font-black text-rose-600">
                {stats.workshopsData.filter((w: any) => w.lateCount > 0).length} <span className="text-xs font-normal text-gray-400">อู่</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-sm text-gray-800">📊 ตารางวิเคราะห์ประสิทธิภาพและปริมาณงานแยกตาม อู่/ศูนย์ซ่อม</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-500 bg-gray-50 border-b border-gray-200 text-xs">
                  <tr>
                    <th className="px-6 py-3 font-semibold">ชื่ออู่ / ศูนย์บริการ</th>
                    <th className="px-6 py-3 font-semibold text-center">งานซ่อมทั้งหมด</th>
                    <th className="px-6 py-3 font-semibold text-center">ซ่อมสำเร็จ (ทันกำหนด)</th>
                    <th className="px-6 py-3 font-semibold text-center">กำลังซ่อมอยู่</th>
                    <th className="px-6 py-3 font-semibold text-center">งานล่าช้า / เลยกำหนด</th>
                    <th className="px-6 py-3 font-semibold text-center">เวลาซ่อมเฉลี่ย</th>
                    <th className="px-6 py-3 font-semibold text-center">อัตราสำเร็จ (SLA %)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-xs">
                  {stats.workshopsData.map((workshop: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{workshop.name}</td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-700">{workshop.totalJobs}</td>
                      <td className="px-6 py-4 text-center text-emerald-600 font-bold">{workshop.successCount}</td>
                      <td className="px-6 py-4 text-center text-amber-600 font-bold">{workshop.inProgressCount}</td>
                      <td className="px-6 py-4 text-center text-rose-600 font-bold">{workshop.lateCount}</td>
                      <td className="px-6 py-4 text-center font-mono text-gray-600">{workshop.avgRepairHours} ชม.</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-md font-mono font-bold ${
                          workshop.efficiencyRate >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          workshop.efficiencyRate >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {workshop.efficiencyRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // 🚀 แท็บที่ 3: เมนู ทีมช่างและประสิทธิภาพ 
    if (activeTab === 'technicians') {
      let currentTechsList: any[] = [];
      let topTechnicians: any[] = [];
      let bottomTechnicians: any[] = [];
      let totalTechsInWorkshop = 0;

      // 🚀 หากเลือก 'all' ให้คำนวณสถิติรวมของช่างทั้งหมดจากทุกอู่ในระบบ
      if (selectedWorkshop === "all") {
        const allTechsMap = new Map();

        stats.workshopsData?.forEach((w: any) => {
          w.technicians?.forEach((t: any) => {
            if (!allTechsMap.has(t.name)) {
              allTechsMap.set(t.name, { ...t });
            } else {
              // ถ้ารายชื่อช่างซ้ำกัน ให้บวกรวมยอดงานเข้าด้วยกัน
              const existing = allTechsMap.get(t.name);
              existing.totalJobs += t.totalJobs;
              existing.successCount += t.successCount;
              existing.inProgressCount += t.inProgressCount;
              existing.lateCount += t.lateCount;
              
              const tClosed = existing.successCount + existing.lateCount;
              existing.efficiencyRate = tClosed > 0 ? Math.round((existing.successCount / tClosed) * 1000) / 10 : 0;
            }
          });
        });

        const allTechsArray = Array.from(allTechsMap.values());
        totalTechsInWorkshop = allTechsArray.length;

        topTechnicians = [...allTechsArray]
          .sort((a, b) => b.efficiencyRate - a.efficiencyRate || b.successCount - a.successCount)
          .slice(0, 3);

        bottomTechnicians = [...allTechsArray]
          .sort((a, b) => a.efficiencyRate - b.efficiencyRate || a.lateCount - b.lateCount)
          .slice(0, 3);

        const techStartIndex = (currentTechPage - 1) * ITEMS_PER_PAGE;
        const techEndIndex = techStartIndex + ITEMS_PER_PAGE;
        currentTechsList = allTechsArray.slice(techStartIndex, techEndIndex);

      } else {
        // หากเจาะจงเลือกดูรายอู่
        const selectedWData = stats.workshopsData?.find((w: any) => w.name === selectedWorkshop);
        totalTechsInWorkshop = selectedWData?.technicians?.length || 0;
        topTechnicians = selectedWData?.topTechnicians || [];
        bottomTechnicians = selectedWData?.bottomTechnicians || [];

        const techStartIndex = (currentTechPage - 1) * ITEMS_PER_PAGE;
        const techEndIndex = techStartIndex + ITEMS_PER_PAGE;
        currentTechsList = selectedWData?.technicians?.slice(techStartIndex, techEndIndex) || [];
      }

      const totalTechPages = Math.max(1, Math.ceil(totalTechsInWorkshop / ITEMS_PER_PAGE));
      const techStartIndexDisplay = (currentTechPage - 1) * ITEMS_PER_PAGE;

      return (
        <div className="flex flex-col gap-6">
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col gap-1 w-full sm:w-72">
              <label className="text-xs font-bold text-gray-500">กรุณาเลือกอู่/ศูนย์ซ่อมเพื่อตรวจสอบรายชื่อช่าง:</label>
              <select 
                value={selectedWorkshop}
                onChange={(e) => { setSelectedWorkshop(e.target.value); setCurrentTechPage(1); }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-bold text-[#0B603A] focus:outline-none focus:ring-2 focus:ring-[#0B603A]"
              >
                {/* 🚀 เพิ่มตัวเลือก "แสดงทั้งหมดทุกอู่" ด้านบนสุด */}
                <option value="all">🌐 แสดงช่างทั้งหมดทุกอู่รวมกัน</option>
                {stats.workshopsData?.map((w: any, i: number) => (
                  <option key={i} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl py-3 px-6 text-center w-full sm:w-auto flex items-center gap-3">
              <span className="text-2xl">👨‍💻</span>
              <div className="text-left">
                <span className="text-xs text-gray-500 font-bold block leading-none mb-1">
                  {selectedWorkshop === "all" ? "จำนวนช่างทั้งหมดในระบบ" : "จำนวนช่างประจำอู่นี้"}
                </span>
                <span className="text-xl font-black text-[#0B603A] font-mono">{totalTechsInWorkshop} <span className="text-xs font-bold text-gray-400">คน</span></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-2xs border-t-4 border-t-emerald-600">
              <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">🏆 ช่างผลงานดีเด่นสูงสุด 3 อันดับแรก (SLA %)</h4>
              <div className="flex flex-col gap-2">
                {topTechnicians?.map((t: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs font-semibold">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">{idx + 1}</span>
                      <span className="text-gray-800 text-sm">{t.name}</span>
                    </div>
                    <span className="font-mono bg-emerald-600 text-white px-2 py-0.5 rounded font-bold text-sm">{t.efficiencyRate}%</span>
                  </div>
                ))}
                {(!topTechnicians || topTechnicians.length === 0) && <p className="text-center text-gray-400 py-4">ไม่มีข้อมูล</p>}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-2xs border-t-4 border-t-rose-500">
              <h4 className="text-sm font-bold text-rose-800 mb-3 flex items-center gap-2">⚠️ ช่างที่ควรเข้าประเมินผลงาน 3 อันดับแรก (SLA ต่ำสุด)</h4>
              <div className="flex flex-col gap-2">
                {bottomTechnicians?.map((t: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-rose-50/50 border border-rose-100 text-xs font-semibold">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold">{idx + 1}</span>
                      <span className="text-gray-800 text-sm">{t.name}</span>
                    </div>
                    <span className="font-mono bg-rose-500 text-white px-2 py-0.5 rounded font-bold text-sm">{t.efficiencyRate}%</span>
                  </div>
                ))}
                {(!bottomTechnicians || bottomTechnicians.length === 0) && <p className="text-center text-gray-400 py-4">ไม่มีข้อมูล</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-sm text-gray-800">
                📋 ตารางผลงานช่างรายบุคคล ประจำ: {selectedWorkshop === "all" ? "ทุกอู่รวมกัน" : selectedWorkshop || "-"}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-500 bg-gray-50 border-b border-gray-200 text-xs">
                  <tr>
                    <th className="px-6 py-3 font-semibold">ลำดับ</th>
                    <th className="px-6 py-3 font-semibold">ชื่อ-นามสกุลช่าง</th>
                    <th className="px-6 py-3 font-semibold text-center">งานทั้งหมด</th>
                    <th className="px-6 py-3 font-semibold text-center">ซ่อมสำเร็จ (ทันกำหนด)</th>
                    <th className="px-6 py-3 font-semibold text-center">กำลังซ่อมอยู่</th>
                    <th className="px-6 py-3 font-semibold text-center">ล่าช้า / เกินกำหนด</th>
                    <th className="px-6 py-3 font-semibold text-center">ประสิทธิภาพสะสม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-xs">
                  {currentTechsList.map((tech: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-400">{techStartIndexDisplay + idx + 1}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{tech.name}</td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-700">{tech.totalJobs}</td>
                      <td className="px-6 py-4 text-center text-emerald-600 font-bold">{tech.successCount}</td>
                      <td className="px-6 py-4 text-center text-amber-600 font-bold">{tech.inProgressCount}</td>
                      <td className="px-6 py-4 text-center text-rose-600 font-bold">{tech.lateCount}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                          tech.efficiencyRate >= 80 ? 'bg-emerald-50 text-emerald-700' :
                          tech.efficiencyRate >= 50 ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {tech.efficiencyRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {currentTechsList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400 font-medium">ไม่พบข้อมูลรายชื่อช่าง</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {totalTechPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
                <span>แสดง {techStartIndexDisplay + 1} - {Math.min(techStartIndexDisplay + ITEMS_PER_PAGE, totalTechsInWorkshop)} จาก {totalTechsInWorkshop} คน</span>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setCurrentTechPage(p => Math.max(p - 1, 1))} 
                    disabled={currentTechPage === 1} 
                    className="px-2.5 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 font-medium"
                  >
                    ก่อนหน้า
                  </button>
                  <span className="px-2 py-1 text-gray-700 font-semibold">หน้า {currentTechPage} / {totalTechPages}</span>
                  <button 
                    onClick={() => setCurrentTechPage(p => Math.min(p + 1, totalTechPages))} 
                    disabled={currentTechPage === totalTechPages} 
                    className="px-2.5 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 font-medium"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100" title="เปิด/ปิด เมนู">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <div className="flex items-center gap-2 mr-2">
            <div className="bg-[#0B603A] text-white font-black italic rounded-full px-3 py-1 text-sm tracking-widest border-2 border-green-200">EVT</div>
            <span className="font-bold text-gray-800 text-sm hidden sm:block">EVT Admin Panel</span>
          </div>
          <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>
          
          <h1 className="text-base font-bold text-[#0B603A]">
            {vehicleData !== undefined ? "ประวัติการซ่อมบำรุงรถ" : activeTab === 'dashboard' ? "Dashboard การซ่อมบำรุง" : activeTab === 'workshops' ? "อู่/ศูนย์ซ่อม" : "ทีมช่างและประสิทธิภาพ"}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 py-1 px-2 select-none">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-800 leading-tight">testuser</p>
              <p className="text-[10px] text-gray-400 font-bold leading-none">admins</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0B603A] text-white flex items-center justify-center font-bold outline outline-2 outline-offset-2 outline-green-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-shrink-0 transition-all duration-300 ease-in-out bg-white ${isSidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth w-full">
          <div className="mx-auto max-w-7xl">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}