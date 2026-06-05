import React from 'react';
import PurePieChart from "../PurePieChart";
import { getStatusBadge, getPriorityBadge } from "../badges";
import { formatDateTime } from "../formatters";
import { sortedArray } from "../../lib/utils";
import { renderPagination } from "../Pagination";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../../lib/constants";

export default function TechniciansTab({
  selectedTechnicianDetail,
  setSelectedTechnicianDetail,
  currentTechLogPage,
  setCurrentTechLogPage,
  globalStatusFilter,
  globalPriorityFilter,
  setMakeFilterValue,
  sortField,
  sortDirection,
  handleSort,
  setActiveLogModal,
  GENERAL_ITEMS_PER_PAGE,
  stats,
  techsData,
  selectedWorkshop,
  setSelectedWorkshop,
  currentTechPage,
  setCurrentTechPage
}: any) {
  if (selectedTechnicianDetail) {
    const t = selectedTechnicianDetail;
    
    let logList = t.logs || [];
    if (globalStatusFilter !== "all") logList = logList.filter((l: any) => l.status === globalStatusFilter);
    if (globalPriorityFilter !== "all") logList = logList.filter((l: any) => l.priority === globalPriorityFilter);
    if (sortField) logList = sortedArray(logList, sortField, sortDirection);

    const totalTechLogs = logList.length;
    const logTotalPages = Math.max(1, Math.ceil(totalTechLogs / GENERAL_ITEMS_PER_PAGE));
    const logStartIndex = (currentTechLogPage - 1) * GENERAL_ITEMS_PER_PAGE;
    const currentLogs = logList.slice(logStartIndex, logStartIndex + GENERAL_ITEMS_PER_PAGE);

    return (
      <div className="flex flex-col gap-6">
        <button onClick={() => { setSelectedTechnicianDetail(null); setCurrentTechLogPage(1); }} className="text-sm font-bold text-gray-500 hover:text-[#0B603A] flex items-center gap-2 w-fit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          กลับไปตารางช่างทั้งหมด
        </button>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16 w-full">
          <div className="flex flex-col items-center shrink-0">
            <h3 className="font-black text-gray-900 text-xl mb-6 text-center border-b pb-2 px-4 border-gray-100">👨‍🔧 {t.name}</h3>
            <PurePieChart success={t.successCount} inProgress={t.inProgressCount} late={t.lateCount} size="lg" />
          </div>
          <div className="flex flex-col gap-4 text-sm font-bold bg-gray-50 p-6 rounded-xl border border-gray-100 w-full max-w-md">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200"><span className="text-gray-500 font-bold flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> ใบงานที่สำเร็จ:</span><span className="font-black text-emerald-600 text-xl">{t.successCount} งาน</span></div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200"><span className="text-gray-500 font-bold flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> กำลังดำเนินการซ่อม:</span><span className="font-black text-amber-500 text-xl">{t.inProgressCount} งาน</span></div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200"><span className="text-gray-500 font-bold flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span> ตรวจพบงานล่าช้า:</span><span className="font-black text-rose-600 text-xl">{t.lateCount} งาน</span></div>
            <div className="flex justify-between items-center pt-2"><span className="text-gray-800 font-black text-base">ประสิทธิภาพบุคคล (SLA):</span><span className={`px-4 py-1.5 rounded-lg font-mono font-black text-lg shadow-sm bg-emerald-50 text-emerald-700`}>{t.efficiencyRate}%</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
            <h3 className="font-bold text-sm sm:text-base text-gray-800">📋 รายการประวัติใบงานทั้งหมดภายใต้ความรับผิดชอบ ({totalTechLogs} รายการ)</h3>
            <div className="flex gap-2">
              <select value={globalStatusFilter} onChange={(e) => setMakeFilterValue('status', e.target.value)} className="text-xs bg-white border p-1.5 rounded font-bold text-gray-600">
                <option value="all">ทุกสถานะ</option>
                {Object.keys(STATUS_CONFIG).map(k => <option key={k} value={k}>{STATUS_CONFIG[k].text}</option>)}
              </select>
              <select value={globalPriorityFilter} onChange={(e) => setMakeFilterValue('priority', e.target.value)} className="text-xs bg-white border p-1.5 rounded font-bold text-gray-600">
                <option value="all">ทุกความเร่งด่วน</option>
                {Object.keys(PRIORITY_CONFIG).map(k => <option key={k} value={k}>{PRIORITY_CONFIG[k].text}</option>)}
              </select>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left table-auto text-[11px] sm:text-sm min-w-[1000px]">
              <thead className="bg-gray-50 text-gray-600 text-[10px] sm:text-xs uppercase border-b border-gray-200">
                <tr>
                  <th onClick={() => handleSort("vehiclePlate")} className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-gray-100 whitespace-nowrap">ทะเบียนรถ {sortField === "vehiclePlate" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                  <th className="p-2 sm:px-4 sm:py-3 font-bold whitespace-nowrap">รายละเอียด / อาการ</th>
                  <th onClick={() => handleSort("workshopName")} className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-gray-100 whitespace-nowrap">อู่/ศูนย์บริการ {sortField === "workshopName" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => handleSort("priority")} className="p-2 sm:px-4 sm:py-3 font-bold text-center cursor-pointer hover:bg-gray-100 whitespace-nowrap">ความเร่งด่วน {sortField === "priority" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => handleSort("status")} className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-gray-100 whitespace-nowrap">สถานะ {sortField === "status" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => handleSort("dueDate")} className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-gray-100 whitespace-nowrap">กำหนดเสร็จ {sortField === "dueDate" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {currentLogs.map((log: any, idx: number) => (
                  <tr key={idx} onClick={() => setActiveLogModal(log)} className="hover:bg-emerald-50/30 cursor-pointer transition-colors">
                    <td className="p-2 sm:px-4 sm:py-3 font-black text-gray-900 align-top whitespace-nowrap">{log.vehiclePlate}</td>
                    <td className="p-2 sm:px-4 sm:py-3 text-gray-600 align-top break-words min-w-[250px]"><div className="line-clamp-2 sm:line-clamp-3 leading-tight">{log.description}</div></td>
                    <td className="p-2 sm:px-4 sm:py-3 text-gray-800 font-bold align-top whitespace-nowrap">{log.workshopName}</td>
                    <td className="p-2 sm:px-4 sm:py-3 text-center align-top whitespace-nowrap">{getPriorityBadge(log.priority)}</td>
                    <td className="p-2 sm:px-4 sm:py-3 align-top whitespace-nowrap">{getStatusBadge(log.status)}</td>
                    <td className="p-2 sm:px-4 sm:py-3 text-gray-500 font-bold align-top text-[10px] sm:text-sm whitespace-nowrap">{formatDateTime(log.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(currentTechLogPage, logTotalPages, setCurrentTechLogPage, totalTechLogs, logStartIndex, GENERAL_ITEMS_PER_PAGE)}
        </div>
      </div>
    );
  }

  const startIndex = (currentTechPage - 1) * GENERAL_ITEMS_PER_PAGE;
  const currentTechsList = techsData.list.slice(startIndex, startIndex + GENERAL_ITEMS_PER_PAGE);
  const totalTechPages = Math.max(1, Math.ceil(techsData.total / GENERAL_ITEMS_PER_PAGE));

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col gap-1 sm:gap-2 w-full sm:w-80 shrink-0">
          <label className="text-xs sm:text-sm font-bold text-gray-500">กรุณาเลือกอู่/ศูนย์ซ่อมเพื่อตรวจสอบรายชื่อช่าง:</label>
          <select value={selectedWorkshop} onChange={(e) => { setSelectedWorkshop(e.target.value); setCurrentTechPage(1); }} className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2.5 px-3 text-sm sm:text-base font-bold text-[#0B603A]">
            <option value="all">🌐 แสดงช่างทั้งหมดทุกอู่รวมกัน</option>
            {stats.workshopsData?.map((w: any, i: number) => <option key={i} value={w.name}>{w.name}</option>)}
          </select>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-3 px-6 text-center w-full sm:w-auto flex items-center justify-center gap-4">
          <span className="text-3xl sm:text-4xl shrink-0">👨‍💻</span>
          <div className="text-left">
            <span className="text-[11px] sm:text-sm text-gray-600 font-bold block mb-0.5">{selectedWorkshop === "all" ? "ช่างทั้งหมด" : "ช่างประจำอู่นี้"}</span>
            <span className="text-2xl sm:text-3xl font-black text-[#0B603A] font-mono leading-none">{techsData.total} <span className="text-xs sm:text-sm font-bold text-gray-500">คน</span></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm border-t-4 border-t-emerald-600">
          <h4 className="text-base font-black text-emerald-800 mb-4 border-b border-emerald-100 pb-2">🏆 พนักงานดีเด่นสูงสุด 3 อันดับแรก (SLA %)</h4>
          <div className="flex flex-col gap-3">
            {techsData.top.map((t: any, idx: number) => (
              <div key={idx} onClick={() => setSelectedTechnicianDetail(t)} className="flex justify-between items-center p-3.5 bg-emerald-50 text-sm font-bold rounded-xl border border-emerald-100 shadow-2xs cursor-pointer hover:bg-emerald-100/50">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm">{idx + 1}</div>
                  <span className="text-emerald-950 text-base break-words leading-tight">{t.name}</span>
                </div>
                <span className="font-mono bg-emerald-600 text-white px-3 py-1 rounded-lg font-black text-base shadow-sm shrink-0">{t.efficiencyRate}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-rose-200 shadow-sm border-t-4 border-t-rose-600">
          <h4 className="text-base font-black text-rose-800 mb-4 border-b border-rose-100 pb-2">⚠️ ช่างที่ควรปรับปรุงผลงาน 3 อันดับแรก (SLA ต่ำสุด)</h4>
          <div className="flex flex-col gap-3">
            {techsData.bottom.map((t: any, idx: number) => (
              <div key={idx} onClick={() => setSelectedTechnicianDetail(t)} className="flex justify-between items-center p-3.5 bg-rose-50 text-sm font-bold rounded-xl border border-rose-100 shadow-2xs cursor-pointer hover:bg-rose-100/50">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-base shadow-sm">{idx + 1}</div>
                  <span className="text-rose-950 text-base break-words leading-tight">{t.name}</span>
                </div>
                <span className="font-mono bg-rose-500 text-white px-3 py-1 rounded-lg font-black text-base shadow-sm shrink-0">{t.efficiencyRate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 sm:p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-black text-sm sm:text-base text-gray-800">📋 ตารางผลงานช่างรายบุคคล</h3>
          <p className="text-[11px] text-gray-400 font-bold hidden sm:block">* คลิกหัวตารางเพื่อจัดเรียงข้อมูล หรือคลิกแถวเพื่อดูข้อมูลเชิงลึก</p>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left table-auto text-[11px] sm:text-sm min-w-[900px]">
            <thead className="text-gray-600 bg-gray-100 border-b border-gray-200 text-[10px] sm:text-xs uppercase">
              <tr>
                <th className="p-2 sm:px-4 sm:py-3 font-bold whitespace-nowrap">ลำดับ</th>
                <th onClick={() => handleSort("name")} className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-gray-200 whitespace-nowrap">ชื่อช่าง {sortField === "name" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                <th onClick={() => handleSort("totalJobs")} className="p-2 sm:px-4 sm:py-3 font-bold text-center cursor-pointer hover:bg-gray-200 whitespace-nowrap">ทั้งหมด {sortField === "totalJobs" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                <th onClick={() => handleSort("successCount")} className="p-2 sm:px-4 sm:py-3 font-bold text-center cursor-pointer hover:bg-gray-200 whitespace-nowrap">สำเร็จ {sortField === "successCount" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                <th onClick={() => handleSort("inProgressCount")} className="p-2 sm:px-4 sm:py-3 font-bold text-center cursor-pointer hover:bg-gray-200 whitespace-nowrap">กำลังซ่อม {sortField === "inProgressCount" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                <th onClick={() => handleSort("lateCount")} className="p-2 sm:px-4 sm:py-3 font-bold text-center cursor-pointer hover:bg-gray-200 whitespace-nowrap">ล่าช้า {sortField === "lateCount" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                <th onClick={() => handleSort("efficiencyRate")} className="p-2 sm:px-4 sm:py-3 font-bold text-center cursor-pointer hover:bg-gray-200 whitespace-nowrap">SLA {sortField === "efficiencyRate" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {currentTechsList.map((tech: any, idx: number) => (
                <tr key={idx} onClick={() => { setSelectedTechnicianDetail(tech); setCurrentTechLogPage(1); }} className="hover:bg-emerald-50/40 transition-colors cursor-pointer">
                  <td className="p-2 sm:px-4 sm:py-4 text-gray-400 font-bold whitespace-nowrap">{startIndex + idx + 1}</td>
                  <td className="p-2 sm:px-4 sm:py-4 font-black text-[#0B603A] hover:underline break-words whitespace-normal"><span className="text-sm sm:text-lg shrink-0">👨‍🔧</span> {tech.name}</td>
                  <td className="p-2 sm:px-4 sm:py-4 text-center font-bold text-gray-800 whitespace-nowrap">{tech.totalJobs}</td>
                  <td className="p-2 sm:px-4 sm:py-4 text-center text-emerald-600 font-black whitespace-nowrap">{tech.successCount}</td>
                  <td className="p-2 sm:px-4 sm:py-4 text-center text-amber-500 font-black whitespace-nowrap">{tech.inProgressCount}</td>
                  <td className="p-2 sm:px-4 sm:py-4 text-center text-rose-600 font-black whitespace-nowrap">{tech.lateCount}</td>
                  <td className="p-2 sm:px-4 sm:py-4 text-center whitespace-nowrap">
                    <span className={`inline-block px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-mono font-black text-[9px] sm:text-sm shadow-xs ${
                      tech.efficiencyRate >= 80 ? 'bg-emerald-50 text-emerald-700' : tech.efficiencyRate >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                    }`}>{tech.efficiencyRate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPagination(currentTechPage, totalTechPages, setCurrentTechPage, techsData.total, startIndex, GENERAL_ITEMS_PER_PAGE)}
      </div>
    </div>
  );
}
