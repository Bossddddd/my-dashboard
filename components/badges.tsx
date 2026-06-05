import { STATUS_CONFIG, PRIORITY_CONFIG } from "../lib/constants";
import { useLanguage } from "../app/LanguageContext";
import { TranslationKey } from "../lib/i18n";

export const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useLanguage();
  const config = STATUS_CONFIG[status] || { color: "bg-gray-100 border-gray-200" };
  const key = `status_${status}` as TranslationKey;
  
  // To avoid errors if key doesn't exist, fallback to status
  const text = t(key) === key ? status : t(key);

  return (
    <div className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border ${config.color} w-fit`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0"></span>
      <span className="whitespace-nowrap">{text}</span>
    </div>
  );
};

export const PriorityBadge = ({ priority }: { priority: string }) => {
  const { t } = useLanguage();
  const config = PRIORITY_CONFIG[priority] || { color: "bg-gray-50 border-gray-200" };
  const key = `priority_${priority}` as TranslationKey;
  
  const text = t(key) === key ? priority : t(key);

  return <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold border ${config.color} whitespace-nowrap`}>{text}</span>;
};
