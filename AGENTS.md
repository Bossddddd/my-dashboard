<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# 🚀 CI/CD Pipeline & Deployment Guidelines

You are assisting with a Next.js project that uses a strict CI/CD pipeline configured via GitHub Actions and Vercel CLI. **You must strictly follow these rules to avoid breaking the deployment flow.**

## 🏗️ Architecture Overview
- **Hosting:** Vercel (Auto-deploy is explicitly DISABLED. Deployments are triggered strictly by GitHub Actions via Vercel CLI).
- **Database:** Neon (PostgreSQL) managed with Drizzle ORM.
- **Testing:** Vitest (Unit), Playwright (E2E / Smoke Test).
- **Monitoring:** Sentry.

## 🛤️ Workflow Branches & Pipelines
The project uses 2 separate GitHub Actions workflows broken down into 4 sequential jobs for graph visualization:

### 1. Staging Pipeline (Branch: `dev`)
Runs when code is pushed/merged to the `dev` branch.
- **Job 1 (Quality & Build):** Runs `eslint`, `tsc`, `vitest`, and `next build`.
- **Job 2 (DB Migration):** Runs `drizzle-kit push` to the `TEST_DATABASE_URL`.
- **Job 3 (E2E Tests):** Runs full Playwright E2E tests simulating user interactions (Create, Read, Update, Delete).
- **Job 4 (Deployment):** Deploys to Vercel Preview environment using Vercel CLI.

### 2. Production Pipeline (Branch: `main`)
Runs when code is pushed/merged to the `main` branch.
- **Job 1 (Quality & Build):** Runs `eslint`, `tsc`, `vitest`, and `next build`.
- **Job 2 (DB Migration):** Runs `drizzle-kit push` to the `PROD_DATABASE_URL`.
- **Job 3 (Smoke Tests):** Runs `npx playwright test tests/smoke.spec.ts`. **(Read-only test. Do NOT add mutating actions here to avoid corrupting production data).**
- **Job 4 (Deployment):** Deploys to Vercel Production environment using Vercel CLI.

## ⚠️ STRICT RULES FOR AI AGENTS:
1. **DO NOT modify the structure of the YAML workflows.** They are intentionally split into 4 separate jobs (with `needs:` dependencies) to render a visual graph in GitHub Actions. Do not merge them back into a single job.
2. **Database Changes:** If you modify the Drizzle schema, keep in mind that `drizzle-kit push` runs automatically in CI/CD. Ensure schema changes are safe and won't drop production data.
3. **Writing Tests:** Any new UI feature MUST be covered by Playwright E2E tests. However, do NOT add write/delete operations to `smoke.spec.ts` as it runs against the production database.
4. **Environment Variables:** The CI/CD relies on GitHub Secrets (`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`, `TEST_DATABASE_URL`, `PROD_DATABASE_URL`). Do not assume these are present locally or try to hardcode them.
