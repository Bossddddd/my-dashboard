import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SyncManager from "@/components/SyncManager";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EVT Admin Panel",
  description: "ระบบจัดการซ่อมบำรุงยานพาหนะ",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <SpeedInsights />
        <SyncManager />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
              fontSize: "14px",
              borderRadius: "8px",
            },
            success: { style: { background: "#059669" } },
            error: { style: { background: "#e11d48" } },
          }}
        />
      </body>
    </html>
  );
}
