import { getStatusBadge, getPriorityBadge } from "./badges";
import { formatDateTime } from "./formatters";

export default function LogDetailModal({ activeLogModal, onClose }: { activeLogModal: any, onClose: () => void }) {
  if (!activeLogModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-200 border border-gray-100">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-black text-gray-900 text-sm sm:text-base flex items-center gap-2">
            <span className="text-xl">📋</span> รายละเอียดใบงาน (Ticket ID: #{activeLogModal.maintenanceLogId || activeLogModal.id})
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-xs border transition-all">✕</button>
        </div>
        <div className="p-5 sm:p-6 space-y-5 text-sm overflow-y-auto max-h-[75vh]">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <span className="text-emerald-800/60 block font-bold text-xs mb-1">หมายเลขทะเบียนรถที่เข้ารับการดูแล</span>
            <p className="font-black text-emerald-950 text-2xl tracking-wide">{activeLogModal.vehiclePlate || activeLogModal.plate || "-"}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="text-gray-500 block font-bold text-[11px] mb-1.5">สถานะใบงาน</span>
              <div>{getStatusBadge(activeLogModal.status)}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="text-gray-500 block font-bold text-[11px] mb-1.5">ความเร่งด่วน</span>
              <div>{getPriorityBadge(activeLogModal.priority)}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400 block font-bold text-[11px] mb-1">ศูนย์บริการ / อู่ที่รับผิดชอบ</span>
              <p className="font-bold text-gray-800 bg-white py-2 px-3 rounded-lg border border-gray-200">{activeLogModal.workshopName || "-"}</p>
            </div>
            <div>
              <span className="text-gray-400 block font-bold text-[11px] mb-1">ช่างผู้ดูแลซ่อมบำรุง</span>
              <p className="font-bold text-blue-700 bg-blue-50 py-2 px-3 rounded-lg border border-blue-100">{activeLogModal.technicianName || "-"}</p>
            </div>
          </div>
          <div>
            <span className="text-gray-400 block font-bold text-[11px] mb-1">รายละเอียดอาการชำรุดเสียหายเชิงลึก</span>
            <p className="text-gray-700 bg-slate-50 border border-slate-200 p-4 rounded-xl leading-relaxed whitespace-pre-wrap break-words font-medium shadow-inner text-sm">
              {activeLogModal.description || "ไม่มีคำอธิบายระบุข้อมูลเพิ่มเติม"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-[11px] sm:text-xs text-gray-500">
            <div>วันที่แจ้งซ่อม: <span className="font-bold text-gray-800 block mt-1">{formatDateTime(activeLogModal.reportedAt)}</span></div>
            <div>กำหนดเสร็จสิ้น: <span className="font-bold text-rose-600 block mt-1">{formatDateTime(activeLogModal.dueDate)}</span></div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button onClick={onClose} className="bg-[#0B603A] hover:bg-[#08482b] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">ปิดหน้าต่าง</button>
        </div>
      </div>
    </div>
  );
}
