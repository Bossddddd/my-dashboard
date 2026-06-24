interface DashboardSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export default function DashboardSearchBar({
  value,
  onChange,
  onSearch,
}: DashboardSearchBarProps) {
  return (
    <div className="flex w-full sm:max-w-md relative">
      <svg
        className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        ></path>
      </svg>
      <input
        type="text"
        placeholder="ค้นหาทะเบียนรถ, ช่าง, ทีมช่าง, ใบแจ้งซ่อม"
        className="w-full pl-10 pr-24 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-600 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B603A]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
      />
      <button
        onClick={onSearch}
        className="absolute right-1.5 top-1.5 bg-[#0B603A] hover:bg-[#08482b] text-white px-4 py-1 rounded-md text-xs font-bold transition-colors"
      >
        ค้นหา
      </button>
    </div>
  );
}
