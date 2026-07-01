import React from "react";
import PurePieChart from "../../PurePieChart";

export function TeamsSummary({ teamSums, stats, t }: any) {
  return (
    <>
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
                (w: any) => w.efficiencyRate >= 80,
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
                (w: any) => w.lateCount > 0,
              ).length
            }{" "}
            <span className="text-sm font-bold text-gray-400 dark:text-slate-500">
              {t("teamsUnit")}
            </span>
          </span>
        </div>
      </div>
    </>
  );
}
