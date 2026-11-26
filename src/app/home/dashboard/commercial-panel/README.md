# WEB-1479: commercial pipeline

## Implemented scope

The dashboard has a lazy Commercial panel alongside the existing Dashboard and Onboarding Board. It retains the application shell and Mifos blue theme. Eight numbered credit-origination phases and departments follow the ticket's order; Recovery remains in the existing nine-stage per-loan view.

The panel reuses `TasksService.getPendingProspects` to display authorized prospect registration records. Search sends the supported `q` parameter (name or external reference), cancels stale requests immediately and debounces new searches for 300 ms. Branch selection sends the verified `officeId` parameter. The existing dashboard offices resolver supplies options; the server remains responsible for tenant and office-hierarchy authorization. Search and branch changes reset pagination. Requests are bounded to 10, 25 or 50 records and ordered deterministically by prospect ID.

Selection updates the latest prospect stage summary. Needs Attention shows only the loaded page's explicitly reported stopped stages, in stable page order. It does not classify these records as overdue, blocked or missing documents. Client-file links require a valid associated client ID and client-read permission. Open client notes additionally requires note-read and note-create permission and navigates to the existing client notes workflow. The dashboard performs no writes.

The component supports keyboard selection, accessible table headers and unknown-state descriptions, request timeout/retry, empty and malformed-response states, destruction cleanup, dark mode, contained table scrolling and a compact eight-step mobile representation. All 14 translation catalogs contain the new labels, phase names, departments, explanations and errors.

**Release limitation:** Identifying prospects overdue by more than 10 days is out of scope for this release, and the ten-day overdue-identification objective is unmet. The source does not provide verified prospect/application links, stage statuses or stage-entry dates. This panel cannot identify overdue prospects; its thresholds are explanatory only. Unavailable data is not evidence that a prospect is on time, overdue or free of issues.

## API audit and precise dependencies

Audit sources: frontend models/services at base `upstream/dev` **809d7d469**, and the locally available Savings Plugin Java contracts in `WEB-1493-savings-plugin`. These are source contracts; live deployment capabilities have not been certified. WEB-1064 could not be retrieved from Jira in this environment.

