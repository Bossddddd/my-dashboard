"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import ImportButton from "../components/ImportButton";
import toast from "react-hot-toast";
import { searchVehicleByPlate, getDashboardStats } from "./actions";

interface MaintenanceLog {
  maintenanceLogId: number;
  vehiclePlate?: string;
  technicianName?: string;
  priority: string; 
  status: string;   
  description: string;
  reportedAt: string;
  dueDate: string;
}

interface VehicleRecord {
  vehicleId: number;
  vehiclePlate: string;
  brand?: string;
  model?: string;
  maintenanceHistory: any[];
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
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color} w-fit`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0"></span>
      <span className="whitespace-nowrap">{config.text}</span>
    </div>
  );
};

const getPriorityBadge = (priority: string) => {
  const config = PRIORITY_CONFIG[priority] || { text: priority || "-", color: "bg-gray-50 border-gray-200" };
  return <span className={`px-2 py-0.5 rounded text-xs font-bold border ${config.color} whitespace-nowrap`}>{config.text}</span>;
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return <span className="text-gray-400 whitespace-nowrap">-</span>;
  return (
    <span className="whitespace-nowrap">
      {new Date(dateStr).toLocaleString('th-TH', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })} น.
    </span>
  );
};

function PurePieChart({ success, inProgress, late, size = 'sm' }: { success: number, inProgress: number, late: number, size?: 'sm' | 'lg' }) {
  const total = success + inProgress + late;
  const sizeClass = size === 'lg' ? 'w-56 h-56' : 'w-24 h-24';
  const innerSizeClass = size === 'lg' ? 'w-36 h-36' : 'w-14 h-14';
  const textClass = size === 'lg' ? 'text-4xl' : 'text-sm';
  const subTextClass = size === 'lg' ? 'text-sm' : 'text-[9px]';

  if (total === 0) {
    return (
      <div className={`${sizeClass} rounded-full bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-gray-400`}>
        <span className="text-xs font-medium">ไม่มีข้อมูล</span>
      </div>
    );
  }

  const p1 = (success / total) * 100;
  const p2 = (inProgress / total) * 100;

  return (
    <div 
      className={`relative ${sizeClass} rounded-full flex items-center justify-center shadow-sm shrink-0`} 
      style={{
        background: `conic-gradient(#10B981 0% ${p1}%, #F59E0B ${p1}% ${p1 + p2}%, #EF4444 ${p1 + p2}% 100%)`
      }}
    >
      <div className={`${innerSizeClass} bg-white rounded-full flex flex-col items-center justify-center text-center shadow-sm`}>
        <span className={`${textClass} font-black text-gray-700 font-mono leading-none`}>{total}</span>
        <span className={`${subTextClass} text-gray-400 font-bold mt-1`}>งานทั้งหมด</span>
      </div>
    </div>
  );
}

