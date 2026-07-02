import React from "react";

export function DashboardCharts({
  monthlyStats,
  maxCount,
}: {
  monthlyStats: any[];
  maxCount: number;
}) {
  if (!monthlyStats || monthlyStats.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-6">
          📈 จำนวนใบแจ้งซ่อมแยกรายเดือน (6 เดือนล่าสุด)
        </h3>
        <div className="flex h-48 items-end justify-between gap-2 border-b border-gray-200 dark:border-slate-700 pb-2 px-2">
          {monthlyStats.map((item: any, idx: number) => {
            const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
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
  );
}
