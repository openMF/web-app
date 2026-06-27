# AI Engineering Guidance for MifosX Web App

Role: Chief Software Engineer / Senior Angular Engineer / Apache Fineract and Microfinance CBS Product Engineer.

Scope: This guidance is for `nandahtoon/Mifosx-web-app` only.

## Core Decision

Keep Angular. Do not rewrite the application in React or another frontend stack.

This repo already contains many working MifosX and Apache Fineract business flows. The safest commercial path is incremental modernization, not full replacement.

## Engineering Guardrails

1. Do not rewrite the whole app.
2. Do not break existing Fineract API compatibility.
3. Preserve tenant header, authentication, routing, permissions, accounting, client, group, loan, savings, reports, and maker-checker flows.
4. Use existing services and interceptors before creating new patterns.
5. Keep pull requests small and reviewable.
6. Avoid AI-generated bloat, unused abstractions, and unrelated formatting churn.
7. Do not hardcode institution data, tenant names, credentials, or deployment-specific values.
8. Do not mix Odoo or separate RiskOps products into this repo unless explicitly requested.

## Current Repo Strengths

- Angular 20 foundation.
- Angular Material UI stack.
- Jest, Playwright, ESLint, Stylelint, Prettier, and HTMLHint are present.
- Runtime environment configuration exists.
- Fineract API prefix interceptor exists.
- Tenant and authorization headers are already handled by interceptors.
- Basic, OAuth, and OIDC authentication paths exist.

## Current Improvement Areas

1. Dashboard and home experience are still not modern enough for MFI executives and operators.
2. Production tenant and server switching should be hardened.
3. Authentication and session storage should receive a production security review.
4. CI should avoid lockfile regeneration fallback.
5. AI development should avoid touching many unrelated modules at once.

## Recommended Development Sequence

### Phase 1: Stabilization

Goal: Make the repo safe for continuous AI-assisted development.

Tasks:

- Run `npm ci`.
- Run `npm run lint`.
- Run `npm run test:ci`.
- Run `npm run build:prod`.
- Remove CI fallback that deletes `package-lock.json` and runs `npm install`.
- Document local run steps against demo or local Fineract.

Definition of Done:

- Install is reproducible.
- Lint passes.
- Tests pass.
- Production build passes.
- CI fails cleanly if lockfile is inconsistent.

### Phase 2: Modern Dashboard

Goal: Build a practical MFI dashboard without changing existing CBS workflows.

Recommended widgets:

- Portfolio summary.
- Collection summary.
- Arrears and overdue summary.
- Office or branch performance.
- Loan officer performance.
- Pending maker-checker tasks.
- Simple explainable risk signals.

Technical guidance:

- Use existing Fineract API/report endpoints first.
- Use existing authentication and tenant interceptors.
- Keep UI widgets reusable and dumb.
- Keep API and data transformation logic in services.
- Add loading, empty, and error states.

Suggested structure:

```text
src/app/dashboard/
  dashboard.module.ts
  dashboard-routing.module.ts
  dashboard.component.ts
  dashboard.component.html
  dashboard.component.scss
  dashboard.service.ts
  components/
    kpi-card/
    collection-summary/
    branch-performance-table/
    risk-signal-card/
```

Definition of Done:

- Dashboard loads after login.
- Existing routes still work.
- Tenant and auth headers still work through interceptors.
- Empty and error states are handled.
- Build and lint pass.

### Phase 3: Operator Productivity UX

Goal: Improve real microfinance daily work.

Priority areas:

- Client 360 summary.
- Loan account action panel.
- Collection queue.
- Maker-checker task center.
- Faster search and navigation.

Rules:

- Do not change core business behavior without explicit approval.
- Respect existing permission model.
- Keep changes incremental.

### Phase 4: Explainable Risk Visibility

Goal: Add simple risk visibility using available Fineract data.

Recommended indicators:

- Rescheduled or restructured loans.
- Repeated term extensions.
- Overdue after restructure.
- High arrears concentration.
- Office or loan officer risk concentration.

Rules:

- Start with explainable rule-based indicators.
- Do not claim machine learning unless a real model/service exists.
- Each risk signal should link back to source loan, client, or report data.
- Do not automate lending decisions.

## API Development Guidance

Do:

- Use relative URLs for Fineract API calls.
- Let existing interceptors add API prefix, tenant, and auth headers.
- Add typed interfaces for new responses.
- Keep external integrations isolated.

Do not:

- Hardcode full API URLs inside components.
- Duplicate auth and tenant headers in every service.
- Place API calls directly inside visual components.
- Store deployment-specific values in source code.

## UI Direction

The target UI should feel like a modern commercial CBS console:

- Clean.
- Fast.
- Dense but readable.
- Practical for branch, credit, collection, and management users.
- Accessible and responsive.
- Focused on action and productivity.

Avoid flashy decoration, excessive animations, and experimental UI that slows down operations.

## AI Developer Checklist Before Coding

Before making changes, answer:

1. What business problem is being solved?
2. Which existing module or service already supports this?
3. Which Fineract API or report endpoint will be used?
4. What existing workflow could break?
5. What is the smallest safe PR?

After making changes, report:

1. Files changed.
2. Routes affected.
3. APIs used.
4. Tests run.
5. Known limitations.
6. Screenshots for UI changes.

## First Recommended GitHub Issue

Title:

Modernize MifosX Dashboard with Portfolio, Collection, and Risk Summary Widgets

Scope:

- Create or modernize dashboard route.
- Add KPI cards and dashboard service.
- Use existing Fineract API or report endpoints.
- Add loading, empty, and error states.
- Do not modify client, loan, savings, or accounting workflows.

Definition of Done:

- Dashboard is visible after login.
- Production build passes.
- Lint passes.
- No unrelated modules changed.
- Tenant and authentication behavior remains unchanged.

## Final Direction

This repo should become a commercial-grade, productivity-focused MifosX web app with practical risk visibility. Keep the system simple, reliable, and safe for real microfinance operations.
