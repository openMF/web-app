# Product Roadmap

## Product Name

MifosX Commercial Operations Portal (MCOP)

## Roadmap Strategy

Build a commercial-grade operations portal on top of Apache Fineract without rewriting the core banking system and without forking customer-specific frontends.

## Phase 1: Governance and Stabilization

Goal: Make the repository safe for AI-assisted and human-reviewed development.

Deliverables:

- Project scope.
- AI engineering guidance.
- Development workflow.
- Definition of Done.
- PR checklist.
- Architecture principles.
- Fineract extension guide.
- CI hardening plan.

Exit criteria:

- Repo has clear scope.
- AI developer has clear rules.
- Human approval points are defined.
- CI expectations are clear.

## Phase 2: Dashboard Modernization

Goal: Create a practical executive and operator dashboard.

Deliverables:

- Portfolio summary.
- Collection summary.
- Arrears summary.
- Branch or office performance.
- Loan officer performance.
- Maker-checker pending task summary.
- Explainable risk signal cards.

Exit criteria:

- Dashboard loads after login.
- Existing flows remain unchanged.
- Tenant and authentication headers still work through existing interceptors.
- Loading, empty, and error states exist.

## Phase 3: Client and Loan 360

Goal: Improve operational productivity around clients and loans.

Deliverables:

- Client 360 summary page.
- Loan 360 summary page.
- Repayment behavior indicators.
- Active accounts summary.
- Recent transactions.
- Notes and documents visibility.
- Risk badges that link back to source data.

Exit criteria:

- User can understand client and loan status quickly.
- No core Fineract behavior is changed.
- Permission model remains respected.

## Phase 4: Collection Workspace

Goal: Improve branch and field collection productivity.

Deliverables:

- Due today queue.
- Overdue queue.
- Field officer filter.
- Center or group filter.
- Promise-to-pay marker.
- Collection progress summary.

Exit criteria:

- Collection users can prioritize work faster.
- Existing repayment workflows remain intact.

## Phase 5: RiskOps Lite

Goal: Add explainable operational risk visibility.

Deliverables:

- PAR monitoring.
- Restructure surveillance.
- Renewal and evergreening warning.
- Branch risk view.
- Field officer concentration view.
- Portfolio truth view.

Exit criteria:

- Risk signals are explainable.
- Risk signals link to source loans, clients, or reports.
- No black-box automated decisioning.

## Phase 6: Productivity Layer

Goal: Reduce operator effort and improve speed.

Deliverables:

- Global search improvement.
- Saved views.
- Quick actions.
- Favorites.
- Notification center.
- Improved task center.

Exit criteria:

- Frequent tasks require fewer clicks.
- No existing route regressions.

## Phase 7: AI Copilot

Goal: Add read-only assistant capability.

Deliverables:

- Report explanation.
- Risk explanation.
- Natural language search.
- Contextual help.
- Workflow guidance.

Exit criteria:

- AI cannot approve, post, reverse, disburse, or modify financial data.
- AI answers must cite source screen, report, or data context where possible.

## Phase 8: Commercial Readiness

Goal: Prepare for deployment across institutions.

Deliverables:

- Tenant branding.
- Feature flags.
- Localization.
- Deployment profiles.
- Security checklist.
- Release checklist.
- Monitoring and observability checklist.

Exit criteria:

- App can be deployed consistently.
- Customer differences are handled by config, not forks.
