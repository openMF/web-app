# WEB-1256 Base Teller Transaction History API Contract

Source of truth: the Savings Plugin `TransactionHistoryApiResource`, transaction-history data records, and `TransactionHistoryReadPlatformServiceImpl` on the plugin's `WEB-1256-base-teller-transaction-history` branch.

All routes are JSON `GET` requests rooted at `/v2/base-teller/transaction-history`. Every route requires `READ_BASE_TELLER_TRANSACTION_HISTORY`.

## Context contract

`GET /v2/base-teller/transaction-history/context`

- `tellers: { id, tellerId, code, name, officeId, officeName }[]`; `id` is the cashier identifier accepted by search.
- `currencies: { code, name, decimalPlaces }[]`.
- `statuses`, `types`, `operations`, `concepts`: `{ code, label }[]`.

Options are derived from authorized history rows and are not fixed frontend enums.

## Search contract

`GET /v2/base-teller/transaction-history`

Optional parameters are `fromDate`, `toDate` (inclusive ISO `yyyy-MM-dd`), `tellerId`, `currencyCode`, `status`, `type`, `operation`, `concept`, `reference`, `offset`, `limit`, `sort`, and `order`. `offset` defaults to `0`; `limit` defaults to `25` and accepts `1..500`. Sort fields are `transactionDate`, `operation`, `inflow`, `outflow`, `currencyCode`, `concept`, `status`, and `reference`; order is `ASC` or `DESC`.

Response:

- `items: { historyId, transactionDate, operation, inflow, outflow, currencyCode, decimalPlaces, concept, status, reference, tellerId, clientId }[]`.
- `totalFilteredRecords`, `offset`, `limit`.
- `totalsByCurrency: { currencyCode, decimalPlaces, totalInflows, totalOutflows, total }[]`.

`inflow`, `outflow`, and all totals are backend-authoritative. Totals cover the complete filtered result.

## Detail contract

`GET /v2/base-teller/transaction-history/{historyId}`

`historyId` is `{SOURCE_TYPE}:{numericSourceId}`. The response is `{ historyId, transactionDate, client, operation, concept, reference, teller, status, currencyCode, decimalPlaces, cashReceived, checksReceived, change, adjustment, total, cancellation, receiptSupported }`. `client`, `teller`, financial fields, and `{ reason, user, date }` cancellation data can be null.

## Denomination contract

`GET /v2/base-teller/transaction-history/{historyId}/denominations`

Response: `{ historyId, operationDenominationsSupported, operationDenominations, changeDenominationsSupported, changeDenominations }`. Each line is `{ currencyCode, denominationId, denominationValue, quantity, amount, denominationType }`. Unsupported or uncaptured data is HTTP 200 with a false support flag and empty list; no breakdown may be inferred.

## Receipt contract

`GET /v2/base-teller/transaction-history/{historyId}/receipt`

Response: `{ historyId, sourceType, sourceId, receipt }`, where `receipt` is the structured source-authoritative receipt DTO. Unsupported receipts use `error.msg.base.teller.transaction.history.receipt.unsupported`.

## Report contract

`GET /v2/base-teller/transaction-history/report`

Accepts all search filters plus `sort` and `order`, without pagination. Response: `{ generatedAt, items, totalFilteredRecords, totalsByCurrency }`; items contains all authorized matching rows for browser printing.

## Error responses

Fineract returns its standard `ApiGlobalErrorResponse`.

- Missing permission: HTTP 403.
- Invalid ISO date, range, teller scope, reference length, pagination, sort/order, currency, option, or `historyId`: HTTP 403 with an `error.msg.base.teller.transaction.history.*` code.
- Missing or unauthorized row: HTTP 403, `error.msg.base.teller.transaction.history.not.found`.
- Unsupported receipt: HTTP 403, `error.msg.base.teller.transaction.history.receipt.unsupported`.
- Empty search: HTTP 200 with no items, zero records, and no totals.
