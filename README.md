# 🚗 Dashboard Maintenance Project

Welcome to the **Dashboard Maintenance** project! This is a modern, fast, and responsive web application built with **Next.js 16**, **React 19**, and styled with **Tailwind CSS**. It is designed to manage and monitor vehicle maintenance logs, technicians, and workshop data efficiently.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** [Neon (Serverless Postgres)](https://neon.tech/)
- **Testing:** [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (Unit/Integration) + [Playwright](https://playwright.dev/) (E2E)

---

## 🚀 CI/CD Pipeline (Automated Workflows)

We have a robust Continuous Integration and Continuous Deployment (CI/CD) pipeline configured via **GitHub Actions** (`.github/workflows/ci.yml`).
Every time code is pushed to the `main` branch or a Pull Request is created, the following automated steps are executed sequentially to ensure code quality:

| ลำดับ | ชื่อระบบ (Job Name)          | เครื่องมือที่ใช้ (Tools)       | หน้าที่การทำงาน (Description)                                                           |
| :---- | :--------------------------- | :----------------------------- | :-------------------------------------------------------------------------------------- |
| **1** | **Lint Check**               | `ESLint`                       | ตรวจสอบมาตรฐานการเขียนโค้ดและค้นหาข้อผิดพลาดทาง Syntax เบื้องต้น                        |
| **2** | **Type Check**               | `TypeScript` (`tsc`)           | ตรวจสอบความถูกต้องของชนิดตัวแปร (Types) ทั้งหมดในโปรเจค                                 |
| **3** | **Unit & Integration Tests** | `Vitest` + `React Testing Lib` | รันชุดทดสอบระดับฟังก์ชันและคอมโพเนนต์ พร้อมออกรายงาน Code Coverage                      |
| **4** | **Database Migration**       | `Drizzle Kit`                  | อัปเดตโครงสร้างฐานข้อมูล (Schema) ใน Test Database ให้เป็นเวอร์ชันล่าสุด                |
| **5** | **Build App**                | `Next.js Build`                | ทดลองจำลองการ Build โปรเจคเสมือนขึ้น Server จริง เพื่อหาข้อผิดพลาด                      |
| **6** | **End-to-End (E2E) Tests**   | `Playwright`                   | จำลองบอทผู้ใช้งานจริงเพื่อคลิกและทดสอบ Flow การทำงานหลักบนหน้าเว็บ                      |
| **7** | **Deployment**               | `Vercel`                       | _(ทำงานอัตโนมัติ)_ หากผ่านขั้นตอนที่ 1-6 ทั้งหมด Vercel จะดึงโค้ดไปอัปเดตบนหน้าเว็บจริง |

> **💡 หมายเหตุ:** หากขั้นตอนใดขั้นตอนหนึ่งทำงานล้มเหลว (Failed) ระบบจะหยุดการทำงานของขั้นตอนถัดไปทันที เพื่อป้องกันไม่ให้บั๊กหลุดไปถึงผู้ใช้งานจริง

---

## 💻 Getting Started (Local Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.development` or `.env` file in the root directory and add your database URL:

```env
DATABASE_URL="postgresql://user:password@host/database"
```

### 3. Database Commands

Push your schema to the database:

```bash
npm run db:push:dev
```

Open Drizzle Studio to view your database:

```bash
npm run db:studio:dev
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🧪 Testing Commands

You can manually run the automated tests locally before pushing your code:

- **Run Unit & Integration Tests:**
  ```bash
  npm run test
  ```
- **Run Tests with Coverage Report:**
  ```bash
  npm run test:coverage
  ```
- **Run End-to-End (E2E) Tests:**
  ```bash
  npx playwright test
  ```
- **View E2E Test Report (HTML):**
  ```bash
  npx playwright show-report
  ```
