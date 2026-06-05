export const formatDateTime = (dateStr?: string | null): any => {
  if (!dateStr) return <span className="text-gray-400 whitespace-nowrap">-</span>;
  return (
    <span className="whitespace-nowrap text-[11px] sm:text-sm font-medium text-gray-700">
      {new Date(dateStr).toLocaleString('th-TH', {
        day: '2-digit', month: 'short', year: '2-digit'
      })}
    </span>
  );
};
