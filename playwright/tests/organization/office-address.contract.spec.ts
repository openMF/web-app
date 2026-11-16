/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect, Page } from '@playwright/test';

// Isolated UI contract fixtures. Every API call is intercepted; these tests never write to a backend.
test.use({ storageState: { cookies: [], origins: [] } });

const office = { id: 1, name: 'Address contract fixture', hierarchy: '.', openingDate: [
    2020,
    1,
    1
  ] };
const address = {
  officeAddressId: 7,
  officeId: 1,
  addressId: 9,
  addressTypeId: 1,
  street: 'MG Road',
  addressLine1: 'Saved address line',
  addressLine2: '',
  addressLine3: '',
  city: 'Bengaluru',
  countyDistrict: '',
  stateProvinceId: 2,
  countryId: 3,
  postalCode: '560001',
  latitude: '12.97160000',
  longitude: '77.59460000',
  isActive: true
};
const template = {
  addressTypeIdOptions: [{ id: 1, name: 'Home' }],
  stateProvinceIdOptions: [{ id: 2, name: 'Karnataka' }],
  countryIdOptions: [{ id: 3, name: 'India' }]
};

async function mockOffice(page: Page, permissions = ['ALL_FUNCTIONS'], unavailable = false) {
  const calls: { method: string; path: string; payload: unknown }[] = [];
  let records = [
    { ...address },
    {
      ...address,
      officeAddressId: 8,
      addressId: 10,
      street: 'Second contract address',
      isActive: false,
      latitude: '13',
      longitude: '78'
    }
  ];
  await page.addInitScript(
    ({ permissions }) => {
      localStorage.setItem('mifosXServerURL', location.origin);
      localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en' }));
      sessionStorage.setItem(
        'mifosXCredentials',
        JSON.stringify({
          authenticated: true,
          username: 'contract-fixture',
          userId: 1,
          officeId: 1,
          officeName: 'Address contract fixture',
          permissions,
          roles: [],
          shouldRenewPassword: false
        })
      );
    },
    { permissions }
  );
  await page.route('**/assets/env.js', async (route) => {
    const response = await route.fetch();
    // CI enables only English; this fixture also exercises the Spanish locale.
    await route.fulfill({
      response,
      body:
        (await response.text()) +
        '\nwindow.env.productionModeEnableRBAC = true;\nwindow.env.supportedLanguages = "en-US,es-MX";'
    });
  });
  await page.route('https://*.tile.openstreetmap.org/**', (route) => route.abort());
  await page.route('**/fineract-provider/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/fineract-provider/api', '');
    const method = request.method();
    const payload = request.postDataJSON();
    calls.push({ method, path, payload });
    let body: unknown = [];
    if (path === '/v1/offices') body = [office];
    else if (path === '/v1/offices/1') body = office;
    else if (path === '/v1/client/addresses/template') body = template;
    else if (path === '/v2/offices/1/addresses') {
      if (unavailable) {
        await route.fulfill({ status: 404, json: { error: 'Not Found' } });
        return;
      }
      body = records;
    } else if (path === '/v2/offices/1/addresses/7' && method === 'PUT') {
      records = records.map((record) => (record.officeAddressId === 7 ? { ...record, ...payload } : record));
      body = { entityId: 7 };
    } else if (path.includes('/notifications')) body = { pageItems: [], totalFilteredRecords: 0 };
    await route.fulfill({ json: body });
  });
  await page.goto('/#/organization/offices/1/address');
  return calls;
}

async function settleLayout(page: Page, width: number) {
  const drawer = page.locator('mat-sidenav');
  await expect(drawer).toHaveAttribute('role', width < 600 ? 'dialog' : 'navigation');
  await drawer.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => undefined))
    );
  });
  // The marker's anchor must be centered after the shared Leaflet resize callbacks finish.
  await expect
    .poll(async () => {
      const map = await page.locator('.management-map .map-container').boundingBox();
      const marker = await page.locator('.management-map .leaflet-marker-icon').boundingBox();
      return (
        !!map &&
        !!marker &&
        Math.abs(marker.x + 12 - map.x - map.width / 2) < 4 &&
        Math.abs(marker.y + 41 - map.y - map.height / 2) < 4
      );
    })
    .toBe(true);
}

