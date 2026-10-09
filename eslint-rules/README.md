# Local ESLint rules (`mifosx-playwright`)

Custom ESLint rules that guard architectural invariants in the
Playwright E2E suite. They are loaded as a local plugin from
[../eslint.config.js](../eslint.config.js).

## Rules

### `mifosx-playwright/no-direct-login-goto`

**Why:** Tests should consume the pre-authenticated `storageState`
produced by `auth.setup.ts`. If a spec calls `page.goto('/login')`
it is either accidentally re-doing auth (slow, flaky) or it is an
explicit logout flow that belongs in `playwright/tests/auth/`.

**Allowed in:** `*.setup.ts`, `playwright/pages/login*.ts`,
`playwright/pages/BasePage.ts`, `playwright/config/routes.ts`.

### `mifosx-playwright/no-bare-wait-for-timeout`

**Why:** Hard-coded sleeps are the #1 source of E2E flake. Any
unavoidable wait MUST go through `loggedSleep(ms, reason)` from
[`playwright/utils/sleep.ts`](../playwright/utils/sleep.ts) so the
sleep is recorded in `playwright/sleeps.json` and reviewable.

**Allowed in:** any file under `playwright/utils/` (so the retry /
backoff infrastructure itself can use raw timers).

## Adding a new rule

1. Create `eslint-rules/<rule-name>.js` exporting `{ meta, create }`.
2. Register it in [`index.js`](./index.js).
3. Enable it in the `playwright/**/*.ts` block of
   [`../eslint.config.js`](../eslint.config.js).
4. Add a test spec under `eslint-rules/__tests__/` (optional but
   encouraged).
