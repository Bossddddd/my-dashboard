import SalesChart from "../components/SalesChart";

export default function Home() {
  return (
    // ใช้ Tailwind Flexbox และ Spacing เพื่อจัด Layout
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard ของฉัน</h1>
          <p className="text-gray-500 mt-2">สรุปภาพรวมข้อมูลและสถิติเบื้องต้น</p>
        </header>
        
        {/* เรียกใช้งาน Component ที่เราสร้างไว้ */}
        <section>
          <SalesChart />
        </section>
      </div>
    </main>
  );
}