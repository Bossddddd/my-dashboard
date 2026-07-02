import React from "react";
import PurePieChart from "../../PurePieChart";
import { StatusBadge, PriorityBadge } from "../../badges";
import { formatDateTime } from "../../formatters";
import Pagination from "../../Pagination";
import ExportButton from "../../ExportButton";
import { BulkPrintView } from "../../BulkPrintView";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../../../lib/constants";

export function TeamDetailView({
  w,
  t,
  setSelectedteamDetail,
  setCurrentteamLogPage,
  globalStatusFilter,
  setMakeFilterValue,
  globalPriorityFilter,
  selectedIds,
  handleSelectAll,
  handleSelectRow,
  handleSort,
  sortField,
  sortDirection,
  setActiveLogModal,
  handlePrintSelected,
  isPrinting,
  printRef,
  printData,
  currentLogs,
  totalteamLogs,
  logTotalPages,
  logStartIndex,
  currentteamLogPage,
  GENERAL_ITEMS_PER_PAGE,
}: any) {
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
                  log: any,
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
