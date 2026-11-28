# Onboarding Board developer notes

## Operational tasks and optional enrollment consultation

The tab opens with the pending client, loan and savings task list. Loan links use the `LoanAccountData.group.id` owner when there is no client owner; savings links use `SavingsAccountData.groupId`. Missing owner names are normalized and records without a valid owner have no navigation link. Task aging retains the existing submission-date calculation; it is separate from enrollment-stage aging.

Enrollment evidence is an optional, collapsed consultation below the tasks. It requires the savings plugin, not standard Apache Fineract. Set `MIFOS_ENABLE_ENROLLMENT_PIPELINE=true` in a deployed environment, or `window.env.enableEnrollmentPipeline=true` in the local runtime configuration, only where that plugin is installed. The flag defaults to false in development and production. No enrollment request runs until the enabled consultation is opened; it is not an authorization boundary.

The existing `TasksService.getEnrollmentCases` calls `GET /v2/onboarding/cases?view=enrollment` with only `view`, `clientId`, `limit` and `offset`. Errors are handled locally, including an inline unavailable message for 404 responses, without a duplicate global alert. The server remains responsible for tenant and office-hierarchy authorization. Frontend checks require both READ_CLIENT and READ_ENROLLMENT_STATUS, or the applicable all-functions read grant.

## Supported evidence and limits

This consultation is a read-only client enrollment projection, not the complete WEB-1480 prospect workflow. It includes active clients. Its single count, search and office filter apply only to the loaded page; the server total is separately labelled. Client IDs are not treated as prospect IDs or folios.

| Stage                                 | Mapping                                                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KYC                                   | Recorded `derivedKycStatus` from a verification: approved, pending, in progress, in review, or declined/rejected.                                             |
| PLD                                   | Approved AML evidence only when present, APPROVED and successful. NOT_APPROVED does not establish a PLD alert or block.                                       |
| Biometric                             | Approved face-match evidence only when present, APPROVED and successful.                                                                                      |
| Account level, card, internal control | Unknown: no authoritative assignment, card decision or final-review decision exists in the projection. Activation and generic KYC levels are not equivalents. |

Verification updates are recorded timestamps, not stage-entry times or generated audit events. The status summary is not a historical timeline. Needs Attention shows only recorded KYC review/rejection decisions on the loaded page. Notes and enrollment-status actions use the existing authorized client routes; the board sends no compliance decisions, notifications or escalations.

Portfolio-wide onboarding/aging/PLD metrics, current-stage aging, overdue identification, executive/account-level/status filters, N1/N2/N3 chips and issued/no-card decisions require additional authoritative contracts. Unsupported summary cards and filter controls are omitted. The full WEB-1480 objectives remain unmet; reduced scope requires maintainer agreement on the issue. The existing Dashboard and Commercial Panel remain separate.

## Tests

Synthetic Jest fixtures cover permissions, scope changes, debounce/selection races, timestamps, identity validation, canonical duplicate IDs, nullable owner names and client/group task routes. Focused Playwright tests cover task-first access, the deployment opt-in, lazy enrollment requests, inline errors without global alerts, responsive layouts, themes, filtering and authorized navigation.

```sh
npm test -- --runInBand --coverage=false --testPathPattern='/onboarding-board/|/commercial-panel/|/dashboard.component.spec.ts$|/dashboard-translations.spec.ts$|/tasks.service.spec.ts$|/clients-view/enrollment-status/'
npm run playwright -- --config playwright.onboarding.config.ts
npm run lint
npm run build
```
