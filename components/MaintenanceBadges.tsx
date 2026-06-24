export const STATUS_CONFIG: Record<string, { text: string; color: string }> = {
  reported: {
    text: "แจ้งแล้ว",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  assigned: {
    text: "มอบหมายแล้ว",
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
  in_progress: {
    text: "กำลังซ่อม",
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  blocked: {
    text: "ติดปัญหา (รออะไหล่)",
    color: "bg-rose-50 text-rose-600 border-rose-200",
  },
  awaiting_qa: {
    text: "รอตรวจงาน",
    color: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200",
  },
  awaiting_q: {
    text: "รอตรวจงาน",
    color: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200",
  },
  completed: {
    text: "เสร็จสิ้น",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  cancelled: {
    text: "ยกเลิก",
    color: "bg-gray-100 text-gray-800 border-gray-300",
  },
};

export const PRIORITY_CONFIG: Record<string, { text: string; color: string }> =
  {
    low: { text: "ต่ำ", color: "bg-blue-50 text-blue-600 border-blue-200" },
    normal: {
      text: "ปกติ",
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    high: {
      text: "สูง",
      color: "bg-orange-50 text-orange-700 border-orange-200",
    },
    urgent: {
      text: "ด่วนที่สุด",
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
  };

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || {
    text: status || "-",
    color: "bg-gray-100 border-gray-200",
  };

  return (
    <div
      className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border ${config.color} w-fit`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0"></span>
      <span className="whitespace-nowrap">{config.text}</span>
    </div>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority] || {
    text: priority || "-",
    color: "bg-gray-50 border-gray-200",
  };

  return (
    <span
      className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold border ${config.color} whitespace-nowrap`}
    >
      {config.text}
    </span>
  );
}
