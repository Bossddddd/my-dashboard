import { STATUS_CONFIG, PRIORITY_CONFIG } from "../lib/constants";

export const getStatusBadge = (status: string) => {
  const config = STATUS_CONFIG[status] || { text: status || "-", color: "bg-gray-100 border-gray-200" };
  return (
    <div className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border ${config.color} w-fit`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0"></span>
      <span className="whitespace-nowrap">{config.text}</span>
    </div>
  );
};

export const getPriorityBadge = (priority: string) => {
  const config = PRIORITY_CONFIG[priority] || { text: priority || "-", color: "bg-gray-50 border-gray-200" };
  return <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold border ${config.color} whitespace-nowrap`}>{config.text}</span>;
};
