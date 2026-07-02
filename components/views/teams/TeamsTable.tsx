import React from "react";

export function TeamsTable({
  processedteams,
  t,
  handleSort,
  sortField,
  sortDirection,
  setSelectedteamDetail,
  setCurrentteamLogPage,
  slaTarget,
}: any) {
  return (
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
  );
}
