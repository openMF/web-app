/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '../../fixtures/auth-session';

/** Requires a live Savings Plugin; no schedule or service responses are mocked. */
test('office schedules display actual LocalTime values and persist the complete week', async ({
  page,
  request
}, testInfo) => {
  test.setTimeout(240000);
  const api = `${process.env.E2E_FINERACT_URL || 'https://localhost:8443'}/fineract-provider/api`;
  const headers = {
    Authorization: `Basic ${Buffer.from(`${process.env.E2E_USERNAME || 'mifos'}:${process.env.E2E_PASSWORD || 'password'}`).toString('base64')}`,
    'Fineract-Platform-TenantId': process.env.E2E_TENANT_ID || 'default'
  };
  const officesResponse = await request.get(`${api}/v1/offices`, { headers });
  expect(officesResponse.ok()).toBeTruthy();
  const offices = await officesResponse.json();
  const capability = await request.get(`${api}/v2/offices/${offices[0].id}/schedules`, { headers });
  test.skip(capability.status() === 404, 'Requires the Savings Plugin office schedules endpoint.');
  expect(capability.ok(), await capability.text()).toBeTruthy();

  const createOffice = async (suffix: string) => {
    const response = await request.post(`${api}/v1/offices`, {
      headers,
      data: {
        name: `WEB-1420 ${suffix} ${Date.now()}`,
        parentId: offices[0].id,
        openingDate: '01 January 2020',
        dateFormat: 'dd MMMM yyyy',
        locale: 'en'
      }
    });
    expect(response.ok(), await response.text()).toBeTruthy();
    return (await response.json()).officeId;
  };
  const officeId = await createOffice('hours');
  const emptyOfficeId = await createOffice('empty');
  const scheduleURL = `${api}/v2/offices/${officeId}/schedules`;
  const weekdays = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
  ];
  const days = weekdays.map((weekday, index) => ({
    weekday,
    enabled: index < 5,
    ...(index < 5 ? { openingTime: index === 1 ? '08:30:05' : '08:00', closingTime: '18:00' } : {})
  }));
  const seed = await request.put(scheduleURL, { headers, data: { days } });
  expect(seed.ok(), await seed.text()).toBeTruthy();
  const readSchedule = async () => {
    const response = await request.get(scheduleURL, { headers });
    expect(response.ok()).toBeTruthy();
    const schedule = await response.json();
    expect(schedule.officeId).toBe(officeId);
    expect(schedule.days).toHaveLength(7);
    return schedule;
  };
  const initial = await readSchedule();
  const service = await request.post(`${api}/v2/offices/${officeId}/services`, {
    headers,
    data: { serviceName: 'WEB-1420 service', serviceExternalId: `web1420-${officeId}`, workingHours: '10:00–14:00' }
  });
  expect(service.ok(), await service.text()).toBeTruthy();

  await page.goto(`/#/organization/offices/${officeId}/schedules`);
  const panel = page.locator('mifosx-office-schedules-tab');
  const rows = panel.locator('.schedule-row');
  await expect(rows).toHaveCount(7);
  for (let index = 0; index < 7; index++) {
    const row = rows.nth(index);
    const opening = row.locator('input[formControlName=openingTime]');
    if (index < 5) {
      await expect(row.getByRole('checkbox')).toBeChecked();
      await expect(opening).toHaveValue(index === 1 ? '08:30:05' : '08:00');
      await expect(row.locator('input[formControlName=closingTime]')).toHaveValue('18:00');
    } else {
      await expect(row).toContainText('Closed');
      await expect(opening).toBeDisabled();
      await expect(row.getByRole('checkbox')).not.toBeChecked();
    }
  }

  const save = panel.getByRole('button', { name: 'Save Changes', exact: true });
  const opening = panel.getByLabel('Monday Opening Time', { exact: true });
  const closing = panel.getByLabel('Monday Closing Time', { exact: true });
  await opening.fill('');
  await opening.blur();
  await expect(rows.first()).toContainText('Not configured');
  await expect(save).toBeDisabled();
  await opening.fill('19:00');
  await closing.focus();
  await closing.blur();
  await expect(rows.first().locator('mat-error')).toContainText('Opening time must be before closing time');
  await expect(save).toBeDisabled();
  await opening.fill('00:00');
  await closing.fill('12:00');
  await expect(save).toBeEnabled();
  const put = page.waitForResponse(
    (response) => response.url().endsWith(`/v2/offices/${officeId}/schedules`) && response.request().method() === 'PUT'
  );
  const refresh = page.waitForResponse(
    (response) => response.url().endsWith(`/v2/offices/${officeId}/schedules`) && response.request().method() === 'GET'
  );
  await save.click();
  const updated = await put;
  expect(updated.ok()).toBeTruthy();
  const payload = updated.request().postDataJSON();
  expect(payload).toEqual({ days: [
      { weekday: 'MONDAY', enabled: true, openingTime: '00:00', closingTime: '12:00' },
      ...days.slice(1)
    ] });
  expect((await refresh).ok()).toBeTruthy();
  await expect(opening).toHaveValue('00:00');
  const persisted = await readSchedule();
  expect(persisted.days[0]).toMatchObject({ openingTime: [
      0,
      0,
      0
    ], closingTime: [
      12,
      0,
      0
    ] });
  expect(persisted.days.slice(1)).toEqual(initial.days.slice(1));
  await page.reload();
  await expect(opening).toHaveValue('00:00');
  await expect(closing).toHaveValue('12:00');
  await expect(panel.getByLabel('Tuesday Opening Time', { exact: true })).toHaveValue('08:30:05');

  for (const width of [
    390,
    768,
    1280,
    1920
  ]) {
    await page.setViewportSize({ width, height: 1000 });
    await opening.scrollIntoViewIfNeeded();
    await expect(opening).toBeVisible();
    await expect(closing).toBeVisible();
    expect(await panel.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`schedules-${width}.png`), fullPage: true });
    await save.scrollIntoViewIfNeeded();
    await expect(save).toBeInViewport();
  }
  await page.getByRole('tab', { name: 'Services', exact: true }).click();
  const services = page.locator('mifosx-office-services-tab');
  await expect(services).toContainText('WEB-1420 service');
  await expect(services).toContainText('10:00–14:00');
  expect(await readSchedule()).toEqual(persisted);
  // Route reuse must retrieve this office's empty schedule, not the previous office's week.
  await page.goto(`/#/organization/offices/${emptyOfficeId}/schedules`);
  await expect(panel).toContainText('No configured hours');
  await expect(panel.getByLabel('Monday Opening Time', { exact: true })).toHaveValue('');
  await page.goto(`/#/organization/offices/${officeId}/schedules`);
  await expect(opening).toHaveValue('00:00');
  await expect(closing).toHaveValue('12:00');
  await testInfo.attach('real-schedule-readback', {
    body: JSON.stringify({ officeId, initial, payload, persisted }, null, 2),
    contentType: 'application/json'
  });
});