| Existing contract                                        | Verified evidence                                                                                                                                                                             | Limitation for WEB-1479                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v2/prospects`                                      | `ProspectData`, `ProspectSearchRequest`, `ProspectSearchValidator`, `ProspectReadPlatformServiceImpl`                                                                                         | Returns IDs, reference, name, office/client IDs, registration status, technical dates, latest stage code, last completed stage code, stopped stage code, pending credit count. Does not return a credit-application ID, latest-stage status, stage-entry timestamp, responsible executive, missing requirements or history. |
| Prospect search                                          | Supports `q`, `officeId`, offset, limit and `prospectId` ordering. Maximum search length 100; maximum limit 200. Read permission and authenticated office hierarchy are enforced server-side. | No executive, current-stage aging or waiting-time sorting parameters.                                                                                                                                                                                                                                                       |
| `ProspectStageResolver`                                  | Latest event code becomes `currentStage`; latest non-completed event code becomes `stoppedAtStage`. Codes can include `COMMERCIAL_REGISTRATION` and `KYC_LEVEL_1`.                            | These are prospect event codes, not a verified mapping to the loan board's eight phases. A latest event code is not proof of current phase status.                                                                                                                                                                          |
| `GET /v2/credit-applications/{id}/origination-board`     | Existing `CreditOriginationBoard` and backend `CreditOriginationStageData` supply nine phase snapshots, explicit statuses, `completedOn`, source details, actor and reason when recorded.     | Requires a known application ID. There is no verified prospect-to-application mapping or bounded portfolio board source. `completedOn` is not an entry time; the projection is not complete event history.                                                                                                                  |
| `GET /v2/onboarding/cases` and account acquisition board | Onboarding/acquisition contracts serve a different enrollment/savings process.                                                                                                                | Their stages/timestamps cannot be substituted for the commercial credit pipeline.                                                                                                                                                                                                                                           |
| Existing client notes                                    | Client association is returned by prospect search; existing notes route and service persist against that client.                                                                              | No prospect-specific notification, escalation or document-request delivery contract was found. Notes open in the existing workflow; navigation is not represented as successful persistence.                                                                                                                                |

To enable the full requested dashboard, a backend contract must provide a bounded, tenant/office-authorized portfolio of **unambiguously linked prospect/application cases**, with:

- Explicit current phase and status; each phase's authoritative state, entry time, completion time and blocked/rejected semantics.
- A verified accountable executive/owner assignment and authorized filter options.
- Missing-item evidence and recorded reasons qualified by source; not inferred from lateness or generic failures.
- A verified pipeline start and actual completed disbursement, with the completed cohort and month boundaries defined for counts and averages.
- A reference business date/timezone and verified calendar-day/business-day rule. Calendar-day thresholds requested by the ticket are zero days separately, yellow 1–5, orange 6–10 and red greater than 10; invalid, future and missing timestamps must remain unknown.
- Server-side aging, waiting-duration ordering, completion ordering and aggregates for the same search/office/owner scope, with stable paging and clear completeness.
- An authorized event-history resource if full traceability is required; snapshots must remain labelled summaries.
- Documented notification, document-request and escalation workflows, permission requirements, confirmation and delivery/outcome contracts before any external communication is enabled.

No new backend endpoint or unsupported frontend request parameter is introduced here. No per-client loan fan-out, arbitrary loan choice, registration-to-stage inference, fabricated completion checkmarks or invented duration is used. Technical creation/update dates do not populate the five metrics. Unknown phase states are `?`, distinct from pending. All five metric cards and unsupported filters remain explicitly unavailable. Waiting-time sorting, completed-last sorting, completed-month counts, cycle averages, traffic-light markers, missing-document markers and severity-ranked escalation are blocked by these contracts. The colored legend states thresholds only; it does not assert that a prospect has met them.

## Files

- `src/app/home/dashboard/commercial-panel/`: component, template, theme-aware responsive styles, typed phase/snapshot model and focused tests.
- `src/app/home/dashboard/dashboard.component.{ts,html,spec.ts}`: third-tab integration and existing-tab regression expectations.
- `src/app/tasks/tasks.service.{ts,spec.ts}`: typed office filter and HTTP parameter regression test.
- `src/assets/translations/*.json`: all 14 locale catalogs, with existing per-loan translations preserved.
- `playwright.commercial.config.ts` and `playwright/tests/commercial-pipeline.spec.ts`: isolated mocked browser verification; no production writes.
- This document: contract audit, unavailable scope and verification evidence.

## Verification

Executed on 26 November 2026:

| Check                                                    | Actual result                                                                                                                                                                                                      |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Focused Jest suite                                       | **167 tests passed across 10 suites**. Includes existing Dashboard, Onboarding, Pending Prospects, task service and per-loan origination tests.                                                                    |
| Commercial Playwright suite                              | **20 passed**. All four widths in light and dark themes, with before/after screenshot artifacts.                                                                                                                   |
| `npm run lint`                                           | **Passed**: ESLint, Stylelint, repository Prettier and HTMLHint (875 templates).                                                                                                                                   |
| `npm run build`                                          | **Passed**. Existing browser-support, CommonJS dependency and selector-optimizer warnings remain.                                                                                                                  |
| Header verification with explicit changed-file arguments | **Passed**. The bare script only prints usage.                                                                                                                                                                     |
| `npm run translations:extract`                           | **Passed**. Ignored extraction template generated; all 14 shipped locale catalogs updated and tested.                                                                                                              |
| `git diff upstream/dev --check`                          | **Passed**, with new files also reviewed and captured in the full patch artifact.                                                                                                                                  |
| Whole Playwright TypeScript project                      | **Blocked by two pre-existing errors**: `credits-workspace.spec.ts:548` and `:634`, variable `release` used before assignment. Both reproduced on unmodified base 809d7d469. No new commercial-test errors remain. |
| Live integration and remote CI/review                    | Not certified. Browser tests use intercepted APIs; the full pipeline features require the contracts documented above.                                                                                              |

Reproduce focused checks with:

```sh
npm test -- --runInBand --coverage=false --testPathPattern='commercial-panel|home/dashboard/dashboard|home/dashboard/onboarding|pending-prospects|credit-origination-status|tasks.service.spec'
npm run playwright -- --config playwright.commercial.config.ts
npm run lint
npm run build
npm run headers:check -- src/app/home/dashboard/commercial-panel/*.ts src/app/home/dashboard/commercial-panel/*.html src/app/home/dashboard/commercial-panel/*.scss playwright.commercial.config.ts playwright/tests/commercial-pipeline.spec.ts
npm run translations:extract
npx tsc --noEmit -p tsconfig.playwright.json
```

`headers:check` without file arguments prints usage; explicit changed-file checking is required. `headers:add` was run against new component/model/template/style files. Translation extraction generates the repository-ignored `src/translations/template.json`; the 14 shipped catalogs carry the actual translations.

Playwright uses deterministic synthetic prospects and dates, intercepts backend requests, rejects writes, verifies both old views, eight phase ordering, unavailable metrics/statuses, search, office filters, paging, keyboard selection, links, RBAC, retry, malformed/empty responses and 390/768/1280/1920px light/dark layouts. Date fixtures deliberately cannot produce stage-aging values. Threshold/date-boundary calculations, metric cohorts and status/history rendering from a portfolio feed cannot be integrated or truthfully tested until the dependencies above exist. Existing per-loan origination status tests remain part of the focused regression run.

Screenshots and logs are in the sibling `WEB-1479-evidence` directory and `WEB-1479-*.log` files. Before screenshots use a separate unmodified detached checkout of base 809d7d469. After screenshots use mocked prospect records on this branch; details screenshots account for the application's internal scrolling. Manual before/after screenshots are still required by repository contribution guidance for a future PR.

## Review and publication

The fork remote is `https://github.com/AnvayKharb/web-app.git`, and the branch is `WEB-1479-commercial-pipeline-redesign`. The active PR is [openMF/web-app#4344](https://github.com/openMF/web-app/pull/4344). Its review timeline contains four actionable CodeRabbit findings and no human-maintainer findings at the time of this verification.

| Review finding                                                                                                               | Change                                                                                                                                                          | Regression evidence                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Requested theme was not asserted](https://github.com/openMF/web-app/pull/4344#discussion_r4709798215)                       | Assert the requested `light-theme` or `dark-theme` body class and absence of the opposite class before screenshots.                                             | All eight responsive light/dark cases pass with distinct expected theme states.                                                                                                                                                       |
| [Refresh could strand an out-of-range page](https://github.com/openMF/web-app/pull/4344#discussion_r4709798240)              | For an empty page beyond a valid server total, reload the last valid page. Preserve pages with valid offsets.                                                   | Unit tests cover totals 19, 20 and 0, valid-page retention, and recovery failure/retry. A browser test shrinks 25 records to 19 on page 3 and verifies offset 20 → 10, the total, paginator, selected summary and subsequent refresh. |
| [Empty page contradicted the positive server total](https://github.com/openMF/web-app/pull/4344#discussion_r4709986925)      | After removed-page recovery, reject an empty page whose valid matching total exceeds its offset.                                                                | Unit tests cover first and later valid offsets; browser coverage checks the error state and successful retry. Existing zero-total and removed-page tests remain.                                                                      |
| [Overdue objective was overstated in the PR description](https://github.com/openMF/web-app/pull/4344#discussion_r4709986944) | State explicitly in the README and PR description that overdue identification is out of scope and the ten-day objective is unmet; list only supported features. | Scope statements retain the distinction between unavailable data and confirmed status.                                                                                                                                                |

All four findings are addressed. GitHub review threads are not marked resolved by this change; remote CI and maintainer approval remain separate.

Comparison URL: <https://github.com/openMF/web-app/compare/dev...AnvayKharb:WEB-1479-commercial-pipeline-redesign>. PR creation remains manual; this document does not certify remote CI or maintainer approval.
