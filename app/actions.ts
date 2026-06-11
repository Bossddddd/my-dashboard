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

export async function getAllLogsForExport(selectedIds?: number[]) {
  try {
    const conditions = selectedIds && selectedIds.length > 0 
      ? inArray(maintenanceLogs.id, selectedIds) 
      : undefined;

    const data = await db.query.maintenanceLogs.findMany({
      where: conditions,
      columns: {
        id: true,
        status: true,
        priority: true,
        description: true,
        technicianName: true,
        reportedAt: true,
        assignedAt: true,
        startedAt: true,
        completedAt: true,
        dueDate: true,
        teamName: true,
        cost: true,
        latitude: true,
        longitude: true,
        locationLabel: true,
      },
      with: {
        vehicle: { columns: { plate: true } }
      },
      orderBy: [desc(maintenanceLogs.reportedAt)]
    });
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

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

    const query = db.select({ count: count() }).from(maintenanceLogs);
    if (whereClause) query.where(whereClause);
    
    const statusQuery = db.select({ status: maintenanceLogs.status, count: count(maintenanceLogs.id) }).from(maintenanceLogs);
    if (whereClause) statusQuery.where(whereClause);
    
    const priorityQuery = db.select({ priority: maintenanceLogs.priority, count: count(maintenanceLogs.id) }).from(maintenanceLogs);
    if (whereClause) priorityQuery.where(whereClause);
    
    const costQuery = db.select({ sumCost: sum(maintenanceLogs.cost) }).from(maintenanceLogs);
    if (whereClause) costQuery.where(whereClause);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const now = new Date();

    const [
      totalVehiclesRes,
      totalLogsRes,
      statusGroupsRaw,
      priorityGroupsRaw,
      costAggRes,
      recentLogs,
      allLogs,
      overdueLogs
    ] = await Promise.all([
      db.select({ count: count() }).from(vehicles),
      query,
      statusQuery.groupBy(maintenanceLogs.status),
      priorityQuery.groupBy(maintenanceLogs.priority),
      costQuery,
      db.query.maintenanceLogs.findMany({
        where: gte(maintenanceLogs.reportedAt, sixMonthsAgo),
        columns: { reportedAt: true, cost: true }
      }),
      db.query.maintenanceLogs.findMany({
        where: whereClause,
        columns: { 
          id: true, status: true, priority: true, description: true, technicianName: true,
          reportedAt: true, assignedAt: true, startedAt: true, completedAt: true, dueDate: true, teamName: true,
          latitude: true, longitude: true, locationLabel: true
        },
        with: { vehicle: { columns: { plate: true } } }
      })
    ]);

    const totalVehicles = totalVehiclesRes[0]?.count || 0;
    const totalLogs = totalLogsRes[0]?.count || 0;
    const statusGroups = statusGroupsRaw.map(s => ({ _count: { id: s.count }, status: s.status }));
    const priorityGroups = priorityGroupsRaw.map(p => ({ _count: { id: p.count }, priority: p.priority }));
    const costAgg = { _sum: { cost: costAggRes[0]?.sumCost ? parseFloat(costAggRes[0].sumCost) : 0 } };

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

    let totalCompleted = 0;
    let onTimeCompleted = 0;
    let totalResponseTimeMs = 0;
    let responseCount = 0;
    let totalRepairTimeMs = 0;
    let repairCount = 0;
    
    const teamMap = new Map();

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
      const rawTeam = log.teamName ? log.teamName.trim() : "";
      if (rawTeam !== "") {
        if (!teamMap.has(rawTeam)) {
          teamMap.set(rawTeam, {
            name: rawTeam, totalJobs: 0, completedOnTime: 0, completedLate: 0, 
            inProgress: 0, overdueActive: 0, totalRepairTimeMs: 0, repairCount: 0,
            techsMap: new Map(),
            logs: [] 
          });
        }
        const wStats = teamMap.get(rawTeam);
        wStats.totalJobs++;

        const logDataForList = {
          maintenanceLogId: log.id,
          vehiclePlate: log.vehicle?.plate || "ไม่ระบุ",
          description: log.description,
          technicianName: log.technicianName || "ยังไม่ระบุ",
          teamName: log.teamName || "ไม่ระบุ",
          status: log.status,
          priority: log.priority,
          reportedAt: log.reportedAt ? log.reportedAt.toISOString() : "",
          dueDate: log.dueDate ? log.dueDate.toISOString() : "",
          latitude: log.latitude,
          longitude: log.longitude,
          locationLabel: log.locationLabel
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
              name: rawTech, totalJobs: 0, completedOnTime: 0, completedLate: 0, inProgress: 0, overdueActive: 0
            });
          }
          const tStats = wStats.techsMap.get(rawTech);
          tStats.totalJobs++;
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

    let overdueActiveCount = 0;
    for (const log of allLogs) {
      if (log.status !== 'completed' && log.status !== 'cancelled' && log.dueDate && new Date(log.dueDate) < now) {
        overdueActiveCount++;
      }
    }

    const completedLateCount = totalCompleted - onTimeCompleted;
    const onTimeRate = calculateSlaRate(onTimeCompleted, completedLateCount + overdueActiveCount);

    const teamsData = Array.from(teamMap.values()).map((w: any) => {
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
      teamsData,
      allLogs: allLogs.map((l: any) => ({ ...l, vehiclePlate: l.vehicle?.plate || "ไม่ระบุ", reportedAt: l.reportedAt?.toISOString(), assignedAt: l.assignedAt?.toISOString(), startedAt: l.startedAt?.toISOString(), completedAt: l.completedAt?.toISOString(), dueDate: l.dueDate?.toISOString() }))
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
        teamName: row.teamName ? String(row.teamName).trim() : null,
        technicianName: row.technicianName ? String(row.technicianName).trim() : null,
        priority: row.priority ? String(row.priority).trim() : "normal",
        status: row.status ? String(row.status).trim() : "reported",
        category: row.category ? String(row.category).trim() : null,
        description: String(row.description).trim(),
        symptoms: row.symptoms ? String(row.symptoms).trim() : null,
        locationLabel: row.locationLabel ? String(row.locationLabel).trim() : null,
        latitude: row.latitude ? parseFloat(row.latitude) : null,
        longitude: row.longitude ? parseFloat(row.longitude) : null,
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

    const parsedId = parseInt(searchTerm, 10);
    
    const plateLogsRaw = await db.select({ logId: maintenanceLogs.id }).from(maintenanceLogs)
      .leftJoin(vehicles, eq(maintenanceLogs.vehicleId, vehicles.id))
      .where(or(
        ilike(vehicles.plate, `%${searchTerm}%`),
        ilike(maintenanceLogs.description, `%${searchTerm}%`),
        ilike(maintenanceLogs.technicianName, `%${searchTerm}%`),
        ilike(maintenanceLogs.teamName, `%${searchTerm}%`),
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
      teamName: log.teamName || "ไม่ระบุ",
      status: log.status,
      priority: log.priority,
      reportedAt: log.reportedAt ? log.reportedAt.toISOString() : null,
      dueDate: log.dueDate ? log.dueDate.toISOString() : null,
    }));

    const teamMap = new Map();
    const technicianMap = new Map();

    formattedLogs.forEach(log => {
      if (log.teamName !== "ไม่ระบุ") {
        if (!teamMap.has(log.teamName)) {
          teamMap.set(log.teamName, { name: log.teamName, totalJobs: 0, successCount: 0, lateCount: 0, efficiencyRate: 100 });
        }
        teamMap.get(log.teamName).totalJobs++;
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
      Teams: Array.from(teamMap.values()),
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
