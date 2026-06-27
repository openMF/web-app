# Human Approval Checklist

## Purpose

This checklist ensures AI-assisted development remains under human control for business, architecture, security, and release decisions.

## Approval Gate 1: Requirement

Approve only if:

- The business problem is clear.
- The target users are clear.
- The feature is reusable across institutions.
- Acceptance criteria are defined.
- Out-of-scope items are listed.
- The request does not require a core banking rewrite.

## Approval Gate 2: Architecture

Approve only if:

- The change fits the approved project scope.
- Existing MifosX/Fineract patterns are reused.
- The proposed module location is correct.
- API usage is clear.
- Tenant and authentication behavior remains unchanged.
- Permission impact is understood.
- Rollback path is understood.

## Approval Gate 3: Business Logic

Approve only if:

- Loan, savings, accounting, client, group, and collection behaviors remain correct.
- Risk signals are explainable.
- No hidden automated decisioning is introduced.
- No financial transaction behavior changes without explicit approval.

## Approval Gate 4: UI/UX

Approve only if:

- Users can complete the workflow efficiently.
- Important data is visible and understandable.
- Loading, empty, and error states are acceptable.
- Responsive behavior is acceptable.
- Risk or warning indicators are labeled clearly, not only by color.

## Approval Gate 5: Merge

Approve only if:

- CI checks pass or exceptions are documented.
- PR summary is complete.
- Changed files are reasonable.
- No unrelated changes are included.
- Documentation is updated.
- Screenshots are attached for UI changes.

## Approval Gate 6: Release

Approve only if:

- Smoke test path is clear.
- Rollback path is clear.
- Deployment configuration is known.
- Critical defects are resolved.
- Production support impact is understood.
