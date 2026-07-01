import React from "react";

export function TechniciansSummary({ techsData, stats, selectedWorkshop, setSelectedWorkshop, setCurrentTechPage, t, setSelectedTechnicianDetail }: any) {
  return (
    <>
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col gap-1 sm:gap-2 w-full sm:w-80 shrink-0">
          <label className="text-xs sm:text-sm font-bold text-gray-500 dark:text-slate-400">
            {t("selectWorkshopLabel")}
          </label>
          <select
            value={selectedWorkshop}
            onChange={(e) => {
              setSelectedWorkshop(e.target.value);
              setCurrentTechPage(1);
            }}
            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg py-2.5 px-3 text-sm sm:text-base font-bold text-[#0B603A]"
          >
            <option value="all">🌐 แสดงช่างทั้งหมดทุกทีมช่างรวมกัน</option>
            {stats.workshopsData?.map((w: any, i: number) => (
              <option key={i} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl py-3 px-6 text-center w-full sm:w-auto flex items-center justify-center gap-4">
          <span className="text-3xl sm:text-4xl shrink-0">👨‍💻</span>
          <div className="text-left">
            <span className="text-[11px] sm:text-sm text-gray-600 dark:text-slate-400 font-bold block mb-0.5">
              {selectedWorkshop === "all"
                ? "ช่างทั้งหมด"
                : "ช่างประจำทีมช่างนี้"}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#0B603A] font-mono leading-none">
              {techsData.total}{" "}
              <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-slate-400">
                {t("techCountUnit")}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm border-t-4 border-t-emerald-600">
          <h4 className="text-base font-black text-emerald-800 dark:text-emerald-300 mb-4 border-b border-emerald-100 dark:border-emerald-800/50 pb-2">
            🏆 พนักงานดีเด่นสูงสุด 3 อันดับแรก (SLA %)
          </h4>
          <div className="flex flex-col gap-3">
            {techsData.top.map(
              (
                techStat: any,
                idx: number,
              ) => (
                <div
                  key={idx}
                  onClick={() =>
                    setSelectedTechnicianDetail(techsData.top[idx])
                  }
                  className="flex justify-between items-center p-3.5 bg-emerald-50 dark:bg-emerald-900/30 text-sm font-bold rounded-xl border border-emerald-100 dark:border-emerald-800/50 shadow-2xs cursor-pointer hover:bg-emerald-100/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                      {idx + 1}
                    </div>
                    <span className="text-emerald-950 dark:text-emerald-100 text-base break-words leading-tight">
                      {techStat.name}
                    </span>
                  </div>
                  <span className="font-mono bg-emerald-600 text-white px-3 py-1 rounded-lg font-black text-base shadow-sm shrink-0">
                    {techStat.efficiencyRate}%
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-rose-200 dark:border-rose-800 shadow-sm border-t-4 border-t-rose-600">
          <h4 className="text-base font-black text-rose-800 dark:text-rose-400 mb-4 border-b border-rose-100 dark:border-rose-800/50 pb-2">
            ⚠️ ช่างที่ควรปรับปรุงผลงาน 3 อันดับแรก (SLA ต่ำสุด)
          </h4>
          <div className="flex flex-col gap-3">
            {techsData.bottom.map(
              (
                techStat: any,
                idx: number,
              ) => (
                <div
                  key={idx}
                  onClick={() =>
                    setSelectedTechnicianDetail(techsData.bottom[idx])
                  }
                  className="flex justify-between items-center p-3.5 bg-rose-50 dark:bg-rose-900/30 text-sm font-bold rounded-xl border border-rose-100 dark:border-rose-800/50 shadow-2xs cursor-pointer hover:bg-rose-100/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-base shadow-sm">
                      {idx + 1}
                    </div>
                    <span className="text-rose-950 dark:text-rose-100 text-base break-words leading-tight">
                      {techStat.name}
                    </span>
                  </div>
                  <span className="font-mono bg-rose-500 text-white px-3 py-1 rounded-lg font-black text-base shadow-sm shrink-0">
                    {techStat.efficiencyRate}%
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </>
  );
}
