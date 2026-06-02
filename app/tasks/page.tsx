export default function TasksPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ตารางงานซ่อมบำรุง</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-500">
          นี่คือหน้าที่ 2 พื้นที่ตรงนี้คือหน้า Content ที่เปลี่ยนไปตาม URL
        แต่สังเกตว่าแถบด้านบนและด้านซ้ายจะไม่กระพริบเลย
        </p>
        
        <div className="mt-6 flex flex-col gap-3">
          <div className="p-4 border rounded-lg border-l-4 border-l-red-500 bg-gray-50">
            <strong>ซ่อมแอร์ชั้น 2</strong> - แจ้งเตือนเมื่อ 10 นาทีที่แล้ว
          </div>
          <div className="p-4 border rounded-lg border-l-4 border-l-yellow-500 bg-gray-50">
            <strong>เช็คระบบไฟเซิร์ฟเวอร์</strong> - รอดำเนินการ
          </div>
        </div>
      </div>
    </div>
  );
}