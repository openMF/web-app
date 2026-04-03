# Playwright E2E Testing

Production-grade End-to-End testing infrastructure for Mifos® X Web App using [Playwright](https://playwright.dev/).

## Running E2E with Docker (Full Stack)

### One-command (recommended)

```bash
npm run e2e:docker                      # All tests
npm run e2e:docker -- --grep login      # Filter by name
npm run e2e:docker -- --headed          # See the browser
npm run e2e:docker -- --debug           # Step through
```

### Manual control (debugging infrastructure)

```bash
npm run e2e:docker:up          # Start stack (Postgres + Fineract + Nginx)
npm run e2e:docker:logs        # Watch logs (separate terminal)
npm run playwright             # Run tests
npm run e2e:docker:down        # Tear down
```

## Running Locally (without Docker)

1. **Backend:** Ensure Apache Fineract® is running on `https://localhost:8443`
2. **Frontend:** Serve the Angular app:
   ```bash
   npm run start
   ```
3. **Run tests:**
   ```bash
   npm run playwright
   ```

## Architecture

This framework follows the **Page Object Model (POM)** pattern:

```text
playwright/
├── fixtures/
│   ├── fineract-api.ts    # Typed Fineract REST client for data seeding
│   └── test-fixtures.ts   # test.extend with fineractApi fixture
├── global-setup.ts        # CI-only: validates backend connectivity
├── pages/
│   ├── BasePage.ts        # Abstract base class with common utilities
│   └── LoginPage.ts       # Login page object
└── tests/
    └── login.spec.ts      # Login smoke tests
```

### Design Principles

| Principle                  | Implementation                                |
| -------------------------- | --------------------------------------------- |
| **Separation of Concerns** | Locators in Page Objects, assertions in Tests |
| **DRY**                    | Common actions in `BasePage`                  |
| **Maintainability**        | Centralized locators per page                 |
| **CI/CD Optimization**     | Artifacts only on failure                     |

## Data Seeding Strategy

Fineract auto-seeds via Liquibase at boot:

- Head Office, default tenant config, schema structure

For domain-specific test data (clients, loans, savings), seed via API fixtures:

```typescript
import { test } from '../fixtures/test-fixtures';

test.beforeAll(async ({ fineractApi }) => {
  await fineractApi.createClient({
    officeId: 1,
    firstname: 'Test',
    lastname: 'Client'
    // ... required Fineract fields
  });
});
```

See `playwright/fixtures/fineract-api.ts` for all available methods.

## Configuration

### SSL Certificate Handling

The local Apache Fineract® backend uses a self-signed certificate. This is handled automatically:

```typescript
// playwright.config.ts
ignoreHTTPSErrors: true;
```

### TypeScript Isolation

Uses a dedicated `tsconfig.playwright.json` to avoid conflicts with Jest:

```json
{
  "types": ["node"] // Excludes Jest types
}
```

## Writing New Tests

### 1. Create a Page Object

```typescript
// playwright/pages/DashboardPage.ts
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly url = '/#/';

  get welcomeMessage() {
    return this.page.locator('.welcome-message');
  }

  async assertOnDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\//);
  }
}
```

### 2. Write the Test

```typescript
// playwright/tests/dashboard.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('should display dashboard after login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.navigate();
  await loginPage.loginAndWaitForDashboard('mifos', 'password');
  await dashboardPage.assertOnDashboard();
});
```

## CI/CD

Tests run automatically on push/PR via GitHub Actions:

```bash
.github/workflows/playwright.yml
```

### Viewing Test Reports

After CI runs, download the `playwright-report` artifact from the Actions tab.

## Test Credentials

| Username | Password   | Environment   |
| -------- | ---------- | ------------- |
| `mifos`  | `password` | Local/Sandbox |

## Troubleshooting

### Tests fail with SSL errors

Ensure `ignoreHTTPSErrors: true` is set in `playwright.config.ts`.

### Tests timeout on CI

Increase the timeout in `playwright.config.ts`:

```typescript
navigationTimeout: 60000,
```

### TypeScript conflicts with Jest

Ensure tests are only in `playwright/` directory and `tsconfig.playwright.json` excludes other directories.
