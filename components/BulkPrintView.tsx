"use client";

import { forwardRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatDateTime } from "./formatters";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../lib/constants";

export const BulkPrintView = forwardRef<HTMLDivElement, { data: any[] }>(
  ({ data }, ref) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!data || data.length === 0) return null;

    const content = (
      <div
        id="bulk-print-view"
        ref={ref}
        className="hidden print:block print:bg-white print:m-0 print:p-0"
      >
        {data.map((log: any, idx: number) => {
          const isOverdue =
            log.status !== "done" &&
            log.dueDate &&
            new Date(log.dueDate) < new Date();
          const displayId = log.maintenanceLogId || log.id;
          const uniqueKey = displayId || `log-${idx}`;

          return (
            <div
              key={uniqueKey}
              className={`print-page relative ${idx > 0 ? "print:break-before-page" : ""} p-8`}
            >
              <div className="flex flex-col items-center mb-6 border-b pb-4 gap-3">
                <h1 className="text-2xl font-black text-center">
                  รายละเอียดใบงาน (Ticket ID: #{displayId})
                </h1>

                {isOverdue && (
                  <div className="border-2 border-rose-500 text-rose-600 px-4 py-1.5 rounded-full font-black text-base bg-rose-50 shadow-sm flex items-center gap-2">
                    🚨 เกินกำหนดเวลา
                  </div>
                )}
              </div>

              <div className="space-y-6 text-sm">
                <div className="flex justify-between items-end border-b pb-2">
                  <div>
                    <p className="font-bold text-gray-500 mb-1">ทะเบียนรถ</p>
                    <p className="text-xl font-black">
                      {log.vehicle?.plate || "-"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-500 mb-1">
                      วันที่แจ้งซ่อม
                    </p>
                    <p className="font-bold">
                      {formatDateTime(log.reportedAt)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="font-bold text-gray-500 mb-1">สถานะงาน</p>
                    <p className="font-bold">
                      {STATUS_CONFIG[log.status]?.text || log.status}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-500 mb-1">ความเร่งด่วน</p>
                    <p className="font-bold">
                      {PRIORITY_CONFIG[log.priority]?.text || log.priority}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="font-bold text-gray-500 mb-1">
                      ทีมช่างที่รับผิดชอบ
                    </p>
                    <p className="font-bold">{log.teamName || "-"}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-500 mb-1">
                      ชื่อช่างหน้างาน
                    </p>
                    <p className="font-bold">{log.technicianName || "-"}</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-500 mb-1">
                    พิกัด / สถานที่หน้างาน
                  </p>
                  <p className="font-bold">{log.locationLabel || "-"}</p>
                  {log.latitude && log.longitude && (
                    <p className="text-sm text-gray-500 font-mono mt-1">
                      Lat: {log.latitude}, Long: {log.longitude}
                    </p>
                  )}
                </div>

                <div>
                  <p className="font-bold text-gray-500 mb-1">
                    รายละเอียด / อาการเสีย
                  </p>
                  <div className="bg-gray-50 p-4 border rounded-xl whitespace-pre-wrap min-h-[100px]">
                    {log.description || "-"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 border-t pt-4">
                  <div>
                    <p className="font-bold text-gray-500 mb-1">ค่าใช้จ่าย</p>
                    <p className="font-black text-lg">{log.cost || 0} บาท</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-500 mb-1">
                      กำหนดเสร็จ (SLA)
                    </p>
                    <p className="font-black text-rose-600">
                      {formatDateTime(log.dueDate)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div>
                    <p className="font-bold text-gray-500 mb-1">
                      เวลาเริ่มซ่อม
                    </p>
                    <p className="font-bold">{formatDateTime(log.startedAt)}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-500 mb-1">
                      เวลาซ่อมเสร็จ
                    </p>
                    <p className="font-bold">
                      {formatDateTime(log.completedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 pt-8 border-t flex justify-between">
                <div className="text-center w-48">
                  <div className="border-b border-gray-400 mb-2 h-10"></div>
                  <p className="text-xs font-bold text-gray-500">
                    ผู้แจ้ง / หัวหน้าช่าง
                  </p>
                </div>
                <div className="text-center w-48">
                  <div className="border-b border-gray-400 mb-2 h-10"></div>
                  <p className="text-xs font-bold text-gray-500">
                    ผู้ปฏิบัติงาน
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    return mounted ? createPortal(content, document.body) : null;
  },
);
BulkPrintView.displayName = "BulkPrintView";
