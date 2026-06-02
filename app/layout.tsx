import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maintenance Dashboard",
  description: "Dashboard for maintenance management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} h-screen flex flex-col antialiased`}>
        
        {/* === 1. Top NavBar === */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <div className="text-xl font-bold text-gray-800">
            Maintenance-Dashboard
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Admin User</span>
            {/* วงกลม Profile Mockup */}
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-inner">
              A
            </div>
          </div>
        </header>

        {/* === 2. พื้นที่ด้านล่าง (Sidebar + Main Content) === */}
        <div className="flex flex-1 overflow-hidden bg-gray-50">
          
          {/* Sidebar ด้านซ้าย */}
          <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-2 shrink-0 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2 px-4">Menu</div>
            
            {/* ลิงก์เมนูต่างๆ (ใช้ next/link เพื่อเปลี่ยนหน้าโดยไม่โหลดเว็บใหม่) */}
            <Link href="/" className="px-4 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-medium transition-colors">
              หน้าหลัก (Dashboard)
            </Link>
            <Link href="my-dashboard/components/Report.tsx" className="px-4 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-medium transition-colors">
              แจ้งซ่อม
            </Link>
            <Link href="/tasks" className="px-4 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-medium transition-colors">
              ลิสรายการซ่อมบำรุง
            </Link>
            <Link href="/tasks" className="px-4 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-medium transition-colors">
              มอบหมายงานให้ช่าง
            </Link>
            <Link href="/tasks" className="px-4 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-medium transition-colors">
              ตรวจงาน
            </Link>
            <Link href="/tasks" className="px-4 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-medium transition-colors">
              รายการวัสดุที่ต้องใช้
            </Link>
            <Link href="/settings" className="px-4 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-medium transition-colors">
              ตั้งค่าระบบ
            </Link>
          </aside>

          {/* === 3. Main Content (พื้นที่ว่างด้านขวา) === */}
          <main className="flex-1 p-8 overflow-y-auto">
            {children} {/* <--- เนื้อหาจากหน้า page.tsx ต่างๆ จะมาโผล่ตรงนี้ */}
          </main>

        </div>
      </body>
    </html>
  );
}