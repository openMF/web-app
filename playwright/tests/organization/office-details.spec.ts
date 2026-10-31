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
    // Persist synthetic fixture coordinates through the form when location entry is enabled.
    const coordinateEntryEnabled = (await dialog.getByLabel('Latitude', { exact: false }).count()) > 0;
    if (coordinateEntryEnabled) {
      await dialog.getByLabel('Latitude', { exact: false }).fill('9.928069');
      await dialog.getByLabel('Longitude', { exact: false }).fill('-84.090725');
    }
    await page.screenshot({ path: testInfo.outputPath('create-address.png'), fullPage: true });
    const saved = page.waitForResponse(
      (response) =>
        response.url().includes(`/v2/offices/${officeId}/addresses`) && response.request().method() === 'POST'
    );
    await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
    expect((await saved).status()).toBe(200);
    await expect(dialog).not.toBeVisible();
    if (!coordinateEntryEnabled) {
      const savedAddresses = await request.get(`${api}/v2/offices/${officeId}/addresses`, { headers });
      expect(savedAddresses.ok()).toBeTruthy();
      const addressId = (await savedAddresses.json())[0].officeAddressId;
      const locationUpdate = await request.put(`${api}/v2/offices/${officeId}/addresses/${addressId}`, {
        headers,
        data: { latitude: 9.928069, longitude: -84.090725, locale: 'en' }
      });
      expect(locationUpdate.ok(), await locationUpdate.text()).toBeTruthy();
    }
    // Reopen through a new document so no component state can satisfy these assertions.
    await page.goto(`${baseURL}/#/organization/offices`);
    await page.goto(`${baseURL}/#/organization/offices/${officeId}/general`);
    await expect(summary).toContainText(street);
    await expect(summary).toContainText('9.928069');
    await expect(summary).toContainText('-84.090725');
    await expect(summary.locator('.leaflet-marker-icon')).toHaveCount(1);
    await expect(summary.locator('.leaflet-container')).toBeVisible();
    await expect(summary.locator('.leaflet-marker-icon')).toBeVisible();
    await expect(summary.locator('mifosx-office-address-tab button')).toHaveCount(0);
    const persisted = await request.get(`${api}/v2/offices/${officeId}/addresses`, { headers });
    expect(persisted.ok()).toBeTruthy();
    addresses = await persisted.json();
    expect(addresses[0]).toMatchObject({ street, officeId, latitude: 9.928069, longitude: -84.090725 });
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
