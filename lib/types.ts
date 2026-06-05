export interface MaintenanceLog {
  maintenanceLogId: number;
  vehiclePlate?: string;
  technicianName?: string;
  workshopName?: string;
  priority: string; 
  status: string;   
  description: string;
  reportedAt: string;
  dueDate: string;
}

export interface VehicleRecord {
  vehicleId: number;
  vehiclePlate: string;
  brand?: string;
  model?: string;
  maintenanceHistory: any[];
}

export interface DashboardSearchResults {
  query: string;
  workshops: any[];
  technicians: any[];
  logs: any[];
  total: number;
}
