# WEB-1264 guarded foreign currency UI verification

Verified locally on 2026-10-22 against savings-plugin commit `7e38b329b34d9bf0f5cc0586248d55110e022cb8` (version `1.16.0-SNAPSHOT`, Java 25). The frontend baseline is `095571059d99ace31c9a7558318a45eb7e6e5721` on `upstream/dev`.

**Overall: PARTIALLY VERIFIED.** Administrative rate drafts and read-only teller workflows are implemented. Operational foreign currency processing remains blocked by the backend's institutional policy guards.

## Implemented behavior

- `/organization/foreign-currency/rates`: permission-aware organization navigation, branch/date selection, exact draft values, server preview-token review, immutable draft confirmation, persisted version retrieval, audit history and pagination.
- `/organization/base-teller/foreign-currency`: permission-aware Base Teller → Other Operations navigation, authenticated cashier context, customer lookup, purchase/sale tabs, configured denominations, actual inventory and incomplete read-only previews.
- A unique backend candidate is preselected. Administration initially displays the latest persisted draft and audit. Neither action submits a write automatically.
- Customer, field and mode changes invalidate prior previews. Late responses cannot attach to changed inputs.
- The Material UI uses existing theme tokens, responsive customer/details/denomination sections, a preview summary, collapsible policy approvals, loading feedback, localized errors and an explanatory missing-drawer state.
- Exact decimal request/response tokens reuse the existing cash-exchange parser and money formatter. No national currency, rate formula or conversion is invented.
- All 14 locale files contain the same 102 nonempty FX translation messages.
- The FX service has no execution, publication or completed-receipt methods. Disabled actions explain the backend restrictions.

See [API-CONTRACT.md](./API-CONTRACT.md) for actual endpoint paths, request/response DTOs, permissions, validation, errors and financial guards.

## Validation results

| Check                              | Result                                                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Frontend regression                | 641 tests passed across 41 suites, including 46 FX tests and existing Base Teller, organization, routing and interceptor coverage |
| TypeScript compilation             | Passed                                                                                                                            |
| Production Angular build           | Passed; existing browser-support and stylesheet-selector warnings remain                                                          |
| Full repository lint               | ESLint, Stylelint, Prettier and HTMLHint passed; 828 HTML files scanned                                                           |
| Translation extraction and parity  | Passed across all 14 locale files                                                                                                 |
| File headers and git whitespace    | Passed                                                                                                                            |
| Backend unit tests                 | 384 tests passed                                                                                                                  |
| Relevant backend integration       | 8 FX database tests and 6 authenticated HTTP tests passed; 14 total                                                               |
| Standalone real API verification   | 41 requests covering safe setup, persisted drafts/audit, lookups, preview validation and guarded operations                       |
| Final browser walkthrough          | 10 checks, 25 real FX responses, no page errors or runtime response mocks                                                         |
| Additional populated sample review | Real customer, denominations and purchase preview verified; desktop/mobile screenshots captured without horizontal page overflow  |

Backend tests were run during the initial integration work. They were not repeated for the subsequent frontend-only visual refinement. The full unrelated backend integration suite was not run.

## Real backend and browser verification

A fresh disposable PostgreSQL/Fineract instance applied migrations legitimately and ran authenticated HTTP regression with the WEB-1264 plugin first on its Jib classpath. A separate review instance used a compatible exported Fineract runtime and an isolated copy of existing synthetic Base Teller data. Class-loading evidence identified both FX controllers and services in the new plugin JAR.

Earlier plugin migration resources matched the compatible artifact; only the master include and additive migration 078 were new. No applied checksums or changelog rows were cleared or rewritten. Existing local demo services and source checkouts were preserved. Database configuration, credentials, logs and screenshots remain local and are not bundled with the frontend.

The review database's business date was configured to match its pre-existing funded drawer. This is a synthetic fixture setting, not a proposed institutional effective-date policy. An administrator account does not automatically have a teller assignment.

Browser verification covered:

1. Authenticated administrative navigation, real draft preview-token confirmation, persisted revision/audit and disabled publication.
2. Mobile administrative layout and a populated teller workflow.
3. Actual customer-number lookup, configured denominations and successful incomplete purchase preview.
4. Sale preview rejection for insufficient outgoing USD inventory, with execution disabled.
5. Teller denial of the direct administrative URL and anonymous redirection to login.
6. Explicit missing-drawer handling for a read-only operator without staff assignment.
7. A safe localized message for the actual backend customer-name search failure.
8. Offline access and a real GET delayed by browser network conditions until its 30-second timeout.

Full-row financial-table hashes and authenticated USD/EUR denomination responses were unchanged before and after API/browser verification. Monitored tables included cashier transactions, GL journal entries, cash allocations and details, reconciliation, exchanges and details, teller transfers, drawer pickup, withdrawals, end-of-day closing and deposits. No new funding, inventory movement, financial transaction or completed FX receipt was fabricated. A receipt lookup returned 404, and UI POST traffic never reached publication or execution endpoints.

## Remaining limitations

**BLOCKED:** customer-name lookup returns HTTP 500 in the tested runtime. The name option is disabled in the teller UI and the form rejects programmatic name searches until the backend is repaired; client-number lookup remains available. `FxTellerService` opens a JDBC transaction and its name-search branch invokes native JPA client search, causing an already-bound connection/transaction-manager conflict. Customer-number lookup succeeds through scoped JDBC. The frontend renders a safe translated error; this requires a separate backend fix.

**NOT TESTED:** successful sale preview against a drawer with existing USD stock. The review fixture has none, so the actual inventory rejection was verified. Service-level sale preview tests pass. No artificial stock was added to bypass the validation.

**BLOCKED:** live rate publication, trade execution, physical cash settlement, FX GL postings and completed exchange receipts. Their unconditional rejection guards were verified with synthetic requests in the isolated runtime. All seven institutional approvals remain outstanding: national currency, rate convention, branch points formula, rounding/limits, activation/reauthentication, customer identification and accounting/atomic execution.

Native-speaker review of every translated message remains desirable. Manual before/after screenshots are also required by repository contribution guidance for a future PR.

This change is reviewable as guarded frontend infrastructure. It does not claim that WEB-1264 financial processing is complete.

## Review corrections — 2026-10-26

Rebased onto upstream/dev `3de08c726`. All 14 locale conflicts were resolved by retaining every upstream translation and adding the FX messages; parsed non-FX contents were checked against upstream for exact equality.

- HTTP-contract tests restore real timers in suite cleanup, including after a failing assertion.
- A successful draft write immediately retains saved status. Refresh failures and empty successful response details show a separate localized refresh warning; a repeat confirmation cannot reuse the cleared preview/token.
- Accessible cash-region names contain the actual currency, and quantity labels contain the formatted denomination value and currency.
- Whitespace-only customer search values are invalid before submission.
- Known-failing customer-name search is disabled and blocked by form validation.
- Nepali and Swahili FX denomination wording now refers specifically to notes and coins.

Added regressions cover each follow-up read failing after a successful write, empty successful response details, write failures, whitespace, disabled name search and accessible cash labels. Focused FX and Base Teller/organization/interceptor regression, app TypeScript compilation, production build, repository lint, extraction and locale preservation were run for this frontend review. Historical backend/browser evidence above was not rerun for these frontend-only corrections.
