// @ts-nocheck
"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";
import { searchVehicleByPlate, getDashboardStats, searchDashboardData } from "./actions";
import { VehicleRecord, DashboardSearchResults } from "../lib/types";
import { sortedArray } from "../lib/utils";

import LogDetailModal from "../components/LogDetailModal";
import DashboardTab from "../components/views/DashboardTab";
import WorkshopsTab from "../components/views/WorkshopsTab";
import TechniciansTab from "../components/views/TechniciansTab";
import VehicleDetailView from "../components/views/VehicleDetailView";
import SettingsTab from "../components/views/SettingsTab";
import DashboardSearchResultsView from "../components/DashboardSearchResults";
import { StatusBadge, PriorityBadge } from "../components/badges";
import { formatDateTime } from "../components/formatters";
import { LanguageProvider } from "./LanguageContext";
import { getTranslation } from "@/lib/i18n";

export default function Home() {
  const [vehicleData, setVehicleData] = useState<VehicleRecord | null | undefined>(undefined);
  const [stats, setStats] = useState<any>(null);
  const [searchInput, setSearchInput] = useState("");
  const [dashboardSearchResults, setDashboardSearchResults] = useState<DashboardSearchResults | null | undefined>(undefined);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workshops' | 'technicians' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Close sidebar by default on mobile screens
  useEffect(() => {
    if (window.innerWidth < 640) {
      setIsSidebarOpen(false);
    }
  }, []);
  
  const [selectedWorkshopDetail, setSelectedWorkshopDetail] = useState<any | null>(null);
  const [selectedTechnicianDetail, setSelectedTechnicianDetail] = useState<any | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState("all");
  
  const [activeLogModal, setActiveLogModal] = useState<any | null>(null);

  const [globalStatusFilter, setGlobalStatusFilter] = useState("all");
  const [globalPriorityFilter, setGlobalPriorityFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const DASHBOARD_ITEMS_PER_PAGE = 50;  
  const GENERAL_ITEMS_PER_PAGE = 100;   

  const [currentPage, setCurrentPage] = useState(1);
  const [currentTechPage, setCurrentTechPage] = useState(1);
  const [currentWorkshopLogPage, setCurrentWorkshopLogPage] = useState(1);
  const [currentTechLogPage, setCurrentTechLogPage] = useState(1);

  // Global Settings State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('th');
  const [dateRange, setDateRange] = useState('30d');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [slaTarget, setSlaTarget] = useState('80');

  // Load from LocalStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('isDarkMode') === 'true';
    const savedLang = localStorage.getItem('language') || 'th';
    const savedDateRange = localStorage.getItem('dateRange') || '30d';
    const savedCustomStart = localStorage.getItem('customDateStart') || '';
    const savedCustomEnd = localStorage.getItem('customDateEnd') || '';
    const savedSla = localStorage.getItem('slaTarget') || '80';

    setIsDarkMode(savedDarkMode);
    setLanguage(savedLang);
    setDateRange(savedDateRange);
    setCustomDateStart(savedCustomStart);
    setCustomDateEnd(savedCustomEnd);
    setSlaTarget(savedSla);
  }, []);

  // Save to LocalStorage and apply dark mode
  useEffect(() => {
    localStorage.setItem('isDarkMode', String(isDarkMode));
    localStorage.setItem('language', language);
    localStorage.setItem('dateRange', dateRange);
    localStorage.setItem('customDateStart', customDateStart);
    localStorage.setItem('customDateEnd', customDateEnd);
    localStorage.setItem('slaTarget', slaTarget);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, language, dateRange, customDateStart, customDateEnd, slaTarget]);

  const loadStats = async () => {
    const data = await getDashboardStats({ dateRange, customStart: customDateStart, customEnd: customDateEnd });
    if (data) setStats(data);
  };

  useEffect(() => {
    if (dateRange !== 'custom' || (customDateStart && customDateEnd)) {
      loadStats();
    }
  }, [dateRange, customDateStart, customDateEnd]);

  useEffect(() => {
    setGlobalStatusFilter("all");
    setGlobalPriorityFilter("all");
    setSortField("");
  }, [activeTab]);

  const resetSearchView = () => {
    setSearchInput("");
    setVehicleData(undefined);
    setDashboardSearchResults(undefined);
  };

  const handleTabChange = (tab: 'dashboard' | 'workshops' | 'technicians' | 'settings') => {
    setActiveTab(tab);
    setVehicleData(undefined);
    setDashboardSearchResults(undefined);
    setSelectedWorkshopDetail(null);
    setSelectedTechnicianDetail(null);
    if (window.innerWidth < 640) {
      setIsSidebarOpen(false);
    }
  };

  const openWorkshopDetail = (workshop: any) => {
    setVehicleData(undefined);
    setDashboardSearchResults(undefined);
    setSelectedTechnicianDetail(null);
    setSelectedWorkshopDetail(workshop);
    setCurrentWorkshopLogPage(1);
    setActiveTab('workshops');
    if (window.innerWidth < 640) setIsSidebarOpen(false);
  };

  const openTechnicianDetail = (technician: any) => {
    setVehicleData(undefined);
    setDashboardSearchResults(undefined);
    setSelectedWorkshopDetail(null);
    setSelectedTechnicianDetail(technician);
    setCurrentTechLogPage(1);
    setActiveTab('technicians');
    if (window.innerWidth < 640) setIsSidebarOpen(false);
  };

  const executeSearch = async () => {
    const query = searchInput.trim();
    if (!query) {
      setVehicleData(undefined);
      setDashboardSearchResults(undefined);
      return;
    }

    const searchToast = toast.loading(`กำลังค้นหา ${query}...`);
    setVehicleData(undefined); 
    setDashboardSearchResults(undefined);

    try {
      const exactVehicle = await searchVehicleByPlate(query);
      if (exactVehicle) {
        toast.success(`พบประวัติรถ ${exactVehicle.plate}`, { id: searchToast });
        setVehicleData({
          vehicleId: exactVehicle.id,
          vehiclePlate: exactVehicle.plate,
          brand: exactVehicle.brand || undefined,
          model: exactVehicle.model || undefined,
          maintenanceHistory: exactVehicle.logs
        });
        return; 
      }

      const searchResults = await searchDashboardData(query);

      if (searchResults && searchResults.total > 0) {
        toast.success(`พบผลลัพธ์ ${searchResults.total} รายการ`, { id: searchToast });
        setDashboardSearchResults(searchResults);
      } else {
        toast.error(`ไม่พบข้อมูล "${query}"`, { id: searchToast });
        setDashboardSearchResults(null);
      }
    } catch (error) {
      console.error("Search Failed:", error);
      toast.error("เกิดข้อผิดพลาดในการค้นหา", { id: searchToast });
      setDashboardSearchResults(null);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const setMakeFilterValue = (type: 'status' | 'priority', value: string) => {
    if (type === 'status') setGlobalStatusFilter(value);
    if (type === 'priority') setGlobalPriorityFilter(value);
    setCurrentPage(1);
    setCurrentWorkshopLogPage(1);
    setCurrentTechLogPage(1);
  };

  const processedWorkshops = useMemo(() => {
    if (!stats?.workshopsData) return [];
    return sortedArray(stats.workshopsData, sortField, sortDirection);
  }, [stats, sortField, sortDirection]);

  const techsData = useMemo(() => {
    if (!stats?.workshopsData) return { list: [], top: [], bottom: [], total: 0 };

    let allTechsArray: any[] = [];
    if (selectedWorkshop === "all") {
      const allTechsMap = new Map();
      stats.workshopsData.forEach((w: any) => {
        w.technicians?.forEach((t: any) => {
          if (!allTechsMap.has(t.name)) {
            allTechsMap.set(t.name, { ...t, logs: t.logs ? [...t.logs] : [] });
          } else {
            const existing = allTechsMap.get(t.name);
            existing.totalJobs += t.totalJobs;
            existing.successCount += t.successCount;
            existing.inProgressCount += t.inProgressCount;
            existing.lateCount += t.lateCount;
            const tClosed = existing.successCount + existing.lateCount;
            existing.efficiencyRate = tClosed > 0 ? Math.round((existing.successCount / tClosed) * 1000) / 10 : 0;
            existing.logs = [...(existing.logs || []), ...(t.logs || [])];
          }
        });
      });
      allTechsArray = Array.from(allTechsMap.values());
    } else {
      const wData = stats.workshopsData.find((w: any) => w.name === selectedWorkshop);
      allTechsArray = wData?.technicians || [];
    }

    const sortedByEff = [...allTechsArray].sort((a, b) => b.efficiencyRate - a.efficiencyRate || b.successCount - a.successCount);
    const sortedByWorst = [...allTechsArray].sort((a, b) => a.efficiencyRate - b.efficiencyRate || a.lateCount - b.lateCount);

    let finalTechList = allTechsArray;
    if (sortField) {
      finalTechList = sortedArray(finalTechList, sortField, sortDirection);
    }

    return { list: finalTechList, top: sortedByEff.slice(0, 3), bottom: sortedByWorst.slice(0, 3), total: allTechsArray.length };
  }, [stats, selectedWorkshop, sortField, sortDirection]);

  const workshopSums = useMemo(() => {
    if (!stats?.workshopsData) return { sumSuccess: 0, sumInProgress: 0, sumLate: 0, totalWorkshops: 0 };
    return {
      totalWorkshops: stats.workshopsData.length,
      sumSuccess: stats.workshopsData.reduce((acc: number, cur: any) => acc + cur.successCount, 0),
      sumInProgress: stats.workshopsData.reduce((acc: number, cur: any) => acc + cur.inProgressCount, 0),
      sumLate: stats.workshopsData.reduce((acc: number, cur: any) => acc + cur.lateCount, 0),
    };
  }, [stats]);


  const renderContent = () => {
    if (!stats) return <div className="text-center p-10 text-gray-500 dark:text-slate-400 font-medium flex items-center justify-center gap-2"><span className="animate-spin text-xl">⏳</span> กำลังโหลดข้อมูล...</div>;

    if (dashboardSearchResults !== undefined) {
      return (
        <DashboardSearchResultsView
          results={dashboardSearchResults}
          searchInput={searchInput}
          itemsLimit={DASHBOARD_ITEMS_PER_PAGE}
          onReset={resetSearchView}
          onOpenWorkshop={openWorkshopDetail}
          onOpenTechnician={openTechnicianDetail}
          onOpenLog={setActiveLogModal}
          renderPriorityBadge={(p: string) => <PriorityBadge priority={p} />}
          renderStatusBadge={(s: string) => <StatusBadge status={s} />}
          renderDateTime={formatDateTime}
        />
      );
    }

    if (vehicleData !== undefined) {
      return (
        <VehicleDetailView 
          vehicleData={vehicleData} 
          setVehicleData={setVehicleData}
          setSearchInput={setSearchInput}
          setActiveLogModal={setActiveLogModal}
        />
      );
    }

    if (activeTab === 'dashboard') {
      return (
        <DashboardTab
          stats={stats}
          globalStatusFilter={globalStatusFilter}
          setGlobalStatusFilter={setGlobalStatusFilter}
          globalPriorityFilter={globalPriorityFilter}
          setGlobalPriorityFilter={setGlobalPriorityFilter}
          DASHBOARD_ITEMS_PER_PAGE={DASHBOARD_ITEMS_PER_PAGE}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogClick={setActiveLogModal}
          StatusBadge={StatusBadge}
          PriorityBadge={PriorityBadge}
          formatDateTime={formatDateTime}
          slaTarget={parseInt(slaTarget)}
        />
      );
    }

    if (activeTab === 'workshops') {
      return (
        <WorkshopsTab 
          selectedWorkshopDetail={selectedWorkshopDetail}
          setSelectedWorkshopDetail={setSelectedWorkshopDetail}
          currentWorkshopLogPage={currentWorkshopLogPage}
          setCurrentWorkshopLogPage={setCurrentWorkshopLogPage}
          globalStatusFilter={globalStatusFilter}
          globalPriorityFilter={globalPriorityFilter}
          setMakeFilterValue={setMakeFilterValue}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          setActiveLogModal={setActiveLogModal}
          GENERAL_ITEMS_PER_PAGE={GENERAL_ITEMS_PER_PAGE}
          stats={stats}
          workshopSums={workshopSums}
          processedWorkshops={processedWorkshops}
          slaTarget={parseInt(slaTarget)}
        />
      );
    }

    if (activeTab === 'technicians') {
      return (
        <TechniciansTab
          stats={stats}
          techsData={techsData}
          selectedWorkshop={selectedWorkshop}
          setSelectedWorkshop={setSelectedWorkshop}
          selectedTechnicianDetail={selectedTechnicianDetail}
          setSelectedTechnicianDetail={setSelectedTechnicianDetail}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          handleLogClick={setActiveLogModal}
          StatusBadge={StatusBadge}
          PriorityBadge={PriorityBadge}
          formatDateTime={formatDateTime}
          GENERAL_ITEMS_PER_PAGE={GENERAL_ITEMS_PER_PAGE}
          currentTechLogPage={currentTechLogPage}
          setCurrentTechLogPage={setCurrentTechLogPage}
          currentTechPage={currentTechPage}
          setCurrentTechPage={setCurrentTechPage}
          slaTarget={parseInt(slaTarget)}
        />
      );
    }

    if (activeTab === 'settings') {
      return (
        <SettingsTab 
          isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
          language={language} setLanguage={setLanguage}
          dateRange={dateRange} setDateRange={setDateRange}
          customDateStart={customDateStart} setCustomDateStart={setCustomDateStart}
          customDateEnd={customDateEnd} setCustomDateEnd={setCustomDateEnd}
          slaTarget={slaTarget} setSlaTarget={setSlaTarget}
          
          loadStats={loadStats}
        />
      );
    }
  };

  return (
    <LanguageProvider language={language} setLanguage={setLanguage}>
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900 font-sans overflow-hidden">
          <header className="h-14 sm:h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-3 sm:px-6 flex-shrink-0 z-20 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200 p-1.5 rounded-lg hover:bg-gray-100 dark:bg-slate-800/50">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div className="flex items-center gap-1 sm:gap-2 mr-1 sm:mr-2">
                <div className="bg-[#0B603A] text-white font-black italic rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-sm tracking-widest border border-green-200 shadow-xs shrink-0">EVT</div>
                <span className="font-black text-gray-800 dark:text-slate-200 text-[11px] sm:text-sm hidden sm:block tracking-wide whitespace-nowrap">{getTranslation(language, 'evtAdminPanel')}</span>
              </div>
              <div className="h-5 sm:h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>
              <h1 className="text-xs sm:text-base font-black text-[#0B603A] truncate max-w-[150px] sm:max-w-none">
                {vehicleData !== undefined ? getTranslation(language, 'historyLog') : selectedWorkshopDetail ? `${getTranslation(language, 'workshopTitle')} ${selectedWorkshopDetail.name}` : selectedTechnicianDetail ? `${getTranslation(language, 'technicianTitle')} ${selectedTechnicianDetail.name}` : activeTab === 'dashboard' ? getTranslation(language, 'maintenanceDashboard') : activeTab === 'workshops' ? getTranslation(language, 'workshops') : activeTab === 'technicians' ? getTranslation(language, 'technicians') : getTranslation(language, 'settings')}
              </h1>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden relative">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
              <div 
                className="absolute inset-0 bg-black/50 z-20 sm:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            <div className={`absolute sm:relative flex-shrink-0 h-full transition-all duration-300 ease-in-out bg-white dark:bg-slate-800 z-30 sm:z-10 shadow-2xl sm:shadow-none ${isSidebarOpen ? "w-64 opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-full"}`}>
              <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
            </div>
            <main className="flex-1 overflow-y-auto p-3 sm:p-6 w-full relative z-10">
              <div className="mx-auto max-w-[1400px]">
                {renderContent()}
              </div>
            </main>
          </div>

          <LogDetailModal activeLogModal={activeLogModal} onClose={() => setActiveLogModal(null)} />
        </div>
      </LanguageProvider>
  );
}