test('address selector, filters, map and responsive layouts use the loaded records', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const calls = await mockOffice(page);
  const screen = page.locator('mifosx-office-address-tab');
  const cards = screen.locator('.address-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.first()).toHaveAttribute('aria-pressed', 'true');
  await expect(screen.locator('.address-detail')).toContainText('MG Road');
  await expect(screen.locator('.audit-metadata')).toHaveCount(0);
  await expect(screen.getByRole('button', { name: 'Add Address', exact: true })).toBeDisabled();
  await expect(screen.locator('.add-another-card button')).toBeDisabled();
  const reads = calls.filter((call) => call.path === '/v2/offices/1/addresses').length;
  await cards.nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(cards.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(screen.locator('.address-detail')).toContainText('Second contract address');
  await expect(screen.locator('.coordinate-strip')).toContainText('78');
  await expect(screen.locator('mifosx-address-location-map')).toHaveCount(1);
  await cards.first().focus();
  await page.keyboard.press('Space');
  await expect(cards.first()).toHaveAttribute('aria-pressed', 'true');
  await screen.getByRole('radio', { name: 'Inactive 1', exact: true }).click();
  await expect(cards).toHaveCount(1);
  await expect(screen.locator('.address-detail')).toContainText('Second contract address');
  await screen.getByRole('radio', { name: 'All 2', exact: true }).click();
  await cards.first().click();
  expect(calls.filter((call) => call.path === '/v2/offices/1/addresses')).toHaveLength(reads);
  expect(calls.filter((call) => call.method !== 'GET')).toHaveLength(0);
  for (const width of [
    1920,
    1280,
    768,
    390
  ]) {
    await page.setViewportSize({ width, height: width < 960 ? 3600 : width < 1920 ? 2200 : 1400 });
    await settleLayout(page, width);
    await page.locator('mat-sidenav-content').evaluate((element) => {
      element.scrollTop = 0;
    });
    await expect(screen.locator('.address-detail')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(screen.getByRole('button', { name: 'Edit Address', exact: true })).toBeVisible();
    expect(await screen.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`address-${width}.png`),
      fullPage: true,
      animations: 'disabled'
    });
  }
  await page.evaluate(() => {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  });
  await page.screenshot({ path: testInfo.outputPath('address-dark-390.png'), fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 1920, height: 1200 });
  await settleLayout(page, 1920);
  await page.screenshot({ path: testInfo.outputPath('address-dark-1920.png'), fullPage: true, animations: 'disabled' });
  await page.evaluate(() => {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  });
  await page.locator('mifosx-toolbar mifosx-language-selector mat-select').first().click();
  await page.getByRole('option', { name: 'Español (Spanish)', exact: true }).click();
  await expect(screen.locator('h2')).toHaveText('Domicilios de la sucursal');
  await expect(screen.getByRole('button', { name: 'Editar domicilio', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1920, height: 1400 });
  await settleLayout(page, 1920);
  await page.screenshot({ path: testInfo.outputPath('address-es-1920.png'), fullPage: true, animations: 'disabled' });
  expect(errors).toEqual([]);
});

test('status writes use the mapping ID and update the filtered details after confirmation', async ({ page }) => {
  const calls = await mockOffice(page);
  const screen = page.locator('mifosx-office-address-tab');
  await expect(screen.locator('.address-card')).toHaveCount(2);
  await screen.getByRole('radio', { name: 'Active 1', exact: true }).click();
  await screen.getByRole('button', { name: 'Deactivate', exact: true }).click();
  await expect(screen.locator('.no-matches')).toBeVisible();
  await expect(screen.locator('.address-detail')).toHaveCount(0);
  expect(calls.filter((call) => call.method === 'PUT')).toEqual([
    { method: 'PUT', path: '/v2/offices/1/addresses/7', payload: { isActive: false } }
  ]);
  await screen.getByRole('radio', { name: 'Inactive 2', exact: true }).click();
  await expect(screen.locator('.address-card')).toHaveCount(2);
  await expect(screen.locator('.address-detail')).toContainText('MG Road');
});

test('a read-only user sees saved details without mutation controls', async ({ page }) => {
  const calls = await mockOffice(page, ['READ_OFFICE']);
  const screen = page.locator('mifosx-office-address-tab');
  await expect(screen.locator('.address-card')).toHaveCount(2);
  await expect(screen.locator('.address-actions button')).toHaveCount(0);
  await expect(screen.getByRole('button', { name: 'Add Address', exact: true })).toHaveCount(0);
  expect(calls.filter((call) => call.method !== 'GET')).toHaveLength(0);
});

test('an unavailable plugin leaves the branch header usable', async ({ page }, testInfo) => {
  await mockOffice(page, ['ALL_FUNCTIONS'], true);
  await expect(page.locator('.office-header')).toContainText(office.name);
  await expect(page.locator('.unavailable-state')).toBeVisible();
  await expect(page.locator('.address-workspace')).toHaveCount(0);
  await expect(
    page.locator('mifosx-office-address-tab').getByRole('button', { name: 'Add Address', exact: true })
  ).toBeDisabled();
  await page.screenshot({
    path: testInfo.outputPath('plugin-unavailable.png'),
    fullPage: true,
    animations: 'disabled'
  });
});
