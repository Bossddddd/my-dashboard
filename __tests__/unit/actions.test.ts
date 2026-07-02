import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllLogsForExport } from "../../app/actions";
import { db } from "../../lib/db";

// Mock next modules
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => ({
    get: vi.fn(),
  })),
}));

// Mock the db
vi.mock("../../lib/db", () => ({
  db: {
    query: {
      maintenanceLogs: {
        findMany: vi.fn(),
      },
      vehicles: {
        findMany: vi.fn(),
      }
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => []),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
    transaction: vi.fn((cb) => cb({
      insert: vi.fn(() => ({
        values: vi.fn(),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(),
        })),
      })),
    })),
  },
}));

// Mock schema
vi.mock("../../db/schema", () => ({
  maintenanceLogs: {
    id: "id",
    status: "status",
  },
  vehicles: {
    id: "id",
  },
  maintenanceHistoryLogs: {
    id: "id",
  }
}));

describe("actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllLogsForExport", () => {
    it("should fetch all logs when no selectedIds are provided", async () => {
      const mockData = [
        { id: 1, status: "OPEN" },
        { id: 2, status: "CLOSED" }
      ];
      
      (db.query.maintenanceLogs.findMany as any).mockResolvedValue(mockData);

      const result = await getAllLogsForExport();

      expect(db.query.maintenanceLogs.findMany).toHaveBeenCalledTimes(1);
      
      // First argument should have a where clause that is undefined (since no IDs passed)
      const callArgs = (db.query.maintenanceLogs.findMany as any).mock.calls[0][0];
      expect(callArgs.where).toBeUndefined();
      
      expect(result).toEqual(mockData);
    });
    
    it("should pass conditions when selectedIds are provided", async () => {
      const mockData = [{ id: 1, status: "OPEN" }];
      
      (db.query.maintenanceLogs.findMany as any).mockResolvedValue(mockData);

      const result = await getAllLogsForExport([1]);

      expect(db.query.maintenanceLogs.findMany).toHaveBeenCalledTimes(1);
      
      const callArgs = (db.query.maintenanceLogs.findMany as any).mock.calls[0][0];
      expect(callArgs.where).toBeDefined(); // inArray creates a condition
      
      expect(result).toEqual(mockData);
    });

    it("should return empty array if db call fails", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      (db.query.maintenanceLogs.findMany as any).mockRejectedValue(new Error("DB Error"));

      const result = await getAllLogsForExport();
      
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
