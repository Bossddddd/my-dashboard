"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { importMaintenanceData } from "../app/actions";

export default function ImportButton() {
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const arrayBuffer = evt.target?.result;
        // อ่านไฟล์ Excel หรือ CSV
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0]; // ดึง Sheet แรก
        const worksheet = workbook.Sheets[sheetName];
        
        // แปลงข้อมูลใน Sheet ให้เป็น Array ของ JSON
        const data = XLSX.utils.sheet_to_json(worksheet);

        // ส่งข้อมูลไปให้ Server Action บันทึกลงฐานข้อมูล
        const result = await importMaintenanceData(data);
        
        if (result.success) {
          alert(`นำเข้าข้อมูลเรียบร้อยแล้ว (${data.length} รายการ)`);
          window.location.reload(); // รีเฟรชหน้าเว็บเพื่อดึงข้อมูลใหม่
        } else {
          alert("เกิดข้อผิดพลาด: " + result.message);
        }
      } catch (error) {
        console.error("Error reading file:", error);
        alert("ไฟล์ไม่ถูกต้อง หรืออ่านไฟล์ไม่สำเร็จ");
      } finally {
        setIsImporting(false);
        // รีเซ็ตค่า input file
        e.target.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="relative overflow-hidden">
      <button 
        disabled={isImporting}
        className={`rounded-lg px-4 py-2 font-medium transition ${isImporting ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
      >
        {isImporting ? "กำลังนำเข้า..." : "📥 นำเข้า Excel / CSV"}
      </button>
      
      {/* input file ซ่อนไว้ทับปุ่ม เพื่อให้คลิกแล้วเลือกไฟล์ได้ */}
      <input
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        onChange={handleFileUpload}
        className="absolute inset-0 cursor-pointer opacity-0"
        disabled={isImporting}
      />
    </div>
  );
}