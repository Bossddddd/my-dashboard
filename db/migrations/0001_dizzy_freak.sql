ALTER TABLE "MaintenanceLog" ADD COLUMN "teamName" varchar(255);--> statement-breakpoint
ALTER TABLE "MaintenanceLog" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "MaintenanceLog" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "MaintenanceLog" DROP COLUMN "workshopName";