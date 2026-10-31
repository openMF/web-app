# WEB-1264 REST contract and capabilities

The source of truth is savings-plugin commit `7e38b329b34d9bf0f5cc0586248d55110e022cb8`, especially `FxData`, `FxValidation`, `FxRateService`, `FxTellerService`, `FxRatesApiResource`, `FxTellerApiResource`, and migration `078-create-foreign-currency-drafts.xml`. The supplied backend implementation report and `target/web1264-evidence/verification.json` were absent; source, current builds, and current requests were inspected instead.

All paths below are relative to `/fineract-provider/api`. Basic authentication and the `Fineract-Platform-TenantId` header use the existing application interceptors. The backend authorizes office hierarchy, operator, customer, and drawer; the UI never supplies an authoritative teller/branch override.

| Method and resource                                       | Parameters/body                                                         | Response                                                                                                                | Required authority                                       | Mutation / capability                                                                    |
| --------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| GET `/v2/foreign-currency/rates/context`                  | None                                                                    | `FxRateContext`                                                                                                         | `READ_BASE_TELLER_FX_RATE`                               | Read; enabled                                                                            |
| GET `/v2/foreign-currency/rates`                          | Optional `officeId`, ISO `effectiveDate`, `offset >= 0`, `limit 1..100` | `FxDraft[]`, effective date and ID descending                                                                           | `READ_BASE_TELLER_FX_RATE`                               | Read; enabled                                                                            |
| GET `/v2/foreign-currency/rates/{id}`                     | Persisted draft ID                                                      | `FxDraft`                                                                                                               | `READ_BASE_TELLER_FX_RATE`                               | Read; enabled                                                                            |
| GET `/v2/foreign-currency/rates/{id}/audit`               | Persisted draft ID                                                      | `FxAudit[]`, all revisions through selected version for same office/date/pair                                           | `READ_BASE_TELLER_FX_RATE`                               | Read; enabled; no separate audit authority exists                                        |
| POST `/v2/foreign-currency/rates/preview`                 | `FxRateRequest` without token                                           | `FxRatePreview`, previous/proposed branches and operator-bound `previewToken`                                           | `CREATE_BASE_TELLER_FX_RATE`                             | Read-only review; enabled                                                                |
| POST `/v2/foreign-currency/rates`                         | Exact reviewed `FxRateRequest` plus returned `previewToken`             | Newly persisted `FxDraft[]`                                                                                             | `CREATE_BASE_TELLER_FX_RATE`                             | Writes immutable DRAFT revisions and DRAFT_CONFIRMED audit rows only; enabled            |
| POST `/v2/foreign-currency/rates/publish`                 | No body is consumed by handler                                          | Domain error, never success                                                                                             | `PUBLISH_BASE_TELLER_FX_RATE`                            | BLOCKED, no financial writes; absent from UI service                                     |
| GET `/v2/base-teller/foreign-currency/context`            | None                                                                    | `FxTellerContext` including authenticated cashier, business date, candidate drafts, operation permissions, capabilities | `READ_BASE_TELLER_FX`                                    | Read; requires exactly one active, open, funded drawer                                   |
| GET `/v2/base-teller/foreign-currency/customers`          | `clientNumber` or `name`; `offset >= 0`, `limit 1..100`                 | `FxCustomerPage` (`pageItems`, `totalFilteredRecords`)                                                                  | `READ_BASE_TELLER_FX` plus native client read            | Read; customer-number search verified; name search currently fails with backend HTTP 500 |
| GET `/v2/base-teller/foreign-currency/denominations`      | Enabled `currencyCode`                                                  | `FxDenomination[]` with configured ID/type/value and actual `availableQuantity`                                         | `READ_BASE_TELLER_FX`                                    | Read; enabled, drawer required                                                           |
| POST `/v2/base-teller/foreign-currency/purchases/preview` | `FxTradeRequest`; registered `identifierId` required                    | `FxTradePreview`, INCOMPLETE_PREVIEW, executable=false, valuationValidated=false                                        | `CREATE_BASE_TELLER_FX_PURCHASE` plus native client read | Read-only, enabled; USD inflow / quote outflow                                           |
| POST `/v2/base-teller/foreign-currency/sales/preview`     | `FxTradeRequest`; identifier optional                                   | Same incomplete preview or domain validation                                                                            | `CREATE_BASE_TELLER_FX_SALE` plus native client read     | Read-only, enabled; USD outflow / quote inflow                                           |
| POST `/v2/base-teller/foreign-currency/purchases`         | No body is consumed by handler                                          | Domain error, never success                                                                                             | `CREATE_BASE_TELLER_FX_PURCHASE`                         | BLOCKED, no financial writes; absent from UI service                                     |
| POST `/v2/base-teller/foreign-currency/sales`             | No body is consumed by handler                                          | Domain error, never success                                                                                             | `CREATE_BASE_TELLER_FX_SALE`                             | BLOCKED, no financial writes; absent from UI service                                     |

