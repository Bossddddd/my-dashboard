import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-2 shrink-0 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2 px-4">
        Menu
      </div>
      
      <Link href="/" className="px-4 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-medium transition-colors">
        📊 หน้าหลัก (Dashboard)
      </Link>
      <Link href="/tasks" className="px-4 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-medium transition-colors">
        🔧 งานซ่อมบำรุง
      </Link>
      <Link href="/settings" className="px-4 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-medium transition-colors">
        ⚙️ ตั้งค่าระบบ
      </Link>
    </aside>
  );
}