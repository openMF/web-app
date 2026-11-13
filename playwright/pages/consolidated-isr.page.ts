/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { expect, type Page } from '@playwright/test';

export class ConsolidatedIsrPage {
  constructor(readonly page: Page) {}
  get view() {
    return this.page.locator('mifosx-consolidated-isr');
  }
  async open(client = 7) {
    await this.page.goto(`/#/clients/${client}/account-management`);
    const tab = this.page
      .locator('mifosx-account-management')
      .getByRole('tab', { name: 'Consolidated ISR', exact: true });
    await tab.click();
    await expect(this.view).toBeVisible();
  }
  async inspect(from = '2026-11-01', through = '2026-11-12') {
    await this.view.locator('input[formControlName="from"]').fill(from);
    await this.view.locator('input[formControlName="through"]').fill(through);
    await this.view.locator('input[formControlName="through"]').press('Tab');
    await this.view.getByRole('button', { name: 'Inspect diagnostic period', exact: true }).click();
  }
  async openHistory() {
    await this.view.getByRole('button', { name: /d4a2587e-564a-4bb8-92f8-ad15ded9a400/ }).click();
    await expect(this.view.getByTestId('isr-historical-detail')).toBeVisible();
  }
}
