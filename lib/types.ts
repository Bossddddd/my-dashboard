export interface MaintenanceLog {
  id?: number;
  maintenanceLogId?: number;
  vehiclePlate?: string;
  technicianName?: string;
  workshopName?: string;
  priority: string; 
  status: string;   
  description: string;
  reportedAt?: string | null;
  dueDate?: string | null;
}

export interface VehicleRecord {
  vehicleId: number;
  vehiclePlate?: string;
  plate?: string;
  brand?: string;
  model?: string;
  maintenanceHistory: MaintenanceLog[];
}

export interface TechnicianStat {
  name: string;
  totalJobs: number;
  successCount: number;
  inProgressCount: number;
  lateCount: number;
  efficiencyRate: number;
  logs: MaintenanceLog[];
}

export interface WorkshopStat {
  name: string;
  logs?: MaintenanceLog[];
  avgRepairHours?: number;
  totalJobs: number;
  successCount: number;
  inProgressCount: number;
  lateCount: number;
  efficiencyRate: number;
  technicians: TechnicianStat[];
}

export interface DashboardStatsData {
  totalJobs: number;
  successCount: number;
  inProgressCount: number;
  lateCount: number;
  workshopsData: WorkshopStat[];
  overallEfficiency: number;
  totalVehicles?: number;
  totalLogs?: number;
  totalCost?: number;
  efficiency?: any;
  monthlyStats?: any;
  overdueTasks?: any[];
  statusCounts?: any;
  priorityCounts?: any;
}

export interface DashboardSearchResults {
  query: string;
  workshops: WorkshopStat[];
  technicians: TechnicianStat[];
  logs: MaintenanceLog[];
  total: number;
}
