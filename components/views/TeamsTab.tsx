import { useLanguage } from "../../app/LanguageContext";
import React from "react";
import PurePieChart from "../PurePieChart";
import { StatusBadge, PriorityBadge } from "../badges";
import { formatDateTime } from "../formatters";
import { sortedArray } from "../../lib/utils";
import Pagination from "../Pagination";
import ExportButton from "../ExportButton";
import { BulkPrintView } from "../BulkPrintView";
import toast from "react-hot-toast";
import { getAllLogsForExport } from "../../app/actions";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../../lib/constants";

export default function TeamsTab({
  selectedteamDetail,
  setSelectedteamDetail,
  currentteamLogPage,
  setCurrentteamLogPage,
  globalStatusFilter,
  globalPriorityFilter,
  setMakeFilterValue,
  sortField,
  sortDirection,
  handleSort,
  setActiveLogModal,
  GENERAL_ITEMS_PER_PAGE,
  stats,
  teamSums,
  processedteams,
  slaTarget,
}: {
  selectedteamDetail: import("../../lib/types").TeamStat | null;
  setSelectedteamDetail: (w: import("../../lib/types").TeamStat | null) => void;
  currentteamLogPage: number;
  setCurrentteamLogPage: (p: number) => void;
  globalStatusFilter: string;
  globalPriorityFilter: string;
  setMakeFilterValue: (k: string, v: string) => void;
  sortField: string;
  sortDirection: "asc" | "desc";
  handleSort: (f: string) => void;
  formatDateTime?: any;
  PriorityBadge?: any;
  StatusBadge?: any;
  setActiveLogModal: (log: import("../../lib/types").MaintenanceLog) => void;
  GENERAL_ITEMS_PER_PAGE: number;
  processedteams: import("../../lib/types").TeamStat[];
  teamSums: {
    sumSuccess: number;
    sumInProgress: number;
    sumLate: number;
    totalteams: number;
  };
  slaTarget: number;
  stats: import("../../lib/types").DashboardStatsData;
}) {
  const { t } = useLanguage();
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [printData, setPrintData] = React.useState<any[]>([]);
  const printRef = React.useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = React.useState(false);
  if (selectedteamDetail) {
    const w = selectedteamDetail;

    let logList = w.logs || [];
    if (globalStatusFilter !== "all")
      logList = logList.filter(
        (l: import("../../lib/types").MaintenanceLog) =>
          l.status === globalStatusFilter,
      );
    if (globalPriorityFilter !== "all")
      logList = logList.filter(
        (l: import("../../lib/types").MaintenanceLog) =>
          l.priority === globalPriorityFilter,
      );
    if (sortField) logList = sortedArray(logList, sortField, sortDirection);

    const totalteamLogs = logList.length;
    const logTotalPages = Math.max(
      1,
      Math.ceil(totalteamLogs / GENERAL_ITEMS_PER_PAGE),
    );
    const logStartIndex = (currentteamLogPage - 1) * GENERAL_ITEMS_PER_PAGE;
    const currentLogs = logList.slice(
      logStartIndex,
      logStartIndex + GENERAL_ITEMS_PER_PAGE,
    );

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        setSelectedIds(
          new Set(currentLogs.map((l: any) => l.maintenanceLogId || l.id)),
        );
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
      <div className="flex flex-col gap-6">
        <button
          onClick={() => {
            setSelectedteamDetail(null);
            setCurrentteamLogPage(1);
          }}
          className="text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-[#0B603A] flex items-center gap-2 w-fit"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          กลับไปตารางทีมช่างทั้งหมด
        </button>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16 w-full">
          <div className="flex flex-col items-center shrink-0">
            <h3 className="font-black text-gray-900 dark:text-slate-100 text-xl mb-6 text-center border-b pb-2 px-4 border-gray-100 dark:border-slate-700/50">
              🏢 {w.name}
            </h3>
            <PurePieChart
              success={w.successCount}
              inProgress={w.inProgressCount}
              late={w.lateCount}
              size="lg"
            />
          </div>
          <div className="flex flex-col gap-4 text-sm font-bold bg-gray-50 dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-700/50 w-full max-w-md">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-slate-700">
              <span className="text-gray-500 dark:text-slate-400 font-bold flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>{" "}
                งานสำเร็จทั้งหมด:
              </span>
              <span className="font-black text-emerald-600 text-xl">
                {w.successCount} งาน
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-slate-700">
              <span className="text-gray-500 dark:text-slate-400 font-bold flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>{" "}
                กำลังซ่อมบำรุง:
              </span>
              <span className="font-black text-amber-500 text-xl">
                {w.inProgressCount} งาน
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-slate-700">
              <span className="text-gray-500 dark:text-slate-400 font-bold flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>{" "}
                งานล่าช้าสะสม:
              </span>
              <span className="font-black text-rose-600 text-xl">
                {w.lateCount} งาน
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-slate-700">
              <span className="text-gray-500 dark:text-slate-400 font-bold">
                เวลาซ่อมเฉลี่ย (ต่อคัน):
              </span>
              <span className="font-mono font-black text-gray-700 dark:text-slate-300 text-lg">
                {w.avgRepairHours} ชม.
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-800 dark:text-slate-200 font-black text-base">
                ประสิทธิภาพ (SLA):
              </span>
              <span
                className={`px-4 py-1.5 rounded-lg font-mono font-black text-lg shadow-sm bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400`}
              >
                {w.efficiencyRate}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden relative">
          <BulkPrintView ref={printRef} data={printData} />
          <div className="p-4 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="font-bold text-sm sm:text-base text-gray-800 dark:text-slate-200">
              📋 รายการประวัติใบงานซ่อมของทีมช่างนี้ ({totalteamLogs} รายการ)
            </h3>
            <div className="flex flex-wrap items-center gap-2">
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
                    fileNamePrefix={`สรุปผลงานทีมช่าง_${w.name}`}
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
                  <ExportButton fileNamePrefix={`สรุปผลงานทีมช่าง_${w.name}`} />
                </div>
              )}
              <select
                value={globalStatusFilter}
                onChange={(e) => setMakeFilterValue("status", e.target.value)}
                className="text-xs bg-white dark:bg-slate-800 border p-1.5 rounded font-bold text-gray-600 dark:text-slate-400"
              >
                <option value="all">{t("allStatus")}</option>
                {Object.keys(STATUS_CONFIG).map((k) => (
                  <option key={k} value={k}>
                    {STATUS_CONFIG[k].text}
                  </option>
                ))}
              </select>
              <select
                value={globalPriorityFilter}
                onChange={(e) => setMakeFilterValue("priority", e.target.value)}
                className="text-xs bg-white dark:bg-slate-800 border p-1.5 rounded font-bold text-gray-600 dark:text-slate-400"
              >
                <option value="all">{t("allPriority")}</option>
                {Object.keys(PRIORITY_CONFIG).map((k) => (
                  <option key={k} value={k}>
                    {PRIORITY_CONFIG[k].text}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left table-auto text-[11px] sm:text-sm min-w-[1000px]">
              <thead className="bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-slate-400 text-[10px] sm:text-xs uppercase border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="w-10 p-2 sm:px-4 sm:py-3 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                      onChange={handleSelectAll}
                      checked={
                        currentLogs.length > 0 &&
                        currentLogs.every((t: any) =>
                          selectedIds.has(t.maintenanceLogId || t.id),
                        )
                      }
                    />
                  </th>
                  <th
                    onClick={() => handleSort("vehiclePlate")}
                    className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-gray-100 dark:bg-slate-800/50 whitespace-nowrap"
                  >
                    ทะเบียน{" "}
                    {sortField === "vehiclePlate"
                      ? sortDirection === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th className="p-2 sm:px-4 sm:py-3 font-bold whitespace-nowrap">
                    {t("descCol")}
                  </th>
                  <th
                    onClick={() => handleSort("technicianName")}
                    className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-gray-100 dark:bg-slate-800/50 whitespace-nowrap"
                  >
                    ช่าง{" "}
                    {sortField === "technicianName"
                      ? sortDirection === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th
                    onClick={() => handleSort("priority")}
                    className="p-2 sm:px-4 sm:py-3 font-bold text-center cursor-pointer hover:bg-gray-100 dark:bg-slate-800/50 whitespace-nowrap"
                  >
                    เร่งด่วน{" "}
                    {sortField === "priority"
                      ? sortDirection === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-gray-100 dark:bg-slate-800/50 whitespace-nowrap"
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
                    className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-gray-100 dark:bg-slate-800/50 whitespace-nowrap"
                  >
                    กำหนดเสร็จ{" "}
                    {sortField === "dueDate"
                      ? sortDirection === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white dark:bg-slate-800">
                {currentLogs.map(
                  (
                    log: import("../../lib/types").MaintenanceLog,
                    idx: number,
                  ) => {
                    const logId = log.maintenanceLogId || log.id;
                    return (
                      <tr
                        key={idx}
                        onClick={() => setActiveLogModal(log)}
                        className={`hover:bg-emerald-50 dark:bg-emerald-900/30/30 cursor-pointer transition-colors ${selectedIds.has(logId as number) ? "bg-emerald-50/80 dark:bg-emerald-900/40" : ""}`}
                      >
                        <td
                          className="p-2 sm:px-4 sm:py-3 text-center"
                          onClick={(e) => {
                            if (logId !== undefined)
                              handleSelectRow(e, logId as number);
                          }}
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                            checked={selectedIds.has(logId as number)}
                            readOnly
                          />
                        </td>
                        <td className="p-2 sm:px-4 sm:py-3 font-black text-gray-900 dark:text-slate-100 align-top whitespace-nowrap">
                          {log.vehiclePlate}
                        </td>
                        <td className="p-2 sm:px-4 sm:py-3 text-gray-600 dark:text-slate-400 align-top break-words min-w-[250px]">
                          <div className="line-clamp-2 sm:line-clamp-3 leading-tight">
                            {log.description}
                          </div>
                        </td>
                        <td className="p-2 sm:px-4 sm:py-3 text-gray-800 dark:text-slate-200 font-bold align-top whitespace-nowrap">
                          {log.technicianName}
                        </td>
                        <td className="p-2 sm:px-4 sm:py-3 text-center align-top whitespace-nowrap">
                          <PriorityBadge priority={log.priority} />
                        </td>
                        <td className="p-2 sm:px-4 sm:py-3 align-top whitespace-nowrap">
                          <StatusBadge status={log.status} />
                        </td>
                        <td className="p-2 sm:px-4 sm:py-3 text-gray-500 dark:text-slate-400 font-bold align-top text-[10px] sm:text-sm whitespace-nowrap">
                          {formatDateTime(log.dueDate || "")}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentteamLogPage}
            totalPages={logTotalPages}
            onPageChange={setCurrentteamLogPage}
            totalItems={totalteamLogs}
            startIndex={logStartIndex}
            itemsPerPage={GENERAL_ITEMS_PER_PAGE}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-12">
        <div className="flex flex-col items-center">
          <h3 className="text-sm sm:text-base font-black text-gray-800 dark:text-slate-200 mb-4 sm:mb-6 text-center">
            📊 สัดส่วนสถานะงานซ่อมรวมทุกทีมช่าง
          </h3>
          <PurePieChart
            success={teamSums.sumSuccess}
            inProgress={teamSums.sumInProgress}
            late={teamSums.sumLate}
            size="lg"
          />
        </div>
        <div className="flex flex-col gap-3 sm:gap-4 text-xs sm:text-sm font-bold bg-gray-50 dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-gray-100 dark:border-slate-700/50 w-full md:w-auto min-w-[250px] lg:min-w-[350px]">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-slate-700">
            <span className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              {t("successJobs")}
            </span>
            <span className="text-emerald-600 text-xl font-black">
              {teamSums.sumSuccess}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-slate-700">
            <span className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              {t("inProgressJobs")}
            </span>
            <span className="text-amber-500 text-xl font-black">
              {teamSums.sumInProgress}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              {t("lateJobs")}
            </span>
            <span className="text-rose-600 text-xl font-black">
              {teamSums.sumLate}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm border-l-4 border-l-[#0B603A]">
          <span className="text-gray-500 dark:text-slate-400 text-xs font-bold block mb-1">
            {t("totalteamsInSystem")}
          </span>
          <span className="text-3xl font-black text-[#0B603A]">
            {teamSums.totalteams}{" "}
            <span className="text-sm font-bold text-gray-400 dark:text-slate-500">
              {t("teamsUnit")}
            </span>
          </span>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm border-l-4 border-l-blue-500">
          <span className="text-gray-500 dark:text-slate-400 text-xs font-bold block mb-1">
            ทีมช่างประสิทธิภาพ SLA ดีเยี่ยม (&gt;=80%)
          </span>
          <span className="text-3xl font-black text-blue-600">
            {
              stats.teamsData?.filter(
                (w: import("../../lib/types").TeamStat) =>
                  w.efficiencyRate >= 80,
              ).length
            }{" "}
            <span className="text-sm font-bold text-gray-400 dark:text-slate-500">
              {t("teamsUnit")}
            </span>
          </span>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm border-l-4 border-l-rose-500">
          <span className="text-gray-500 dark:text-slate-400 text-xs font-bold block mb-1">
            {t("lateteams")}
          </span>
          <span className="text-3xl font-black text-rose-600">
            {
              stats.teamsData?.filter(
                (w: import("../../lib/types").TeamStat) => w.lateCount > 0,
              ).length
            }{" "}
            <span className="text-sm font-bold text-gray-400 dark:text-slate-500">
              {t("teamsUnit")}
            </span>
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mt-2">
        <div className="p-3 sm:p-5 border-b border-gray-100 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-900 flex justify-between items-center">
          <h3 className="font-bold text-sm sm:text-base text-gray-800 dark:text-slate-200">
            🏢 ตารางทำเนียบรายชื่อทีมช่าง/ศูนย์บริการซ่อมบำรุง
          </h3>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 font-bold hidden sm:block">
            * คลิกหัวตารางเพื่อจัดเรียงลำดับได้
          </p>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left table-auto text-[11px] sm:text-sm min-w-[900px]">
            <thead className="text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 text-[10px] sm:text-xs uppercase">
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 whitespace-nowrap"
                >
                  ชื่อทีมช่าง{" "}
                  {sortField === "name"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  onClick={() => handleSort("totalJobs")}
                  className="p-2 sm:px-4 sm:py-3 font-bold text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 whitespace-nowrap"
                >
                  สะสม{" "}
                  {sortField === "totalJobs"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  onClick={() => handleSort("successCount")}
                  className="p-2 sm:px-4 sm:py-3 font-bold text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 whitespace-nowrap"
                >
                  สำเร็จ{" "}
                  {sortField === "successCount"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  onClick={() => handleSort("inProgressCount")}
                  className="p-2 sm:px-4 sm:py-3 font-bold text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 whitespace-nowrap"
                >
                  กำลังซ่อม{" "}
                  {sortField === "inProgressCount"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  onClick={() => handleSort("lateCount")}
                  className="p-2 sm:px-4 sm:py-3 font-bold text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 whitespace-nowrap"
                >
                  ล่าช้า{" "}
                  {sortField === "lateCount"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th className="p-2 sm:px-4 sm:py-3 font-bold text-center whitespace-nowrap">
                  {t("avgRepairHours")}
                </th>
                <th
                  onClick={() => handleSort("efficiencyRate")}
                  className="p-2 sm:px-4 sm:py-3 font-bold text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 whitespace-nowrap"
                >
                  SLA{" "}
                  {sortField === "efficiencyRate"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white dark:bg-slate-800">
              {processedteams.map((team: any, index: number) => (
                <tr
                  key={index}
                  onClick={() => {
                    setSelectedteamDetail(team);
                    setCurrentteamLogPage(1);
                  }}
                  className="hover:bg-emerald-50 dark:bg-emerald-900/30/40 cursor-pointer transition-all"
                >
                  <td className="p-2 sm:px-4 sm:py-4 font-black text-[#0B603A] hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm sm:text-lg shrink-0">🏢</span>{" "}
                    {team.name}
                  </td>
                  <td className="p-2 sm:px-4 sm:py-4 text-center font-bold text-gray-800 dark:text-slate-200 whitespace-nowrap">
                    {team.totalJobs}
                  </td>
                  <td className="p-2 sm:px-4 sm:py-4 text-center text-emerald-600 font-black whitespace-nowrap">
                    {team.successCount}
                  </td>
                  <td className="p-2 sm:px-4 sm:py-4 text-center text-amber-500 font-black whitespace-nowrap">
                    {team.inProgressCount}
                  </td>
                  <td className="p-2 sm:px-4 sm:py-4 text-center text-rose-600 font-black whitespace-nowrap">
                    {team.lateCount}
                  </td>
                  <td className="p-2 sm:px-4 sm:py-4 text-center font-mono font-bold text-gray-600 dark:text-slate-400 whitespace-nowrap">
                    {team.avgRepairHours} ชม.
                  </td>
                  <td className="p-2 sm:px-4 sm:py-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-mono font-black text-[9px] sm:text-sm shadow-xs ${
                        team.efficiencyRate >= (slaTarget || 80)
                          ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : team.efficiencyRate >= (slaTarget || 80) - 30
                            ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700"
                            : "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      {team.efficiencyRate}%
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
