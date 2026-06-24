"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../../lib/constants";
import { useLanguage } from "../../app/LanguageContext";

const MultiMapComponent = dynamic(() => import("../MultiMapComponent"), {
  ssr: false,
});

export default function MapTab({
  mapLogs = [],
  setActiveLogModal,
}: {
  mapLogs: any[];
  setActiveLogModal: (log: any) => void;
}) {
  const { t } = useLanguage();

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    Object.keys(STATUS_CONFIG).filter(
      (key) => key !== "completed" && key !== "cancelled",
    ),
  );
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(
    Object.keys(PRIORITY_CONFIG),
  );
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const togglePriority = (priority: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority],
    );
  };

  const filteredLogs = useMemo(() => {
    return mapLogs.filter((log) => {
      // Filter by status
      if (!selectedStatuses.includes(log.status)) return false;

      // Filter by priority
      if (!selectedPriorities.includes(log.priority)) return false;

      // Filter by overdue
      if (overdueOnly) {
        const isCompleted =
          log.status === "completed" || log.status === "cancelled";
        if (isCompleted) return false;
        if (!log.dueDate) return false;
        if (new Date(log.dueDate) >= new Date()) return false;
      }

      return true;
    });
  }, [mapLogs, selectedStatuses, selectedPriorities, overdueOnly]);

  const stats = useMemo(() => {
    const total = filteredLogs.length;
    let overdue = 0;
    let urgent = 0;

    filteredLogs.forEach((log) => {
      const isCompleted =
        log.status === "completed" || log.status === "cancelled";
      if (!isCompleted && log.dueDate && new Date(log.dueDate) < new Date()) {
        overdue++;
      }
      if (log.priority === "urgent" || log.priority === "high") {
        urgent++;
      }
    });

    return { total, overdue, urgent };
  }, [filteredLogs]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] gap-4">
      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col gap-4 flex-shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-[#0B603A] dark:text-emerald-400 flex items-center gap-2">
              📍 แผนที่พิกัดรถเสีย / จุดซ่อมหน้างาน
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-bold mt-1">
              พบข้อมูลพิกัด {stats.total} รายการ |{" "}
              <span className="text-rose-500">
                เกินกำหนด {stats.overdue} งาน
              </span>{" "}
              |{" "}
              <span className="text-amber-500">
                เร่งด่วน {stats.urgent} งาน
              </span>
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm font-bold bg-rose-50 dark:bg-rose-900/30 px-4 py-2.5 rounded-xl border border-rose-100 dark:border-rose-800 cursor-pointer text-rose-700 dark:text-rose-400 transition-colors hover:bg-rose-100 shadow-sm">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
            />
            แสดงเฉพาะงานเกินกำหนด
          </label>
        </div>

        <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700/50 flex flex-col xl:flex-row gap-4 xl:items-center">
          {/* Status Checkboxes */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 dark:text-slate-500 mr-1">
              สถานะ:
            </span>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <label
                key={key}
                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${selectedStatuses.includes(key) ? "bg-white dark:bg-slate-800 text-[#0B603A] dark:text-emerald-400 border-[#0B603A]/30 dark:border-emerald-500/30 shadow-sm" : "bg-transparent text-gray-400 border-transparent hover:bg-gray-200/50 dark:hover:bg-slate-800"}`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedStatuses.includes(key)}
                  onChange={() => toggleStatus(key)}
                />
                <div
                  className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all ${selectedStatuses.includes(key) ? "bg-[#0B603A] border-[#0B603A] dark:bg-emerald-500 dark:border-emerald-500" : "bg-white border-gray-300 dark:bg-slate-800 dark:border-slate-600"}`}
                >
                  {selectedStatuses.includes(key) && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                {config.text}
              </label>
            ))}
          </div>

          <div className="hidden xl:block w-px h-6 bg-gray-200 dark:bg-slate-700"></div>

          {/* Priority Checkboxes */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 dark:text-slate-500 mr-1">
              เร่งด่วน:
            </span>
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <label
                key={key}
                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${selectedPriorities.includes(key) ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-amber-500/30 dark:border-amber-500/30 shadow-sm" : "bg-transparent text-gray-400 border-transparent hover:bg-gray-200/50 dark:hover:bg-slate-800"}`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedPriorities.includes(key)}
                  onChange={() => togglePriority(key)}
                />
                <div
                  className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all ${selectedPriorities.includes(key) ? "bg-amber-500 border-amber-500" : "bg-white border-gray-300 dark:bg-slate-800 dark:border-slate-600"}`}
                >
                  {selectedPriorities.includes(key) && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                {config.text}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-2 overflow-hidden relative">
        {/* Legend */}
        <div className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-3 rounded-xl border shadow-lg text-xs font-bold space-y-2 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500 border border-white"></div>{" "}
            แจ้งซ่อม / แจ้งเหตุ
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 border border-white"></div>{" "}
            กำลังดำเนินการ
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 border border-white"></div>{" "}
            รออะไหล่ / รอตัดสินใจ
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></div>{" "}
            งานเสร็จสิ้น
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500 border border-white"></div>{" "}
            ยกเลิก
          </div>
        </div>

        {mapLogs.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold flex-col gap-4">
            <span className="text-4xl">🗺️</span>
            <p>ไม่มีข้อมูลพิกัดสถานที่ในระบบ</p>
          </div>
        ) : (
          <MultiMapComponent
            logs={filteredLogs}
            onMarkerClick={setActiveLogModal}
          />
        )}
      </div>
    </div>
  );
}
