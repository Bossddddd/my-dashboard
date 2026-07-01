// @ts-nocheck
import { useLanguage } from "../../app/LanguageContext";
import React from "react";
import PurePieChart from "../PurePieChart";
import { StatusBadge, PriorityBadge } from "../badges";
import { formatDateTime } from "../formatters";
import { sortedArray } from "../../lib/utils";
import Pagination from "../Pagination";
import ExportButton from "../ExportButton";
import { BulkPrintView } from "../BulkPrintView";
import toast from "react-hot-toast";
import { getAllLogsForExport } from "../../app/actions";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../../lib/constants";
import { TechnicianDetailView } from "./technicians/TechnicianDetailView";
import { TechniciansSummary } from "./technicians/TechniciansSummary";
import { TechniciansTable } from "./technicians/TechniciansTable";

export default function TechniciansTab({
  selectedTechnicianDetail,
  setSelectedTechnicianDetail,
  currentTechLogPage,
  setCurrentTechLogPage,
  globalStatusFilter,
  globalPriorityFilter,
  setMakeFilterValue,
  sortField,
  sortDirection,
  handleSort,
  handleLogClick,
  GENERAL_ITEMS_PER_PAGE,
  stats,
  techsData,
  selectedWorkshop,
  setSelectedWorkshop,
  currentTechPage,
  setCurrentTechPage,
  slaTarget,
}: {
  selectedTechnicianDetail: import("../../lib/types").TechnicianStat | null;
  setSelectedTechnicianDetail: (
    t: import("../../lib/types").TechnicianStat | null,
  ) => void;
  currentTechLogPage: number;
  setCurrentTechLogPage: (p: number) => void;
  globalStatusFilter: string;
  globalPriorityFilter: string;
  setMakeFilterValue: (k: string, v: string) => void;
  sortField: string;
  sortDirection: "asc" | "desc";
  handleSort: (f: string) => void;
  setActiveLogModal: (log: import("../../lib/types").MaintenanceLog) => void;
  GENERAL_ITEMS_PER_PAGE: number;
  stats: import("../../lib/types").DashboardStatsData;
  techsData: {
    list: import("../../lib/types").TechnicianStat[];
    top: import("../../lib/types").TechnicianStat[];
    bottom: import("../../lib/types").TechnicianStat[];
    total: number;
  };
  selectedWorkshop: string;
  setSelectedWorkshop: (w: string) => void;
  currentTechPage: number;
  setCurrentTechPage: (p: number) => void;
  slaTarget: number;
  handleLogClick: (log: import("../../lib/types").MaintenanceLog) => void;
  StatusBadge: any;
  PriorityBadge: any;
  formatDateTime: (d: string) => string;
}) {
  const { t } = useLanguage();
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [printData, setPrintData] = React.useState<any[]>([]);
  const printRef = React.useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = React.useState(false);
  if (selectedTechnicianDetail) {
    const tech = selectedTechnicianDetail;

    let logList = tech.logs || [];
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

    const totalTechLogs = logList.length;
    const logTotalPages = Math.max(
      1,
      Math.ceil(totalTechLogs / GENERAL_ITEMS_PER_PAGE),
    );
    const logStartIndex = (currentTechLogPage - 1) * GENERAL_ITEMS_PER_PAGE;
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
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล", { id: toastId });
        setIsPrinting(false);
      }
    };

    return (
      <TechnicianDetailView
        tech={tech}
        t={t}
        setSelectedTechnicianDetail={setSelectedTechnicianDetail}
        setCurrentTechLogPage={setCurrentTechLogPage}
        globalStatusFilter={globalStatusFilter}
        setMakeFilterValue={setMakeFilterValue}
        globalPriorityFilter={globalPriorityFilter}
        selectedIds={selectedIds}
        handleSelectAll={handleSelectAll}
        handleSelectRow={handleSelectRow}
        handleSort={handleSort}
        sortField={sortField}
        sortDirection={sortDirection}
        handleLogClick={handleLogClick}
        handlePrintSelected={handlePrintSelected}
        isPrinting={isPrinting}
        printRef={printRef}
        printData={printData}
        currentLogs={currentLogs}
        totalTechLogs={totalTechLogs}
        logTotalPages={logTotalPages}
        logStartIndex={logStartIndex}
        currentTechLogPage={currentTechLogPage}
        GENERAL_ITEMS_PER_PAGE={GENERAL_ITEMS_PER_PAGE}
      />
    );
  }

  const startIndex = (currentTechPage - 1) * GENERAL_ITEMS_PER_PAGE;
  const currentTechsList = techsData.list.slice(
    startIndex,
    startIndex + GENERAL_ITEMS_PER_PAGE,
  );
  const totalTechPages = Math.max(
    1,
    Math.ceil(techsData.total / GENERAL_ITEMS_PER_PAGE),
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <TechniciansSummary
        techsData={techsData}
        stats={stats}
        selectedWorkshop={selectedWorkshop}
        setSelectedWorkshop={setSelectedWorkshop}
        setCurrentTechPage={setCurrentTechPage}
        t={t}
        setSelectedTechnicianDetail={setSelectedTechnicianDetail}
      />

      <TechniciansTable
        currentTechsList={currentTechsList}
        t={t}
        handleSort={handleSort}
        sortField={sortField}
        sortDirection={sortDirection}
        setSelectedTechnicianDetail={setSelectedTechnicianDetail}
        setCurrentTechLogPage={setCurrentTechLogPage}
        startIndex={startIndex}
        slaTarget={slaTarget}
        currentTechPage={currentTechPage}
        totalTechPages={totalTechPages}
        setCurrentTechPage={setCurrentTechPage}
        techsData={techsData}
        GENERAL_ITEMS_PER_PAGE={GENERAL_ITEMS_PER_PAGE}
      />
    </div>
  );
}