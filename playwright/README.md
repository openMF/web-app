# Playwright E2E Testing

Production-grade End-to-End testing infrastructure for Mifos® X Web App using [Playwright](https://playwright.dev/).

## Prerequisites

Before running the tests, ensure the local environment is running:

1. **Backend:** Ensure Apache Fineract® is running on `https://localhost:8443`
2. **Frontend:** Serve the Angular app:
   ```bash
   ng serve
   ```

## Quick Start

```bash
# Run all tests
npm run playwright

# Run with UI mode (recommended for debugging)
npm run playwright:ui

# Run with visible browser
npm run playwright:headed

# Debug mode (step through tests)
npm run playwright:debug
```

## Architecture

This framework follows the **Page Object Model (POM)** pattern:

```
playwright/
├── pages/
│   ├── BasePage.ts      # Abstract base class with common utilities
│   └── LoginPage.ts     # Login page object
└── tests/
    └── login.spec.ts    # Login smoke tests
```

### Design Principles

| Principle                  | Implementation                                |
| -------------------------- | --------------------------------------------- |
| **Separation of Concerns** | Locators in Page Objects, assertions in Tests |
| **DRY**                    | Common actions in `BasePage`                  |
| **Maintainability**        | Centralized locators per page                 |
| **CI/CD Optimization**     | Artifacts only on failure                     |

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