`ALL_FUNCTIONS` is accepted by method security. These FX method annotations do **not** accept `ALL_FUNCTIONS_READ` alone. Navigation, direct-route guards, and action checks match the explicit FX authorities even if the application's general RBAC display flag is disabled. Native client read also accepts its existing native read authority semantics. There is no independent execution permission or receipt endpoint; the same purchase/sale authorities reach unconditional execution rejection.

All endpoints can return 401 for unauthenticated requests, 403 for authorization failures, and 5xx for infrastructure errors. Actual FX domain validation uses **403**, not the hypothetical 422 codes from the task. Unknown routes return 404. In particular, out-of-scope branches and missing/inaccessible draft IDs return domain-rule 403. Frontend fallback handling additionally covers 404, 409, 422, offline status 0 and request timeouts without exposing developer messages, SQL, or stack traces.

## DTOs and validation

Exact TypeScript fields are in `foreign-currency.models.ts`. Monetary JSON response tokens use the existing cash-exchange parser; monetary requests are serialized as exact numeric tokens without converting decimal strings to floating point.

`FxRateRequest`:

```json
{
  "effectiveDate": "2026-10-21",
  "baseCurrency": "USD",
  "quoteCurrency": "EUR",
  "dailyBaseRate": 2.350000000001,
  "branches": [{ "officeId": 18, "expectedVersion": 1, "buyPoints": -1, "sellPoints": 2 }],
  "previewToken": "returned-by-real-preview"
}
```

EUR here is an enabled **draft quote currency**, not an approved national currency or a calculated trading rate. Dates are ISO dates with year >= 1; no effective-date activation policy is invented. The backend accepts 1..100 unique branches, nonnegative expected versions below Long.MAX_VALUE, exact DECIMAL(32,12) values, positive base rate, and signed uninterpreted points. Both currencies must be configured and distinct; base must be USD. The UI intentionally edits one branch per review, retrieves the latest matching pair across history pages, and invalidates the token on any edit. Confirmation repeats version/token validation under branch locks and saves another DRAFT; it never publishes.

`FxTradeRequest`:

```json
{
  "clientId": 110,
  "identifierId": 9,
  "reference": "Synthetic read-only preview",
  "quoteCurrency": "EUR",
  "usdAmount": 10.0,
  "rateDraftId": 1,
  "rateVersion": 1,
  "usdDenominations": [{ "denominationId": "USD-10", "quantity": 1 }],
  "quoteDenominations": [{ "denominationId": "EUR-10", "quantity": 1 }]
}
```

Each leg requires 1..1000 unique configured denomination IDs and nonnegative integral signed-64-bit quantities. The UI restricts quantities to JavaScript's safe-integer range rather than risking rounded quantity JSON. Both totals must be positive; USD total must equal the positive USD amount at configured precision. Outgoing inventory must suffice, and incoming inventory must not overflow. The active customer and identifier must be authorized; a purchase identifier must belong to that customer and be active/unexpired. Reference is 1..100 printable characters. Draft ID/version must be the latest for the authenticated drawer's branch, business date, and currency pair.

A successful preview returns actual denomination totals and directions, but **no validated FX valuation**. `nationalCurrency`, `appliedRate`, and `calculatedNationalAmount` are null (often omitted by Gson). No local conversion formula is used. Checks and vouchers are unsupported.

## Structured domain errors

All codes start with `error.msg.base.teller.fx.`. Actual suffixes include:

- Requests/storage: `request.required`, `request.invalid`, `request.malformed`, `date.invalid`, `decimal.invalid`, `branches.invalid`, `branch.invalid`, `page.invalid`, `reference.invalid`.
- Scope/context: `branch.forbidden`, `office.required`, `cashier.required`, `cashier.assignment`, `search.invalid`, `customer.inactive`, `customer.not.found`, `identification.required`, `identification.invalid`.
- Rates/currency: `version.conflict`, `preview.stale`, `rate.not.found`, `rate.context`, `rate.stale`, `currency.pair`, `currency.disabled`, `currency.precision`, `amount.precision`.
- Cash: `quantity.invalid`, `denominations.required`, `denomination.invalid`, `denomination.unsupported`, `denomination.configuration`, `denominations.total`, `denominations.usd.total`, `inventory.insufficient`, `inventory.overflow`.
- Guards: `operation.unsupported`; `operation.required` rejects a missing operation internally.

Publication and execution capabilities are false. The backend lists these seven pending policy approvals: national currency; trading-rate convention; branch points formula; rounding/limits; activation/reauthentication; customer identification; accounting/atomic execution. Every blocker and visible FX string has a translation in all 14 locale files, including es-CL.
