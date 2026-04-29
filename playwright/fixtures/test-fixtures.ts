/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test as base } from '@playwright/test';

import { FineractApiClient } from './fineract-api';

type E2EFixtures = {
  fineractApi: FineractApiClient;
};

export const test = base.extend<E2EFixtures>({
  fineractApi: async ({}, use) => {
    const api = new FineractApiClient(
      process.env.E2E_FINERACT_URL || 'https://localhost:8443',
      process.env.E2E_TENANT_ID || 'default',
      process.env.E2E_USERNAME || 'mifos',
      process.env.E2E_PASSWORD || 'password'
    );
    await api.init();
    await use(api);
    await api.dispose();
  }
});

export { expect } from '@playwright/test';
