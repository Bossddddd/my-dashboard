import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// โหลดไฟล์ .env ตามคำสั่งที่รัน (ถ้าไม่ได้ระบุจะใช้ .env.development เป็นค่าเริ่มต้น)
dotenv.config({ path: process.env.ENV_FILE || ".env.development" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
