import React from "react";
import { StatusBadge, PriorityBadge } from "../badges";
import { formatDateTime } from "../formatters";

export default function VehicleDetailView({
  vehicleData,
  setVehicleData,
  setSearchInput,
  setActiveLogModal,
}: {
  vehicle?: import("../../lib/types").VehicleRecord;
  vehicleData?: import("../../lib/types").VehicleRecord | null;
  setVehicleData?: any;
  setSearchInput?: any;
  setActiveLogModal?: any;
  onClose: () => void;
  formatDateTime: (d: string) => any;
}) {
  if (vehicleData === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-3">🔍</div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-slate-200">
          ไม่พบข้อมูลยานพาหนะ
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          ไม่พบเลขทะเบียนในระบบ
        </p>
        <button
          onClick={() => {
            setSearchInput("");
            setVehicleData(undefined);
          }}
          className="mt-4 text-xs bg-gray-100 dark:bg-slate-800/50 text-gray-600 dark:text-slate-400 font-bold px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => {
          setSearchInput("");
          setVehicleData(undefined);
        }}
        className="text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-[#0B603A] flex items-center gap-1 transition-colors w-fit"
      >
        ← กลับหน้าแดชบอร์ดหลัก
      </button>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-3xl shrink-0">
          🚌
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#0B603A]">
            {vehicleData?.vehiclePlate}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mt-1">
            ยี่ห้อ/รุ่น: {vehicleData?.brand || "-"} {vehicleData?.model || "-"}{" "}
            (รหัส ID-{vehicleData?.vehicleId})
          </p>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700/50">
          <p className="text-sm font-bold text-gray-800 dark:text-slate-200">
            📋 ประวัติการแจ้งซ่อม
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {vehicleData?.maintenanceHistory?.map(
            (log: import("../../lib/types").MaintenanceLog, idx: number) => (
              <div
                key={idx}
                onClick={() =>
                  setActiveLogModal({
                    ...log,
                    vehiclePlate: vehicleData?.vehiclePlate,
                  })
                }
                className="p-5 hover:bg-gray-50 dark:bg-slate-900/50 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-[#0B603A] hover:underline">
                    ใบงาน: #{log.maintenanceLogId || log.id || "N/A"}
                  </span>
                  <StatusBadge status={log.status} />
                </div>
                <p className="text-sm text-gray-700 dark:text-slate-300 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed mb-3 break-words whitespace-normal">
                  {log.description}
                </p>
                <div className="flex gap-6 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
                  <div>
                    ช่างซ่อม:{" "}
                    <span className="font-bold text-gray-800 dark:text-slate-200">
                      {log.technicianName || "-"}
                    </span>
                  </div>
                  <div>
                    วันที่แจ้ง:{" "}
                    <span className="font-medium text-gray-800 dark:text-slate-200">
                      {formatDateTime(log.reportedAt || "")}
                    </span>
                  </div>
                  <div>
                    ความเร่งด่วน: <PriorityBadge priority={log.priority} />
                  </div>
                </div>
              </div>
            ),
          )}
          {(!vehicleData?.maintenanceHistory ||
            vehicleData?.maintenanceHistory.length === 0) && (
            <div className="p-8 text-center text-gray-400 dark:text-slate-500 font-medium">
              ไม่พบประวัติการซ่อมบำรุง
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
