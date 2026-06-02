import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Import Component ที่เราเพิ่งสร้าง
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

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
        
        {/* เรียกใช้ Navbar */}
        <Navbar />

        <div className="flex flex-1 overflow-hidden bg-gray-50">
          {/* เรียกใช้ Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>

      </body>
    </html>
  );
}