# 🚗 Dashboard Maintenance Project

Welcome to the **Dashboard Maintenance** project! This is a modern, fast, and responsive web application built with **Next.js 15**, **React 19**, and styled with **Tailwind CSS v4**. It is designed to manage and monitor vehicle maintenance logs, technicians, and workshop data efficiently.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** [Neon (Serverless Postgres)](https://neon.tech/)
- **Testing:** [Vitest](https://vitest.dev/) (Unit/Integration) & [Playwright](https://playwright.dev/) (E2E)
- **Monitoring & Error Tracking:** [Sentry](https://sentry.io/)

---

## 🚀 CI/CD Pipeline (GitHub Actions)

We have a robust Continuous Integration and Continuous Deployment (CI/CD) pipeline configured via **GitHub Actions**. The pipeline is strictly divided into two distinct environments to ensure stability and quality before reaching production.

| Workflow File | Branch | Description |
| :--- | :--- | :--- |
| **`staging-pipeline.yml`** | `dev` | Runs full testing and database migrations against the Test Database, and deploys to Vercel Preview. |
| **`production-pipeline.yml`** | `main` | Runs smoke (read-only) tests against the Production Database, and deploys to Vercel Production. |

### 🔄 Pipeline Jobs (Sequential Execution)

Both pipelines execute the following 4 jobs sequentially. If any job fails, the pipeline halts immediately.

1. **01 - Quality & Build:** Runs `eslint`, TypeScript type checking (`tsc --noEmit`), `vitest` unit tests with coverage, and compiles the Next.js build.
2. **02 - Database Migration:** Pushes schema changes to Neon DB using `drizzle-kit push`.
3. **03 - E2E / Smoke Tests:** Runs UI automated tests using **Playwright**. (Staging runs full CRUD E2E tests, while Production runs read-only Smoke tests to prevent mutating live data).
4. **04 - Deployment:** Deploys the application directly using the Vercel CLI.

> **✨ Detailed Job Summaries:** Our pipelines are configured to output rich markdown summaries directly on the GitHub Actions UI. This includes **Vitest Coverage Tables**, **Next.js Bundle Route Sizes**, and **Playwright Execution Logs**.

---

## 🧠 Smart Data Import (Upsert)

The system features an intelligent Excel/CSV upload system for maintenance logs:
- **Auto-Translation:** Supports uploading files with either English headers (`plate`, `description`) or Thai headers exported from the system (`ทะเบียนรถ`, `รายละเอียด/อาการ`).
- **Smart Upsert:** If an uploaded row contains an existing Job ID (`รหัสใบงาน`), the system will safely **Update (Overwrite)** the existing record instead of duplicating it. New rows without IDs are automatically **Inserted**.

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

Push your schema to the development database:

```bash
npm run db:push:dev
```

Open Drizzle Studio to view and manage your database visually:

```bash
npm run db:studio:dev
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running.

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
