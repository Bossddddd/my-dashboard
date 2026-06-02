// นำเข้า Component (ระวังเรื่อง Path ให้ถอยหลัง 2 ขั้น ../../ เพราะไฟล์อยู่ในโฟลเดอร์ tasks)
import TaskList from "../../components/TaskList";

export default function TasksPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ตารางงานซ่อมบำรุง</h1>
      
      {/* เรียกใช้งาน Component ตรงนี้ */}
      <TaskList />
      
    </div>
  );
}