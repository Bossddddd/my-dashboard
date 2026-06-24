import { createMaintenanceLog, updateMaintenanceLog } from "../app/actions";

const SYNC_QUEUE_KEY = "offline_sync_queue";

export type OfflineTask = {
  id: string; // Unique ID for the task
  type: "CREATE" | "UPDATE";
  dataToSave: any;
  editedBy: string;
  lat: number | null;
  lng: number | null;
  timestamp: number;
  // Only for UPDATE
  logId?: number;
};

export const getOfflineTasks = (): OfflineTask[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addOfflineTask = (task: Omit<OfflineTask, "id" | "timestamp">) => {
  const tasks = getOfflineTasks();
  const newTask: OfflineTask = {
    ...task,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
  };
  tasks.push(newTask);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(tasks));
  // Dispatch a custom event to notify components that the queue has changed
  window.dispatchEvent(new Event("offlineQueueUpdated"));
};

export const removeOfflineTask = (id: string) => {
  const tasks = getOfflineTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event("offlineQueueUpdated"));
};

export const processSyncQueue = async (): Promise<{
  success: number;
  failed: number;
}> => {
  const tasks = getOfflineTasks();
  if (tasks.length === 0) return { success: 0, failed: 0 };

  let successCount = 0;
  let failCount = 0;

  for (const task of tasks) {
    try {
      let res;
      if (task.type === "CREATE") {
        res = await createMaintenanceLog(
          task.dataToSave,
          task.editedBy,
          task.lat,
          task.lng,
        );
      } else if (task.type === "UPDATE" && task.logId) {
        res = await updateMaintenanceLog(
          task.logId,
          task.dataToSave,
          task.editedBy,
          task.lat,
          task.lng,
        );
      }

      if (res && res.success) {
        // Successfully synced, remove from queue
        removeOfflineTask(task.id);
        successCount++;
      } else {
        // Keep it in the queue if server rejected or error
        failCount++;
      }
    } catch (e) {
      failCount++;
      console.error("Sync error for task", task, e);
    }
  }

  return { success: successCount, failed: failCount };
};
