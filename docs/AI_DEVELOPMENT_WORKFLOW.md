# AI Development Workflow

## Purpose

This workflow keeps AI-assisted development safe, reviewable, and commercially useful.

The goal is not full automation. The goal is high-productivity AI execution with human approval at key decision points.

## Workflow

```text
Business Request
      |
      v
Chief Engineer Analysis
      |
      v
Human Approval
      |
      v
AI Development Plan
      |
      v
Small Feature Branch
      |
      v
Code Change
      |
      v
Lint / Test / Build
      |
      v
AI Self Review
      |
      v
Human Review
      |
      v
Merge
      |
      v
Post-Merge Documentation
```

## Human-in-the-Loop Gates

## Gate 1: Requirement Approval

Before coding, a human must approve:

- Business purpose.
- User value.
- Scope.
- Acceptance criteria.
- Out-of-scope items.

## Gate 2: Architecture Approval

Before significant implementation, a human must approve:

- Proposed module location.
- API approach.
- Reuse of existing services.
- Impact on existing MifosX/Fineract flows.
- Risk and rollback plan.

## Gate 3: Merge Approval

Before merge, a human must verify:

- Feature works as expected.
- Existing flows are not broken.
- Business logic is correct.
- Tests/build pass.
- Documentation is updated.

## AI Developer Rules

Before coding, AI must answer:

1. What business problem is being solved?
2. Which existing module already supports part of this?
3. Which Fineract API/report endpoint will be used?
4. What existing workflow could break?
5. What is the smallest safe PR?

During coding, AI must:

- Reuse existing patterns.
- Keep changes small.
- Avoid unrelated formatting changes.
- Avoid dead code.
- Avoid customer-specific branches.
- Preserve tenant and auth behavior.

After coding, AI must report:

1. Files changed.
2. Routes affected.
3. APIs used.
4. Tests run.
5. Known limitations.
6. Screenshots if UI changed.

## Branch Naming

Use:

- `feature/<short-name>`
- `fix/<short-name>`
- `docs/<short-name>`
- `refactor/<short-name>`
- `chore/<short-name>`

## PR Size Rule

Prefer small PRs.

A PR should normally change one feature area only.

Avoid PRs that mix:

- UI redesign.
- API change.
- refactoring.
- dependency upgrade.
- formatting cleanup.

## Forbidden AI Behaviors

AI must not:

- Rewrite the app.
- Replace Angular without approval.
- Bypass Fineract permissions.
- Store secrets in source code.
- Hardcode tenant-specific values.
- Change accounting or transaction behavior without explicit approval.
- Claim AI/ML functionality where only rule-based logic exists.

## Required Checks

Before PR is ready:

```bash
npm ci
npm run lint
npm run test:ci
npm run build:prod
```

If a command cannot be run, the PR must state why.
