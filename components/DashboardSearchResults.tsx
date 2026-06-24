// @ts-nocheck
import type { ReactNode } from "react";

export interface DashboardSearchResultsData {
  query: string;
  workshops: any[];
  technicians: any[];
  logs: any[];
  total: number;
}

interface DashboardSearchResultsProps {
  results: DashboardSearchResultsData | null;
  searchInput: string;
  itemsLimit: number;
  onReset: () => void;
  onOpenWorkshop: (workshop: any) => void;
  onOpenTechnician: (technician: any) => void;
  onOpenLog: (log: any) => void;
  renderPriorityBadge: (priority: string) => ReactNode;
  renderStatusBadge: (status: string) => ReactNode;
  renderDateTime: (dateStr?: string) => ReactNode;
}

export default function DashboardSearchResults({
  results,
  searchInput,
  itemsLimit,
  onReset,
  onOpenWorkshop,
  onOpenTechnician,
  onOpenLog,
  renderPriorityBadge,
  renderStatusBadge,
  renderDateTime,
}: DashboardSearchResultsProps) {
  if (results === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-3">🔍</div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-slate-200">
          ไม่พบข้อมูลที่ค้นหา
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          ไม่พบ{" "}
          <span className="font-bold text-gray-800 dark:text-slate-200">
            "{searchInput}"
          </span>{" "}
          ในทะเบียนรถ ช่าง ทีมช่าง หรือใบแจ้งซ่อม
        </p>
        <button
          onClick={onReset}
          className="mt-4 text-xs bg-gray-100 dark:bg-slate-800/50 text-gray-600 dark:text-slate-400 font-bold px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const displayedLogs = results.logs.slice(0, itemsLimit);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <button
        onClick={onReset}
        className="text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-[#0B603A] flex items-center gap-1 transition-colors w-fit"
      >
        ← กลับหน้าแดชบอร์ดหลัก
      </button>

      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0B603A]">
            ผลการค้นหา "{results.query}"
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-bold mt-1">
            {results.total} รายการที่ตรงกัน
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-black">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
            ทีมช่าง {results.workshops.length}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 border border-blue-100 dark:border-blue-800/50">
            ช่าง {results.technicians.length}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 border border-amber-100">
            ใบแจ้งซ่อม {results.logs.length}
          </span>
        </div>
      </div>

      {results.workshops.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700/50">
            <h3 className="font-black text-sm text-gray-800 dark:text-slate-200">
              🏢 ทีมช่าง/ศูนย์ซ่อม
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {results.workshops.map((workshop: any, idx: number) => (
              <button
                key={`${workshop.name}-${idx}`}
                onClick={() => onOpenWorkshop(workshop)}
                className="w-full p-4 text-left hover:bg-emerald-50 dark:bg-emerald-900/30/40 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <div className="font-black text-[#0B603A]">
                    {workshop.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 font-bold mt-1">
                    งานทั้งหมด {workshop.totalJobs} | สำเร็จ{" "}
                    {workshop.successCount} | ล่าช้า {workshop.lateCount}
                  </div>
                </div>
                <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg w-fit">
                  SLA {workshop.efficiencyRate}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {results.technicians.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700/50">
            <h3 className="font-black text-sm text-gray-800 dark:text-slate-200">
              👨‍🔧 ช่างซ่อม
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {results.technicians.map((technician: any, idx: number) => (
              <button
                key={`${technician.name}-${idx}`}
                onClick={() => onOpenTechnician(technician)}
                className="w-full p-4 text-left hover:bg-blue-50 dark:bg-blue-900/30/40 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <div className="font-black text-blue-800">
                    {technician.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 font-bold mt-1">
                    งานทั้งหมด {technician.totalJobs} | สำเร็จ{" "}
                    {technician.successCount} | ล่าช้า {technician.lateCount}
                  </div>
                </div>
                <span className="font-mono font-black text-sm text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg w-fit">
                  SLA {technician.efficiencyRate}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {results.logs.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="font-black text-sm text-gray-800 dark:text-slate-200">
              📋 ใบแจ้งซ่อม
            </h3>
            {results.logs.length > displayedLogs.length && (
              <span className="text-xs text-gray-400 dark:text-slate-500 font-bold">
                แสดง {displayedLogs.length} จาก {results.logs.length} รายการ
              </span>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {displayedLogs.map(
              (log: import("../lib/types").MaintenanceLog, idx: number) => (
                <button
                  key={`${log.maintenanceLogId || log.id}-${idx}`}
                  onClick={() => onOpenLog(log)}
                  className="w-full p-4 text-left hover:bg-amber-50 dark:bg-amber-900/30/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <span className="font-black text-[#0B603A]">
                      ใบแจ้งซ่อม #{log.maintenanceLogId || log.id || "N/A"}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {renderPriorityBadge(log.priority)}{" "}
                      {renderStatusBadge(log.status)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {log.description}
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500 dark:text-slate-400 font-bold mt-3">
                    <span>
                      ทะเบียน:{" "}
                      <span className="text-gray-800 dark:text-slate-200">
                        {log.vehiclePlate || "-"}
                      </span>
                    </span>
                    <span>
                      ช่าง:{" "}
                      <span className="text-gray-800 dark:text-slate-200">
                        {log.technicianName || "-"}
                      </span>
                    </span>
                    <span>
                      ทีมช่าง:{" "}
                      <span className="text-gray-800 dark:text-slate-200">
                        {log.workshopName || "-"}
                      </span>
                    </span>
                    <span>
                      กำหนดเสร็จ:{" "}
                      <span className="text-rose-600">
                        {renderDateTime(log.dueDate)}
                      </span>
                    </span>
                  </div>
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
