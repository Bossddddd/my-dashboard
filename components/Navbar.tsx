"use client";

import { useState } from "react";

// 1. กำหนด Type ของ Props ที่จะรับเข้ามา
interface NavbarProps {
  onSearch: (plate: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // 2. เรียกใช้ฟังก์ชันที่ส่งมาจากตัวแม่ (page.tsx)
    onSearch(searchQuery.trim());
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm z-10">
      <div className="text-xl font-bold text-gray-800">
        Maintenance-Dashboard
      </div>
      
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
    </header>
  );
}