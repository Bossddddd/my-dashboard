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
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardStatsCards } from "./dashboard/DashboardStatsCards";
import { DashboardCharts } from "./dashboard/DashboardCharts";
import { DashboardSummaryLists } from "./dashboard/DashboardSummaryLists";
import { DashboardOverdueTable } from "./dashboard/DashboardOverdueTable";
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
      
      <DashboardHeader
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        executeSearch={executeSearch}
        selectedIds={selectedIds}
        handlePrintSelected={handlePrintSelected}
        isPrinting={isPrinting}
        handleLogClick={handleLogClick}
      />

      {dateRangeText && (
        <div className="flex items-center gap-2 px-1">
          <svg className="w-4 h-4 text-gray-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
            แสดงข้อมูล:{" "}
            <span className="text-[#0B603A] font-bold dark:text-emerald-400">
              {dateRangeText}
            </span>
          </span>
        </div>
      )}

      <DashboardStatsCards stats={stats} t={t} />

      <DashboardCharts monthlyStats={stats.monthlyStats} maxCount={maxCount} />

      <DashboardSummaryLists statusCounts={stats.statusCounts} priorityCounts={stats.priorityCounts} t={t} />

      <DashboardOverdueTable
        overdueList={overdueList}
        currentOverdueTasks={currentOverdueTasks}
        selectedIds={selectedIds}
        handleSelectAll={handleSelectAll}
        handleSelectRow={handleSelectRow}
        handleSort={handleSort || (() => {})}
        sortField={sortField}
        sortDirection={sortDirection}
        handleLogClick={handleLogClick}
        startIndex={startIndex}
        handlePrintSelected={handlePrintSelected}
        isPrinting={isPrinting}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalOverdueItems={totalOverdueItems}
        DASHBOARD_ITEMS_PER_PAGE={DASHBOARD_ITEMS_PER_PAGE}
      />
    </div>
  );
}
