/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

/** Explicit BE-01 run: requires the plugin and one product per classification plus a legacy product. */
export default defineConfig(baseConfig, {
  testMatch: '**/savings-products-list.spec.ts',
  projects: baseConfig
    .projects!.filter((project) => project.name === 'setup' || project.name === 'chromium')
    .map((project) => (project.name === 'chromium' ? { ...project, testIgnore: [] } : project))
});
