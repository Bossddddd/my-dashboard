// @ts-nocheck
import { useLanguage } from "../../app/LanguageContext";
import React, { useState, useRef } from "react";
import DashboardSearchBar from "../DashboardSearchBar";
import ImportButton from "../ImportButton";
import ExportButton from "../ExportButton";
import { BulkPrintView } from "../BulkPrintView";
import { StatusBadge, PriorityBadge } from "../badges";
import { formatDateTime } from "../formatters";
import { sortedArray } from "../../lib/utils";
import Pagination from "../Pagination";
import toast from "react-hot-toast";
import { getAllLogsForExport } from "../../app/actions";

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
  handleLogClick,
  currentPage,
  setCurrentPage,
  DASHBOARD_ITEMS_PER_PAGE,
  dateRange,
  customDateStart,
  customDateEnd,
}: {
  stats: import("../../lib/types").DashboardStatsData;
  searchInput: string;
  setSearchInput: (v: string) => void;
  executeSearch: () => void;
  setGlobalStatusFilter?: any;
  setGlobalPriorityFilter?: any;
  globalStatusFilter?: string;
  globalPriorityFilter?: string;
  sortField?: string;
  sortDirection: "asc" | "desc" | string;
  handleSort?: (f: string) => void;
  setActiveLogModal?: (log: import("../../lib/types").MaintenanceLog) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  DASHBOARD_ITEMS_PER_PAGE: number;
  dateRange?: string;
  customDateStart?: string;
  customDateEnd?: string;
}) {
  const { t } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [printData, setPrintData] = useState<any[]>([]);
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  let dateRangeText = "";
  if (dateRange === "7d") dateRangeText = "7 วันล่าสุด";
  else if (dateRange === "30d") dateRangeText = "30 วันล่าสุด";
  else if (dateRange === "6m") dateRangeText = "6 เดือนล่าสุด";
  else if (dateRange === "1y") dateRangeText = "1 ปีล่าสุด";
  else if (dateRange === "all") dateRangeText = "ทั้งหมด";
  else if (dateRange === "custom")
    dateRangeText = `ตั้งแต่ ${customDateStart || "-"} ถึง ${customDateEnd || "-"}`;
  const maxCount = Math.max(
    ...(stats.monthlyStats?.map((m: any) => m.count) || [0]),
    1,
  );

  let overdueList = stats.overdueTasks || [];
  if (globalStatusFilter !== "all")
    overdueList = overdueList.filter(
      (t: any) => t.status === globalStatusFilter,
    );
  if (globalPriorityFilter !== "all")
    overdueList = overdueList.filter(
      (t: any) => t.priority === globalPriorityFilter,
    );
  if (sortField)
    overdueList = sortedArray(overdueList, sortField, sortDirection);

  const totalOverdueItems = overdueList.length;
  const totalPages =
    Math.ceil(totalOverdueItems / DASHBOARD_ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * DASHBOARD_ITEMS_PER_PAGE;
  const currentOverdueTasks = overdueList.slice(
    startIndex,
    startIndex + DASHBOARD_ITEMS_PER_PAGE,
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(currentOverdueTasks.map((t: any) => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handlePrintSelected = async () => {
    setIsPrinting(true);
    const toastId = toast.loading("กำลังเตรียมหน้าพิมพ์...");
    try {
      const data = await getAllLogsForExport(
        selectedIds.size > 0 ? Array.from(selectedIds) : [],
      );
      setPrintData(data);
      setTimeout(() => {
        window.print();
        toast.success("พร้อมพิมพ์", { id: toastId });
        setIsPrinting(false);
      }, 500);
    } catch {
      toast.error("เกิดข้อผิดพลาด", { id: toastId });
      setIsPrinting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 relative">
      <BulkPrintView ref={printRef} data={printData} />
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <DashboardSearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSearch={executeSearch}
        />
        <div className="w-full sm:w-auto flex flex-wrap gap-2 flex-shrink-0 items-center">
          {selectedIds.size > 0 && (
            <div className="flex gap-2 items-center bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-100">
              <span className="text-xs font-bold text-emerald-700">
                เลือก {selectedIds.size} รายการ:
              </span>
              <button
                onClick={handlePrintSelected}
                disabled={isPrinting}
                className="bg-white text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded shadow-sm text-xs font-bold border border-gray-200 flex items-center gap-1"
              >
                🖨️ {isPrinting ? "กำลังโหลด..." : "พิมพ์"}
              </button>
              <ExportButton
                selectedIds={Array.from(selectedIds)}
                fileNamePrefix="สรุปภาพรวมแดชบอร์ด"
              />
            </div>
          )}
          {selectedIds.size === 0 && (
            <div className="flex gap-2 items-center">
              <button
                onClick={() =>
                  handleLogClick?.({
                    isNew: true,
                    status: "reported",
                    priority: "normal",
                  } as any)
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-sm text-sm font-bold border border-emerald-700 flex items-center gap-1 transition-colors"
              >
                ➕ สร้างใบงาน
              </button>
              <button
                onClick={handlePrintSelected}
                disabled={isPrinting}
                className="bg-white text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg shadow-sm text-sm font-bold border border-gray-200 flex items-center gap-2 hidden sm:flex"
              >
                🖨️ {isPrinting ? "กำลังโหลด..." : "พิมพ์ทั้งหมด"}
              </button>
              <ExportButton fileNamePrefix="สรุปภาพรวมแดชบอร์ด" />
            </div>
          )}
          <ImportButton />
        </div>
      </div>

      {dateRangeText && (
        <div className="flex items-center gap-2 px-1">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
            แสดงข้อมูล:{" "}
            <span className="text-[#0B603A] font-bold dark:text-emerald-400">
              {dateRangeText}
            </span>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm border-t-4 border-t-[#0B603A]">
          <div className="text-gray-400 dark:text-slate-500 text-xs font-bold mb-1">
            {t("totalVehicles")}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0B603A]">
            {stats.totalVehicles}{" "}
            <span className="text-xs sm:text-sm font-normal text-gray-400 dark:text-slate-500">
              {t("vehiclesUnit")}
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm border-t-4 border-t-amber-500">
          <div className="text-gray-400 dark:text-slate-500 text-xs font-bold mb-1">
            {t("totalLogs")}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {stats.totalLogs}{" "}
            <span className="text-xs sm:text-sm font-normal text-gray-400 dark:text-slate-500">
              {t("logsUnit")}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          {t("kpiTitle")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-gray-500 dark:text-slate-400 block mb-1 text-xs font-bold">
                {t("onTimeRate")}
              </span>
              <span className="text-2xl font-bold text-emerald-600 font-mono">
                {stats.efficiency.onTimeRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                style={{ width: `${stats.efficiency.onTimeRate}%` }}
                className="bg-emerald-500 h-1.5 rounded-full"
              ></div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <span className="text-gray-500 dark:text-slate-400 block mb-1 text-xs font-bold">
              {t("avgResponseTime")}
            </span>
            <span className="text-2xl font-bold text-blue-600 font-mono">
              {stats.efficiency.avgResponseHours}
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">
              {t("hoursPerJob")}
            </span>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <span className="text-gray-500 dark:text-slate-400 block mb-1 text-xs font-bold">
              {t("avgRepairTime")}
            </span>
            <span className="text-2xl font-bold text-purple-600 font-mono">
              {stats.efficiency.avgRepairHours}
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">
              {t("hoursPerJob")}
            </span>
          </div>
          <div
            className={`p-4 rounded-lg border flex flex-col justify-between ${stats.efficiency.overdueActiveCount > 0 ? "bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800/50" : "bg-slate-50 border-slate-100"}`}
          >
            <div>
              <span className="text-gray-500 dark:text-slate-400 block mb-1 text-xs font-bold">
                {t("overdueTasksActive")}
              </span>
              <span
                className={`text-2xl font-bold font-mono ${stats.efficiency.overdueActiveCount > 0 ? "text-rose-600" : "text-gray-700 dark:text-slate-300"}`}
              >
                {stats.efficiency.overdueActiveCount}
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">
                {t("logsUnit")}
              </span>
            </div>
            {stats.efficiency.overdueActiveCount > 0 && (
              <span className="text-[10px] font-bold text-rose-500 animate-pulse mt-1">
                ⚠️ เร่งติดตามงานด่วน
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-6">
            📈 จำนวนใบแจ้งซ่อมแยกรายเดือน (6 เดือนล่าสุด)
          </h3>
          <div className="flex h-48 items-end justify-between gap-2 border-b border-gray-200 dark:border-slate-700 pb-2 px-2">
            {stats.monthlyStats?.map((item: any, idx: number) => {
              const heightPercent = (item.count / maxCount) * 100;
              return (
                <div
                  key={idx}
                  className="flex flex-1 flex-col items-center h-full justify-end group"
                >
                  <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded mb-1 whitespace-nowrap">
                    {item.count} งาน
                  </span>
                  <div
                    style={{ height: `${Math.max(heightPercent, 6)}%` }}
                    className="w-full rounded-t-sm bg-blue-500 hover:bg-blue-600 transition-all group-hover:scale-x-105"
                  ></div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-full font-medium mt-2">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-4 border-b pb-2">
            {t("statusSummaryTitle")}
          </h3>
          <div className="flex flex-col gap-2">
            {stats.statusCounts?.map((item: any) => (
              <div
                key={item.status}
                className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:bg-slate-900 transition-colors"
              >
                <StatusBadge status={item.status} />
                <span className="font-bold text-gray-800 dark:text-slate-200">
                  {item.count}{" "}
                  <span className="text-xs font-normal text-gray-500 dark:text-slate-400 ml-1">
                    {t("logsUnit")}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-4 border-b pb-2">
            {t("prioritySummaryTitle")}
          </h3>
          <div className="flex flex-col gap-2">
            {stats.priorityCounts?.map((item: any) => (
              <div
                key={item.priority}
                className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:bg-slate-900 transition-colors"
              >
                <PriorityBadge priority={item.priority} />
                <span className="font-bold text-gray-800 dark:text-slate-200">
                  {item.count}{" "}
                  <span className="text-xs font-normal text-gray-500 dark:text-slate-400 ml-1">
                    {t("logsUnit")}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {totalOverdueItems > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-3 sm:p-5 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="font-black text-sm sm:text-base text-gray-800 dark:text-slate-200 flex items-center gap-2 shrink-0">
              <span className="text-rose-500">🔥</span>
              รายการแจ้งซ่อมที่เกินกำหนด SLA ({overdueList.length})
            </h3>

            <div className="flex flex-wrap items-center gap-4">
              <p className="text-[11px] text-gray-400 dark:text-slate-500 font-bold hidden lg:block">
                * คลิกหัวตารางเพื่อจัดเรียงข้อมูล
                หรือคลิกแถวเพื่อดูข้อมูลเชิงลึก
              </p>
              {selectedIds.size > 0 && (
                <div className="flex gap-2 items-center bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 rounded-lg border border-rose-100">
                  <span className="text-xs font-bold text-rose-700">
                    เลือก {selectedIds.size} รายการ:
                  </span>
                  <button
                    onClick={handlePrintSelected}
                    disabled={isPrinting}
                    className="bg-white text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded shadow-sm text-xs font-bold border border-gray-200 flex items-center gap-1"
                  >
                    🖨️ {isPrinting ? "กำลังโหลด..." : "พิมพ์"}
                  </button>
                  <ExportButton
                    selectedIds={Array.from(selectedIds)}
                    fileNamePrefix="รายการใบงานเกินกำหนด_SLA"
                  />
                </div>
              )}
              {selectedIds.size === 0 && (
                <div className="flex gap-2 items-center">
                  <button
                    onClick={handlePrintSelected}
                    disabled={isPrinting}
                    className="bg-white text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded shadow-sm text-xs font-bold border border-gray-200 flex items-center gap-1"
                  >
                    🖨️ {isPrinting ? "กำลังโหลด..." : "พิมพ์ทั้งหมด"}
                  </button>
                  <ExportButton fileNamePrefix="รายการใบงานเกินกำหนด_SLA" />
                </div>
              )}
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left table-auto text-[11px] sm:text-sm min-w-[1000px]">
              <thead className="text-gray-600 dark:text-slate-400 bg-rose-50 dark:bg-rose-900/30/20 text-[10px] sm:text-xs uppercase border-b border-rose-100 dark:border-rose-800/50">
                <tr>
                  <th className="w-10 p-2 sm:px-4 sm:py-3 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-rose-300 text-rose-600 focus:ring-rose-500 cursor-pointer w-4 h-4"
                      onChange={handleSelectAll}
                      checked={
                        currentOverdueTasks.length > 0 &&
                        currentOverdueTasks.every((t: any) =>
                          selectedIds.has(t.id),
                        )
                      }
                    />
                  </th>
                  <th className="w-16 p-2 sm:px-4 sm:py-3 font-bold whitespace-nowrap">
                    ลำดับ
                  </th>
                  <th
                    onClick={() => handleSort("plate")}
                    className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-rose-100/50 whitespace-nowrap"
                  >
                    ทะเบียนรถ{" "}
                    {sortField === "plate"
                      ? sortDirection === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th className="p-2 sm:px-4 sm:py-3 font-bold whitespace-nowrap">
                    รายละเอียด / อาการ
                  </th>
                  <th
                    onClick={() => handleSort("technicianName")}
                    className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-rose-100/50 whitespace-nowrap"
                  >
                    ช่าง{" "}
                    {sortField === "technicianName"
                      ? sortDirection === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-rose-100/50 whitespace-nowrap"
                  >
                    สถานะ{" "}
                    {sortField === "status"
                      ? sortDirection === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th
                    onClick={() => handleSort("dueDate")}
                    className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-rose-100/50 whitespace-nowrap"
                  >
                    กำหนดส่ง{" "}
                    {sortField === "dueDate"
                      ? sortDirection === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white dark:bg-slate-800">
                {currentOverdueTasks.map((task: any, idx: number) => (
                  <tr
                    key={task.id}
                    onClick={() => handleLogClick && handleLogClick(task)}
                    className={`hover:bg-rose-50 dark:bg-rose-900/30/40 cursor-pointer transition-colors ${selectedIds.has(task.id) ? "bg-rose-50/80 dark:bg-rose-900/40" : ""}`}
                  >
                    <td
                      className="p-2 sm:px-4 sm:py-3 text-center"
                      onClick={(e) => handleSelectRow(e, task.id)}
                    >
                      <input
                        type="checkbox"
                        className="rounded border-rose-300 text-rose-600 focus:ring-rose-500 cursor-pointer w-4 h-4"
                        checked={selectedIds.has(task.id)}
                        readOnly
                      />
                    </td>
                    <td className="p-2 sm:px-4 sm:py-3 text-gray-400 dark:text-slate-500 align-top whitespace-nowrap">
                      {startIndex + idx + 1}
                    </td>
                    <td className="p-2 sm:px-4 sm:py-3 font-black text-gray-900 dark:text-slate-100 align-top whitespace-nowrap">
                      {task.vehiclePlate || "-"}
                    </td>
                    <td className="p-2 sm:px-4 sm:py-3 text-gray-600 dark:text-slate-400 align-top break-words min-w-[250px]">
                      <div className="line-clamp-2 sm:line-clamp-3 leading-tight">
                        {task.description}
                      </div>
                    </td>
                    <td className="p-2 sm:px-4 sm:py-3 text-blue-600 font-bold align-top whitespace-nowrap">
                      {task.technicianName || "-"}
                    </td>
                    <td className="p-2 sm:px-4 sm:py-3 align-top whitespace-nowrap">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="p-2 sm:px-4 sm:py-3 font-bold text-rose-600 align-top text-[10px] sm:text-sm whitespace-nowrap">
                      {formatDateTime(task.dueDate)}
                    </td>
                  </tr>
                ))}
                {currentOverdueTasks.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-10 text-gray-400 dark:text-slate-500 font-bold"
                    >
                      ไม่พบรายการข้อมูลที่ตรงตามเงื่อนไขตัวกรอง
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalOverdueItems}
            startIndex={startIndex}
            itemsPerPage={DASHBOARD_ITEMS_PER_PAGE}
          />
        </div>
      )}
    </div>
  );
}
