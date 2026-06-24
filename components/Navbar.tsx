"use client";

import { useState } from "react";
import Link from "next/link";
import ImportButton from "./ImportButton";

interface NavbarProps {
  onSearch: (plate: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // เรียกใช้ฟังก์ชันค้นหาที่ส่งมาจาก page.tsx
    onSearch(searchQuery.trim());
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm z-10">
      {/* โลโก้ / ชื่อโปรเจกต์ (ปรับเป็นลิงก์เพื่อให้กดกลับหน้า Home ได้) */}
      <Link
        href="/"
        className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-2"
        title="กลับหน้าหลัก"
      >
        Maintenance-Dashboard
        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
          DEV VERSION
        </span>
      </Link>

      {/* พื้นที่ด้านขวา: ช่องค้นหา + ปุ่มนำเข้าไฟล์ */}
      <div className="flex items-center gap-4">
        {/* ฟอร์มค้นหา */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="ค้นหาเลขทะเบียน เช่น กท-1234"
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

        {/* เส้นคั่นบางๆ */}
        <div className="h-8 w-px bg-gray-200"></div>

        {/* ปุ่มนำเข้า Excel/CSV */}
        <ImportButton />
      </div>
    </header>
  );
}
