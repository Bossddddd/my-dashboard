import { useLanguage } from "../../app/LanguageContext";
import React from "react";

import { sortedArray } from "../../lib/utils";
import toast from "react-hot-toast";
import { getAllLogsForExport } from "../../app/actions";
import { TeamDetailView } from "./teams/TeamDetailView";
import { TeamsSummary } from "./teams/TeamsSummary";
import { TeamsTable } from "./teams/TeamsTable";

export default function TeamsTab({
  selectedteamDetail,
  setSelectedteamDetail,
  currentteamLogPage,
  setCurrentteamLogPage,
  globalStatusFilter,
  globalPriorityFilter,
  setMakeFilterValue,
  sortField,
  sortDirection,
  handleSort,
  setActiveLogModal,
  GENERAL_ITEMS_PER_PAGE,
  stats,
  teamSums,
  processedteams,
  slaTarget,
}: {
  selectedteamDetail: import("../../lib/types").TeamStat | null;
  setSelectedteamDetail: (w: import("../../lib/types").TeamStat | null) => void;
  currentteamLogPage: number;
  setCurrentteamLogPage: (p: number) => void;
  globalStatusFilter: string;
  globalPriorityFilter: string;
  setMakeFilterValue: (k: string, v: string) => void;
  sortField: string;
  sortDirection: "asc" | "desc";
  handleSort: (f: string) => void;
  formatDateTime?: any;
  PriorityBadge?: any;
  StatusBadge?: any;
  setActiveLogModal: (log: import("../../lib/types").MaintenanceLog) => void;
  GENERAL_ITEMS_PER_PAGE: number;
  processedteams: import("../../lib/types").TeamStat[];
  teamSums: {
    sumSuccess: number;
    sumInProgress: number;
    sumLate: number;
    totalteams: number;
  };
  slaTarget: number;
  stats: import("../../lib/types").DashboardStatsData;
}) {
  const { t } = useLanguage();
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [printData, setPrintData] = React.useState<any[]>([]);
  const printRef = React.useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = React.useState(false);
  if (selectedteamDetail) {
    const w = selectedteamDetail;

    let logList = w.logs || [];
    if (globalStatusFilter !== "all")
      logList = logList.filter(
        (l: import("../../lib/types").MaintenanceLog) =>
          l.status === globalStatusFilter,
      );
    if (globalPriorityFilter !== "all")
      logList = logList.filter(
        (l: import("../../lib/types").MaintenanceLog) =>
          l.priority === globalPriorityFilter,
      );
    if (sortField) logList = sortedArray(logList, sortField, sortDirection);

    const totalteamLogs = logList.length;
    const logTotalPages = Math.max(
      1,
      Math.ceil(totalteamLogs / GENERAL_ITEMS_PER_PAGE),
    );
    const logStartIndex = (currentteamLogPage - 1) * GENERAL_ITEMS_PER_PAGE;
    const currentLogs = logList.slice(
      logStartIndex,
      logStartIndex + GENERAL_ITEMS_PER_PAGE,
    );

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        setSelectedIds(
          new Set(currentLogs.map((l: any) => l.maintenanceLogId || l.id)),
        );
      } else {
        setSelectedIds(new Set());
      }
    };

    const handleSelectRow = (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) newSelected.delete(id);
      else newSelected.add(id);
      setSelectedIds(newSelected);
    };

    const handlePrintSelected = async () => {
      setIsPrinting(true);
      const toastId = toast.loading("กำลังเตรียมหน้าพิมพ์...");
      try {
        const data = await getAllLogsForExport(
          selectedIds.size > 0 ? Array.from(selectedIds) : [],
        );
        setPrintData(data);
        setTimeout(() => {
          window.print();
          toast.success("พร้อมพิมพ์", { id: toastId });
          setIsPrinting(false);
        }, 500);
      } catch {
        toast.error("เกิดข้อผิดพลาด", { id: toastId });
        setIsPrinting(false);
      }
    };

    return (
      <TeamDetailView
        w={w}
        t={t}
        setSelectedteamDetail={setSelectedteamDetail}
        setCurrentteamLogPage={setCurrentteamLogPage}
        globalStatusFilter={globalStatusFilter}
        setMakeFilterValue={setMakeFilterValue}
        globalPriorityFilter={globalPriorityFilter}
        selectedIds={selectedIds}
        handleSelectAll={handleSelectAll}
        handleSelectRow={handleSelectRow}
        handleSort={handleSort}
        sortField={sortField}
        sortDirection={sortDirection}
        setActiveLogModal={setActiveLogModal}
        handlePrintSelected={handlePrintSelected}
        isPrinting={isPrinting}
        printRef={printRef}
        printData={printData}
        currentLogs={currentLogs}
        totalteamLogs={totalteamLogs}
        logTotalPages={logTotalPages}
        logStartIndex={logStartIndex}
        currentteamLogPage={currentteamLogPage}
        GENERAL_ITEMS_PER_PAGE={GENERAL_ITEMS_PER_PAGE}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <TeamsSummary teamSums={teamSums} stats={stats} t={t} />

      <TeamsTable
        processedteams={processedteams}
        t={t}
        handleSort={handleSort}
        sortField={sortField}
        sortDirection={sortDirection}
        setSelectedteamDetail={setSelectedteamDetail}
        setCurrentteamLogPage={setCurrentteamLogPage}
        slaTarget={slaTarget}
      />
    </div>
  );
}
