import React from "react";

export default function TaskList() {
  // จำลองข้อมูล Array ของงานซ่อมบำรุง (ในอนาคตดึงจาก API ได้เลย)
  const tasks = [
    { id: 1, title: "ซ่อมแอร์ชั้น 2", status: "แจ้งเตือนเมื่อ 10 นาทีที่แล้ว", type: "urgent" },
    { id: 2, title: "เช็คระบบไฟเซิร์ฟเวอร์", status: "รอดำเนินการ", type: "warning" },
    { id: 3, title: "เปลี่ยนหลอดไฟทางเดิน", status: "เสร็จสิ้น", type: "success" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <p className="text-gray-500 mb-6">
        รายการงานซ่อมบำรุงทั้งหมดในระบบ
      </p>

      {/* วนลูป Array เพื่อสร้างรายการ */}
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 border rounded-lg border-l-4 bg-gray-50 ${
              task.type === "urgent" ? "border-l-red-500" :
              task.type === "warning" ? "border-l-yellow-500" :
              "border-l-green-500"
            }`}
          >
            <strong>{task.title}</strong> - {task.status}
          </div>
        ))}
      </div>
    </div>
  );
}