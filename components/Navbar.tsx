"use client";

import { useState } from "react";

export default function Navbar() {
  // State สำหรับเก็บข้อความที่พิมพ์ในช่องค้นหา
  const [searchQuery, setSearchQuery] = useState("");

  // ฟังก์ชันเมื่อกด Enter หรือกดปุ่มค้นหา
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return; // ถ้าไม่ได้พิมพ์อะไรก็ไม่ต้องทำอะไร
    
    // ตรงนี้สามารถเชื่อม API เพื่อค้นหาข้อมูลรถในอนาคตได้
    alert(`ระบบกำลังค้นหาข้อมูลของทะเบียน: ${searchQuery}`);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm z-10">
      
      {/* โลโก้ / ชื่อโปรเจกต์ ด้านซ้าย */}
      <div className="text-xl font-bold text-gray-800">
        Maintenance-Dashboard
      </div>
      
      {/* ช่องค้นหาเลขทะเบียน ด้านขวา */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="ค้นหาเลขทะเบียนรถ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-72 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          🔍 ค้นหา
        </button>
      </form>

    </header>
  );
}