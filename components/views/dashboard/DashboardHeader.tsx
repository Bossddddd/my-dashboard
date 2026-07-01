import React from "react";
import DashboardSearchBar from "../../DashboardSearchBar";
import ImportButton from "../../ImportButton";
import ExportButton from "../../ExportButton";

export function DashboardHeader({
  searchInput,
  setSearchInput,
  executeSearch,
  selectedIds,
  handlePrintSelected,
  isPrinting,
  handleLogClick,
}: {
  searchInput: string;
  setSearchInput: (v: string) => void;
  executeSearch: () => void;
  selectedIds: Set<number>;
  handlePrintSelected: () => void;
  isPrinting: boolean;
  handleLogClick?: (log: any) => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
      <DashboardSearchBar
        value={searchInput}
        onChange={setSearchInput}
        onSearch={executeSearch}
      />
      <div className="w-full sm:w-auto flex flex-wrap gap-2 flex-shrink-0 items-center">
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
              fileNamePrefix="สรุปภาพรวมแดชบอร์ด"
            />
          </div>
        )}
        {selectedIds.size === 0 && (
          <div className="flex gap-2 items-center">
            <button
              onClick={() =>
                handleLogClick?.({
                  isNew: true,
                  status: "reported",
                  priority: "normal",
                } as any)
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-sm text-sm font-bold border border-emerald-700 flex items-center gap-1 transition-colors"
            >
              ➕ สร้างใบงาน
            </button>
            <button
              onClick={handlePrintSelected}
              disabled={isPrinting}
              className="bg-white text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg shadow-sm text-sm font-bold border border-gray-200 flex items-center gap-2 hidden sm:flex"
            >
              🖨️ {isPrinting ? "กำลังโหลด..." : "พิมพ์ทั้งหมด"}
            </button>
            <ExportButton fileNamePrefix="สรุปภาพรวมแดชบอร์ด" />
          </div>
        )}
        <ImportButton />
      </div>
    </div>
  );
}
