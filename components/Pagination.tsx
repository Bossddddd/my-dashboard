import { useLanguage } from '../app/LanguageContext';

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, startIndex, itemsPerPage }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void, totalItems: number, startIndex: number, itemsPerPage: number }) {
  const { t } = useLanguage();

  if (totalPages <= 1) return null;

  const pages = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (currentPage <= 3) endPage = Math.min(5, totalPages);
  if (currentPage >= totalPages - 2) startPage = Math.max(1, totalPages - 4);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg font-bold text-xs sm:text-sm transition-all ${
          currentPage === i
            ? "bg-[#0B603A] text-white shadow-md"
            : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
        }`}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="p-3 sm:p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-gray-600 bg-gray-50/80 font-medium">
      <span className="whitespace-nowrap text-center sm:text-left">
        แสดงผล <span className="font-bold text-gray-800">{startIndex + 1}</span> ถึง <span className="font-bold text-gray-800">{Math.min(startIndex + itemsPerPage, totalItems)}</span> จากทั้งหมด <span className="font-bold text-gray-800">{totalItems}</span> รายการ
      </span>
      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
        <button onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 font-bold shadow-xs transition-colors shrink-0">{t('prevPage')}</button>

        {startPage > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm font-bold">1</button>
            {startPage > 2 && <span className="text-gray-400">...</span>}
          </>
        )}

        {pages}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
            <button onClick={() => onPageChange(totalPages)} className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm font-bold">{totalPages}</button>
          </>
        )}

        <button onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 font-bold shadow-xs transition-colors shrink-0">{t('nextPage')}</button>
      </div>
    </div>
  );
};
