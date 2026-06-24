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

We have a robust Continuous Integration and Continuous Deployment (CI/CD) pipeline configured via **GitHub Actions** in `.github/workflows/`. The pipeline is split into 3 sequential workflows to improve modularity and observability:

![CI/CD Pipeline Diagram](/ci-cd-diagram.png)

| ไฟล์ Workflow | ชื่อระบบ (Job Name) | เครื่องมือ (Tools) | หน้าที่การทำงาน |
| :--- | :--- | :--- | :--- |
| **`01-code-quality.yml`** | **Lint & Type Check**<br>**Unit Tests** | `ESLint`, `TypeScript`<br>`Vitest`, `React Testing Lib` | ทำงานทันทีเมื่อมีการ Push หรือ PR ตรวจสอบ Syntax, Types และรัน Unit Test |
| **`02-database.yml`** | **Database Migration** | `Drizzle Kit` | ทำงานต่อจาก 01 อัปเดตโครงสร้างฐานข้อมูล (Schema) ให้พร้อมสำหรับ E2E |
| **`03-e2e-tests.yml`** | **Build & E2E Tests** | `Next.js Build`<br>`Playwright` | ทำงานต่อจาก 02 จำลองการ Build ระบบและใช้บอททดสอบการใช้งานจริง (UI Testing) |
| *(อัตโนมัติ)* | **Deployment** | `Vercel` | หากผ่านขั้นตอนทั้งหมด โค้ดจะถูกดึงไปอัปเดตบน Vercel Production/Preview อัตโนมัติ |

### 🔄 Workflow: Development to Production
กระบวนการทำงานของเราถูกออกแบบให้แบ่งออกเป็น 2 ระยะ (Phase) ดังภาพรวมด้านบน:

1. **Development Phase (ช่วงกำลังพัฒนา)**
   - ทีมงานเขียนโค้ดและ **Push** งานขึ้นไปยังสาขา (Branch) `dev`
   - ระบบ CI Pipeline (01, 02, 03) จะทำงานอัตโนมัติเพื่อตรวจสอบ Syntax, รัน Test และเช็คบั๊ก
   - หากรันผ่านทั้งหมด Vercel จะดึงไปสร้าง **Preview Deployment** เพื่อให้ทีมงานสามารถคลิกเข้าไปทดสอบหน้าเว็บจาก URL ชั่วคราวได้
   - *หากมีจุดไหนพัง (Fail) นักพัฒนาจะต้องแก้ไขโค้ดและ Push ใหม่ให้ผ่าน*

2. **Production Phase (ช่วงเปิดให้คนนอกใช้งานจริง)**
   - เมื่องานบน `dev` ถูกตรวจสอบและอนุมัติแล้ว จะทำการ **Merge (รวมโค้ด)** จาก `dev` เข้าสู่สาขา `main`
   - ระบบ CI Pipeline จะรันซ้ำอีกครั้งบน `main` เพื่อ Double-check ความปลอดภัยสูงสุด
   - หากเรียบร้อย Vercel จะดึงไปสร้าง **Production Deployment** เพื่ออัปเดตระบบจริงให้ทุกคนได้ใช้งานทันที

> **💡 หมายเหตุ:** หากขั้นตอนใดใน CI Pipeline ทำงานล้มเหลว (Failed) ระบบจะหยุดการทำงานของ Workflow ถัดไปทันที เพื่อป้องกันไม่ให้บั๊กหลุดไปถึงผู้ใช้งานจริง

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
