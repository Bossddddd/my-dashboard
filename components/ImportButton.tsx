"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { importMaintenanceData } from "../app/actions";

export default function ImportButton() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0); // 🚀 เพิ่ม State สำหรับเก็บเปอร์เซ็นต์โหลด
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const buffer = event.target?.result;
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // ข้อมูลดิบทั้งหมด (เช่น 10,000 รายการ)
        const allData = XLSX.utils.sheet_to_json(sheet);
        
        if (allData.length === 0) {
          alert("ไม่พบข้อมูลในไฟล์");
          setIsImporting(false);
          return;
        }

        // 🚀 ระบบหั่นข้อมูล (Chunking) เพื่อหลบ Vercel Timeout
        const CHUNK_SIZE = 500; // ส่งไปทีละ 500 รายการ
        const totalChunks = Math.ceil(allData.length / CHUNK_SIZE);
        
        let successCount = 0;

        for (let i = 0; i < totalChunks; i++) {
          // ตัดก้อนข้อมูลทีละ 500
          const chunk = allData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          
          // ส่งไปให้ actions.ts จัดการ
          const result = await importMaintenanceData(chunk);
          
          if (!result.success) {
            console.error("Chunk Error:", result.message);
          } else {
            successCount += chunk.length;
          }

          // อัปเดต % หน้าจอให้รู้ว่าไม่ค้าง
          setProgress(Math.round(((i + 1) / totalChunks) * 100));
        }

        alert(`นำเข้าข้อมูลเรียบร้อยแล้ว (${successCount} จาก ${allData.length} รายการ)`);
        window.location.reload(); 

      } catch (error) {
        console.error("Error reading file:", error);
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์ โปรดตรวจสอบรูปแบบไฟล์อีกครั้ง");
      } finally {
        setIsImporting(false);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-4 ${
          isImporting 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300"
        }`}
      >
        {isImporting ? `⏳ กำลังนำเข้า... ${progress}%` : "📄 นำเข้า Excel / CSV"}
      </button>
    </div>
  );
}