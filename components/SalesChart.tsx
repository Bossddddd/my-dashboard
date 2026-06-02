"use client"; // จำเป็นสำหรับ React Hooks และ Recharts ใน Next.js 13+

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// 1. กำหนด TypeScript Type / Interface
interface SalesData {
  id: string;
  month: string;
  amount: number;
}

// 2. Component หลัก
export default function SalesChart() {
  // จัดการ State ต่างๆ (มี Union Type ด้วย เช่น string | null)
  const [data, setData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 3. useEffect & async/await สำหรับ Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // ตัวอย่าง Fetch จำลอง (ของจริงแก้ URL ตรงนี้)
        const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "YOUR_SECRET_KEY", // ใส่ Header ตามที่ต้องการ
          },
        });

        if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูล");

        // จำลองการแปลงข้อมูลให้ตรงกับ Type ที่เราต้องการวาดกราฟ
        const mockData: SalesData[] = [
          { id: "1", month: "ม.ค.", amount: 4000 },
          { id: "2", month: "ก.พ.", amount: 3000 },
          { id: "3", month: "มี.ค.", amount: 5000 },
        ];

        // ตัวอย่างการใช้ Array Method (.map, .filter)
        const processedData = mockData
          .filter(item => item.amount > 0)
          .map(item => ({
            ...item,
            amount: item.amount * 1,
          }));

        setData(processedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // จำลองความหน่วงของ Network 1 วินาที เพื่อให้เห็น Loading State
    const timer = setTimeout(() => fetchData(), 1000);
    return () => clearTimeout(timer);
  }, []);

  // 4. Conditional Rendering (เช็คสถานะ Loading, Error, Empty)
  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return <div className="rounded-md bg-red-100 p-4 text-red-700">ข้อผิดพลาด: {error}</div>;
  }

  if (data.length === 0) {
    return <div className="py-10 text-center text-gray-400">ไม่มีข้อมูลแสดงผล</div>;
  }

  // 5. Render กราฟและรายการ (Tailwind CSS + Recharts)
  return (
    <div className="w-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">ยอดขายรายเดือน</h2>
      
      {/* Recharts Component */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="month" stroke="#8884d8" />
            <YAxis />
            <Tooltip cursor={{ fill: "#f3f4f6" }} />
            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* List Rendering (+ key) และ Tailwind Grid */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.id} className="rounded-lg bg-blue-50 p-3 text-center">
            <span className="block text-sm text-gray-500">{item.month}</span>
            <span className="block font-mono text-lg font-bold text-blue-700">
              {item.amount.toLocaleString()} ฿
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}