// 🚀 สร้างคอมโพเนนต์สำหรับระบบแบ่งหน้า (Pagination) แบบมีตัวเลข
const renderPagination = (currentPage: number, totalPages: number, onPageChange: (page: number) => void, totalItems: number, startIndex: number, itemsPerPage: number) => {
  if (totalPages <= 1) return null;

  const pages = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (currentPage <= 3) endPage = Math.min(5, totalPages);
  if (currentPage >= totalPages - 2) startPage = Math.max(1, totalPages - 4);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
          currentPage === i
            ? "bg-[#0B603A] text-white shadow-md"
            : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
        }`}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 bg-gray-50/80 font-medium">
      <span className="whitespace-nowrap text-center sm:text-left">
        แสดงผล <span className="font-bold text-gray-800">{startIndex + 1}</span> ถึง <span className="font-bold text-gray-800">{Math.min(startIndex + itemsPerPage, totalItems)}</span> จากทั้งหมด <span className="font-bold text-gray-800">{totalItems}</span> รายการ
      </span>
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 font-bold shadow-xs transition-colors shrink-0"
        >
          ก่อนหน้า
        </button>

        {startPage > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-bold">1</button>
            {startPage > 2 && <span className="text-gray-400">...</span>}
          </>
        )}

        {pages}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
            <button onClick={() => onPageChange(totalPages)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-bold">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 font-bold shadow-xs transition-colors shrink-0"
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [vehicleData, setVehicleData] = useState<VehicleRecord | null | undefined>(undefined);
  const [stats, setStats] = useState<any>(null);
  const [searchInput, setSearchInput] = useState("");
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workshops' | 'technicians'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [selectedWorkshopDetail, setSelectedWorkshopDetail] = useState<any | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState("all");
  
  // 🚀 ตั้งค่าการแสดงผลตารางเป็น 100 รายการต่อหน้า
  const ITEMS_PER_PAGE = 100; 

  const [currentPage, setCurrentPage] = useState(1);
  const [currentTechPage, setCurrentTechPage] = useState(1);
  const [currentWorkshopLogPage, setCurrentWorkshopLogPage] = useState(1);

  useEffect(() => {
    const loadStats = async () => {
      const data = await getDashboardStats();
      if (data) setStats(data);
    };
    loadStats();
  }, []);

  useEffect(() => {
    setSelectedWorkshopDetail(null);
  }, [activeTab]);

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
        maintenanceHistory: foundData.logs
      });
    } else {
      toast.error(`ไม่พบข้อมูล ${searchInput}`, { id: searchToast });
      setVehicleData(null);
    }
  };

  const techsData = useMemo(() => {
    if (!stats?.workshopsData) return { list: [], top: [], bottom: [], total: 0 };

    let allTechsArray: any[] = [];
    if (selectedWorkshop === "all") {
      const allTechsMap = new Map();
      stats.workshopsData.forEach((w: any) => {
        w.technicians?.forEach((t: any) => {
          if (!allTechsMap.has(t.name)) {
            allTechsMap.set(t.name, { ...t });
          } else {
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
      allTechsArray = Array.from(allTechsMap.values());
    } else {
      const wData = stats.workshopsData.find((w: any) => w.name === selectedWorkshop);
      allTechsArray = wData?.technicians || [];
    }

    const sortedByEff = [...allTechsArray].sort((a, b) => b.efficiencyRate - a.efficiencyRate || b.successCount - a.successCount);
    const sortedByWorst = [...allTechsArray].sort((a, b) => a.efficiencyRate - b.efficiencyRate || a.lateCount - b.lateCount);

    return {
      list: allTechsArray,
      top: sortedByEff.slice(0, 3),
      bottom: sortedByWorst.slice(0, 3),
      total: allTechsArray.length
    };
  }, [stats, selectedWorkshop]);

  const workshopSums = useMemo(() => {
    if (!stats?.workshopsData) return { sumSuccess: 0, sumInProgress: 0, sumLate: 0, totalWorkshops: 0 };
    return {
      totalWorkshops: stats.workshopsData.length,
      sumSuccess: stats.workshopsData.reduce((acc: number, cur: any) => acc + cur.successCount, 0),
      sumInProgress: stats.workshopsData.reduce((acc: number, cur: any) => acc + cur.inProgressCount, 0),
      sumLate: stats.workshopsData.reduce((acc: number, cur: any) => acc + cur.lateCount, 0),
    };
  }, [stats]);


  const renderContent = () => {
    if (!stats) return <div className="text-center p-10 text-gray-500 font-medium flex items-center justify-center gap-2"><span className="animate-spin text-xl">⏳</span> กำลังโหลดข้อมูล...</div>;

    // ==========================================
    // หน้าค้นหาประวัติรายคัน
    // ==========================================
    if (vehicleData !== undefined) {
      if (vehicleData === null) {
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <h2 className="text-lg font-bold text-gray-800">ไม่พบข้อมูลยานพาหนะ</h2>
            <p className="text-gray-500 text-sm mt-1">ไม่พบเลขทะเบียน <span className="font-bold text-gray-800">"{searchInput}"</span> ในระบบ</p>
            <button onClick={() => {setSearchInput(""); setVehicleData(undefined);}} className="mt-4 text-xs bg-gray-100 text-gray-600 font-bold px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              กลับหน้าหลัก
            </button>
          </div>
        );
      }
      return (
        <div className="flex flex-col gap-6">
          <button onClick={() => {setSearchInput(""); setVehicleData(undefined);}} className="text-sm font-bold text-gray-500 hover:text-[#0B603A] flex items-center gap-1 transition-colors w-fit">
            ← กลับหน้าแดชบอร์ดหลัก
          </button>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-3xl shrink-0">🚌</div>
            <div>
              <h2 className="text-2xl font-black text-[#0B603A]">{vehicleData.vehiclePlate}</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">ยี่ห้อ/รุ่น: {vehicleData.brand || "-"} {vehicleData.model || "-"} (รหัส ID-{vehicleData.vehicleId})</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">📋 ประวัติการแจ้งซ่อม</p>
            </div>
            <div className="divide-y divide-gray-100">
              {vehicleData.maintenanceHistory?.map((log: any, idx: number) => (
                <div key={idx} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-[#0B603A]">ใบงาน: #{log.id || "N/A"}</span>
                    {getStatusBadge(log.status)}
                  </div>
                  <p className="text-sm text-gray-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed mb-3 break-words whitespace-normal">
                    {log.description}
                  </p>
                  <div className="flex gap-6 text-xs text-gray-500 flex-wrap">
                    <div>ช่างซ่อม: <span className="font-bold text-gray-800">{log.technicianName || "-"}</span></div>
                    <div>วันที่แจ้ง: <span className="font-medium text-gray-800">{formatDateTime(log.reportedAt)}</span></div>
                    <div>ความเร่งด่วน: {getPriorityBadge(log.priority)}</div>
                  </div>
                </div>
              ))}
              {(!vehicleData.maintenanceHistory || vehicleData.maintenanceHistory.length === 0) && (
                <div className="p-8 text-center text-gray-400 font-medium">ไม่พบประวัติการซ่อมบำรุง</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // แท็บที่ 1: Dashboard การซ่อมบำรุง
    // ==========================================
    if (activeTab === 'dashboard') {
      const maxCount = Math.max(...stats.monthlyStats.map((m: any) => m.count), 1);
      const maxCost = Math.max(...stats.monthlyStats.map((m: any) => m.cost), 1);
      
      const totalOverdueItems = stats.overdueTasks?.length || 0;
      const totalPages = Math.ceil(totalOverdueItems / ITEMS_PER_PAGE) || 1;
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const currentOverdueTasks = stats.overdueTasks?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

      return (
        <div className="flex flex-col gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex w-full sm:max-w-md relative">
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input 
                type="text" 
                placeholder="ค้นหาทะเบียนรถ (ตัวอย่าง: 34-3276)" 
                className="w-full pl-10 pr-24 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-600 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B603A] transition-colors"
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
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm border-t-4 border-t-[#0B603A]">
              <div className="text-gray-400 text-xs font-bold mb-1">รถยนต์ในระบบทั้งหมด</div>
              <div className="text-3xl font-black text-[#0B603A]">{stats.totalVehicles} <span className="text-sm font-normal text-gray-400">คัน</span></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm border-t-4 border-t-amber-500">
              <div className="text-gray-400 text-xs font-bold mb-1">ใบแจ้งซ่อมทั้งหมด</div>
              <div className="text-3xl font-black text-amber-600">{stats.totalLogs} <span className="text-sm font-normal text-gray-400">รายการ</span></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm border-t-4 border-t-emerald-600">
              <div className="text-gray-400 text-xs font-bold mb-1">ยอดค่าซ่อมรวมสุทธิ</div>
              <div className="text-3xl font-black text-emerald-600">{stats.totalCost.toLocaleString('th-TH')} <span className="text-sm font-normal text-gray-400">บาท</span></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">⚡ ประสิทธิภาพการดำเนินงานและความเร็วในการบริการ (KPI Metrics)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between">
                <div>
                  <span className="text-gray-500 block mb-1 text-xs font-bold">ซ่อมเสร็จตามกำหนด (SLA)</span>
                  <span className="text-2xl font-bold text-emerald-600 font-mono">{stats.efficiency.onTimeRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div style={{ width: `${stats.efficiency.onTimeRate}%` }} className="bg-emerald-500 h-1.5 rounded-full"></div>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-gray-500 block mb-1 text-xs font-bold">เวลาเฉลี่ยในการจ่ายงานให้ช่าง</span>
                <span className="text-2xl font-bold text-blue-600 font-mono">{stats.efficiency.avgResponseHours}</span>
                <span className="text-xs text-gray-400 ml-1">ชั่วโมง / งาน</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-gray-500 block mb-1 text-xs font-bold">เวลาเฉลี่ยที่ใช้ในการซ่อมจริง</span>
                <span className="text-2xl font-bold text-purple-600 font-mono">{stats.efficiency.avgRepairHours}</span>
                <span className="text-xs text-gray-400 ml-1">ชั่วโมง / งาน</span>
              </div>
              <div className={`p-4 rounded-lg border flex flex-col justify-between ${stats.efficiency.overdueActiveCount > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                <div>
                  <span className="text-gray-500 block mb-1 text-xs font-bold">งานคงค้างที่เลยกำหนดส่ง</span>
                  <span className={`text-2xl font-bold font-mono ${stats.efficiency.overdueActiveCount > 0 ? 'text-rose-600' : 'text-gray-700'}`}>{stats.efficiency.overdueActiveCount}</span>
                  <span className="text-xs text-gray-400 ml-1">รายการ</span>
                </div>
                {stats.efficiency.overdueActiveCount > 0 && <span className="text-[10px] font-bold text-rose-500 animate-pulse mt-1">⚠️ เร่งติดตามงานด่วน</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-6">📈 จำนวนใบแจ้งซ่อมแยกรายเดือน (6 เดือนล่าสุด)</h3>
              <div className="flex h-48 items-end justify-between gap-2 border-b border-gray-200 pb-2 px-2">
                {stats.monthlyStats.map((item: any, idx: number) => {
                  const heightPercent = (item.count / maxCount) * 100;
                  return (
                    <div key={idx} className="flex flex-1 flex-col items-center h-full justify-end group">
                      <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 px-2 py-0.5 rounded mb-1 whitespace-nowrap">{item.count} งาน</span>
                      <div style={{ height: `${Math.max(heightPercent, 6)}%` }} className="w-full rounded-t-sm bg-blue-500 hover:bg-blue-600 transition-all group-hover:scale-x-105"></div>
                      <span className="text-xs text-gray-500 truncate max-w-full font-medium mt-2">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-6">💰 ยอดค่าใช้จ่ายรวมสุทธิรายเดือน (6 เดือนล่าสุด)</h3>
              <div className="flex h-48 items-end justify-between gap-2 border-b border-gray-200 pb-2 px-2">
                {stats.monthlyStats.map((item: any, idx: number) => {
                  const heightPercent = (item.cost / maxCost) * 100;
                  return (
                    <div key={idx} className="flex flex-1 flex-col items-center h-full justify-end group">
                      <span className="text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-50 px-2 py-0.5 rounded mb-1 truncate max-w-[120%]">{item.cost.toLocaleString()} ฿</span>
                      <div style={{ height: `${Math.max(heightPercent, 6)}%` }} className="w-full rounded-t-sm bg-emerald-500 hover:bg-emerald-600 transition-all group-hover:scale-x-105"></div>
                      <span className="text-xs text-gray-500 truncate max-w-full font-medium mt-2">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 🚀 ตารางงานล่าช้า ปลดล็อคความกว้าง และยอมให้ขึ้นบรรทัดใหม่ */}
          {totalOverdueItems > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-rose-200 overflow-hidden">
              <div className="p-4 border-b border-rose-100 bg-rose-50/50">
                <h3 className="font-bold text-base text-rose-700 flex items-center gap-2">🚨 รายการแจ้งซ่อมที่เกินกำหนด ({totalOverdueItems} รายการ)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[1000px]">
                  <thead className="text-gray-600 bg-rose-50/20 text-xs uppercase border-b border-rose-100">
                    <tr>
                      <th className="px-4 py-3 font-bold whitespace-nowrap">ลำดับ</th>
                      <th className="px-4 py-3 font-bold whitespace-nowrap">ทะเบียนรถ</th>
                      <th className="px-4 py-3 font-bold whitespace-nowrap">รายละเอียด / อาการ</th>
                      <th className="px-4 py-3 font-bold whitespace-nowrap">ช่างที่รับผิดชอบ</th>
                      <th className="px-4 py-3 font-bold whitespace-nowrap">สถานะ</th>
                      <th className="px-4 py-3 font-bold whitespace-nowrap">กำหนดส่งเดิม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white text-sm">
                    {currentOverdueTasks.map((task: any, idx: number) => (
                      <tr key={task.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="px-4 py-4 text-gray-400 whitespace-nowrap">{startIndex + idx + 1}</td>
                        <td className="px-4 py-4 font-black text-gray-900 whitespace-nowrap">{task.plate || "-"}</td>
                        {/* 🚀 บังคับตัดคำเฉพาะช่องรายละเอียด และเว้นที่ขั้นต่ำให้กว้างพอ */}
                        <td className="px-4 py-4 text-gray-600 leading-relaxed whitespace-normal break-words min-w-[250px]">{task.description}</td>
                        <td className="px-4 py-4 text-blue-600 font-bold whitespace-nowrap">{task.technicianName || "ยังไม่จ่ายงาน"}</td>
                        <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(task.status)}</td>
                        <td className="px-4 py-4 font-bold text-rose-600 whitespace-nowrap">{formatDateTime(task.dueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* 🚀 นำ Pagination Component มาใช้งาน */}
              {renderPagination(currentPage, totalPages, setCurrentPage, totalOverdueItems, startIndex, ITEMS_PER_PAGE)}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">สรุปตามสถานะงานซ่อม (Status)</h3>
              <div className="flex flex-col gap-2">
                {stats.statusCounts.map((item: any) => (
                  <div key={item.status} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    {getStatusBadge(item.status)}
                    <span className="font-bold text-gray-800">{item.count} <span className="text-xs font-normal text-gray-500 ml-1">รายการ</span></span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">สรุปตามความเร่งด่วน (Priority)</h3>
              <div className="flex flex-col gap-2">
                {stats.priorityCounts.map((item: any) => (
                  <div key={item.priority} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
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

    // ==========================================
    // แท็บที่ 2: อู่/ศูนย์ซ่อม 
    // ==========================================
    if (activeTab === 'workshops') {
      
      // หน้าจอเจาะลึกรายละเอียดอู่
      if (selectedWorkshopDetail) {
        const w = selectedWorkshopDetail;
        const totalWorkshopLogs = w.logs?.length || 0;
        const logTotalPages = Math.max(1, Math.ceil(totalWorkshopLogs / ITEMS_PER_PAGE));
        const logStartIndex = (currentWorkshopLogPage - 1) * ITEMS_PER_PAGE;
        const currentLogs = w.logs?.slice(logStartIndex, logStartIndex + ITEMS_PER_PAGE) || [];

        return (
          <div className="flex flex-col gap-6">
            <button 
              onClick={() => { setSelectedWorkshopDetail(null); setCurrentWorkshopLogPage(1); }} 
              className="text-sm font-bold text-gray-500 hover:text-[#0B603A] flex items-center gap-2 transition-colors w-fit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              กลับไปตารางอู่ทั้งหมด
            </button>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm w-full lg:w-96 flex flex-col items-center shrink-0">
                <h3 className="font-black text-gray-900 text-lg mb-6 text-center w-full border-b pb-3 border-gray-100">
                  🏢 {w.name}
                </h3>
                
                <div className="my-4">
                  <PurePieChart success={w.successCount} inProgress={w.inProgressCount} late={w.lateCount} size="lg" />
                </div>

                <div className="w-full space-y-4 mt-8 text-sm">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-bold flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> งานสำเร็จทั้งหมด:</span>
                    <span className="font-black text-emerald-600 text-base">{w.successCount} งาน</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-bold flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> กำลังซ่อมบำรุง:</span>
                    <span className="font-black text-amber-500 text-base">{w.inProgressCount} งาน</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-bold flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> งานล่าช้าสะสม:</span>
                    <span className="font-black text-rose-600 text-base">{w.lateCount} งาน</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-bold">เวลาซ่อมเฉลี่ย (ต่อคัน):</span>
                    <span className="font-mono font-bold text-gray-700">{w.avgRepairHours} ชม.</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-800 font-black">ประสิทธิภาพ (SLA):</span>
                    <span className={`px-3 py-1 rounded-lg font-mono font-black text-base shadow-sm ${
                      w.efficiencyRate >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      w.efficiencyRate >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {w.efficiencyRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* ฝั่งขวา: ลิสต์รายการซ่อม 🚀 ปลดล็อคความกว้างเพื่อให้เนื้อหาไม่ซ้อน */}
              <div className="flex-1 w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-base text-gray-800">
                    📋 ประวัติการดำเนินการของอู่นี้ ({totalWorkshopLogs} รายการ)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left relative min-w-[1000px]">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-4 font-bold whitespace-nowrap">ทะเบียนรถ</th>
                        <th className="px-5 py-4 font-bold whitespace-nowrap">รายละเอียด / อาการ</th>
                        <th className="px-5 py-4 font-bold whitespace-nowrap">ช่างผู้รับผิดชอบ</th>
                        <th className="px-5 py-4 font-bold text-center whitespace-nowrap">ความเร่งด่วน</th>
                        <th className="px-5 py-4 font-bold whitespace-nowrap">สถานะ</th>
                        <th className="px-5 py-4 font-bold whitespace-nowrap">กำหนดเสร็จ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {currentLogs.map((log: any, idx: number) => (
                        <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="px-5 py-4 font-black text-gray-900 whitespace-nowrap">{log.vehiclePlate}</td>
                          {/* 🚀 จำกัดความกว้างขั้นต่ำของรายละเอียด เพื่อให้ตัดบรรทัดได้เหมาะสมและไม่ทับส่วนอื่น */}
                          <td className="px-5 py-4 text-gray-600 leading-relaxed whitespace-normal break-words min-w-[300px]">{log.description}</td>
                          <td className="px-5 py-4 text-gray-800 font-bold whitespace-nowrap">{log.technicianName}</td>
                          <td className="px-5 py-4 text-center whitespace-nowrap">{getPriorityBadge(log.priority)}</td>
                          <td className="px-5 py-4 whitespace-nowrap">{getStatusBadge(log.status)}</td>
                          <td className="px-5 py-4 text-gray-500 font-bold whitespace-nowrap">{formatDateTime(log.dueDate)}</td>
                        </tr>
                      ))}
                      {currentLogs.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-12 text-gray-400 font-medium">ไม่พบข้อมูลประวัติใบงานซ่อมในอู่นี้</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 🚀 นำ Pagination Component มาใช้งาน */}
                {renderPagination(currentWorkshopLogPage, logTotalPages, setCurrentWorkshopLogPage, totalWorkshopLogs, logStartIndex, ITEMS_PER_PAGE)}
              </div>
            </div>
          </div>
        );
      }

      // หน้าหลักแท็บอู่ (แสดงรายชื่อตารางอู่ทั้งหมด)
      return (
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="flex flex-col items-center">
              <h3 className="text-base font-black text-gray-800 mb-6 text-center tracking-wide">
                📊 สัดส่วนสถานะงานซ่อมรวมทุกอู่ (ภาพรวมทั้งระบบ)
              </h3>
              <PurePieChart success={workshopSums.sumSuccess} inProgress={workshopSums.sumInProgress} late={workshopSums.sumLate} size="lg" />
            </div>
            
            <div className="flex flex-col gap-4 text-sm font-bold bg-gray-50 p-6 rounded-xl border border-gray-100 min-w-[250px]">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="flex items-center gap-3 text-gray-600"><span className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm"></span> งานสำเร็จทั้งหมด</span>
                <span className="text-emerald-600 text-lg font-black">{workshopSums.sumSuccess}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="flex items-center gap-3 text-gray-600"><span className="w-4 h-4 rounded-full bg-amber-500 shadow-sm"></span> กำลังซ่อมบำรุง</span>
                <span className="text-amber-500 text-lg font-black">{workshopSums.sumInProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-3 text-gray-600"><span className="w-4 h-4 rounded-full bg-rose-500 shadow-sm"></span> ล่าช้า / เกินกำหนด</span>
                <span className="text-rose-600 text-lg font-black">{workshopSums.sumLate}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm border-l-4 border-l-[#0B603A]">
              <span className="text-gray-500 text-xs font-bold block mb-1">จำนวนอู่ในระบบทั้งหมด</span>
              <span className="text-3xl font-black text-[#0B603A]">{workshopSums.totalWorkshops} <span className="text-sm font-bold text-gray-400">อู่</span></span>
            </div>
            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
              <span className="text-gray-500 text-xs font-bold block mb-1">อู่ประสิทธิภาพ SLA ดีเยี่ยม (&gt;=80%)</span>
              <span className="text-3xl font-black text-blue-600">{stats.workshopsData?.filter((w: any) => w.efficiencyRate >= 80).length} <span className="text-sm font-bold text-gray-400">อู่</span></span>
            </div>
            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm border-l-4 border-l-rose-500">
              <span className="text-gray-500 text-xs font-bold block mb-1">อู่ที่พบล่าช้าสะสมเร่งด่วน</span>
              <span className="text-3xl font-black text-rose-600">{stats.workshopsData?.filter((w: any) => w.lateCount > 0).length} <span className="text-sm font-bold text-gray-400">อู่</span></span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-2">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-base text-gray-800">🏢 ตารางรายชื่ออู่/ศูนย์บริการซ่อมบำรุง <span className="text-sm text-gray-400 font-medium ml-2">(คลิกที่แถวอู่เพื่อเข้าดูข้อมูลเชิงลึก)</span></h3>
            </div>
            <div className="overflow-x-auto">
              {/* 🚀 ปรับตารางอู่ให้เลื่อนอิสระหากหน้าจอแคบเกินไป */}
              <table className="w-full text-sm text-left min-w-[900px]">
                <thead className="text-gray-600 bg-gray-100 border-b border-gray-200 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 font-bold whitespace-nowrap">ชื่ออู่ / ศูนย์บริการ</th>
                    <th className="px-6 py-4 font-bold text-center whitespace-nowrap">งานซ่อมสะสม</th>
                    <th className="px-6 py-4 font-bold text-center whitespace-nowrap">สำเร็จ (ในเวลา)</th>
                    <th className="px-6 py-4 font-bold text-center whitespace-nowrap">กำลังดำเนินการ</th>
                    <th className="px-6 py-4 font-bold text-center whitespace-nowrap">ล่าช้า / เกินกำหนด</th>
                    <th className="px-6 py-4 font-bold text-center whitespace-nowrap">เวลาซ่อมเฉลี่ย</th>
                    <th className="px-6 py-4 font-bold text-center whitespace-nowrap">อัตราสำเร็จ (SLA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-sm">
                  {stats.workshopsData?.map((workshop: any, index: number) => (
                    <tr 
                      key={index} 
                      onClick={() => { setSelectedWorkshopDetail(workshop); setCurrentWorkshopLogPage(1); }}
                      className="hover:bg-emerald-50/50 cursor-pointer transition-all"
                    >
                      <td className="px-6 py-5 font-black text-[#0B603A] hover:text-emerald-700 flex items-center gap-2 whitespace-nowrap">
                        <span className="text-lg shrink-0">🏢</span> {workshop.name}
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-gray-800 whitespace-nowrap">{workshop.totalJobs}</td>
                      <td className="px-6 py-5 text-center text-emerald-600 font-black whitespace-nowrap">{workshop.successCount}</td>
                      <td className="px-6 py-5 text-center text-amber-500 font-black whitespace-nowrap">{workshop.inProgressCount}</td>
                      <td className="px-6 py-5 text-center text-rose-600 font-black whitespace-nowrap">{workshop.lateCount}</td>
                      <td className="px-6 py-5 text-center font-mono font-bold text-gray-600 whitespace-nowrap">{workshop.avgRepairHours} <span className="text-xs">ชม.</span></td>
                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        <span className={`inline-block px-3 py-1.5 rounded-lg font-mono font-black text-sm shadow-xs ${
                          workshop.efficiencyRate >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          workshop.efficiencyRate >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {workshop.efficiencyRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!stats.workshopsData || stats.workshopsData.length === 0) && (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400 font-bold text-base">ไม่มีข้อมูลอู่ซ่อมบำรุง</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // แท็บที่ 3: ทีมช่างและประสิทธิภาพ 
    // ==========================================
    if (activeTab === 'technicians') {
      const startIndex = (currentTechPage - 1) * ITEMS_PER_PAGE;
      const currentTechsList = techsData.list.slice(startIndex, startIndex + ITEMS_PER_PAGE);
      const totalTechPages = Math.max(1, Math.ceil(techsData.total / ITEMS_PER_PAGE));

      return (
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex flex-col gap-2 w-full sm:w-80 shrink-0">
              <label className="text-sm font-bold text-gray-500">กรุณาเลือกอู่/ศูนย์ซ่อมเพื่อตรวจสอบรายชื่อช่าง:</label>
              <select 
                value={selectedWorkshop} 
                onChange={(e) => { setSelectedWorkshop(e.target.value); setCurrentTechPage(1); }} 
                className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 px-4 text-base font-bold text-[#0B603A] focus:outline-none focus:ring-2 focus:ring-[#0B603A] cursor-pointer shadow-xs"
              >
                <option value="all">🌐 แสดงช่างทั้งหมดทุกอู่รวมกัน</option>
                {stats.workshopsData?.map((w: any, i: number) => <option key={i} value={w.name}>{w.name}</option>)}
              </select>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-4 px-8 text-center w-full sm:w-auto flex items-center justify-center gap-4 shadow-xs">
              <span className="text-4xl drop-shadow-sm shrink-0">👨‍💻</span>
              <div className="text-left">
                <span className="text-sm text-gray-600 font-bold block mb-1">
                  {selectedWorkshop === "all" ? "จำนวนช่างทั้งหมดในระบบ" : "จำนวนช่างประจำอู่นี้"}
                </span>
                <span className="text-3xl font-black text-[#0B603A] font-mono leading-none">
                  {techsData.total} <span className="text-sm font-bold text-gray-500">คน</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm border-t-4 border-t-emerald-600">
              <h4 className="text-base font-black text-emerald-800 mb-4 border-b border-emerald-100 pb-2">🏆 พนักงานดีเด่นสูงสุด 3 อันดับแรก (SLA %)</h4>
              <div className="flex flex-col gap-3">
                {techsData.top.map((t: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 bg-emerald-50 text-sm font-bold rounded-xl border border-emerald-100 shadow-2xs">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm">{idx + 1}</div>
                      <span className="text-emerald-950 text-base break-words leading-tight">{t.name}</span>
                    </div>
                    <span className="font-mono bg-emerald-600 text-white px-3 py-1 rounded-lg font-black text-base shadow-sm shrink-0">{t.efficiencyRate}%</span>
                  </div>
                ))}
                {techsData.top.length === 0 && <p className="text-center text-emerald-600/50 font-bold py-6">ไม่มีข้อมูล</p>}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-rose-200 shadow-sm border-t-4 border-t-rose-600">
              <h4 className="text-base font-black text-rose-800 mb-4 border-b border-rose-100 pb-2">⚠️ ช่างที่ควรปรับปรุงผลงาน 3 อันดับแรก (SLA ต่ำสุด)</h4>
              <div className="flex flex-col gap-3">
                {techsData.bottom.map((t: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 bg-rose-50 text-sm font-bold rounded-xl border border-rose-100 shadow-2xs">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-base shadow-sm">{idx + 1}</div>
                      <span className="text-rose-950 text-base break-words leading-tight">{t.name}</span>
                    </div>
                    <span className="font-mono bg-rose-500 text-white px-3 py-1 rounded-lg font-black text-base shadow-sm shrink-0">{t.efficiencyRate}%</span>
                  </div>
                ))}
                {techsData.bottom.length === 0 && <p className="text-center text-rose-600/50 font-bold py-6">ไม่มีข้อมูล</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-black text-base text-gray-800">
                📋 ตารางผลงานช่างรายบุคคล <span className="text-[#0B603A]">(อ้างอิงจาก: {selectedWorkshop === "all" ? "ทุกอู่รวมกัน" : selectedWorkshop || "-"})</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              {/* 🚀 ปรับเป็นตารางที่มีความกว้างขั้นต่ำ ป้องกันการทับซ้อน */}
              <table className="w-full text-sm text-left min-w-[900px]">
                <thead className="text-gray-600 bg-gray-100 border-b border-gray-200 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 font-bold whitespace-nowrap">ลำดับ</th>
                    <th className="px-6 py-4 font-bold whitespace-nowrap">ชื่อ-นามสกุลช่าง</th>
                    <th className="px-6 py-4 font-bold text-center whitespace-nowrap">งานทั้งหมด</th>
                    <th className="px-6 py-4 font-bold text-center whitespace-nowrap">ซ่อมสำเร็จ</th>
                    <th className="px-6 py-4 font-bold text-center whitespace-nowrap">กำลังซ่อมอยู่</th>
                    <th className="px-6 py-4 font-bold text-center whitespace-nowrap">ล่าช้าสะสม</th>
                    <th className="px-6 py-4 font-bold text-center whitespace-nowrap">ประสิทธิภาพรวม (SLA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-sm">
                  {currentTechsList.map((tech: any, idx: number) => (
                    <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="px-6 py-4 text-gray-400 font-bold whitespace-nowrap">{startIndex + idx + 1}</td>
                      <td className="px-6 py-4 font-black text-gray-900 text-base whitespace-nowrap">{tech.name}</td>
                      <td className="px-6 py-4 text-center font-bold text-gray-800 whitespace-nowrap">{tech.totalJobs}</td>
                      <td className="px-6 py-4 text-center text-emerald-600 font-black whitespace-nowrap">{tech.successCount}</td>
                      <td className="px-6 py-4 text-center text-amber-500 font-black whitespace-nowrap">{tech.inProgressCount}</td>
                      <td className="px-6 py-4 text-center text-rose-600 font-black whitespace-nowrap">{tech.lateCount}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-3 py-1.5 rounded-lg font-mono font-black shadow-xs ${
                          tech.efficiencyRate >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          tech.efficiencyRate >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {tech.efficiencyRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {currentTechsList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400 font-bold text-base">ไม่พบข้อมูลรายชื่อช่างในระบบ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* 🚀 นำ Pagination Component มาใช้งาน */}
            {renderPagination(currentTechPage, totalTechPages, setCurrentTechPage, techsData.total, startIndex, ITEMS_PER_PAGE)}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="เปิด/ปิด เมนู">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <div className="flex items-center gap-2 mr-2">
            <div className="bg-[#0B603A] text-white font-black italic rounded-full px-3 py-1 text-sm tracking-widest border-2 border-green-200 shadow-xs shrink-0">EVT</div>
            <span className="font-black text-gray-800 text-sm hidden sm:block tracking-wide whitespace-nowrap">EVT Admin Panel</span>
          </div>
          <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>
          
          <h1 className="text-base font-black text-[#0B603A] truncate max-w-xs md:max-w-none">
            {vehicleData !== undefined ? "ประวัติการซ่อมบำรุงรถ" : selectedWorkshopDetail ? `รายละเอียด: ${selectedWorkshopDetail.name}` : activeTab === 'dashboard' ? "Dashboard การซ่อมบำรุง" : activeTab === 'workshops' ? "อู่/ศูนย์ซ่อม" : "ทีมช่างและประสิทธิภาพ"}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 py-1 px-2 select-none cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-gray-800 leading-tight">testuser</p>
              <p className="text-[11px] text-gray-500 font-bold leading-none mt-0.5">admins</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#0B603A] text-white flex items-center justify-center font-bold outline outline-2 outline-offset-2 outline-green-100 shadow-sm shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-shrink-0 transition-all duration-300 ease-in-out bg-white z-10 shadow-[4px_0_10px_rgba(0,0,0,0.02)] ${isSidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth w-full">
          <div className="mx-auto max-w-[1400px]">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}