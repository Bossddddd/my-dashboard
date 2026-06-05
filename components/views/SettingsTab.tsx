import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { deleteDataByYear, resetDatabase } from '../../app/actions';
import { useLanguage } from '../../app/LanguageContext';

export default function SettingsTab({
  isDarkMode, setIsDarkMode,
  language, setLanguage,
  dateRange, setDateRange,
  customDateStart, setCustomDateStart,
  customDateEnd, setCustomDateEnd,
  slaTarget, setSlaTarget,
  loadStats
}: {
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  language: string;
  setLanguage: (v: string) => void;
  dateRange: string;
  setDateRange: (v: string) => void;
  customDateStart: string;
  setCustomDateStart: (v: string) => void;
  customDateEnd: string;
  setCustomDateEnd: (v: string) => void;
  slaTarget: string;
  setSlaTarget: (v: string) => void;
  loadStats: () => void;
}) {
  const { t } = useLanguage();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState<'old' | 'all' | null>(null);
  
  // สร้างตัวเลือกปีแบบไดนามิก (ย้อนหลัง 5 ปีจากปีปัจจุบัน)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({length: 5}, (_, i) => (currentYear - i).toString());
  const [selectedYearToDelete, setSelectedYearToDelete] = useState(availableYears[0]);

  const handleSaveSettings = () => {
    toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
  };

  const handleTriggerDelete = (type: 'old' | 'all') => {
    setDeleteType(type);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    const loadingToast = toast.loading('กำลังลบข้อมูล กรุณารอสักครู่...');

    try {
      if (deleteType === 'old') {
        const res = await deleteDataByYear(selectedYearToDelete);
        if (res?.success) {
          toast.success(`ลบข้อมูลปี ${selectedYearToDelete} สำเร็จแล้ว (ลบไป ${res.count} รายการ)`, { id: loadingToast });
        } else {
          toast.error(res?.error || 'เกิดข้อผิดพลาด', { id: loadingToast });
        }
      } else if (deleteType === 'all') {
        const res = await resetDatabase();
        if (res?.success) {
          toast.success(`รีเซ็ตฐานข้อมูลสำเร็จ (ลบใบงาน ${res.logsCount} รายการ, รถ ${res.vehiclesCount} คัน)`, { id: loadingToast });
        } else {
          toast.error(res?.error || 'เกิดข้อผิดพลาด', { id: loadingToast });
        }
      }
      loadStats();
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ', { id: loadingToast });
    }
    setDeleteType(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-10">
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="mb-8 border-b border-gray-100 dark:border-slate-700/50 pb-4 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100 flex items-center gap-3">
              <span className="text-3xl">⚙️</span>{t('settingsTitle')}</h2>
            <p className="text-gray-500 dark:text-slate-400 font-medium text-sm mt-2">{t('settingsDesc')}</p>
          </div>
          <button 
            onClick={handleSaveSettings}
            className="bg-[#0B603A] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-emerald-800 transition-colors hidden sm:block"
          >{t('saveChanges')}</button>
        </div>

        <div className="space-y-10">
          {/* Section 1: Appearance */}
          <section>
            <h3 className="text-lg font-black text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="text-emerald-600">🎨</span>{t('appearance')}</h3>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700/50 p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-slate-200 text-sm">{t('darkMode')}</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-1">{t('darkModeDesc')}</p>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-[#0B603A]' : 'bg-gray-300'}`}
                >
                  <div className={`bg-white dark:bg-slate-800 w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
              <hr className="border-gray-200 dark:border-slate-700" />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-slate-200 text-sm">{t('language')}</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-1">{t('languageDesc')}</p>
                </div>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 text-sm font-bold rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none shadow-sm"
                >
                  <option value="th">🇹🇭 ภาษาไทย</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: Data & Analytics */}
          <section>
            <h3 className="text-lg font-black text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="text-blue-500">📊</span>{t('dataAnalytics')}</h3>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700/50 p-5 space-y-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-slate-200 text-sm">{t('defaultDateRange')}</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-1">{t('defaultDateRangeDesc')}</p>
                  </div>
                  <select 
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 text-sm font-bold rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none shadow-sm min-w-[150px]"
                  >
                    <option value="7d">{t('date7d')}</option>
                    <option value="30d">{t('date30d')}</option>
                    <option value="6m">{t('date6m')}</option>
                    <option value="1y">{t('date1y')}</option>
                    <option value="all">{t('dateAll')}</option>
                    <option value="custom">{t('dateCustom')}</option>
                  </select>
                </div>

                {dateRange === 'custom' && (
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-end bg-blue-50 dark:bg-blue-900/30/50 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-gray-600 dark:text-slate-400">{t('dateFrom')}</label>
                      <input 
                        type="date" 
                        value={customDateStart} 
                        onChange={(e) => setCustomDateStart(e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 text-sm font-bold rounded-lg px-3 py-2 outline-none shadow-sm"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-gray-600 dark:text-slate-400">{t('dateTo')}</label>
                      <input 
                        type="date" 
                        value={customDateEnd} 
                        onChange={(e) => setCustomDateEnd(e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 text-sm font-bold rounded-lg px-3 py-2 outline-none shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <hr className="border-gray-200 dark:border-slate-700" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-slate-200 text-sm">{t('slaTarget')}</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-1">{t('slaTargetDesc')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={slaTarget}
                    onChange={(e) => setSlaTarget(e.target.value)}
                    min="1" max="100"
                    className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-center text-gray-900 dark:text-slate-100 text-sm font-bold rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-20 p-2.5 outline-none shadow-sm"
                  />
                  <span className="text-gray-500 dark:text-slate-400 font-bold">%</span>
                </div>
              </div>
            </div>
          </section>


          {/* Section 4: Danger Zone */}
          <section>
            <h3 className="text-lg font-black text-rose-600 mb-4 flex items-center gap-2">
              <span className="text-rose-600">⚠️</span>{t('dangerZone')}</h3>
            <div className="bg-rose-50 dark:bg-rose-900/30 rounded-xl border border-rose-200 dark:border-rose-800 p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-rose-900 dark:text-rose-300 text-sm">{t('deleteByYear')}</h4>
                  <p className="text-xs text-rose-700 dark:text-rose-400/80 font-medium mt-1">{t('deleteByYearDesc')}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={selectedYearToDelete}
                    onChange={(e) => setSelectedYearToDelete(e.target.value)}
                    className="bg-white dark:bg-slate-800 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm font-bold rounded-lg focus:ring-rose-500 focus:border-rose-500 block p-2 outline-none shadow-sm"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{t('yearDataPrefix')}  {year}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => handleTriggerDelete('old')}
                    className="bg-white dark:bg-slate-800 text-rose-600 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 px-3 py-2 rounded-lg font-bold text-xs sm:text-sm shadow-sm transition-colors"
                  >{t('deleteButton')}</button>
                </div>
              </div>
              <hr className="border-rose-200 dark:border-rose-800/50" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-rose-900 dark:text-rose-300 text-sm">{t('resetDatabase')}</h4>
                  <p className="text-xs text-rose-700 dark:text-rose-400/80 font-medium mt-1">{t('resetDatabaseDesc')}</p>
                </div>
                <button 
                  onClick={() => handleTriggerDelete('all')}
                  className="bg-rose-600 text-white hover:bg-rose-700 px-4 py-2 rounded-lg font-bold text-xs sm:text-sm shadow-sm transition-colors shrink-0"
                >{t('resetButton')}</button>
              </div>
            </div>
          </section>
        </div>

        {/* Mobile Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700/50 sm:hidden">
          <button 
            onClick={handleSaveSettings}
            className="w-full bg-[#0B603A] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-800 transition-colors"
          >{t('saveChanges')}</button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
              ⚠️
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-slate-100 text-center mb-2">{t('confirmAction')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-6 font-medium leading-relaxed">
              {deleteType === 'old' ? `${t('confirmDeleteYear')} ${selectedYearToDelete}?` : t('confirmResetAll')} <br/>
              <span className="text-rose-500 font-bold">{t('cannotUndo')}</span>
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors"
              >{t('cancel')}</button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors"
              >{t('confirmDelete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

