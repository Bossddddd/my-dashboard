import { useLanguage } from '../../app/LanguageContext';
import React from 'react';
import DashboardSearchBar from "../DashboardSearchBar";
import ImportButton from "../ImportButton";
import { StatusBadge, PriorityBadge } from "../badges";
import { formatDateTime } from "../formatters";
import { sortedArray } from "../../lib/utils";
import Pagination from '../Pagination';

export default function DashboardTab({
  stats,
  searchInput,
  setSearchInput,
  executeSearch,
  globalStatusFilter,
  globalPriorityFilter,
  sortField,
  sortDirection,
  handleSort,
  setActiveLogModal,
  currentPage,
  setCurrentPage,
  DASHBOARD_ITEMS_PER_PAGE
}: any) {
  const { t } = useLanguage();
  const maxCount = Math.max(...(stats.monthlyStats?.map((m: any) => m.count) || [0]), 1);
  const maxCost = Math.max(...(stats.monthlyStats?.map((m: any) => m.cost) || [0]), 1);
  
  let overdueList = stats.overdueTasks || [];
  if (globalStatusFilter !== "all") overdueList = overdueList.filter((t: any) => t.status === globalStatusFilter);
  if (globalPriorityFilter !== "all") overdueList = overdueList.filter((t: any) => t.priority === globalPriorityFilter);
  if (sortField) overdueList = sortedArray(overdueList, sortField, sortDirection);

  const totalOverdueItems = overdueList.length;
  const totalPages = Math.ceil(totalOverdueItems / DASHBOARD_ITEMS_PER_PAGE) || 1; 
  const startIndex = (currentPage - 1) * DASHBOARD_ITEMS_PER_PAGE;
  const currentOverdueTasks = overdueList.slice(startIndex, startIndex + DASHBOARD_ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <DashboardSearchBar value={searchInput} onChange={setSearchInput} onSearch={executeSearch} />
        <div className="w-full sm:w-auto flex-shrink-0"><ImportButton /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm border-t-4 border-t-[#0B603A]">
          <div className="text-gray-400 dark:text-slate-500 text-xs font-bold mb-1">{t('totalVehicles')}</div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B603A]">{stats.totalVehicles} <span className="text-xs sm:text-sm font-normal text-gray-400 dark:text-slate-500">{t('vehiclesUnit')}</span></div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm border-t-4 border-t-amber-500">
          <div className="text-gray-400 dark:text-slate-500 text-xs font-bold mb-1">{t('totalLogs')}</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">{stats.totalLogs} <span className="text-xs sm:text-sm font-normal text-gray-400 dark:text-slate-500">{t('logsUnit')}</span></div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm border-t-4 border-t-emerald-600">
          <div className="text-gray-400 dark:text-slate-500 text-xs font-bold mb-1">{t('totalCost')}</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.totalCost.toLocaleString('th-TH')} <span className="text-xs sm:text-sm font-normal text-gray-400 dark:text-slate-500">{t('currency')}</span></div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">{t('kpiTitle')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-gray-500 dark:text-slate-400 block mb-1 text-xs font-bold">{t('onTimeRate')}</span>
              <span className="text-2xl font-bold text-emerald-600 font-mono">{stats.efficiency.onTimeRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div style={{ width: `${stats.efficiency.onTimeRate}%` }} className="bg-emerald-500 h-1.5 rounded-full"></div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <span className="text-gray-500 dark:text-slate-400 block mb-1 text-xs font-bold">{t('avgResponseTime')}</span>
            <span className="text-2xl font-bold text-blue-600 font-mono">{stats.efficiency.avgResponseHours}</span>
            <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">{t('hoursPerJob')}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <span className="text-gray-500 dark:text-slate-400 block mb-1 text-xs font-bold">{t('avgRepairTime')}</span>
            <span className="text-2xl font-bold text-purple-600 font-mono">{stats.efficiency.avgRepairHours}</span>
            <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">{t('hoursPerJob')}</span>
          </div>
          <div className={`p-4 rounded-lg border flex flex-col justify-between ${stats.efficiency.overdueActiveCount > 0 ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800/50' : 'bg-slate-50 border-slate-100'}`}>
            <div>
              <span className="text-gray-500 dark:text-slate-400 block mb-1 text-xs font-bold">{t('overdueTasksActive')}</span>
              <span className={`text-2xl font-bold font-mono ${stats.efficiency.overdueActiveCount > 0 ? 'text-rose-600' : 'text-gray-700 dark:text-slate-300'}`}>{stats.efficiency.overdueActiveCount}</span>
              <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">{t('logsUnit')}</span>
            </div>
            {stats.efficiency.overdueActiveCount > 0 && <span className="text-[10px] font-bold text-rose-500 animate-pulse mt-1">⚠️ เร่งติดตามงานด่วน</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-6">📈 จำนวนใบแจ้งซ่อมแยกรายเดือน (6 เดือนล่าสุด)</h3>
          <div className="flex h-48 items-end justify-between gap-2 border-b border-gray-200 dark:border-slate-700 pb-2 px-2">
            {stats.monthlyStats?.map((item: any, idx: number) => {
              const heightPercent = (item.count / maxCount) * 100;
              return (
                <div key={idx} className="flex flex-1 flex-col items-center h-full justify-end group">
                  <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded mb-1 whitespace-nowrap">{item.count} งาน</span>
                  <div style={{ height: `${Math.max(heightPercent, 6)}%` }} className="w-full rounded-t-sm bg-blue-500 hover:bg-blue-600 transition-all group-hover:scale-x-105"></div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-full font-medium mt-2">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-6">💰 ยอดค่าใช้จ่ายรวมสุทธิรายเดือน (6 เดือนล่าสุด)</h3>
          <div className="flex h-48 items-end justify-between gap-2 border-b border-gray-200 dark:border-slate-700 pb-2 px-2">
            {stats.monthlyStats?.map((item: any, idx: number) => {
              const heightPercent = (item.cost / maxCost) * 100;
              return (
                <div key={idx} className="flex flex-1 flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded mb-1 truncate max-w-[120%]">{item.cost.toLocaleString()} ฿</span>
                  <div style={{ height: `${Math.max(heightPercent, 6)}%` }} className="w-full rounded-t-sm bg-emerald-500 hover:bg-emerald-600 transition-all group-hover:scale-x-105"></div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-full font-medium mt-2">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-4 border-b pb-2">{t('statusSummaryTitle')}</h3>
          <div className="flex flex-col gap-2">
            {stats.statusCounts?.map((item: any) => (
              <div key={item.status} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:bg-slate-900 transition-colors">
                <StatusBadge status={item.status} />
                <span className="font-bold text-gray-800 dark:text-slate-200">{item.count} <span className="text-xs font-normal text-gray-500 dark:text-slate-400 ml-1">{t('logsUnit')}</span></span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-4 border-b pb-2">{t('prioritySummaryTitle')}</h3>
          <div className="flex flex-col gap-2">
            {stats.priorityCounts?.map((item: any) => (
              <div key={item.priority} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:bg-slate-900 transition-colors">
                <PriorityBadge priority={item.priority} />
                <span className="font-bold text-gray-800 dark:text-slate-200">{item.count} <span className="text-xs font-normal text-gray-500 dark:text-slate-400 ml-1">{t('logsUnit')}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {totalOverdueItems > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-rose-200 dark:border-rose-800 overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-rose-100 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-900/30/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="font-bold text-sm sm:text-base text-rose-700 dark:text-rose-400 flex items-center gap-2">🚨 รายการแจ้งซ่อมที่เกินกำหนด ({totalOverdueItems} รายการ)</h3>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 font-bold hidden sm:block">* คลิกหัวตารางเพื่อจัดเรียงลำดับ</p>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left table-auto text-[11px] sm:text-sm min-w-[1000px]">
              <thead className="text-gray-600 dark:text-slate-400 bg-rose-50 dark:bg-rose-900/30/20 text-[10px] sm:text-xs uppercase border-b border-rose-100 dark:border-rose-800/50">
                <tr>
                  <th className="w-16 p-2 sm:px-4 sm:py-3 font-bold whitespace-nowrap">ลำดับ</th>
                  <th onClick={() => handleSort("plate")} className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-rose-100/50 whitespace-nowrap">ทะเบียนรถ {sortField === "plate" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                  <th className="p-2 sm:px-4 sm:py-3 font-bold whitespace-nowrap">รายละเอียด / อาการ</th>
                  <th onClick={() => handleSort("technicianName")} className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-rose-100/50 whitespace-nowrap">ช่าง {sortField === "technicianName" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => handleSort("status")} className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-rose-100/50 whitespace-nowrap">สถานะ {sortField === "status" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => handleSort("dueDate")} className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-rose-100/50 whitespace-nowrap">กำหนดส่ง {sortField === "dueDate" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white dark:bg-slate-800">
                {currentOverdueTasks.map((task: any, idx: number) => (
                  <tr key={task.id} onClick={() => setActiveLogModal(task)} className="hover:bg-rose-50 dark:bg-rose-900/30/40 cursor-pointer transition-colors">
                    <td className="p-2 sm:px-4 sm:py-3 text-gray-400 dark:text-slate-500 align-top whitespace-nowrap">{startIndex + idx + 1}</td>
                    <td className="p-2 sm:px-4 sm:py-3 font-black text-gray-900 dark:text-slate-100 align-top whitespace-nowrap">{task.plate || "-"}</td>
                    <td className="p-2 sm:px-4 sm:py-3 text-gray-600 dark:text-slate-400 align-top break-words min-w-[250px]"><div className="line-clamp-2 sm:line-clamp-3 leading-tight">{task.description}</div></td>
                    <td className="p-2 sm:px-4 sm:py-3 text-blue-600 font-bold align-top whitespace-nowrap">{task.technicianName || "-"}</td>
                    <td className="p-2 sm:px-4 sm:py-3 align-top whitespace-nowrap"><StatusBadge status={task.status} /></td>
                    <td className="p-2 sm:px-4 sm:py-3 font-bold text-rose-600 align-top text-[10px] sm:text-sm whitespace-nowrap">{formatDateTime(task.dueDate)}</td>
                  </tr>
                ))}
                {currentOverdueTasks.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400 dark:text-slate-500 font-bold">ไม่พบรายการข้อมูลที่ตรงตามเงื่อนไขตัวกรอง</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={totalOverdueItems} startIndex={startIndex} itemsPerPage={DASHBOARD_ITEMS_PER_PAGE} />
        </div>
      )}
    </div>
  );
}
