# WEB-1257 Cash Exchange

Inspected against the Savings Plugin `CashExchangesApiResource`, `CashExchangePlatformServiceImpl`, `CashExchangeInventory`, `CashExchangeValidator`, and `CashExchange*Data` records.

## Routing and permissions

Web route: `/organization/base-teller/cash-exchange`.

The Base Teller card and route use `READ_BASE_TELLER_CASH_EXCHANGE`, following existing RBAC configuration and aggregate read permissions. Preview/create require `CREATE_BASE_TELLER_CASH_EXCHANGE`; print/reprint require `REPRINT_BASE_TELLER_CASH_EXCHANGE`. Backend authorization remains authoritative.

All paths below are relative to `/fineract-provider/api/v2/base-teller/cash-exchanges`.

| Method | Path                                        | Permission | Contract                             |
| ------ | ------------------------------------------- | ---------- | ------------------------------------ |
| GET    | `/context`                                  | READ       | `{ tellers, currencies }`            |
| GET    | `/denominations?cashierId=…&currencyCode=…` | READ       | Drawer inventory                     |
| POST   | `/preview`                                  | CREATE     | Validate request without persistence |
| POST   | base path                                   | CREATE     | Persist an idempotent exchange       |
| GET    | `/{exchangeId}`                             | READ       | Stored exchange                      |
| GET    | `/{exchangeId}/receipt`                     | REPRINT    | Stored exchange used for printing    |

## Context and inventory

`tellers`: `{ id, tellerId, code, name, officeId }[]`. **`id` is the cashier drawer ID**, not `tellerId`. Options are authorized, active drawers for the current business date and the authenticated office/staff scope.

`currencies`: `{ code, name, decimalPlaces }[]`, configured by the tenant.

Inventory: `{ cashierId, currencyCode, decimalPlaces, denominations }`.

Each inventory line: `{ denominationId, type, value, availableQuantity }`. Identifiers, values, precision and availability come from the backend. Unknown, unreconciled or closed drawer inventory fails closed. Availability is checked before incoming cash is added.

## Preview and create

Both accept only:

```typescript
{
  cashierId: number;
  currencyCode: string;
  receivedDenominations: {
    denominationId: string;
    quantity: number;
  }
  [];
  deliveredDenominations: {
    denominationId: string;
    quantity: number;
  }
  [];
  idempotencyKey: string;
}
```

The frontend submits no monetary values or inventory mutations. Zero quantity lines are omitted. Quantities must be nonnegative safe integers in the UI; the backend accepts signed 64-bit nonnegative integers. Each side must contain a positive total, and totals must be exactly equal. The backend permits identical positive denomination composition; the UI therefore does not invent a stricter no-op rule.

Preview returns `{ cashierId, currencyCode, receivedAmount, deliveredAmount, balanced, netMonetaryEffect, receivedDenominations, deliveredDenominations }`. A detail line has `{ denominationId, type, value, quantity, amount }`. The UI checks the selected drawer/currency, positive equal amounts, `balanced`, and zero net monetary effect before opening General Transaction confirmation.

Create/retrieve/receipt return `{ id, receiptNumber, status, businessDate, officeId, tellerId, cashierId, tellerName, currencyCode, receivedAmount, deliveredAmount, processedBy, processedByUsername, processedAt, receivedDenominations, deliveredDenominations }`.

A unique key is generated before preview and reused for the confirmed create. Controls are locked during preview, confirmation and create. Uncertain create outcomes retain the exact request/key for idempotent retry; definitive client errors allow correction. Pending data and completed references are held for the current component session.

## Precision, errors and receipts

JSON decimal tokens are preserved as strings before parsing to avoid floating-point rounding. BigInt minor-unit arithmetic calculates display totals without tolerance. Preview/create remain authoritative. Unsupported precision or unsafe inventory quantities disable the workflow.

The real backend returns **HTTP 403 for domain-rule violations as well as authorization failures**. Error codes take precedence over status when identifying insufficient inventory, unequal amounts, invalid teller/currency and idempotency conflicts. Other server errors receive generic localized feedback. The global error interceptor delegates only this endpoint family to the component so raw Java/SQL details are not shown.

Print/reprint fetches the authoritative receipt endpoint every time and renders its stored values using the existing `window.print()` and Mifos print stylesheet pattern. Success retains the create response independently of receipt or inventory-refresh failures. Inventory is always reloaded after success; it is never changed optimistically.

## Verification

Unit-test HTTP/service doubles exist only in `*.spec.ts`. Runtime code has no mocked APIs, hardcoded tellers, currency catalogs, denomination values or available quantities.

Run focused tests:

```sh
npm test -- --runInBand --coverage=false src/app/organization/base-teller/cash-exchange
```

Real browser acceptance evidence and the complete validation report are in the workspace's `web1257-validation` directory. The local acceptance test funds the existing dedicated WEB-1257 fixture through real allocation APIs before executing real exchanges. Fixture funding is distinct from the zero-accounting-effect cash exchanges.
