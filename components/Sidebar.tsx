"use client";

import React, { useState } from "react";

interface SidebarProps {
  activeTab: 'dashboard' | 'workshops';
  setActiveTab: (tab: 'dashboard' | 'workshops') => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(true);

  return (
    <aside className="w-full h-full bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        <MenuItem icon="📊" label="แดชบอร์ดภาพรวม" />
        <MenuItem icon="🏢" label="โครงการ" />
        <MenuItem icon="🚌" label="ยานพาหนะ" hasArrow />
        <MenuItem icon="📍" label="ผู้ให้บริการ GPS" />
        <MenuItem icon="🗺️" label="การเดินรถ" hasArrow />
        <MenuItem icon="🪪" label="คนขับรถ" hasArrow />
        
        <div className="mt-2">
          <button 
            onClick={() => setIsMaintenanceOpen(!isMaintenanceOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold text-[#0B603A] bg-emerald-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🛠️</span>
              <span>ซ่อมบำรุง</span>
            </div>
            <svg className={`w-4 h-4 transition-transform ${isMaintenanceOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          
          {isMaintenanceOpen && (
            <div className="mt-1 flex flex-col gap-1 pl-4">
              <div 
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 text-sm font-bold rounded-lg border-l-4 cursor-pointer transition-all ${
                  activeTab === 'dashboard' ? 'text-[#0B603A] bg-emerald-50 border-[#0B603A]' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-transparent'
                }`}
              >
                Dashboard การซ่อมบำรุง
              </div>
              <div 
                onClick={() => setActiveTab('workshops')}
                className={`px-3 py-2 text-sm font-bold rounded-lg border-l-4 cursor-pointer transition-all ${
                  activeTab === 'workshops' ? 'text-[#0B603A] bg-emerald-50 border-[#0B603A]' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-transparent'
                }`}
              >
                อู่/ศูนย์ซ่อม
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function MenuItem({ icon, label, hasArrow }: { icon: string, label: string, hasArrow?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-lg grayscale opacity-70">{icon}</span>
        <span>{label}</span>
      </div>
      {hasArrow && <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>}
    </div>
  );
}