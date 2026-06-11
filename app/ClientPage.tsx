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
import TeamsTab from "../components/views/TeamsTab";
import TechniciansTab from "../components/views/TechniciansTab";
import MapTab from "../components/views/MapTab";
import VehicleDetailView from '@/components/views/VehicleDetailView';
import ImportButton from '@/components/ImportButton';
import SettingsTab from "../components/views/SettingsTab";
import DashboardSearchResultsView from "../components/DashboardSearchResults";
import { StatusBadge, PriorityBadge } from "../components/badges";
import { formatDateTime } from "../components/formatters";
import { LanguageProvider } from "./LanguageContext";
import { getTranslation } from "@/lib/i18n";

export default function Home({ initialStats, initialDateRange, initialCustomStart, initialCustomEnd }: any) {
  const [vehicleData, setVehicleData] = useState<VehicleRecord | null | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [dashboardSearchResults, setDashboardSearchResults] = useState<DashboardSearchResults | null | undefined>(undefined);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'teams' | 'technicians' | 'map' | 'settings'>('dashboard');
  
  const processedStats = useMemo(() => {
    if (!initialStats) return initialStats;
    const s = { ...initialStats };
    if (s.allLogs) {
      const now = new Date();
      s.overdueTasks = s.allLogs.filter((log: any) => 
        log.status !== 'completed' && log.status !== 'cancelled' && log.dueDate && new Date(log.dueDate) < now
      );
      s.mapLogs = s.allLogs.filter((log: any) => log.latitude != null && log.longitude != null);
    }
    return s;
  }, [initialStats]);

  const [stats, setStats] = useState(processedStats);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Close sidebar by default on mobile screens
  useEffect(() => {
    if (window.innerWidth < 640) {
      setIsSidebarOpen(false);
    }
  }, []);
  
  const [selectedteamDetail, setSelectedteamDetail] = useState<any | null>(null);
  const [selectedTechnicianDetail, setSelectedTechnicianDetail] = useState<any | null>(null);
  const [selectedteam, setSelectedteam] = useState("all");
  
  const [activeLogModal, setActiveLogModal] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [globalStatusFilter, setGlobalStatusFilter] = useState("all");
  const [globalPriorityFilter, setGlobalPriorityFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const DASHBOARD_ITEMS_PER_PAGE = 50;  
  const GENERAL_ITEMS_PER_PAGE = 100;   

  const [currentPage, setCurrentPage] = useState(1);
  const [currentTechPage, setCurrentTechPage] = useState(1);
  const [currentteamLogPage, setCurrentteamLogPage] = useState(1);
  const [currentTechLogPage, setCurrentTechLogPage] = useState(1);

  // Global Settings State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('th');
  const [dateRange, setDateRange] = useState(initialDateRange || '30d');
  const [customDateStart, setCustomDateStart] = useState(initialCustomStart || '');
  const [customDateEnd, setCustomDateEnd] = useState(initialCustomEnd || '');
  const [slaTarget, setSlaTarget] = useState('80');

  // Load from LocalStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('isDarkMode') === 'true';
    const savedLang = localStorage.getItem('language') || 'th';
    const savedSla = localStorage.getItem('slaTarget') || '80';

    setIsDarkMode(savedDarkMode);
    setLanguage(savedLang);
    setSlaTarget(savedSla);
  }, []);

  // Save to LocalStorage, Cookies, and apply dark mode
  useEffect(() => {
    localStorage.setItem('isDarkMode', String(isDarkMode));
    localStorage.setItem('language', language);
    localStorage.setItem('slaTarget', slaTarget);
    
    // Save date preferences to Cookies for SSR and LocalStorage for client
    document.cookie = `dateRange=${dateRange}; path=/; max-age=31536000`;
    document.cookie = `customDateStart=${customDateStart}; path=/; max-age=31536000`;
    document.cookie = `customDateEnd=${customDateEnd}; path=/; max-age=31536000`;
    localStorage.setItem('dateRange', dateRange);
    localStorage.setItem('customDateStart', customDateStart);
    localStorage.setItem('customDateEnd', customDateEnd);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, language, dateRange, customDateStart, customDateEnd, slaTarget]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardStats({ dateRange, customStart: customDateStart, customEnd: customDateEnd });
      
      if (data && data.allLogs) {
        const now = new Date();
        data.overdueTasks = data.allLogs.filter((log: any) => 
          log.status !== 'completed' && log.status !== 'cancelled' && log.dueDate && new Date(log.dueDate) < now
        );
        data.mapLogs = data.allLogs.filter((log: any) => log.latitude != null && log.longitude != null);
      }
      
      setStats(data);
      setDashboardSearchResults(undefined);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if date range is different from initial or we need fresh data
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

  const handleTabChange = (tab: 'dashboard' | 'teams' | 'technicians' | 'settings') => {
    setActiveTab(tab);
    setVehicleData(undefined);
    setDashboardSearchResults(undefined);
    setSelectedteamDetail(null);
    setSelectedTechnicianDetail(null);
    if (window.innerWidth < 640) {
      setIsSidebarOpen(false);
    }
  };

  const openteamDetail = (team: any) => {
    setVehicleData(undefined);
    setDashboardSearchResults(undefined);
    setSelectedTechnicianDetail(null);
    setSelectedteamDetail(team);
    setCurrentteamLogPage(1);
    setActiveTab('teams');
    if (window.innerWidth < 640) setIsSidebarOpen(false);
  };

  const openTechnicianDetail = (technician: any) => {
    setVehicleData(undefined);
    setDashboardSearchResults(undefined);
    setSelectedteamDetail(null);
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
    setCurrentteamLogPage(1);
    setCurrentTechLogPage(1);
  };

  const processedteams = useMemo(() => {
    if (!stats?.teamsData) return [];
    return sortedArray(stats.teamsData, sortField, sortDirection);
  }, [stats, sortField, sortDirection]);

  const techsData = useMemo(() => {
    if (!stats?.teamsData) return { list: [], top: [], bottom: [], total: 0 };

    let allTechsArray: any[] = [];
    if (selectedteam === "all") {
      const allTechsMap = new Map();
      stats.teamsData.forEach((w: any) => {
        w.technicians?.forEach((t: any) => {
          const tLogs = w.logs ? w.logs.filter((l: any) => l.technicianName === t.name) : [];
          if (!allTechsMap.has(t.name)) {
            allTechsMap.set(t.name, { ...t, logs: [...tLogs] });
          } else {
            const existing = allTechsMap.get(t.name);
            existing.totalJobs += t.totalJobs;
            existing.successCount += t.successCount;
            existing.inProgressCount += t.inProgressCount;
            existing.lateCount += t.lateCount;
            const tClosed = existing.successCount + existing.lateCount;
            existing.efficiencyRate = tClosed > 0 ? Math.round((existing.successCount / tClosed) * 1000) / 10 : 0;
            existing.logs = [...(existing.logs || []), ...tLogs];
          }
        });
      });
      allTechsArray = Array.from(allTechsMap.values());
    } else {
      const wData = stats.teamsData.find((w: any) => w.name === selectedteam);
      allTechsArray = (wData?.technicians || []).map((t: any) => ({
        ...t,
        logs: wData?.logs ? wData.logs.filter((l: any) => l.technicianName === t.name) : []
      }));
    }

    const sortedByEff = [...allTechsArray].sort((a, b) => b.efficiencyRate - a.efficiencyRate || b.successCount - a.successCount);
    const sortedByWorst = [...allTechsArray].sort((a, b) => a.efficiencyRate - b.efficiencyRate || a.lateCount - b.lateCount);

    let finalTechList = allTechsArray;
    if (sortField) {
      finalTechList = sortedArray(finalTechList, sortField, sortDirection);
    }

    return { list: finalTechList, top: sortedByEff.slice(0, 3), bottom: sortedByWorst.slice(0, 3), total: allTechsArray.length };
  }, [stats, selectedteam, sortField, sortDirection]);

  const teamSums = useMemo(() => {
    if (!stats?.teamsData) return { sumSuccess: 0, sumInProgress: 0, sumLate: 0, totalteams: 0 };
    return {
      totalteams: stats.teamsData.length,
      sumSuccess: stats.teamsData.reduce((acc: number, cur: any) => acc + cur.successCount, 0),
      sumInProgress: stats.teamsData.reduce((acc: number, cur: any) => acc + cur.inProgressCount, 0),
      sumLate: stats.teamsData.reduce((acc: number, cur: any) => acc + cur.lateCount, 0),
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
          onOpenteam={openteamDetail}
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
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          executeSearch={executeSearch}
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
          dateRange={dateRange}
          customDateStart={customDateStart}
          customDateEnd={customDateEnd}
        />
      );
    }

    if (activeTab === 'teams') {
      return (
        <TeamsTab 
          selectedteamDetail={selectedteamDetail}
          setSelectedteamDetail={setSelectedteamDetail}
          currentteamLogPage={currentteamLogPage}
          setCurrentteamLogPage={setCurrentteamLogPage}
          globalStatusFilter={globalStatusFilter}
          globalPriorityFilter={globalPriorityFilter}
          setMakeFilterValue={setMakeFilterValue}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          setActiveLogModal={setActiveLogModal}
          GENERAL_ITEMS_PER_PAGE={GENERAL_ITEMS_PER_PAGE}
          stats={stats}
          teamSums={teamSums}
          processedteams={processedteams}
          slaTarget={parseInt(slaTarget)}
        />
      );
    }

    if (activeTab === 'technicians') {
      return (
        <TechniciansTab
          stats={stats}
          techsData={techsData}
          selectedteam={selectedteam}
          setSelectedteam={setSelectedteam}
          selectedTechnicianDetail={selectedTechnicianDetail}
          setSelectedTechnicianDetail={setSelectedTechnicianDetail}
          globalStatusFilter={globalStatusFilter}
          globalPriorityFilter={globalPriorityFilter}
          setMakeFilterValue={setMakeFilterValue}
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

    if (activeTab === 'map') {
      return (
        <MapTab 
          mapLogs={stats?.mapLogs || []} 
          setActiveLogModal={setActiveLogModal} 
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
                {vehicleData !== undefined ? getTranslation(language, 'historyLog') : selectedteamDetail ? `${getTranslation(language, 'teamTitle')} ${selectedteamDetail.name}` : selectedTechnicianDetail ? `${getTranslation(language, 'technicianTitle')} ${selectedTechnicianDetail.name}` : activeTab === 'dashboard' ? getTranslation(language, 'maintenanceDashboard') : activeTab === 'teams' ? getTranslation(language, 'teams') : activeTab === 'technicians' ? getTranslation(language, 'technicians') : activeTab === 'map' ? 'แผนที่รวม' : getTranslation(language, 'settings')}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
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
