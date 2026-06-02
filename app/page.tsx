import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="flex h-screen flex-col antialiased bg-gray-50">
      
      {/* เรียกใช้ Navbar ที่เราเพิ่งแก้ */}
      <Navbar />

      {/* พื้นที่เนื้อหาหลัก (ตอนนี้ปล่อยโล่งไว้ก่อน) */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl">
          
          {/* กล่องข้อความ Placeholder */}
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <div className="mb-3 text-4xl">🚗</div>
            <h2 className="text-xl font-medium text-gray-600">
              ยินดีต้อนรับสู่ระบบแจ้งซ่อม
            </h2>
            <p className="mt-2 text-gray-400">
              กรุณาพิมพ์เลขทะเบียนรถในช่องค้นหาด้านบน เพื่อเริ่มต้นการทำงาน
            </p>
          </div>

        </div>
      </main>

    </div>
  );
}