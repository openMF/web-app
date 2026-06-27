# Definition of Done

A feature, fix, or documentation change is done only when it meets all applicable criteria below.

## 1. Business Criteria

- The business problem is clearly stated.
- Acceptance criteria are met.
- Out-of-scope items are not added silently.
- The change is reusable and not customer-specific.

## 2. Fineract Compatibility

- Existing Apache Fineract API behavior is preserved.
- Tenant header behavior is preserved.
- Authentication behavior is preserved.
- Permissions are respected.
- Existing client, loan, savings, group, accounting, report, and maker-checker flows are not broken.

## 3. Architecture Criteria

- Existing services and patterns are reused where practical.
- New logic is placed in the correct module.
- UI components do not contain avoidable business logic.
- API calls are isolated in services.
- Shared components are reusable and not duplicated.
- No full rewrite or unrelated refactor is included.

## 4. Code Quality

- Code is simple and readable.
- No unused code.
- No avoidable duplication.
- No unrelated formatting churn.
- No hardcoded deployment values.
- No secrets in source code.

## 5. UX Criteria

All new user-facing screens or widgets must handle:

- Loading state.
- Empty state.
- Error state.
- Permission-restricted state where applicable.
- Responsive layout where practical.

## 6. RiskOps Criteria

For risk-related features:

- Signal logic is explainable.
- Source data is traceable.
- No black-box decisioning is introduced.
- No autonomous credit, accounting, or transaction action is performed.

## 7. Test and Build Criteria

Required checks:

```bash
npm ci
npm run lint
npm run test:ci
npm run build:prod
```

If any check cannot be run, the PR must state the reason.

## 8. Documentation Criteria

- Relevant documentation is updated.
- PR includes changed files summary.
- PR includes affected routes.
- PR includes APIs or report endpoints used.
- PR includes known limitations.
- Screenshots are included for UI changes.

## 9. Human Approval

A human reviewer must approve:

- Business correctness.
- Architecture fit.
- UI/UX acceptability.
- Merge readiness.

## 10. Release Readiness

Before release:

- Smoke test path is known.
- Rollback path is clear.
- No critical unresolved defects.
- Deployment configuration is understood.
