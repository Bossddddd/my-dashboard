import React from "react";

export function DashboardStatsCards({
  stats,
  t,
}: {
  stats: any;
  t: (key: string) => string;
}) {
  return (
    <>
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
                {stats.efficiency?.onTimeRate || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                style={{ width: `${stats.efficiency?.onTimeRate || 0}%` }}
                className="bg-emerald-500 h-1.5 rounded-full"
              ></div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <span className="text-gray-500 dark:text-slate-400 block mb-1 text-xs font-bold">
              {t("avgResponseTime")}
            </span>
            <span className="text-2xl font-bold text-blue-600 font-mono">
              {stats.efficiency?.avgResponseHours || 0}
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
              {stats.efficiency?.avgRepairHours || 0}
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">
              {t("hoursPerJob")}
            </span>
          </div>
          <div
            className={`p-4 rounded-lg border flex flex-col justify-between ${
              (stats.efficiency?.overdueActiveCount || 0) > 0
                ? "bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800/50"
                : "bg-slate-50 border-slate-100"
            }`}
          >
            <div>
              <span className="text-gray-500 dark:text-slate-400 block mb-1 text-xs font-bold">
                {t("overdueTasksActive")}
              </span>
              <span
                className={`text-2xl font-bold font-mono ${
                  (stats.efficiency?.overdueActiveCount || 0) > 0
                    ? "text-rose-600"
                    : "text-gray-700 dark:text-slate-300"
                }`}
              >
                {stats.efficiency?.overdueActiveCount || 0}
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">
                {t("logsUnit")}
              </span>
            </div>
            {(stats.efficiency?.overdueActiveCount || 0) > 0 && (
              <span className="text-[10px] font-bold text-rose-500 animate-pulse mt-1">
                ⚠️ เร่งติดตามงานด่วน
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
