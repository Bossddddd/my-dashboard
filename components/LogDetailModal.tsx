// @ts-nocheck
import { useState, useEffect } from "react";
import { StatusBadge, PriorityBadge } from "./badges";
import { formatDateTime } from "./formatters";
import { useLanguage } from "../app/LanguageContext";
import dynamic from "next/dynamic";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../lib/constants";
import { BulkPrintView } from "./BulkPrintView";
import {
  updateMaintenanceLog,
  getHistoryByLogId,
  createMaintenanceLog,
} from "../app/actions";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

export default function LogDetailModal({
  activeLogModal,
  onClose,
  onUpdate,
}: {
  activeLogModal: any;
  onClose: () => void;
  onUpdate?: (log: any) => void;
}) {
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  // สมมุติว่าดึงมาจากระบบ Login
  const currentUser = { name: "แอดมินระบบ (Admin)" };
  const editedBy = currentUser.name;
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (activeLogModal) {
      // eslint-disable-next-line
      setFormData({ ...activeLogModal });
      setIsEditing(activeLogModal.isNew === true);

      const logId = activeLogModal.maintenanceLogId || activeLogModal.id;
      if (logId) {
        getHistoryByLogId(logId).then(setHistory);
      }
    }
  }, [activeLogModal]);

  if (!activeLogModal) return null;

  const handleSave = async () => {

    setIsSaving(true);
    const toastId = toast.loading("กำลังตรวจสอบตำแหน่งและบันทึกข้อมูล...");

    let lat: number | null = null;
    let lng: number | null = null;

    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 4000,
            });
          },
        );
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      }
    } catch (err) {
      console.warn("Location error or denied:", err);
    }
    try {
      const isNew = activeLogModal.isNew;

      const dataToSave = {
        vehiclePlate: formData.vehiclePlate || formData.plate,
        status: formData.status,
        priority: formData.priority,
        teamName: formData.teamName,
        technicianName: formData.technicianName,
        description: formData.description,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        specialTools: formData.specialTools || null,
      };

      let res;

      if (isNew) {
        if (!dataToSave.vehiclePlate || !dataToSave.vehiclePlate.trim()) {
          toast.error("กรุณาระบุทะเบียนรถ");
          setIsSaving(false);
          return;
        }
        res = await createMaintenanceLog(dataToSave, editedBy.trim(), lat, lng);
      } else {
        const id = activeLogModal.maintenanceLogId || activeLogModal.id;
        res = await updateMaintenanceLog(
          id,
          dataToSave,
          editedBy.trim(),
          lat,
          lng,
        );
      }

      if (res.success) {
        toast.success(
          isNew ? "สร้างใบงานเรียบร้อย" : "บันทึกการแก้ไขเรียบร้อย",
          { id: toastId },
        );
        setIsEditing(false);
        if (onUpdate) {
          onUpdate(isNew ? null : { ...activeLogModal, ...dataToSave });
        }
        if (isNew) {
          onClose();
        } else {
          const id = activeLogModal.maintenanceLogId || activeLogModal.id;
          const newHistory = await getHistoryByLogId(id);
          setHistory(newHistory);
        }
      } else {
        toast.error(res.error || "บันทึกไม่สำเร็จ", { id: toastId });
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportSingle = () => {
    try {
      const exportData = [
        {
          "รหัสใบงาน (ID)":
            activeLogModal.maintenanceLogId || activeLogModal.id,
          ทะเบียนรถ: activeLogModal.vehiclePlate || activeLogModal.plate || "-",
          สถานะ:
            STATUS_CONFIG[activeLogModal.status]?.text || activeLogModal.status,
          ความเร่งด่วน:
            PRIORITY_CONFIG[activeLogModal.priority]?.text ||
            activeLogModal.priority,
          "ทีมช่าง (Team)":
            activeLogModal.teamName || activeLogModal.workshopName || "-",
          ช่างผู้รับผิดชอบ: activeLogModal.technicianName || "-",
          เครื่องมือพิเศษ: activeLogModal.specialTools || "-",
          "รายละเอียด/อาการ": activeLogModal.description || "-",
          "ค่าใช้จ่าย (บาท)": activeLogModal.cost || 0,
          เวลาแจ้งซ่อม: formatDateTime(activeLogModal.reportedAt || ""),
          เวลาทำงานเสร็จ: formatDateTime(activeLogModal.completedAt || ""),
          "กำหนดเสร็จตาม SLA": formatDateTime(activeLogModal.dueDate || ""),
        },
      ];
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ticket Detail");
      XLSX.writeFile(
        workbook,
        `ticket_${activeLogModal.maintenanceLogId || activeLogModal.id}.xlsx`,
      );
      toast.success("ส่งออก Excel สำเร็จ");
    } catch {
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
            <span className="text-xl">📋</span>{" "}
            {activeLogModal.isNew
              ? "สร้างใบงานแจ้งซ่อมใหม่"
              : `รายละเอียดใบงาน (Ticket ID: #${activeLogModal.maintenanceLogId || activeLogModal.id})`}
          </h3>
          <div className="flex items-center gap-2">
            {!isEditing && !activeLogModal.isNew && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                ✏️ แก้ไข
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-xs border transition-all"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-5 sm:p-6 space-y-5 text-sm overflow-y-auto max-h-[75vh]">
          <div className="bg-emerald-50 dark:bg-emerald-900/30/50 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
            <span className="text-emerald-800 dark:text-emerald-300/60 block font-bold text-xs mb-1">
              {t("vehiclePlateLabel")}
            </span>
            {activeLogModal.isNew && isEditing ? (
              <input
                type="text"
                value={formData.vehiclePlate || formData.plate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, vehiclePlate: e.target.value })
                }
                className="w-full text-xl font-black p-2 border border-emerald-200 rounded text-emerald-950 uppercase"
                placeholder="เช่น กท 1234"
              />
            ) : (
              <p className="font-black text-emerald-950 dark:text-emerald-100 text-2xl tracking-wide">
                {activeLogModal.vehiclePlate || activeLogModal.plate || "-"}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-700/50">
              <span className="text-gray-500 dark:text-slate-400 block font-bold text-[11px] mb-1.5">
                {t("jobStatusLabel")}
              </span>
              {isEditing ? (
                <select
                  value={formData.status || "reported"}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full text-xs font-bold p-1.5 border rounded"
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.text}
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <StatusBadge status={activeLogModal.status} />
                </div>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-700/50">
              <span className="text-gray-500 dark:text-slate-400 block font-bold text-[11px] mb-1.5">
                {t("priorityLabel")}
              </span>
              {isEditing ? (
                <select
                  value={formData.priority || "normal"}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full text-xs font-bold p-1.5 border rounded"
                >
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.text}
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <PriorityBadge priority={activeLogModal.priority} />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400 dark:text-slate-500 block font-bold text-[11px] mb-1">
                {t("teamLabel")}
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.teamName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, teamName: e.target.value })
                  }
                  className="w-full text-xs font-bold p-1.5 border rounded"
                  placeholder="ชื่อทีม / อู่ซ่อม"
                />
              ) : (
                <p className="font-bold text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-800 py-2 px-3 rounded-lg border border-gray-200 dark:border-slate-700">
                  {activeLogModal.teamName ||
                    activeLogModal.workshopName ||
                    "-"}
                </p>
              )}
            </div>
            <div>
              <span className="text-gray-400 dark:text-slate-500 block font-bold text-[11px] mb-1">
                {t("techLabel")}
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.technicianName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, technicianName: e.target.value })
                  }
                  className="w-full text-xs font-bold p-1.5 border rounded"
                  placeholder="ชื่อช่าง"
                />
              ) : (
                <p className="font-bold text-blue-700 bg-blue-50 dark:bg-blue-900/30 py-2 px-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
                  {activeLogModal.technicianName || "-"}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 dark:text-slate-500 block font-bold text-[11px] mb-1">
                  ค่าใช้จ่าย (Cost)
                </span>
                <input
                  type="number"
                  value={formData.cost || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  className="w-full text-xs font-bold p-1.5 border rounded"
                  placeholder="ระบุค่าใช้จ่าย"
                />
              </div>
              <div>
                <span className="text-gray-400 dark:text-slate-500 block font-bold text-[11px] mb-1">
                  เครื่องมือพิเศษ (Special Tools)
                </span>
                <input
                  type="text"
                  value={formData.specialTools || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, specialTools: e.target.value })
                  }
                  className="w-full text-xs font-bold p-1.5 border rounded"
                  placeholder="เช่น เครนยก, เครื่องเชื่อม, ชุดตรวจเช็คพิเศษ"
                />
              </div>
            </div>
          )}

          {!isEditing &&
            (activeLogModal.cost != null || activeLogModal.specialTools) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeLogModal.cost != null && (
                  <div>
                    <span className="text-gray-400 dark:text-slate-500 block font-bold text-[11px] mb-1">
                      ค่าใช้จ่าย
                    </span>
                    <p className="text-sm font-bold text-emerald-600">
                      {activeLogModal.cost} บาท
                    </p>
                  </div>
                )}
                {activeLogModal.specialTools && (
                  <div>
                    <span className="text-amber-500 dark:text-amber-400 block font-bold text-[11px] mb-1 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        ></path>
                      </svg>
                      เครื่องมือพิเศษที่ต้องใช้
                    </span>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 inline-block rounded">
                      {activeLogModal.specialTools}
                    </p>
                  </div>
                )}
              </div>
            )}

          {(activeLogModal.locationLabel ||
            (activeLogModal.latitude && activeLogModal.longitude)) &&
            !isEditing && (
              <div>
                <span className="text-gray-400 dark:text-slate-500 block font-bold text-[11px] mb-1">
                  พิกัด / สถานที่หน้างาน
                </span>
                {activeLogModal.locationLabel && (
                  <p className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-2">
                    {activeLogModal.locationLabel}
                  </p>
                )}
                {activeLogModal.latitude && activeLogModal.longitude && (
                  <div className="mt-2">
                    <p className="text-xs font-mono text-gray-500 dark:text-slate-400 mb-2">
                      Lat: {activeLogModal.latitude}, Long:{" "}
                      {activeLogModal.longitude}
                    </p>
                    <MapComponent
                      lat={activeLogModal.latitude}
                      lng={activeLogModal.longitude}
                      label={activeLogModal.locationLabel}
                    />
                  </div>
                )}
              </div>
            )}

          <div>
            <span className="text-gray-400 dark:text-slate-500 block font-bold text-[11px] mb-1">
              {t("descLabel")}
            </span>
            {isEditing ? (
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full text-xs font-medium p-2 border rounded min-h-[100px]"
                placeholder="รายละเอียดอาการเสีย"
              />
            ) : (
              <p className="text-gray-700 dark:text-slate-300 bg-slate-50 border border-slate-200 p-4 rounded-xl leading-relaxed whitespace-pre-wrap break-words font-medium shadow-inner text-sm">
                {activeLogModal.description ||
                  "ไม่มีคำอธิบายระบุข้อมูลเพิ่มเติม"}
              </p>
            )}
          </div>

          {!activeLogModal.isNew && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-slate-700/50 text-[11px] sm:text-xs text-gray-500 dark:text-slate-400">
              <div>
                {t("reportedAtLabel")}
                <span className="font-bold text-gray-800 dark:text-slate-200 block mt-1">
                  {formatDateTime(activeLogModal.reportedAt || "")}
                </span>
              </div>
              <div>
                {t("dueDateLabel")}
                <span className="font-bold text-rose-600 block mt-1">
                  {formatDateTime(activeLogModal.dueDate || "")}
                </span>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl flex items-center justify-between">
              <div>
                <label className="block text-orange-800 dark:text-orange-300 font-bold text-xs mb-1">
                  👤 ผู้บันทึก/แก้ไขข้อมูล
                </label>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {editedBy} (ข้อมูลจากระบบ Login)
                </div>
              </div>
            </div>
          )}

          {history.length > 0 && !isEditing && (
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700/50">
              <h4 className="font-bold text-gray-800 dark:text-slate-200 text-sm mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                ประวัติการแก้ไข (Audit Log)
              </h4>
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 text-xs shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-blue-700 dark:text-blue-400">
                        👤 {h.editedBy}
                      </span>
                      <span className="text-gray-400 text-[10px]">
                        {formatDateTime(h.editedAt)}
                      </span>
                    </div>
                    <div className="text-gray-600 dark:text-slate-300 mt-2 font-medium text-[11px] sm:text-xs">
                      {(() => {
                        try {
                          const changesObj = JSON.parse(h.changes);
                          const parts = [];
                          if (changesObj.status)
                            parts.push(
                              `สถานะเป็น "${STATUS_CONFIG[changesObj.status]?.text || changesObj.status}"`,
                            );
                          if (changesObj.priority)
                            parts.push(
                              `ความเร่งด่วนเป็น "${PRIORITY_CONFIG[changesObj.priority]?.text || changesObj.priority}"`,
                            );
                          return parts.length > 0
                            ? `✏️ อัปเดต: ${parts.join(", ")}`
                            : "✏️ อัปเดตข้อมูลทั่วไป";
                        } catch {
                          return `✨ ${h.changes || "อัปเดตข้อมูล"}`;
                        }
                      })()}
                    </div>
                    {(h.ipAddress || h.editorLatitude) && (
                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700 flex flex-wrap gap-2 text-[10px]">
                        {h.ipAddress && (
                          <span className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-slate-300">
                            🌐 IP: {h.ipAddress}
                          </span>
                        )}
                        {h.editorLatitude && h.editorLongitude && (
                          <a
                            href={`https://www.google.com/maps?q=${h.editorLatitude},${h.editorLongitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded hover:underline"
                          >
                            📍 เปิดแผนที่ (Lat, Lng)
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t flex justify-between print:hidden">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-xl text-sm font-bold transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2"
              >
                {isSaving ? "⏳ กำลังบันทึก..." : "💾 บันทึกการแก้ไข"}
              </button>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                >
                  🖨️ พิมพ์
                </button>
                <button
                  onClick={handleExportSingle}
                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                >
                  📊 Excel
                </button>
              </div>
              <button
                onClick={onClose}
                className="bg-[#0B603A] hover:bg-[#08482b] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
              >
                {t("closeWindow")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
