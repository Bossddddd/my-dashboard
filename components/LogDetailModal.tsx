// @ts-nocheck
import { StatusBadge, PriorityBadge } from "./badges";
import { formatDateTime } from "./formatters";
import { useLanguage } from "../app/LanguageContext";
import dynamic from 'next/dynamic';
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../lib/constants";
import { BulkPrintView } from "./BulkPrintView";

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

export default function LogDetailModal({ activeLogModal, onClose }: { activeLogModal: import('../lib/types').MaintenanceLog | null, onClose: () => void }) {
  const { t } = useLanguage();
  if (!activeLogModal) return null;

  const handleExportSingle = () => {
    try {
      const exportData = [{
        "รหัสใบงาน (ID)": activeLogModal.maintenanceLogId || activeLogModal.id,
        "ทะเบียนรถ": activeLogModal.vehiclePlate || activeLogModal.plate || "-",
        "สถานะ": STATUS_CONFIG[activeLogModal.status]?.text || activeLogModal.status,
        "ความเร่งด่วน": PRIORITY_CONFIG[activeLogModal.priority]?.text || activeLogModal.priority,
        "ทีมช่าง (Team)": activeLogModal.teamName || activeLogModal.workshopName || "-",
        "ช่างผู้รับผิดชอบ": activeLogModal.technicianName || "-",
        "รายละเอียด/อาการ": activeLogModal.description || "-",
        "ค่าใช้จ่าย (บาท)": activeLogModal.cost || 0,
        "เวลาแจ้งซ่อม": formatDateTime(activeLogModal.reportedAt || ''),
        "เวลาทำงานเสร็จ": formatDateTime(activeLogModal.completedAt || ''),
        "กำหนดเสร็จตาม SLA": formatDateTime(activeLogModal.dueDate || '')
      }];
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ticket Detail");
      XLSX.writeFile(workbook, `ticket_${activeLogModal.maintenanceLogId || activeLogModal.id}.xlsx`);
      toast.success("ส่งออก Excel สำเร็จ");
    } catch (e) {
      toast.error("เกิดข้อผิดพลาดในการส่งออก");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <BulkPrintView data={[activeLogModal]} />
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-700/50">
        <div className="p-4 bg-gray-50 dark:bg-slate-900 border-b flex justify-between items-center">
          <h3 className="font-black text-gray-900 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
            <span className="text-xl">📋</span> รายละเอียดใบงาน (Ticket ID: #{activeLogModal.maintenanceLogId || activeLogModal.id})
          </h3>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-xs border transition-all">✕</button>
        </div>
        <div className="p-5 sm:p-6 space-y-5 text-sm overflow-y-auto max-h-[75vh]">
          <div className="bg-emerald-50 dark:bg-emerald-900/30/50 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
            <span className="text-emerald-800 dark:text-emerald-300/60 block font-bold text-xs mb-1">{t('vehiclePlateLabel')}</span>
            <p className="font-black text-emerald-950 dark:text-emerald-100 text-2xl tracking-wide">{activeLogModal.vehiclePlate || activeLogModal.plate || "-"}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-700/50">
              <span className="text-gray-500 dark:text-slate-400 block font-bold text-[11px] mb-1.5">{t('jobStatusLabel')}</span>
              <div><StatusBadge status={activeLogModal.status} /></div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-700/50">
              <span className="text-gray-500 dark:text-slate-400 block font-bold text-[11px] mb-1.5">{t('priorityLabel')}</span>
              <div><PriorityBadge priority={activeLogModal.priority} /></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400 dark:text-slate-500 block font-bold text-[11px] mb-1">{t('teamLabel')}</span>
              <p className="font-bold text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-800 py-2 px-3 rounded-lg border border-gray-200 dark:border-slate-700">{activeLogModal.teamName || activeLogModal.workshopName || "-"}</p>
            </div>
            <div>
              <span className="text-gray-400 dark:text-slate-500 block font-bold text-[11px] mb-1">{t('techLabel')}</span>
              <p className="font-bold text-blue-700 bg-blue-50 dark:bg-blue-900/30 py-2 px-3 rounded-lg border border-blue-100 dark:border-blue-800/50">{activeLogModal.technicianName || "-"}</p>
            </div>
          </div>
          
          {(activeLogModal.locationLabel || (activeLogModal.latitude && activeLogModal.longitude)) && (
            <div>
              <span className="text-gray-400 dark:text-slate-500 block font-bold text-[11px] mb-1">พิกัด / สถานที่หน้างาน</span>
              {activeLogModal.locationLabel && <p className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-2">{activeLogModal.locationLabel}</p>}
              {activeLogModal.latitude && activeLogModal.longitude && (
                <div className="mt-2">
                  <p className="text-xs font-mono text-gray-500 dark:text-slate-400 mb-2">
                    Lat: {activeLogModal.latitude}, Long: {activeLogModal.longitude}
                  </p>
                  <MapComponent lat={activeLogModal.latitude} lng={activeLogModal.longitude} label={activeLogModal.locationLabel} />
                </div>
              )}
            </div>
          )}
          <div>
            <span className="text-gray-400 dark:text-slate-500 block font-bold text-[11px] mb-1">{t('descLabel')}</span>
            <p className="text-gray-700 dark:text-slate-300 bg-slate-50 border border-slate-200 p-4 rounded-xl leading-relaxed whitespace-pre-wrap break-words font-medium shadow-inner text-sm">
              {activeLogModal.description || "ไม่มีคำอธิบายระบุข้อมูลเพิ่มเติม"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-slate-700/50 text-[11px] sm:text-xs text-gray-500 dark:text-slate-400">
            <div>{t('reportedAtLabel')}<span className="font-bold text-gray-800 dark:text-slate-200 block mt-1">{formatDateTime(activeLogModal.reportedAt || '')}</span></div>
            <div>{t('dueDateLabel')}<span className="font-bold text-rose-600 block mt-1">{formatDateTime(activeLogModal.dueDate || '')}</span></div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t flex justify-between print:hidden">
          <div className="flex gap-2">
            <button onClick={handlePrint} className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2">
              🖨️ พิมพ์
            </button>
            <button onClick={handleExportSingle} className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2">
              📊 Excel
            </button>
          </div>
          <button onClick={onClose} className="bg-[#0B603A] hover:bg-[#08482b] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">{t('closeWindow')}</button>
        </div>
      </div>
    </div>
  );
}
