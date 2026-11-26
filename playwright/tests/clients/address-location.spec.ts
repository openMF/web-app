/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect, Page } from '@playwright/test';

/** Synthetic API contracts only. No requests reach a real tenant or tile provider. */
async function installContracts(
  page: Page,
  options: {
    enabled?: boolean;
    latitude?: boolean;
    longitude?: boolean;
    permissions?: string[];
    coordinates?: { latitude?: string | number | null; longitude?: string | number | null };
    tileFailure?: boolean;
    writeFailure?: number;
    readFailure?: number;
    rereadFailure?: number;
    missingTemplate?: boolean;
  } = {}
) {
  let addresses: any[] = [
    {
      addressId: 11,
      addressTypeId: 1,
      addressType: 'Home',
      street: 'Synthetic Street',
      addressLine1: 'Synthetic building',
      addressLine2: 'Unit 4',
      addressLine3: 'Block A',
      townVillage: 'Synthetic locality',
      city: 'Synthetic City',
      countyDistrict: 'Synthetic district',
      postalCode: '110001',
      stateProvinceId: 2,
      countryId: 3,
      isActive: true,
      createdBy: 'fixture',
      ...(options.coordinates ?? { latitude: '28.6139', longitude: '77.2090' })
    }
  ];
  const createdClients: any[] = [];
  const writes: { method: string; payload: any; type: string | null }[] = [];
  let addressReads = 0;
  const tileRequests: string[] = [];
  await page.addInitScript(
    (permissions) => {
      sessionStorage.setItem(
        'mifosXCredentials',
        JSON.stringify({
          authenticated: true,
          base64EncodedAuthenticationKey: 'synthetic-key',
          permissions,
          roles: [],
          userId: 1454,
          username: 'Synthetic reviewer',
          officeId: 1,
          officeName: 'Synthetic office',
          shouldRenewPassword: false
        })
      );
      localStorage.setItem('mifosXServerURL', location.origin);
      localStorage.setItem('mifosXServerDate', '2026-11-24');
      localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en-US' }));
    },
    options.permissions ?? ['ALL_FUNCTIONS']
  );
  await page.route('**/assets/env.js', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `window.env = { productionModeEnableRBAC: true, enableClientAddressLocation: ${options.enabled !== false} };`
    })
  );
  await page.route('https://*.tile.openstreetmap.org/**', (route) => {
    tileRequests.push(route.request().url());
    return options.tileFailure
      ? route.abort()
      : route.fulfill({
          contentType: 'image/png',
          body: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
            'base64'
          )
        });
  });
  await page.route('**/fineract-provider/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/^.*\/api\/v\d+/, '');
    if (path === '/client/7/addresses') {
      if (req.method() === 'GET') {
        addressReads++;
        const failure = options.readFailure ?? (writes.length ? options.rereadFailure : undefined);
        await route.fulfill({ status: failure ?? 200, json: failure ? { errors: [] } : addresses });
      } else {
        const payload = req.postDataJSON();
        writes.push({ method: req.method(), payload, type: url.searchParams.get('type') });
        if (options.writeFailure) {
          await route.fulfill({
            status: options.writeFailure,
            json: { errors: [{ defaultUserMessage: 'Synthetic address rejected' }] }
          });
          return;
        }
        // Fineract leaves omitted/null coordinates unchanged on update.
        const supplied = Object.fromEntries(
          Object.entries(payload).filter(
            ([
              ,
              value
            ]) => value != null
          )
        );
        if (req.method() === 'POST')
          addresses.push({ ...supplied, addressId: 22, addressTypeId: 1, addressType: 'Home', isActive: false });
        else addresses = addresses.map((a) => (a.addressId === payload.addressId ? { ...a, ...supplied } : a));
        await route.fulfill({ json: { resourceId: req.method() === 'POST' ? 22 : 11 } });
      }
      return;
    }
    if (path === '/clients' && req.method() === 'POST') {
      const payload = req.postDataJSON();
      createdClients.push(payload);
      addresses = (payload.address ?? []).map((address: any) => ({ ...address, addressId: 22, addressType: 'Home' }));
      await route.fulfill({ json: { resourceId: 7, clientId: 7 } });
      return;
    }
    let data: any = [];
    if (path === '/clients/7')
      data = {
        id: 7,
        displayName: 'Synthetic Customer',
        accountNo: 'C000007',
        officeId: 1,
        officeName: 'Synthetic office',
        groups: [],
        active: true,
        status: { id: 300, value: 'Active' },
        legalForm: { id: 1 },
        timeline: { activatedOnDate: [
            2026,
            11,
            24
          ] }
      };
    else if (path === '/clients/template')
      data = {
        isAddressEnabled: true,
        officeOptions: [{ id: 1, name: 'Synthetic office' }],
        clientLegalFormOptions: [
          { id: 1, value: 'Person' },
          { id: 2, value: 'Entity' }
        ],
        staffOptions: [],
        genderOptions: [],
        clientTypeOptions: [],
        clientClassificationOptions: [],
        clientNonPersonConstitutionOptions: [],
        clientNonPersonMainBusinessLineOptions: [],
        savingProductOptions: [],
        familyMemberOptions: {},
        address: [{ addressTypeIdOptions: [{ id: 1, name: 'Home' }], stateProvinceIdOptions: [], countryIdOptions: [] }]
      };
    else if (path === '/client/addresses/template')
      data = options.missingTemplate
        ? null
        : {
            addressTypeIdOptions: [{ id: 1, name: 'Home' }],
            stateProvinceIdOptions: [{ id: 2, name: 'Synthetic state' }],
            countryIdOptions: [{ id: 3, name: 'Synthetic country' }]
          };
    else if (path === '/fieldconfiguration/ADDRESS') data = [
        ...[
          'addressType',
          'street',
          'addressLine1',
          'addressLine2',
          'addressLine3',
          'townVillage',
          'city',
          'countyDistrict',
          'postalCode',
          'stateProvinceId',
          'countryId',
          'isActive'
        ].map((field) => ({ field, isEnabled: true })),
        { field: 'latitude', isEnabled: options.latitude !== false },
        { field: 'longitude', isEnabled: options.longitude !== false }
      ];
    else if (path.includes('/configurations')) data = { enabled: true, value: 0 };
    else if (path.endsWith('/notifications')) data = { pageItems: [], totalFilteredRecords: 0 };
    else if (path.endsWith('/images')) {
      await route.fulfill({ status: 404, json: {} });
      return;
    } else if (path.includes('/actuator/')) data = { status: 'UP' };
    else if (path.endsWith('/businessdate')) data = { businessDate: '2026-11-24' };
    else if (req.method() !== 'GET') {
      await route.fulfill({ status: 403, json: { errors: [] } });
      return;
    }
    await route.fulfill({ json: data });
  });
  return {
    writes,
    createdClients,
    tileRequests,
    get addressReads() {
      return addressReads;
    }
  };
}

