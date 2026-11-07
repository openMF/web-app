/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { test, expect } from '../../fixtures/auth-session';

/** Live integration test for stock Fineract and deployments with the office extension plugin. */
test('office details reflect persisted addresses, maps and available backend services', async ({
  page,
  request
}, testInfo) => {
  test.setTimeout(240000);
  // Keep map assertions independent of tile-provider availability, including offline CI.
  await page.route('https://*.tile.openstreetmap.org/**', (route) => route.abort());
  const baseURL = testInfo.project.use.baseURL || 'http://localhost:4200';
  const api = `${process.env.E2E_FINERACT_URL || 'https://localhost:8443'}/fineract-provider/api`;
  const username = process.env.E2E_USERNAME || 'mifos';
  const password = process.env.E2E_PASSWORD || 'password';
  const headers = {
    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
    'Fineract-Platform-TenantId': process.env.E2E_TENANT_ID || 'default'
  };
  const officesResponse = await request.get(`${api}/v1/offices`, { headers });
  expect(officesResponse.ok()).toBeTruthy();
  const offices = await officesResponse.json();
  const templateResponse = await request.get(`${api}/v1/client/addresses/template`, { headers });
  expect(templateResponse.ok()).toBeTruthy();
  const create = await request.post(`${api}/v1/offices`, {
    headers,
    data: {
      name: `WEB-1046 demo ${Date.now()}`,
      parentId: offices[0].id,
      openingDate: '01 January 2020',
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    }
  });
  expect(create.ok(), await create.text()).toBeTruthy();
  const officeId = (await create.json()).officeId;
  expect(officeId).toBeTruthy();
  // Use the same authenticated storage state and session restoration as the CI suite.
  await page.goto(`${baseURL}/#/organization/offices/${officeId}/general`);
  const summary = page.locator('mifosx-general-tab');
  await expect(summary).toContainText('Address & Location');
  const addressCapability = await request.get(`${api}/v2/offices/${officeId}/addresses`, { headers });
  // Stock Fineract has no office extension API. Assert that UI contract instead of skipping the test.
  expect([
    200,
    404
  ]).toContain(addressCapability.status());
  let addresses: unknown[] = [];
  if (addressCapability.status() === 404) {
    await expect(summary.locator('mifosx-office-address-tab')).toContainText(
      'Office Address management requires the Savings Plugin to be deployed.'
    );
    await expect(summary.locator('mifosx-address-location-map')).toHaveCount(0);
    await page.getByRole('tab', { name: 'Address', exact: true }).click();
    await expect(
      page.locator('mifosx-office-address-tab').getByRole('button', { name: 'Add', exact: true }).first()
    ).toBeDisabled();
    await page.getByRole('tab', { name: 'General', exact: true }).click();
  } else {
    await expect(summary.locator('mifosx-office-address-tab')).toContainText('No data found');
    await page.screenshot({ path: testInfo.outputPath('empty.png'), fullPage: true });
    await page.getByRole('tab', { name: 'Address', exact: true }).click();
    await page.locator('mifosx-office-address-tab').getByRole('button', { name: 'Add', exact: true }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Address Type', { exact: false }).click();
    await page.getByRole('option').first().click();
    const street = `Victor persistence ${officeId}`;
    await dialog.getByLabel('Street', { exact: false }).fill(street);
    await dialog.getByLabel('City', { exact: false }).fill('San José');
    await dialog.getByLabel('Postal Code', { exact: false }).fill('10101');
    await dialog.getByLabel('State / Province', { exact: false }).click();
    await page.getByRole('option').first().click();
    await dialog.getByRole('combobox', { name: 'Country', exact: true }).click();
    await page.getByRole('option', { name: 'CR', exact: true }).click();
    // Offices expose coordinate entry even with the default client location flag disabled.
    await expect(dialog.getByLabel('Latitude', { exact: false })).toBeVisible();
    await expect(dialog.getByLabel('Longitude', { exact: false })).toBeVisible();
    // Creating an address without a location remains supported.
    const saved = page.waitForResponse(
      (response) =>
        response.url().includes(`/v2/offices/${officeId}/addresses`) && response.request().method() === 'POST'
    );
    await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
    expect((await saved).status()).toBe(200);
    await expect(dialog).not.toBeVisible();
    await page.getByRole('tab', { name: 'General', exact: true }).click();
    await expect(summary.locator('mifosx-office-address-tab')).toContainText('Not Provided');
    await expect(summary.locator('mifosx-address-location-map')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath('missing-location.png'), fullPage: true });

    const readAddress = async () => {
      const response = await request.get(`${api}/v2/offices/${officeId}/addresses`, { headers });
      expect(response.ok()).toBeTruthy();
      const values = await response.json();
      expect(values).toHaveLength(1);
      expect(values[0].officeId).toBe(officeId);
      return values[0];
    };
    const original = await readAddress();
    const openEdit = async () => {
      await page.getByRole('tab', { name: 'Address', exact: true }).click();
      const panel = page.locator('mifosx-office-address-tab mat-expansion-panel');
      if ((await panel.locator('mat-expansion-panel-header').getAttribute('aria-expanded')) !== 'true') {
        await panel.locator('mat-expansion-panel-header').click();
      }
      await panel.getByRole('button', { name: 'Edit', exact: true }).click();
      await expect(dialog).toBeVisible();
    };
    const saveEdit = async () => {
      const updated = page.waitForResponse(
        (response) =>
          response.url().endsWith(`/v2/offices/${officeId}/addresses/${original.officeAddressId}`) &&
          response.request().method() === 'PUT'
      );
      await dialog.getByRole('button', { name: 'Edit', exact: true }).click();
      expect((await updated).status()).toBe(200);
      await expect(dialog).not.toBeVisible();
      await expect(page.locator('mifosx-office-address-tab mat-expansion-panel')).toBeVisible();
    };
    await openEdit();
    const latitude = dialog.getByLabel('Latitude', { exact: false });
    const longitude = dialog.getByLabel('Longitude', { exact: false });
    const saveButton = dialog.getByRole('button', { name: 'Edit', exact: true });
    await latitude.fill('9.92806912');
    await longitude.focus();
    await longitude.blur();
    await expect(saveButton).toBeDisabled();
    await expect(dialog.locator('mat-error')).toContainText('required');
    await longitude.fill('-84.09072512');
    await latitude.fill('91');
    await latitude.blur();
    await expect(saveButton).toBeDisabled();
    await expect(dialog.locator('mat-error')).toContainText('Maximum Value must be 90');
    await latitude.fill('9.92806912');
    await expect(saveButton).toBeEnabled();
    for (const coordinate of [
      latitude,
      longitude
    ]) {
      const originalValue = await coordinate.inputValue();
      for (const value of [
        '0.123456789',
        '-5e-9'
      ]) {
        await coordinate.fill(value);
        await coordinate.blur();
        await expect(saveButton).toBeDisabled();
        await expect(dialog.locator('mat-error')).toHaveText('Up to 8 decimal places allowed');
      }
      await coordinate.fill(originalValue);
      await expect(saveButton).toBeEnabled();
    }
    // The form remains scrollable and its actions usable at all required widths.
    for (const width of [
      390,
      768,
      1280,
      1920
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      await longitude.scrollIntoViewIfNeeded();
      await expect(latitude).toBeVisible();
      await expect(longitude).toBeVisible();
      await expect(saveButton).toBeInViewport();
      expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`edit-${width}.png`), fullPage: true });
    }
    await saveEdit();
    const located = await readAddress();
    expect(located).toMatchObject({ ...original, latitude: 9.92806912, longitude: -84.09072512 });

    // A text-only edit must keep the location and the same office-address record.
    await openEdit();
    await dialog.getByLabel('Postal Code', { exact: false }).fill('10102');
    await saveEdit();
    expect(await readAddress()).toMatchObject({ ...located, postalCode: '10102' });
    // Cancel must leave the persisted coordinates unchanged.
    await openEdit();
    await latitude.fill('10');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(
      page.locator('mifosx-office-address-tab').getByRole('button', { name: 'Edit', exact: true })
    ).toBeFocused();
    expect(await readAddress()).toMatchObject({ ...located, postalCode: '10102' });
    // Either member can be changed while retaining the other saved value.
    await openEdit();
    await latitude.fill('10.12345678');
    await saveEdit();
    expect(await readAddress()).toMatchObject({ latitude: 10.12345678, longitude: -84.09072512 });
    await openEdit();
    await longitude.fill('-85.12345678');
    await saveEdit();
    expect(await readAddress()).toMatchObject({ latitude: 10.12345678, longitude: -85.12345678 });
    // Clearing both is deliberate, persists nulls, and removes the map after reload.
    await openEdit();
    await latitude.fill('');
    await expect(saveButton).toBeDisabled();
    await longitude.fill('');
    await saveEdit();
    expect(await readAddress()).toMatchObject({ latitude: null, longitude: null });
    await page.getByRole('tab', { name: 'General', exact: true }).click();
    await expect(summary).toBeVisible();
    await page.reload();
    await expect(summary.locator('mifosx-address-location-map')).toHaveCount(0);
    // Zero is a valid location and must render a marker.
    await openEdit();
    await latitude.fill('0');
    await longitude.fill('0');
    await saveEdit();
    await page.getByRole('tab', { name: 'General', exact: true }).click();
    await expect(summary.locator('.leaflet-marker-icon')).toBeVisible();
    expect(await readAddress()).toMatchObject({ latitude: 0, longitude: 0 });
    // Dynamic number inputs can return strings; the locale parser needs decimal text instead of e notation.
    await openEdit();
    await latitude.fill('5e-8');
    await longitude.fill('-5e-8');
    const exponentWrite = page.waitForRequest(
      (request) =>
        request.method() === 'PUT' &&
        request.url().endsWith(`/v2/offices/${officeId}/addresses/${original.officeAddressId}`)
    );
    await saveEdit();
    expect((await exponentWrite).postDataJSON()).toMatchObject({
      latitude: '0.00000005',
      longitude: '-0.00000005',
      locale: 'en'
    });
    expect(await readAddress()).toMatchObject({ latitude: 0.00000005, longitude: -0.00000005 });

    await openEdit();
    await latitude.fill('9.92806912');
    await longitude.fill('-84.09072512');
    await saveEdit();
    // Reopen through a new document so no component state can satisfy these assertions.
    await page.getByRole('tab', { name: 'General', exact: true }).click();
    await expect(summary).toBeVisible();
    await page.reload();
    await expect(summary).toContainText(street);
    await expect(summary).toContainText('9.92806912');
    await expect(summary).toContainText('-84.09072512');
    await expect(summary.locator('.leaflet-marker-icon')).toHaveCount(1);
    await expect(summary.locator('.leaflet-container')).toBeVisible();
    await expect(summary.locator('.leaflet-marker-icon')).toBeVisible();
    await expect(summary.locator('mifosx-office-address-tab button')).toHaveCount(0);
    await expect(summary.locator('mifosx-address-location-map')).toContainText('Map tiles unavailable');
    for (const width of [
      390,
      768,
      1280,
      1920
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      const map = summary.locator('.leaflet-container');
      await map.scrollIntoViewIfNeeded();
      await expect(summary.locator('.leaflet-marker-icon')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`location-${width}.png`), fullPage: true });
    }
    for (let repeat = 0; repeat < 3; repeat++) {
      await page.getByRole('tab', { name: 'Address', exact: true }).click();
      const header = page.locator('mifosx-office-address-tab mat-expansion-panel-header');
      await header.click();
      await expect(page.locator('.leaflet-marker-icon')).toHaveCount(1);
      await header.click();
      await header.click();
      await expect(page.locator('.leaflet-marker-icon')).toHaveCount(1);
      await page.getByRole('tab', { name: 'General', exact: true }).click();
      await expect(summary.locator('.leaflet-marker-icon')).toHaveCount(1);
    }
    const persisted = await request.get(`${api}/v2/offices/${officeId}/addresses`, { headers });
    expect(persisted.ok()).toBeTruthy();
    addresses = await persisted.json();
    expect(addresses[0]).toMatchObject({ street, officeId, latitude: 9.92806912, longitude: -84.09072512 });
  }
  const services = await request.get(`${api}/v2/offices/${officeId}/services`, { headers });
  expect([
    200,
    404
  ]).toContain(services.status());
  let serviceData: unknown[] = [];
  if (services.status() === 404) {
    await expect(summary.locator('mifosx-office-services-tab')).toContainText(
      'Office Services management requires the Savings Plugin to be deployed.'
    );
    await expect(summary.locator('mifosx-office-services-tab table')).toHaveCount(0);
  } else {
    expect(await services.json()).toEqual([]);
    await expect(summary.locator('mifosx-office-services-tab')).toContainText('No data found');
    const createdService = await request.post(`${api}/v2/offices/${officeId}/services`, {
      headers,
      data: {
        serviceName: 'WEB-1046 integration fixture',
        serviceExternalId: `web1046-${officeId}`,
        workingHours: 'Monday 09:00–17:00'
      }
    });
    expect(createdService.ok(), await createdService.text()).toBeTruthy();
    await expect(summary).toBeVisible();
    await page.reload();
    await expect(summary.locator('mifosx-office-services-tab')).toContainText('WEB-1046 integration fixture');
    await expect(summary.locator('mifosx-office-services-tab')).toContainText('Monday 09:00–17:00');
    const savedServices = await request.get(`${api}/v2/offices/${officeId}/services`, { headers });
    expect(savedServices.ok()).toBeTruthy();
    serviceData = await savedServices.json();
    expect(serviceData[0]).toMatchObject({ officeId, serviceName: 'WEB-1046 integration fixture' });
  }
  await summary.locator('mifosx-office-services-tab').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('services-in-browser.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.screenshot({ path: testInfo.outputPath('mobile-details.png'), fullPage: true });
  await testInfo.attach('backend-evidence', {
    body: JSON.stringify(
      {
        officeId,
        addressStatus: addressCapability.status(),
        serviceStatus: services.status(),
        addresses,
        services: serviceData
      },
      null,
      2
    ),
    contentType: 'application/json'
  });
  // A failed office-list request must not redirect to OfficesResolver and request it again.
  let officeListRequests = 0;
  await page.route(/\/api\/v1\/offices(?:\?.*)?$/, async (route) => {
    officeListRequests++;
    await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
  });
  await page.reload();
  await expect(page).toHaveURL(`${baseURL}/#/organization`);
  await expect(page.locator('mifosx-products')).toBeVisible();
  expect(officeListRequests).toBe(1);
});
