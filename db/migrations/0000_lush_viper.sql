CREATE TABLE "MaintenanceLog" (
	"id" serial PRIMARY KEY NOT NULL,
	"priority" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"symptoms" text,
	"projectId" integer,
	"projectName" varchar(255),
	"workshopName" varchar(255),
	"technicianName" varchar(255),
	"category" varchar(255),
	"locationLabel" varchar(255),
	"reportedAt" timestamp DEFAULT now() NOT NULL,
	"assignedAt" timestamp,
	"acceptedAt" timestamp,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"dueDate" timestamp,
	"cost" double precision,
	"vehicleId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Vehicle" (
	"id" serial PRIMARY KEY NOT NULL,
	"plate" varchar(255) NOT NULL,
	"brand" varchar(255),
	"model" varchar(255),
	CONSTRAINT "Vehicle_plate_key" UNIQUE("plate")
);
--> statement-breakpoint
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_vehicleId_Vehicle_id_fk" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE cascade ON UPDATE no action;