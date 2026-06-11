import { pgTable, serial, varchar, text, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const vehicles = pgTable("Vehicle", {
  id: serial("id").primaryKey(),
  plate: varchar("plate", { length: 255 }).notNull().unique("Vehicle_plate_key"),
  brand: varchar("brand", { length: 255 }),
  model: varchar("model", { length: 255 }),
});

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  logs: many(maintenanceLogs),
}));

export const maintenanceLogs = pgTable("MaintenanceLog", {
  id: serial("id").primaryKey(),
  priority: varchar("priority", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  description: text("description").notNull(),
  symptoms: text("symptoms"),
  projectId: integer("projectId"),
  projectName: varchar("projectName", { length: 255 }),
  teamName: varchar("teamName", { length: 255 }),
  technicianName: varchar("technicianName", { length: 255 }),
  category: varchar("category", { length: 255 }),
  locationLabel: varchar("locationLabel", { length: 255 }),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  reportedAt: timestamp("reportedAt").defaultNow().notNull(),
  assignedAt: timestamp("assignedAt"),
  acceptedAt: timestamp("acceptedAt"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  dueDate: timestamp("dueDate"),
  cost: doublePrecision("cost"),
  vehicleId: integer("vehicleId").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
});

export const maintenanceLogsRelations = relations(maintenanceLogs, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [maintenanceLogs.vehicleId],
    references: [vehicles.id],
  }),
}));
