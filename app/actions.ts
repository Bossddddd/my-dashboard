"use server";

import { db } from "../lib/db";
import { vehicles, maintenanceLogs } from "../db/schema";
import { eq, desc, asc, and, or, gte, lte, count, sum, inArray, lt, ilike } from "drizzle-orm";

const parseSafeDate = (val: any) => {
  if (!val || String(val).trim() === "") return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const calculateSlaRate = (onTimeCount: number, lateCount: number) => {
  const slaTotal = onTimeCount + lateCount;
  return slaTotal > 0 ? (onTimeCount / slaTotal) * 100 : 0;
};

export async function searchVehicleByPlate(plate: string) {
  try {
    const v = await db.query.vehicles.findFirst({
      where: eq(vehicles.plate, plate),
      with: { logs: { orderBy: [desc(maintenanceLogs.reportedAt)] } }
    });
    return v || null;
  } catch (error) {
    console.error("Database Error:", error);
    return null;
  }
}

export async function getDashboardStats(options?: { dateRange?: string, customStart?: string, customEnd?: string }) {
  try {
    let dateFilter: any = undefined;
    if (options && options.dateRange && options.dateRange !== 'all') {
      const now = new Date();
      if (options.dateRange === 'custom' && options.customStart && options.customEnd) {
        dateFilter = and(gte(maintenanceLogs.reportedAt, new Date(options.customStart)), lte(maintenanceLogs.reportedAt, new Date(options.customEnd)));
      } else if (options.dateRange === '7d') {
        dateFilter = gte(maintenanceLogs.reportedAt, new Date(now.setDate(now.getDate() - 7)));
      } else if (options.dateRange === '30d') {
        dateFilter = gte(maintenanceLogs.reportedAt, new Date(now.setDate(now.getDate() - 30)));
      } else if (options.dateRange === '6m') {
        dateFilter = gte(maintenanceLogs.reportedAt, new Date(now.setMonth(now.getMonth() - 6)));
      } else if (options.dateRange === '1y') {
        dateFilter = gte(maintenanceLogs.reportedAt, new Date(now.setFullYear(now.getFullYear() - 1)));
      }
    }

    const whereClause = dateFilter;

    const totalVehiclesRes = await db.select({ count: count() }).from(vehicles);
    const totalVehicles = totalVehiclesRes[0]?.count || 0;
    
    const query = db.select({ count: count() }).from(maintenanceLogs);
    if (whereClause) query.where(whereClause);
    const totalLogsRes = await query;
    const totalLogs = totalLogsRes[0]?.count || 0;

    const statusQuery = db.select({ status: maintenanceLogs.status, count: count(maintenanceLogs.id) }).from(maintenanceLogs);
    if (whereClause) statusQuery.where(whereClause);
    const statusGroupsRaw = await statusQuery.groupBy(maintenanceLogs.status);
    const statusGroups = statusGroupsRaw.map(s => ({ _count: { id: s.count }, status: s.status }));

    const priorityQuery = db.select({ priority: maintenanceLogs.priority, count: count(maintenanceLogs.id) }).from(maintenanceLogs);
    if (whereClause) priorityQuery.where(whereClause);
    const priorityGroupsRaw = await priorityQuery.groupBy(maintenanceLogs.priority);
    const priorityGroups = priorityGroupsRaw.map(p => ({ _count: { id: p.count }, priority: p.priority }));

    const costQuery = db.select({ sumCost: sum(maintenanceLogs.cost) }).from(maintenanceLogs);
    if (whereClause) costQuery.where(whereClause);
    const costAggRes = await costQuery;
    const costAgg = { _sum: { cost: costAggRes[0]?.sumCost ? parseFloat(costAggRes[0].sumCost) : 0 } };

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentLogs = await db.query.maintenanceLogs.findMany({
      where: gte(maintenanceLogs.reportedAt, sixMonthsAgo),
      columns: { reportedAt: true, cost: true }
    });

    const monthlyMap = new Map();
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleString('th-TH', { month: 'short' });
      const yearLabel = d.getFullYear() + 543;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, { label: `${monthLabel} ${String(yearLabel).substring(2)}`, count: 0, cost: 0 });
    }

    for (const log of recentLogs) {
      if (!log.reportedAt) continue;
      const logDate = new Date(log.reportedAt);
      const key = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap.has(key)) {
        const current = monthlyMap.get(key);
        current.count += 1;
        current.cost += log.cost || 0;
        monthlyMap.set(key, current);
      }
    }
    const monthlyStats = Array.from(monthlyMap.values()).reverse();

    const allLogs = await db.query.maintenanceLogs.findMany({
      where: whereClause,
      columns: { 
        id: true, status: true, priority: true, description: true, technicianName: true,
        reportedAt: true, assignedAt: true, startedAt: true, completedAt: true, dueDate: true, workshopName: true,
      },
      with: { vehicle: { columns: { plate: true } } }
    });

    let totalCompleted = 0;
    let onTimeCompleted = 0;
    let totalResponseTimeMs = 0;
    let responseCount = 0;
    let totalRepairTimeMs = 0;
    let repairCount = 0;
    let overdueActiveCount = 0;
    
    const overdueTasks = [];
    const workshopMap = new Map(); 
    const now = new Date();

    for (const log of allLogs) {
      if (log.status === 'completed' && log.completedAt) {
        totalCompleted++;
        if (log.dueDate && new Date(log.completedAt) <= new Date(log.dueDate)) {
          onTimeCompleted++;
        }
      }
      if (log.reportedAt && log.assignedAt) {
        const diff = new Date(log.assignedAt).getTime() - new Date(log.reportedAt).getTime();
        if (diff >= 0) { totalResponseTimeMs += diff; responseCount++; }
      }
      if (log.status === 'completed' && log.startedAt && log.completedAt) {
        const diff = new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime();
        if (diff >= 0) { totalRepairTimeMs += diff; repairCount++; }
      }
      const rawWorkshop = log.workshopName ? log.workshopName.trim() : "";
      if (rawWorkshop !== "") {
        if (!workshopMap.has(rawWorkshop)) {
          workshopMap.set(rawWorkshop, {
            name: rawWorkshop, totalJobs: 0, completedOnTime: 0, completedLate: 0, 
            inProgress: 0, overdueActive: 0, totalRepairTimeMs: 0, repairCount: 0,
            techsMap: new Map(),
            logs: [] 
          });
        }
        const wStats = workshopMap.get(rawWorkshop);
        wStats.totalJobs++;

        const logDataForList = {
          maintenanceLogId: log.id,
          vehiclePlate: log.vehicle?.plate || "ไม่ระบุ",
          description: log.description,
          technicianName: log.technicianName || "ยังไม่ระบุ",
          workshopName: log.workshopName || "ไม่ระบุ",
          status: log.status,
          priority: log.priority,
          reportedAt: log.reportedAt ? log.reportedAt.toISOString() : "",
          dueDate: log.dueDate ? log.dueDate.toISOString() : ""
        };

        wStats.logs.push(logDataForList);

        if (log.status === 'completed') {
          if (log.dueDate && log.completedAt) {
            if (new Date(log.completedAt) <= new Date(log.dueDate)) { wStats.completedOnTime++; } 
            else { wStats.completedLate++; }
          } else {
            wStats.completedOnTime++; 
          }
          if (log.startedAt && log.completedAt) {
            const diff = new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime();
            if (diff >= 0) { wStats.totalRepairTimeMs += diff; wStats.repairCount++; }
          }
        } else if (log.status === 'in_progress') {
          wStats.inProgress++;
        }
        if (log.status !== 'completed' && log.status !== 'cancelled' && log.dueDate) {
          if (now > new Date(log.dueDate)) { wStats.overdueActive++; }
        }

        const rawTech = log.technicianName ? log.technicianName.trim() : "";
        if (rawTech !== "") {
          if (!wStats.techsMap.has(rawTech)) {
            wStats.techsMap.set(rawTech, {
              name: rawTech, totalJobs: 0, completedOnTime: 0, completedLate: 0, inProgress: 0, overdueActive: 0,
              logs: [] 
            });
          }
          const tStats = wStats.techsMap.get(rawTech);
          tStats.totalJobs++;
          tStats.logs.push(logDataForList); 

          if (log.status === 'completed') {
            if (log.dueDate && log.completedAt) {
              if (new Date(log.completedAt) <= new Date(log.dueDate)) { tStats.completedOnTime++; }
              else { tStats.completedLate++; }
            } else {
              tStats.completedOnTime++;
            }
          } else if (log.status === 'in_progress') {
            tStats.inProgress++;
          }
          if (log.status !== 'completed' && log.status !== 'cancelled' && log.dueDate && now > new Date(log.dueDate)) {
            tStats.overdueActive++;
          }
        }
      }
    }

    const efficiency = {
      onTimeRate: totalCompleted > 0 ? Math.round((onTimeCompleted / totalCompleted) * 100) : 0,
      avgResponseTimeHours: responseCount > 0 ? Math.round((totalResponseTimeMs / responseCount) / (1000 * 60 * 60) * 10) / 10 : 0,
      avgRepairTimeHours: repairCount > 0 ? Math.round((totalRepairTimeMs / repairCount) / (1000 * 60 * 60) * 10) / 10 : 0,
    };

    const overdueLogs = await db.query.maintenanceLogs.findMany({
      where: and(
        notInArray(maintenanceLogs.status, ['completed', 'cancelled']),
        lt(maintenanceLogs.dueDate, now)
      ),
      columns: {
        id: true, description: true, technicianName: true, status: true, priority: true, dueDate: true, workshopName: true, reportedAt: true,
      },
      with: { vehicle: { columns: { plate: true } } },
      orderBy: [asc(maintenanceLogs.dueDate)]
    });

    overdueActiveCount = overdueLogs.length;
    for (const log of overdueLogs) {
      overdueTasks.push({
        id: log.id, plate: log.vehicle?.plate, description: log.description,
        technicianName: log.technicianName, status: log.status, priority: log.priority, dueDate: log.dueDate,
        workshopName: log.workshopName,
        reportedAt: log.reportedAt ? log.reportedAt.toISOString() : ""
      });
    }

    const completedLateCount = totalCompleted - onTimeCompleted;
    const onTimeRate = calculateSlaRate(onTimeCompleted, completedLateCount + overdueActiveCount);

    const workshopsData = Array.from(workshopMap.values()).map((w: any) => {
      const lateCount = w.completedLate + w.overdueActive;
      const efficiencyRate = calculateSlaRate(w.completedOnTime, lateCount);
      const avgRepairHoursW = w.repairCount > 0 ? (w.totalRepairTimeMs / (1000 * 60 * 60)) / w.repairCount : 0;
      return {
        name: w.name, totalJobs: w.totalJobs, successCount: w.completedOnTime, 
        lateCount, inProgressCount: w.inProgress, 
        efficiencyRate: Math.round(efficiencyRate * 10) / 10, avgRepairHours: Math.round(avgRepairHoursW * 10) / 10,
        logs: w.logs, 
        technicians: Array.from(w.techsMap.values()).map((t: any) => {
          const tLateCount = t.completedLate + t.overdueActive;
          const tEfficiency = calculateSlaRate(t.completedOnTime, tLateCount);
          return {
            name: t.name, totalJobs: t.totalJobs, successCount: t.completedOnTime,
            inProgressCount: t.inProgress, lateCount: tLateCount,
            efficiencyRate: Math.round(tEfficiency * 10) / 10,
            logs: t.logs 
          };
        })
      };
    });

    const avgResponseHours = responseCount > 0 ? (totalResponseTimeMs / (1000 * 60 * 60)) / responseCount : 0;
    const avgRepairHours = repairCount > 0 ? (totalRepairTimeMs / (1000 * 60 * 60)) / repairCount : 0;

    return {
      totalVehicles, totalLogs,
      statusCounts: statusGroups.map((s: any) => ({ status: s.status, count: s._count.id })),
      priorityCounts: priorityGroups.map((p: any) => ({ priority: p.priority, count: p._count.id })),
      totalCost: costAgg._sum.cost || 0,
      monthlyStats,
      efficiency: {
        onTimeRate: Math.round(onTimeRate * 10) / 10,
        avgResponseHours: Math.round(avgResponseHours * 10) / 10,
        avgRepairHours: Math.round(avgRepairHours * 10) / 10,
        overdueActiveCount
      },
      overdueTasks, workshopsData
    };
  } catch (error) {
    console.error("Stats Error:", error);
    return null;
  }
}

