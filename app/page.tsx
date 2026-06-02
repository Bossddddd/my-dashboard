import SalesChart from "../components/SalesChart";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ภาพรวมระบบ (Overview)</h1>
      <SalesChart />
    </div>
  );
}