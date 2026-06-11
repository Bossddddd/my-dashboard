export interface MaintenanceLog {
  id?: number;
  maintenanceLogId?: number;
  vehiclePlate?: string;
  technicianName?: string;
  teamName?: string;
  locationLabel?: string;
  latitude?: number | null;
  longitude?: number | null;
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

export interface TeamStat {
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
  teamsData: TeamStat[];
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
  teams: TeamStat[];
  technicians: TechnicianStat[];
  logs: MaintenanceLog[];
  total: number;
}
