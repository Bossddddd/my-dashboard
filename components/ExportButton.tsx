"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { getAllLogsForExport } from "../app/actions";
import { formatDateTime } from "./formatters";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../lib/constants";

export default function ExportButton({ selectedIds = [], fileNamePrefix = "maintenance_export" }: { selectedIds?: number[], fileNamePrefix?: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading("กำลังเตรียมข้อมูลส่งออก...");
    try {
      const data = await getAllLogsForExport(selectedIds);
      if (!data || data.length === 0) {
        toast.error("ไม่มีข้อมูลสำหรับส่งออก", { id: toastId });
        return;
      }

      toast.loading("กำลังสร้างไฟล์ Excel...", { id: toastId });

      // Transform data to fit nicely in Excel
      const exportData = data.map((log: any) => ({
        "รหัสใบงาน (ID)": log.id,
        "ทะเบียนรถ": log.vehicle?.plate || "-",
        "สถานะ": STATUS_CONFIG[log.status]?.text || log.status,
        "ความเร่งด่วน": PRIORITY_CONFIG[log.priority]?.text || log.priority,
        "ทีมช่าง (Team)": log.teamName || "-",
        "ช่างผู้รับผิดชอบ": log.technicianName || "-",
        "รายละเอียด/อาการ": log.description || "-",
        "ค่าใช้จ่าย (บาท)": log.cost || 0,
        "เวลาแจ้งซ่อม": formatDateTime(log.reportedAt),
        "เวลาเริ่มงาน": formatDateTime(log.startedAt),
        "เวลาทำงานเสร็จ": formatDateTime(log.completedAt),
        "กำหนดเสร็จตาม SLA": formatDateTime(log.dueDate)
      }));

      // Create a new workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Maintenance Logs");

      // Generate excel file and trigger download
      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `${fileNamePrefix}_${today}.xlsx`);

      toast.success(`ส่งออกสำเร็จ (${data.length} รายการ)`, { id: toastId });
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("เกิดข้อผิดพลาดในการส่งออกข้อมูล", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors shadow-xs ${
        isExporting ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
      }`}
    >
      {isExporting ? "⏳ กำลังส่งออก..." : "นำออกข้อมูล (Excel)"}
    </button>
  );
}
