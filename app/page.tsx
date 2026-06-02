"use client"; // ต้องมีเพราะเราจะใช้ useState จัดการการคลิกเมนู

import { useState } from "react";
import Navbar from "../components/Navbar";

// นำเข้า Components ที่เรามี
import SalesChart from "../components/SalesChart";
import TaskList from "../components/TaskList";

export default function Home() {
  // 1. สร้าง State สำหรับเก็บว่าตอนนี้เลือกเมนูไหนอยู่ (ค่าเริ่มต้นคือ 'overview')
  const [activeTab, setActiveTab] = useState("overview");

  // 2. ฟังก์ชันสำหรับ render เนื้อหาตรงกลางตาม Tab ที่เลือก
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">ภาพรวมระบบ</h1>
            <SalesChart />
          </div>
        );
      case "report":
        return (
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">แจ้งซ่อม</h1>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
               <p className="text-gray-500">ฟอร์มแจ้งซ่อมจะอยู่ที่นี่ (รอสร้าง Component)</p>
            </div>
          </div>
        );
      case "tasks":
        return (
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">ลิสรายการแจ้งซ่อม</h1>
            <TaskList />
          </div>
        );
      case "materials":
        return (
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">ลิสรายการวัสดุ</h1>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
               <p className="text-gray-500">ตารางเบิกจ่ายวัสดุจะอยู่ที่นี่ (รอสร้าง Component)</p>
            </div>
          </div>
        );
      case "inspect":
        return (
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">ตรวจงาน</h1>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
               <p className="text-gray-500">หน้าสำหรับตรวจรับงานจะอยู่ที่นี่ (รอสร้าง Component)</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col antialiased">
      <Navbar />

      <div className="flex flex-1 overflow-hidden bg-gray-50">
        
        {/* === Sidebar ที่ใช้ setState แทน Link === */}
        <aside className="w-64 shrink-0 flex-col gap-2 border-r border-gray-200 bg-white p-4 shadow-[2px_0_5px_rgba(0,0,0,0.02)] flex">
          <div className="mb-2 mt-2 px-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Menu
          </div>
          
          <button 
            onClick={() => setActiveTab("overview")}
            className={`text-left rounded-lg px-4 py-2.5 font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'}`}
          >
            📊 ภาพรวม
          </button>
          
          <button 
            onClick={() => setActiveTab("report")}
            className={`text-left rounded-lg px-4 py-2.5 font-medium transition-colors ${activeTab === 'report' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'}`}
          >
            📝 แจ้งซ่อม
          </button>
          
          <button 
            onClick={() => setActiveTab("tasks")}
            className={`text-left rounded-lg px-4 py-2.5 font-medium transition-colors ${activeTab === 'tasks' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'}`}
          >
            📋 ลิสรายการแจ้งซ่อม
          </button>

          <button 
            onClick={() => setActiveTab("materials")}
            className={`text-left rounded-lg px-4 py-2.5 font-medium transition-colors ${activeTab === 'materials' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'}`}
          >
            📦 ลิสรายการวัสดุ
          </button>

          <button 
            onClick={() => setActiveTab("inspect")}
            className={`text-left rounded-lg px-4 py-2.5 font-medium transition-colors ${activeTab === 'inspect' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'}`}
          >
            ✅ ตรวจงาน
          </button>
        </aside>

        {/* === พื้นที่ตรงกลาง จะเปลี่ยนไปตาม State === */}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
        
      </div>
    </div>
  );
}