/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { request } from '@playwright/test';

async function globalSetup(): Promise<void> {
  const fineractUrl = process.env.E2E_FINERACT_URL || 'https://localhost:8443';
  const webAppUrl = process.env.E2E_BASE_URL || 'http://localhost:4200';

  const ctx = await request.newContext({ ignoreHTTPSErrors: true });

  try {
    const fineractRes = await ctx.get(`${fineractUrl}/fineract-provider/actuator/health`, {
      timeout: 15000
    });
    if (!fineractRes.ok()) {
      throw new Error(`Fineract returned ${fineractRes.status()} at ${fineractUrl}`);
    }

    const webAppRes = await ctx.get(webAppUrl, { timeout: 15000 });
    if (!webAppRes.ok()) {
      throw new Error(`Web-app returned ${webAppRes.status()} at ${webAppUrl}`);
    }

    console.log('✅ Global setup: Fineract + web-app verified');
  } catch (error) {
    throw new Error(
      `FATAL: E2E infrastructure unreachable.\n` +
        `Fineract: ${fineractUrl}\nWeb-app: ${webAppUrl}\n` +
        `Run: docker compose -f docker-compose.e2e.yml up -d\n` +
        `Error: ${error}`
    );
  } finally {
    await ctx.dispose();
  }
}

export default globalSetup;
