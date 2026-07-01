import React from "react";
import { StatusBadge, PriorityBadge } from "../../badges";

export function DashboardSummaryLists({
  statusCounts,
  priorityCounts,
  t,
}: {
  statusCounts: any[];
  priorityCounts: any[];
  t: (key: string) => string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-4 border-b pb-2">
          {t("statusSummaryTitle")}
        </h3>
        <div className="flex flex-col gap-2">
          {statusCounts?.map((item: any) => (
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
          {priorityCounts?.map((item: any) => (
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
  );
}
