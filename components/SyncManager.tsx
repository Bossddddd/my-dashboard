"use client";

import { useEffect, useState } from "react";
import { getOfflineTasks, processSyncQueue } from "../lib/syncQueue";
import toast from "react-hot-toast";

export default function SyncManager() {
  const [isOffline, setIsOffline] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Update status
  const updateStatus = () => {
    setIsOffline(!navigator.onLine);
    const tasks = getOfflineTasks();
    setQueueCount(tasks.length);
  };

  useEffect(() => {
    // Initial check
    setTimeout(() => {
      updateStatus();
    }, 0);

    // Event listeners
    const handleOnline = async () => {
      setIsOffline(false);
      const tasks = getOfflineTasks();
      if (tasks.length > 0) {
        setIsSyncing(true);
        toast.loading(`กำลังส่งข้อมูลที่ค้างอยู่ ${tasks.length} รายการ...`, { id: "sync" });
        const res = await processSyncQueue();
        setIsSyncing(false);
        updateStatus();
        
        if (res.success > 0) {
          toast.success(`อัปเดตข้อมูลเข้าระบบสำเร็จ ${res.success} รายการ`, { id: "sync" });
        }
        if (res.failed > 0) {
          toast.error(`พบข้อมูลส่งไม่ผ่าน ${res.failed} รายการ`, { id: "sync_fail" });
        }
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast("ไม่มีสัญญาณอินเทอร์เน็ต ระบบเปลี่ยนเป็นออฟไลน์", { icon: "🔴" });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("offlineQueueUpdated", updateStatus);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offlineQueueUpdated", updateStatus);
    };
  }, []);

  if (!isOffline && queueCount === 0 && !isSyncing) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-white dark:bg-slate-800 shadow-xl border border-gray-200 dark:border-slate-700 rounded-lg p-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700">
        {isSyncing ? (
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        ) : isOffline ? (
          <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></div>
        ) : (
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
        )}
      </div>
      <div>
        <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200">
          {isSyncing
            ? "กำลังซิงค์ข้อมูล..."
            : isOffline
              ? "ระบบออฟไลน์"
              : "ออนไลน์"}
        </h4>
        {queueCount > 0 && (
          <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
            มีข้อมูลรอส่ง {queueCount} รายการ
          </p>
        )}
      </div>
    </div>
  );
}