function notInArray(column: any, values: string[]) {
  const { not, inArray } = require("drizzle-orm");
  return not(inArray(column, values));
}

export async function importMaintenanceData(rows: any[]) {
  try {
    const cleanRows = rows.map(row => {
      const cleanRow: any = {};
      for (const key of Object.keys(row)) {
        const cleanKey = key.replace(/^\uFEFF/, '').trim();
        cleanRow[cleanKey] = row[key];
      }
      return cleanRow;
    });

    const validRows = cleanRows.filter(r => r.plate);
    if (validRows.length === 0) return { success: false, message: "ไม่พบข้อมูลรถในไฟล์" };

    const uniquePlates = [...new Set(validRows.map(r => String(r.plate).trim()))];
    let existingVehicles = await db.query.vehicles.findMany({ where: inArray(vehicles.plate, uniquePlates) });
    const existingPlates = new Set(existingVehicles.map((v: any) => v.plate));

    const vehiclesToCreate = [];
    const seenNewPlates = new Set(); 
    for (const row of validRows) {
      const plate = String(row.plate).trim();
      if (!existingPlates.has(plate) && !seenNewPlates.has(plate)) {
        vehiclesToCreate.push({ plate: plate, brand: row.brand ? String(row.brand).trim() : null, model: row.model ? String(row.model).trim() : null });
        seenNewPlates.add(plate);
      }
    }

    if (vehiclesToCreate.length > 0) {
      await db.insert(vehicles).values(vehiclesToCreate).onConflictDoNothing({ target: vehicles.plate });
      existingVehicles = await db.query.vehicles.findMany({ where: inArray(vehicles.plate, uniquePlates) });
    }

    const plateToIdMap = new Map();
    for (const v of existingVehicles as any[]) { plateToIdMap.set(v.plate, v.id); }

    const logsToCreate = [];
    for (const row of validRows) {
      if (!row.description) continue; 
      const vehicleId = plateToIdMap.get(String(row.plate).trim());
      if (!vehicleId) continue; 

      logsToCreate.push({
        vehicleId: vehicleId,
        projectId: row.projectId ? parseInt(row.projectId) : null,
        projectName: row.projectName ? String(row.projectName).trim() : null,
        workshopName: row.workshopName ? String(row.workshopName).trim() : null,
        technicianName: row.technicianName ? String(row.technicianName).trim() : null,
        priority: row.priority ? String(row.priority).trim() : "normal",
        status: row.status ? String(row.status).trim() : "reported",
        category: row.category ? String(row.category).trim() : null,
        description: String(row.description).trim(),
        symptoms: row.symptoms ? String(row.symptoms).trim() : null,
        locationLabel: row.locationLabel ? String(row.locationLabel).trim() : null,
        cost: row.cost ? parseFloat(row.cost) : null,
        reportedAt: parseSafeDate(row.reportedAt) || new Date(),
        assignedAt: parseSafeDate(row.assignedAt),
        acceptedAt: parseSafeDate(row.acceptedAt),
        startedAt: parseSafeDate(row.startedAt),
        completedAt: parseSafeDate(row.completedAt),
        dueDate: parseSafeDate(row.dueDate),
      });
    }

    if (logsToCreate.length > 0) {
      await db.insert(maintenanceLogs).values(logsToCreate);
    }
    return { success: true, message: `นำเข้าข้อมูลสำเร็จ` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}

export async function searchDashboardData(query: string) {
  try {
    if (!query || query.trim() === "") return null;

    const searchTerm = query.trim();

    const searchConditions: any[] = [
      ilike(vehicles.plate, `%${searchTerm}%`),
      ilike(maintenanceLogs.description, `%${searchTerm}%`),
      ilike(maintenanceLogs.technicianName, `%${searchTerm}%`),
      ilike(maintenanceLogs.workshopName, `%${searchTerm}%`)
    ];

    const parsedId = parseInt(searchTerm, 10);
    if (!isNaN(parsedId)) {
      searchConditions.push(eq(maintenanceLogs.id, parsedId));
    }

    const logs = await db.query.maintenanceLogs.findMany({
      where: (maintenanceLogs, { or, ilike, eq }) => {
        const conditions = [
          ilike(maintenanceLogs.description, `%${searchTerm}%`),
          ilike(maintenanceLogs.technicianName, `%${searchTerm}%`),
          ilike(maintenanceLogs.workshopName, `%${searchTerm}%`)
        ];
        if (!isNaN(parsedId)) conditions.push(eq(maintenanceLogs.id, parsedId));
        // Wait, filtering by vehicle plate needs a join. Drizzle's findMany doesn't easily let us filter by relations yet
        // So we might need to use db.select for complex search, but let's stick to simple or here, or use db.select.
        // I will use db.select to make it easier to search by vehicle plate.
        return or(...conditions);
      },
      with: { vehicle: { columns: { plate: true } } },
      orderBy: [desc(maintenanceLogs.reportedAt)]
    });

    // To handle vehicle plate search properly with Drizzle:
    const plateLogsRaw = await db.select({ logId: maintenanceLogs.id }).from(maintenanceLogs)
      .leftJoin(vehicles, eq(maintenanceLogs.vehicleId, vehicles.id))
      .where(or(
        ilike(vehicles.plate, `%${searchTerm}%`),
        ilike(maintenanceLogs.description, `%${searchTerm}%`),
        ilike(maintenanceLogs.technicianName, `%${searchTerm}%`),
        ilike(maintenanceLogs.workshopName, `%${searchTerm}%`),
        !isNaN(parsedId) ? eq(maintenanceLogs.id, parsedId) : undefined
      ))
      .orderBy(desc(maintenanceLogs.reportedAt));
      
    const logIds = [...new Set(plateLogsRaw.map(l => l.logId))];
    
    let logsFull: any[] = [];
    if (logIds.length > 0) {
      logsFull = await db.query.maintenanceLogs.findMany({
        where: inArray(maintenanceLogs.id, logIds),
        with: { vehicle: { columns: { plate: true } } },
        orderBy: [desc(maintenanceLogs.reportedAt)]
      });
    }

    const formattedLogs = logsFull.map(log => ({
      id: log.id,
      maintenanceLogId: log.id,
      vehiclePlate: log.vehicle?.plate || "ไม่ระบุ",
      description: log.description,
      technicianName: log.technicianName || "ไม่ระบุ",
      workshopName: log.workshopName || "ไม่ระบุ",
      status: log.status,
      priority: log.priority,
      reportedAt: log.reportedAt ? log.reportedAt.toISOString() : null,
      dueDate: log.dueDate ? log.dueDate.toISOString() : null,
    }));

    const workshopMap = new Map();
    const technicianMap = new Map();

    formattedLogs.forEach(log => {
      if (log.workshopName !== "ไม่ระบุ") {
        if (!workshopMap.has(log.workshopName)) {
          workshopMap.set(log.workshopName, { name: log.workshopName, totalJobs: 0, successCount: 0, lateCount: 0, efficiencyRate: 100 });
        }
        workshopMap.get(log.workshopName).totalJobs++;
      }
      if (log.technicianName !== "ไม่ระบุ") {
        if (!technicianMap.has(log.technicianName)) {
          technicianMap.set(log.technicianName, { name: log.technicianName, totalJobs: 0, successCount: 0, lateCount: 0, efficiencyRate: 100 });
        }
        technicianMap.get(log.technicianName).totalJobs++;
      }
    });

    return {
      query: searchTerm,
      workshops: Array.from(workshopMap.values()),
      technicians: Array.from(technicianMap.values()),
      logs: formattedLogs,
      total: formattedLogs.length
    };

  } catch (error) {
    console.error("Search Error:", error);
    return null;
  }
}

export async function deleteDataByYear(yearString: string) {
  try {
    const year = parseInt(yearString, 10);
    if (isNaN(year)) throw new Error("Invalid year");
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    
    const result = await db.delete(maintenanceLogs).where(and(
      gte(maintenanceLogs.reportedAt, startDate),
      lte(maintenanceLogs.reportedAt, endDate)
    )).returning({ id: maintenanceLogs.id });
    
    return { success: true, count: result.length };
  } catch (error) {
    console.error("Delete by year error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}

export async function resetDatabase() {
  try {
    const logsResult = await db.delete(maintenanceLogs).returning({ id: maintenanceLogs.id });
    const vehiclesResult = await db.delete(vehicles).returning({ id: vehicles.id });
    
    return { success: true, logsCount: logsResult.length, vehiclesCount: vehiclesResult.length };
  } catch (error) {
    console.error("Reset database error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการรีเซ็ตฐานข้อมูล" };
  }
}