async function openAddress(page: Page) {
  await page.goto('/#/clients/7/address');
  await expect(page.locator('mifosx-address-tab')).toContainText('Synthetic Street', { timeout: 15000 });
  await page.locator('mifosx-address-tab mat-expansion-panel-header').first().click();
}

for (const width of [
  390,
  768,
  1280,
  1920
]) {
  test(`responsive address and dialog at ${width}px`, async ({ page }, info) => {
    await installContracts(page);
    await page.setViewportSize({ width, height: 1100 });
    await openAddress(page);
    const tab = page.locator('mifosx-address-tab');
    await expect(tab.locator('.leaflet-marker-icon')).toHaveCount(1);
    await expect(tab).toContainText('28.6139');
    await expect(tab).toContainText('77.2090');
    await tab.getByRole('region', { name: 'Location Map', exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({
      path: info.outputPath(`after-${width}.png`),
      fullPage: true,
      animations: 'disabled'
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await tab.getByRole('button', { name: 'Add', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('Latitude', { exact: true })).toBeVisible();
    await dialog.getByLabel('Latitude', { exact: true }).fill('28.6139');
    await dialog.getByLabel('Longitude', { exact: true }).fill('77.2090');
    await expect(dialog.locator('.leaflet-marker-icon')).toHaveCount(1);
    expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await dialog.getByRole('region', { name: 'Location Map', exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({
      path: info.outputPath(`after-dialog-${width}.png`),
      fullPage: true,
      animations: 'disabled'
    });
  });
}

async function editDialog(page: Page) {
  await page.locator('mifosx-address-tab').getByRole('button', { name: 'Edit', exact: true }).first().click();
  const dialog = page.getByRole('dialog');
  // Material delays initial focus until the opening animation completes; wait before sending clear keystrokes.
  await expect(dialog.getByLabel('Postal Code', { exact: true })).toBeFocused();
  return dialog;
}

function centerTile(latitude: number, longitude: number) {
  const size = 2 ** 15;
  const radians = (latitude * Math.PI) / 180;
  const x = Math.floor(((longitude + 180) / 360) * size);
  const y = Math.floor(((1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2) * size);
  return `/15/${x}/${y}.png`;
}

test('adds, re-reads, reloads and edits saved coordinates with an accurate live map', async ({ page }) => {
  const api = await installContracts(page);
  await openAddress(page);
  const tab = page.locator('mifosx-address-tab');
  await expect.poll(() => api.tileRequests.some((url) => url.endsWith(centerTile(28.6139, 77.209)))).toBe(true);
  await tab.getByRole('button', { name: 'Add', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByRole('combobox', { name: 'Address Type' }).click();
  await page.getByRole('option', { name: 'Home', exact: true }).click();
  await dialog.getByLabel('Street', { exact: true }).fill('Synthetic added street');
  await dialog.getByLabel('Latitude', { exact: true }).fill('28.6139123456789');
  await dialog.getByLabel('Longitude', { exact: true }).fill('77.2090123456789');
  await expect(dialog.getByRole('region', { name: 'Location Map', exact: true })).toBeVisible();
  await expect(dialog.locator('.leaflet-marker-icon')).toHaveCount(1);
  await dialog.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(tab).toContainText('Synthetic added street');
  expect(api.writes[0]).toMatchObject({
    method: 'POST',
    type: '1',
    payload: { latitude: '28.6139123456789', longitude: '77.2090123456789' }
  });
  expect(api.addressReads).toBe(2);
  await page.reload();
  await expect(tab.locator('mat-expansion-panel')).toHaveCount(2);
  await tab.locator('mat-expansion-panel-header').nth(1).click();
  await expect(tab.locator('mat-expansion-panel').nth(1)).toContainText('28.6139123456789');
  await tab.locator('mat-expansion-panel').nth(1).getByRole('button', { name: 'Edit', exact: true }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog.locator('.leaflet-marker-icon')).toHaveCount(1);
  const marker = await dialog.locator('.leaflet-marker-icon').elementHandle();
  await dialog.getByLabel('Latitude', { exact: true }).fill('-33.8688');
  await dialog.getByLabel('Longitude', { exact: true }).fill('151.2093');
  await expect.poll(() => api.tileRequests.some((url) => url.endsWith(centerTile(-33.8688, 151.2093)))).toBe(true);
  expect(await marker!.evaluate((el) => el.isConnected)).toBe(true);
  await expect(dialog.locator('.leaflet-marker-icon')).toHaveCount(1);
  await dialog.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(tab.locator('mat-expansion-panel').nth(1)).toContainText('-33.8688');
  expect(api.writes[1]).toMatchObject({
    method: 'PUT',
    payload: { addressId: 22, street: 'Synthetic added street', latitude: '-33.8688', longitude: '151.2093' }
  });
  await page.reload();
  await tab.locator('mat-expansion-panel-header').nth(1).click();
  await expect(tab.locator('mat-expansion-panel').nth(1)).toContainText('151.2093');
});

test('validates numeric input, ranges, zero and partial optional pairs', async ({ page }) => {
  const api = await installContracts(page);
  await openAddress(page);
  const dialog = await editDialog(page);
  const latitude = dialog.getByLabel('Latitude', { exact: true });
  const longitude = dialog.getByLabel('Longitude', { exact: true });
  const save = dialog.getByRole('button', { name: 'Edit', exact: true });
  for (const value of [
    'abc',
    '12junk',
    '1e',
    '91',
    '-91'
  ]) {
    await latitude.fill(value);
    await latitude.press('Tab');
    await expect(save).toBeDisabled();
    await expect(latitude).toHaveAttribute('aria-invalid', 'true');
    await expect(dialog.locator('mat-error')).toBeVisible();
    await expect(dialog.locator('.leaflet-marker-icon')).toHaveCount(0);
  }
  await latitude.fill('0E-8');
  await longitude.fill('181');
  await expect(save).toBeDisabled();
  await longitude.fill('0');
  await expect(save).toBeEnabled();
  await expect(dialog.locator('.leaflet-marker-icon')).toHaveCount(1);
  await longitude.fill('');
  await expect(save).toBeEnabled();
  await expect(dialog.locator('.leaflet-marker-icon')).toHaveCount(0);
  await longitude.fill('0');
  await save.click();
  await expect(page.locator('mifosx-address-tab')).toContainText('Latitude : 0E-8');
  expect(api.writes[0].payload).toMatchObject({ latitude: '0E-8', longitude: '0' });
});

for (const settings of [
  { enabled: false },
  { latitude: false },
  { longitude: false },
  { latitude: false, longitude: false }
]) {
  test(`honors location configuration ${JSON.stringify(settings)}`, async ({ page }) => {
    const api = await installContracts(page, settings);
    await openAddress(page);
    const tab = page.locator('mifosx-address-tab');
    await expect(tab.locator('.leaflet-marker-icon')).toHaveCount(0);
    const dialog = await editDialog(page);
    await expect(dialog.getByLabel('Latitude', { exact: true })).toHaveCount(
      settings.enabled === false || settings.latitude === false ? 0 : 1
    );
    await expect(dialog.getByLabel('Longitude', { exact: true })).toHaveCount(
      settings.enabled === false || settings.longitude === false ? 0 : 1
    );
    await dialog.getByLabel('City', { exact: true }).fill('Updated synthetic city');
    await dialog.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(tab).toContainText('Updated synthetic city');
    if (settings.enabled === false || settings.latitude === false)
      expect(api.writes[0].payload.latitude).toBeUndefined();
    if (settings.enabled === false || settings.longitude === false)
      expect(api.writes[0].payload.longitude).toBeUndefined();
    expect(api.tileRequests).toHaveLength(0);
  });
}

for (const coordinates of [
  {},
  { latitude: 0 },
  { latitude: 91, longitude: 77 },
  { latitude: 'bad', longitude: null }
]) {
  test(`keeps ordinary addresses readable for missing or invalid coordinates ${JSON.stringify(coordinates)}`, async ({
    page
  }) => {
    await installContracts(page, { coordinates });
    await openAddress(page);
    const tab = page.locator('mifosx-address-tab');
    await expect(tab).toContainText('Synthetic Street');
    await expect(tab).toContainText('A map is unavailable because saved coordinates are missing or invalid.');
    await expect(tab.locator('.leaflet-marker-icon')).toHaveCount(0);
    if ('latitude' in coordinates && coordinates.latitude === 0) await expect(tab).toContainText('Latitude : 0');
  });
}

test('retains textual coordinates on tile failure and renders safely across repeated opens', async ({ page }, info) => {
  await installContracts(page, { tileFailure: true });
  await openAddress(page);
  const tab = page.locator('mifosx-address-tab');
  await expect(tab).toContainText('Map tiles unavailable');
  await expect(tab).toContainText('28.6139');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(tab.getByRole('region', { name: 'Location Map', exact: true })).toBeVisible();
  await tab.getByRole('region', { name: 'Location Map', exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({
    path: info.outputPath('after-dark-tile-failure.png'),
    fullPage: true,
    animations: 'disabled'
  });
  for (let i = 0; i < 3; i++) {
    await tab.locator('mat-expansion-panel-header').click();
    await expect(tab.locator('.leaflet-container')).toHaveCount(0);
    await tab.locator('mat-expansion-panel-header').click();
    await expect(tab.locator('.leaflet-container')).toHaveCount(1);
    await expect(tab.locator('.leaflet-marker-icon')).toHaveCount(1);
  }
});

test('retains backend coordinates when cleared fields are omitted by the existing API', async ({ page }) => {
  const api = await installContracts(page);
  await openAddress(page);
  const dialog = await editDialog(page);
  await dialog.getByLabel('Latitude', { exact: true }).fill('');
  await dialog.getByLabel('Longitude', { exact: true }).fill('');
  await expect(dialog.getByLabel('Latitude', { exact: true })).toHaveValue('');
  await expect(dialog.getByLabel('Longitude', { exact: true })).toHaveValue('');
  await dialog.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.locator('mifosx-address-tab')).toContainText('28.6139');
  await expect.poll(() => api.addressReads).toBe(2);
  expect(api.writes[0].payload.latitude).toBeUndefined();
  expect(api.writes[0].payload.longitude).toBeUndefined();
});

test('shows saved location to read-only users without address write controls', async ({ page }) => {
  const api = await installContracts(page, { permissions: [
      'READ_CLIENT',
      'READ_ADDRESS',
      'READ_DATATABLE'
    ] });
  await openAddress(page);
  const tab = page.locator('mifosx-address-tab');
  await expect(tab.locator('.leaflet-marker-icon')).toHaveCount(1);
  await expect(tab.getByRole('button', { name: 'Add', exact: true })).toHaveCount(0);
  await expect(tab.getByRole('button', { name: 'Edit', exact: true })).toHaveCount(0);
  await expect(tab.getByRole('switch')).toBeDisabled();
  expect(api.writes).toHaveLength(0);
});

for (const failure of [
  { writeFailure: 403 },
  { writeFailure: 400 },
  { rereadFailure: 503 }
]) {
  test(`does not display unconfirmed coordinates after persistence failure ${JSON.stringify(failure)}`, async ({
    page
  }) => {
    const api = await installContracts(page, failure);
    await openAddress(page);
    const dialog = await editDialog(page);
    await dialog.getByLabel('Latitude', { exact: true }).fill('-33.8688');
    await dialog.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect.poll(() => api.writes.length).toBe(1);
    await expect(page.locator('mifosx-address-tab')).toContainText('28.6139');
    await expect(page.locator('mifosx-address-tab')).not.toContainText('-33.8688');
    if ('rereadFailure' in failure) await expect.poll(() => api.addressReads).toBe(2);
  });
}

for (const readFailure of [
  403,
  404
]) {
  test(`does not expose address data after a denied or missing read (${readFailure})`, async ({ page }) => {
    const api = await installContracts(page, { readFailure });
    await page.goto('/#/clients/7/address');
    await expect.poll(() => api.addressReads).toBe(1);
    await expect(page.locator('mifosx-address-tab')).toHaveCount(0);
    expect(api.writes).toHaveLength(0);
    expect(api.tileRequests).toHaveLength(0);
  });
}

test('handles a missing address template without opening an empty form', async ({ page }) => {
  await installContracts(page, { missingTemplate: true });
  await openAddress(page);
  await expect(page.locator('mifosx-address-tab').getByRole('button', { name: 'Add', exact: true })).toBeDisabled();
});

test('preserves wizard coordinates through navigation, preview, final creation payload and mocked reload', async ({
  page
}) => {
  const api = await installContracts(page);
  await page.goto('/#/clients/create');
  const general = page.locator('mifosx-client-general-step');
  await general.getByRole('combobox', { name: 'Office', exact: true }).click();
  await page.getByRole('option', { name: 'Synthetic office', exact: true }).click();
  await general.getByLabel('First Name', { exact: true }).fill('Synthetic');
  await general.getByLabel('Last Name', { exact: true }).fill('Customer');
  await page.getByRole('tab', { name: 'ADDRESS', exact: true }).click();
  const addressStep = page.locator('mifosx-client-address-step');
  await addressStep.getByRole('button', { name: 'Add', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('combobox', { name: 'Address Type' }).click();
  await page.getByRole('option', { name: 'Home', exact: true }).click();
  await dialog.getByLabel('Street', { exact: true }).fill('Synthetic wizard street');
  await dialog.getByLabel('Latitude', { exact: true }).fill('28.6139123456789');
  await dialog.getByLabel('Longitude', { exact: true }).fill('-77.2090123456789');
  await dialog.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('tab', { name: 'GENERAL', exact: true }).click();
  await page.getByRole('tab', { name: 'ADDRESS', exact: true }).click();
  await expect(addressStep).toContainText('28.6139123456789');
  await page.getByRole('tab', { name: 'PREVIEW', exact: true }).click();
  const preview = page.locator('mifosx-client-preview-step');
  await preview.locator('mat-expansion-panel-header').last().click();
  await expect(preview).toContainText('-77.2090123456789');
  await preview.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect.poll(() => api.createdClients.length).toBe(1);
  expect(api.createdClients[0].address[0]).toMatchObject({
    street: 'Synthetic wizard street',
    latitude: '28.6139123456789',
    longitude: '-77.2090123456789'
  });
  await page.goto('/#/clients/7/address');
  const saved = page.locator('mifosx-address-tab');
  await saved.locator('mat-expansion-panel-header').click();
  await expect(saved).toContainText('28.6139123456789');
  await expect(saved.locator('.leaflet-marker-icon')).toHaveCount(1);
});

test('reconciles activation without changing saved coordinates or address details', async ({ page }) => {
  const api = await installContracts(page);
  await openAddress(page);
  const tab = page.locator('mifosx-address-tab');
  const toggle = tab.getByRole('switch', { name: 'Active Status', exact: true });
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  await expect(tab).toContainText('Active Status : No');
  expect(api.writes[0].payload).toEqual({ addressId: 11, isActive: false });
  await expect(tab).toContainText('28.6139');
  await expect(tab).toContainText('Synthetic Street');
  await toggle.click();
  await expect(toggle).toBeChecked();
  expect(api.writes[1].payload).toEqual({ addressId: 11, isActive: true });
});

test('retains the saved activation state when its update is denied', async ({ page }) => {
  const api = await installContracts(page, { writeFailure: 403 });
  await openAddress(page);
  const toggle = page.locator('mifosx-address-tab').getByRole('switch', { name: 'Active Status', exact: true });
  await toggle.click();
  await expect.poll(() => api.writes.length).toBe(1);
  await expect(toggle).toBeChecked();
  expect(api.addressReads).toBe(1);
});
