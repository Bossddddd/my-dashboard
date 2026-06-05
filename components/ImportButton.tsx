"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { importMaintenanceData } from "../app/actions";

export default function ImportButton() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setProgress(0);
    const toastId = toast.loading("กำลังเตรียมอ่านไฟล์...");

    const processData = async (bufferOrString: string | ArrayBuffer) => {
      try {
        const isString = typeof bufferOrString === "string";
        const workbook = XLSX.read(bufferOrString, { type: isString ? "string" : "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        const allData = XLSX.utils.sheet_to_json(sheet);
        
        if (allData.length === 0) {
          toast.error("ไม่พบข้อมูลในไฟล์", { id: toastId });
          setIsImporting(false);
          return;
        }

        const CHUNK_SIZE = 500; 
        const totalChunks = Math.ceil(allData.length / CHUNK_SIZE);
        
        let successCount = 0;
        let lastErrorMessage = "";

        for (let i = 0; i < totalChunks; i++) {
          const chunk = allData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          const currentProgress = Math.round(((i + 1) / totalChunks) * 100);
          
          toast.loading(`กำลังนำเข้าข้อมูล... ${currentProgress}%`, { id: toastId });
          setProgress(currentProgress);

          const result = await importMaintenanceData(chunk);
          if (!result.success) {
            lastErrorMessage = result.message;
            console.error("Chunk Error:", result.message);
          } else {
            successCount += chunk.length;
          }
        }

        if (successCount === 0 && lastErrorMessage) {
          toast.error(`นำเข้าข้อมูลไม่สำเร็จ: ${lastErrorMessage}`, { id: toastId });
        } else {
          toast.success(`นำเข้าสำเร็จ (${successCount} รายการ)`, { id: toastId });
          setTimeout(() => { window.location.reload(); }, 1500);
        }

      } catch (error) {
        console.error("Error reading file:", error);
        toast.error("รูปแบบไฟล์ไม่ถูกต้อง", { id: toastId });
      } finally {
        setIsImporting(false);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result;
      if (result) {
        await processData(result);
      }
    };

    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors shadow-xs ${
          isImporting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isImporting ? `⏳ นำเข้า ${progress}%` : "นำเข้าข้อมูล"}
      </button>
    </div>
  );
}