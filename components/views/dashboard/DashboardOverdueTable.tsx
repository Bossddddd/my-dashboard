import React from "react";
import { StatusBadge } from "../../badges";
import { formatDateTime } from "../../formatters";
import Pagination from "../../Pagination";
import ExportButton from "../../ExportButton";

export function DashboardOverdueTable({
  overdueList,
  currentOverdueTasks,
  selectedIds,
  handleSelectAll,
  handleSelectRow,
  handleSort,
  sortField,
  sortDirection,
  handleLogClick,
  startIndex,
  handlePrintSelected,
  isPrinting,
  currentPage,
  totalPages,
  setCurrentPage,
  totalOverdueItems,
  DASHBOARD_ITEMS_PER_PAGE,
}: {
  overdueList: any[];
  currentOverdueTasks: any[];
  selectedIds: Set<number>;
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectRow: (e: React.MouseEvent, id: number) => void;
  handleSort: (f: string) => void;
  sortField?: string;
  sortDirection: string;
  handleLogClick?: (log: any) => void;
  startIndex: number;
  handlePrintSelected: () => void;
  isPrinting: boolean;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (p: number) => void;
  totalOverdueItems: number;
  DASHBOARD_ITEMS_PER_PAGE: number;
}) {
  if (totalOverdueItems === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="p-3 sm:p-5 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="font-black text-sm sm:text-base text-gray-800 dark:text-slate-200 flex items-center gap-2 shrink-0">
          <span className="text-rose-500">🔥</span>
          รายการแจ้งซ่อมที่เกินกำหนด SLA ({overdueList.length})
        </h3>

        <div className="flex flex-wrap items-center gap-4">
          <p className="text-[11px] text-gray-400 dark:text-slate-500 font-bold hidden lg:block">
            * คลิกหัวตารางเพื่อจัดเรียงข้อมูล หรือคลิกแถวเพื่อดูข้อมูลเชิงลึก
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
                    currentOverdueTasks.every((t: any) => selectedIds.has(t.id))
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
                ทะเบียนรถ {sortField === "plate" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="p-2 sm:px-4 sm:py-3 font-bold whitespace-nowrap">
                รายละเอียด / อาการ
              </th>
              <th
                onClick={() => handleSort("technicianName")}
                className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-rose-100/50 whitespace-nowrap"
              >
                ช่าง {sortField === "technicianName" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                onClick={() => handleSort("status")}
                className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-rose-100/50 whitespace-nowrap"
              >
                สถานะ {sortField === "status" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                onClick={() => handleSort("dueDate")}
                className="p-2 sm:px-4 sm:py-3 font-bold cursor-pointer hover:bg-rose-100/50 whitespace-nowrap"
              >
                กำหนดส่ง {sortField === "dueDate" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:bg-slate-800">
            {currentOverdueTasks.map((task: any, idx: number) => (
              <tr
                key={task.id}
                onClick={() => handleLogClick && handleLogClick(task)}
                className={`hover:bg-rose-50 dark:bg-rose-900/30/40 cursor-pointer transition-colors ${
                  selectedIds.has(task.id) ? "bg-rose-50/80 dark:bg-rose-900/40" : ""
                }`}
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
                <td colSpan={7} className="text-center py-10 text-gray-400 dark:text-slate-500 font-bold">
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
  );
}
