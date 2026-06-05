"use client";

import React, { useState } from "react";
import { useLanguage } from "../app/LanguageContext";

interface SidebarProps {
  activeTab: 'dashboard' | 'workshops' | 'technicians' | 'settings'; // 🚀 เพิ่มสถานะ technicians และ settings
  setActiveTab: (tab: 'dashboard' | 'workshops' | 'technicians' | 'settings') => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(true);
  const { t } = useLanguage();

  return (
    <aside className="w-full h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col shadow-sm">
      {/* เมนู */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        <MenuItem icon="📊" label={t('dashboardOverview')} />
        <MenuItem icon="🏢" label={t('projects')} />
        <MenuItem icon="🚌" label={t('vehicles')} hasArrow />
        <MenuItem icon="📍" label={t('gpsProviders')} />
        <MenuItem icon="🗺️" label={t('routes')} hasArrow />
        <MenuItem icon="🪪" label={t('drivers')} hasArrow />
        
        {/* หมวดหมู่ซ่อมบำรุง */}
        <div className="mt-2">
          <button 
            onClick={() => setIsMaintenanceOpen(!isMaintenanceOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold text-[#0B603A] bg-emerald-50 dark:bg-emerald-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🛠️</span>
              <span>{t('maintenance')}</span>
            </div>
            <svg className={`w-4 h-4 transition-transform ${isMaintenanceOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          
          {isMaintenanceOpen && (
            <div className="mt-1 flex flex-col gap-1 pl-4">
              <div 
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 text-sm font-bold rounded-lg border-l-4 cursor-pointer transition-all ${
                  activeTab === 'dashboard' ? 'text-[#0B603A] bg-emerald-50 dark:bg-emerald-900/30 border-[#0B603A]' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:bg-slate-900 border-transparent'
                }`}
              >
                {t('maintenanceDashboard')}
              </div>
              <div 
                onClick={() => setActiveTab('workshops')}
                className={`px-3 py-2 text-sm font-bold rounded-lg border-l-4 cursor-pointer transition-all ${
                  activeTab === 'workshops' ? 'text-[#0B603A] bg-emerald-50 dark:bg-emerald-900/30 border-[#0B603A]' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:bg-slate-900 border-transparent'
                }`}
              >
                {t('workshops')}
              </div>
              {/* 🚀 เมนูใหม่: ทีมช่างและประสิทธิภาพ */}
              <div 
                onClick={() => setActiveTab('technicians')}
                className={`px-3 py-2 text-sm font-bold rounded-lg border-l-4 cursor-pointer transition-all ${
                  activeTab === 'technicians' ? 'text-[#0B603A] bg-emerald-50 dark:bg-emerald-900/30 border-[#0B603A]' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:bg-slate-900 border-transparent'
                }`}
              >
                {t('technicians')}
              </div>
            </div>
          )}
        </div>

        {/* เมนูตั้งค่า แยกอิสระ */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <MenuItem 
            icon="⚙️" 
            label={t('settings')} 
            isActive={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
        </div>
      </div>
    </aside>
  );
}

function MenuItem({ icon, label, hasArrow, isActive, onClick }: { icon: string, label: string, hasArrow?: boolean, isActive?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
        isActive 
          ? 'text-[#0B603A] bg-emerald-50 dark:bg-emerald-900/30 font-bold' 
          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-900 dark:hover:text-slate-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`text-lg ${isActive ? '' : 'grayscale opacity-70'}`}>{icon}</span>
        <span>{label}</span>
      </div>
      {hasArrow && <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>}
    </div>
  );
}