/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect, Page } from '@playwright/test';

// Isolated UI contract fixtures. All API calls are intercepted; no backend writes occur.
test.use({ storageState: { cookies: [], origins: [] } });

const weekdays = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
];
const office = { id: 1, name: 'Hours contract fixture', hierarchy: '.', openingDate: [
    2020,
    1,
    1
  ] };

async function mockHours(
  page: Page,
  permissions = ['ALL_FUNCTIONS'],
  holidayError = 0,
  scheduleError = 0,
  exactTimes = false
) {
  const calls: { method: string; path: string; officeId: string | null; payload: any }[] = [];
  let days = weekdays.map((weekday, index) => ({
    weekday,
    enabled: index < 5,
    ...(index < 5
      ? {
          openingTime: exactTimes && index === 1 ? '08:30:05' : '08:00',
          closingTime: exactTimes && index === 1 ? '18:00:30' : '18:00'
        }
      : {})
  }));
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
          officeName: 'Hours contract fixture',
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
    await route.fulfill({
      response,
      body:
        (await response.text()) +
        '\nwindow.env.productionModeEnableRBAC = true;\nwindow.env.supportedLanguages = "en-US,es-MX,de-DE";'
    });
  });
  await page.route('https://*.tile.openstreetmap.org/**', (route) => route.abort());
  await page.route('**/fineract-provider/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/fineract-provider/api', '');
    const method = request.method();
    const payload = request.postDataJSON();
    calls.push({ method, path, officeId: url.searchParams.get('officeId'), payload });
    let body: unknown = [];
    if (path === '/v1/offices') body = [office];
    else if (path === '/v1/offices/1') body = office;
    else if (path === '/v2/offices/1/schedules') {
      if (scheduleError) {
        await route.fulfill({ status: scheduleError, json: { error: 'Not Found' } });
        return;
      }
      if (method === 'PUT') {
        days = payload.days;
        body = { resourceId: 1 };
      } else body = { officeId: 1, days };
    } else if (path === '/v1/holidays') {
      if (holidayError) {
        await route.fulfill({ status: holidayError, json: {} });
        return;
      }
      const day = new Date();
      day.setDate(day.getDate() + 3);
      const date = [
        day.getFullYear(),
        day.getMonth() + 1,
        day.getDate()
      ];
      const end = new Date(day);
      end.setDate(end.getDate() + 2);
      body = [
        { id: 7, name: 'Calendar fixture holiday', fromDate: date, toDate: date, status: { id: 300, value: 'Active' } },
        { id: 8, name: 'Pending multi-day holiday', fromDate: date, toDate: [
            end.getFullYear(),
            end.getMonth() + 1,
            end.getDate()
          ], status: { id: 100, value: 'Pending for activation' } }
      ];
    } else if (path.includes('/notifications')) body = { pageItems: [], totalFilteredRecords: 0 };
    await route.fulfill({ json: body });
  });
  await page.goto('/#/organization/offices/1/schedules');
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
}

test('view-first dashboard uses real intervals and remains readable at all reference widths', async ({
  page
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const calls = await mockHours(page);
  const screen = page.locator('mifosx-office-schedules-tab');
  await expect(screen.locator('.weekly-table .mat-mdc-row')).toHaveCount(7);
  await expect(screen.locator('.timeline-bar')).toHaveCount(5);
  await expect(screen.locator('.weekly-summary')).toContainText('50 h per week');
  await expect(screen.locator('.weekly-summary')).toContainText('5 operating days');
  await expect(screen.locator('.holiday-row')).toHaveCount(2);
  await expect(screen.locator('input')).toHaveCount(0);
  await expect(screen.locator('.status-card')).toContainText('Current status unavailable');
  await expect(screen.locator('.holiday-badge').first()).toHaveText('Active');
  expect(calls.filter((call) => call.path === '/v1/holidays').map((call) => call.officeId)).toEqual(['1']);
  for (const width of [
    1920,
    1280,
    768,
    390
  ]) {
    await page.setViewportSize({ width, height: width < 960 ? 2400 : 1200 });
    await settleLayout(page, width);
    await page.locator('mat-sidenav-content').evaluate((element) => {
      element.scrollTop = 0;
    });
    await expect(screen.locator('.regular-schedule')).toBeVisible();
    await expect(screen.getByRole('button', { name: 'Edit schedule', exact: true })).toBeVisible();
    expect(await screen.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if (width === 390) {
      const track = await screen.locator('.timeline-track').first().boundingBox();
      const card = await screen.locator('.regular-schedule').boundingBox();
      const row = await screen.locator('.weekly-table .mat-mdc-row').first().boundingBox();
      expect(row!.height).toBeLessThan(144);
      expect(track!.width).toBeGreaterThan(card!.width - 48);
    }
    const sidebar = await screen.locator('.hours-sidebar').boundingBox();
    const schedule = await screen.locator('.regular-schedule').boundingBox();
    expect(width >= 1100 ? sidebar!.x > schedule!.x : sidebar!.y >= schedule!.y + schedule!.height).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`hours-${width}.png`), fullPage: true, animations: 'disabled' });
  }
  await page.evaluate(() => {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  });
  await page.screenshot({ path: testInfo.outputPath('hours-dark-390.png'), fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 1920, height: 1200 });
  await settleLayout(page, 1920);
  await page.screenshot({ path: testInfo.outputPath('hours-dark-1920.png'), fullPage: true, animations: 'disabled' });
  await page.evaluate(() => {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  });
  await page.locator('mifosx-toolbar mifosx-language-selector mat-select').first().click();
  await page.getByRole('option', { name: 'Español (Spanish)', exact: true }).click();
  await expect(screen.locator('h2')).toHaveText('Horarios de la sucursal');
  await page.screenshot({ path: testInfo.outputPath('hours-es-1920.png'), fullPage: true, animations: 'disabled' });
  await page.locator('mifosx-toolbar mifosx-language-selector mat-select').first().click();
  await page.getByRole('option', { name: /^Deutsch/ }).click();
  await page.setViewportSize({ width: 390, height: 2400 });
  await settleLayout(page, 390);
  expect(await screen.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('hours-de-390.png'), fullPage: true, animations: 'disabled' });
  expect(calls.filter((call) => call.method !== 'GET')).toHaveLength(0);
  expect(errors).toEqual([]);
});

test('edit, cancel and authoritative save preserve the complete-week contract', async ({ page }, testInfo) => {
  const calls = await mockHours(page);
  const screen = page.locator('mifosx-office-schedules-tab');
  await screen.getByRole('button', { name: 'Edit schedule', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.setViewportSize({ width: 390, height: 3600 });
  await settleLayout(page, 390);
  const opening = screen.getByLabel('Monday Opening Time', { exact: true });
  await opening.fill('05:30');
  await expect(screen.getByRole('button', { name: 'Save Changes', exact: true })).toBeInViewport();
  expect(await screen.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('editor-390.png'), fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 1000 });
  await screen.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(screen.locator('.configured-hours').first()).toContainText('08:00');
  expect(calls.filter((call) => call.method === 'PUT')).toHaveLength(0);
  await screen.getByRole('button', { name: 'Edit schedule', exact: true }).click();
  const save = screen.getByRole('button', { name: 'Save Changes', exact: true });
  await opening.fill('19:00');
  await opening.blur();
  await expect(save).toBeDisabled();
  await opening.fill('05:30');
  await save.click();
  await expect(screen.locator('form')).toHaveCount(0);
  await expect(screen.locator('.configured-hours').first()).toContainText('05:30');
  const writes = calls.filter((call) => call.method === 'PUT');
  expect(writes).toHaveLength(1);
  expect(writes[0].path).toBe('/v2/offices/1/schedules');
  expect(writes[0].payload.days).toHaveLength(7);
  expect(writes[0].payload.days[0]).toEqual({
    weekday: 'MONDAY',
    enabled: true,
    openingTime: '05:30',
    closingTime: '18:00'
  });
  expect(writes[0].payload.days[6]).toEqual({ weekday: 'SUNDAY', enabled: false });
  expect(calls.filter((call) => call.method === 'GET' && call.path.endsWith('/schedules'))).toHaveLength(2);
  expect(calls.filter((call) => call.path === '/v1/holidays')).toHaveLength(1);
});

test('read-only users have no mutation actions and no unpermitted holiday request', async ({ page }) => {
  const calls = await mockHours(page, ['READ_OFFICE']);
  const screen = page.locator('mifosx-office-schedules-tab');
  await expect(screen.locator('.weekly-table .mat-mdc-row')).toHaveCount(7);
  await expect(screen.locator('.edit-schedule')).toHaveCount(0);
  await expect(screen.locator('a')).toHaveCount(0);
  expect(calls.filter((call) => call.path === '/v1/holidays')).toHaveLength(0);
});

test('holiday failure leaves schedule visible and never presents successful emptiness', async ({ page }) => {
  await mockHours(page, ['ALL_FUNCTIONS'], 500);
  const screen = page.locator('mifosx-office-schedules-tab');
  await expect(screen.locator('.weekly-table .mat-mdc-row')).toHaveCount(7);
  await expect(screen.locator('[role=alert]')).toContainText('Holidays could not be loaded');
  await expect(screen).not.toContainText('No upcoming holidays');
});

test('holiday links reuse existing permission-protected routes', async ({ page }) => {
  await mockHours(page);
  const screen = page.locator('mifosx-office-schedules-tab');
  await expect(screen.getByRole('link', { name: 'Create Holiday', exact: true })).toHaveAttribute(
    'href',
    '#/organization/holidays/create'
  );
  await expect(screen.getByRole('link', { name: 'Manage Holidays', exact: false })).toHaveAttribute(
    'href',
    '#/organization/holidays'
  );
});

test('General overview keeps the compact strip without fetching holidays', async ({ page }) => {
  const calls = await mockHours(page);
  await page.getByRole('tab', { name: 'Summary', exact: true }).click();
  const screen = page.locator('mifosx-office-schedules-tab');
  await expect(screen.locator('.day-tile')).toHaveCount(7);
  await expect(screen.locator('.hours-dashboard')).toHaveCount(0);
  await expect(screen.locator('input')).toHaveCount(0);
  expect(calls.filter((call) => call.path === '/v1/holidays')).toHaveLength(1);
});

test('unavailable schedule plugin preserves branch navigation', async ({ page }) => {
  await mockHours(page, ['ALL_FUNCTIONS'], 0, 404);
  await expect(page.locator('mifosx-office-schedules-tab .unavailable-state')).toBeVisible();
  await expect(page.locator('.office-header')).toContainText(office.name);
  await expect(page.locator('mifosx-office-schedules-tab .hours-dashboard')).toHaveCount(0);
});

test('minute-only native controls preserve untouched seconds through save, reload and General overview', async ({
  page
}, testInfo) => {
  const calls = await mockHours(page, ['ALL_FUNCTIONS'], 0, 0, true);
  const screen = page.locator('mifosx-office-schedules-tab');
  await expect(screen.locator('.configured-hours').nth(1)).toHaveText('08:30 – 18:00');
  await screen.getByRole('button', { name: 'Edit schedule', exact: true }).click();
  const inputs = screen.locator('input[type=time]');
  await expect(inputs).toHaveCount(14);
  for (const input of await inputs.all()) {
    await expect(input).toHaveAttribute('step', '60');
    expect(await input.inputValue()).toMatch(/^(\d{2}:\d{2})?$/);
    expect(await input.evaluate((element: HTMLInputElement) => element.validity.stepMismatch)).toBe(false);
  }
  const tuesday = screen.getByLabel('Tuesday Opening Time', { exact: true });
  await expect(tuesday).toHaveValue('08:30');
  await tuesday.focus();
  await tuesday.blur();
  const monday = screen.getByLabel('Monday Opening Time', { exact: true });
  await monday.evaluate((input: HTMLInputElement) => {
    input.addEventListener('click', () => input.showPicker(), { once: true });
  });
  await monday.click();
  await page.screenshot({ path: testInfo.outputPath('native-minute-picker.png'), animations: 'disabled' });
  await page.keyboard.press('Escape');
  await monday.fill('08:30');
  await monday.focus();
  await monday.press('ArrowUp');
  expect(await monday.inputValue()).not.toBe('08:30');
  await monday.fill('08:31');
  const save = screen.getByRole('button', { name: 'Save Changes', exact: true });
  for (const width of [
    390,
    768,
    1280,
    1920
  ]) {
    await page.setViewportSize({ width, height: 1200 });
    await settleLayout(page, width);
    await tuesday.scrollIntoViewIfNeeded();
    await expect(tuesday).toBeVisible();
    expect(await screen.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`minute-editor-${width}.png`),
      fullPage: true,
      animations: 'disabled'
    });
    await monday.fill('');
    await monday.blur();
    await monday.scrollIntoViewIfNeeded();
    await expect(screen.locator('mat-error').first()).toBeVisible();
    await expect(save).toBeDisabled();
    await monday.fill('08:31');
  }
  await expect(save).toBeEnabled();
  await save.click();
  await expect(screen.locator('form')).toHaveCount(0);
  const write = calls.filter((call) => call.method === 'PUT');
  expect(write).toHaveLength(1);
  expect(write[0].payload.days).toHaveLength(7);
  expect(write[0].payload.days[0].openingTime).toBe('08:31');
  expect(write[0].payload.days[1]).toEqual({
    weekday: 'TUESDAY',
    enabled: true,
    openingTime: '08:30:05',
    closingTime: '18:00:30'
  });
  await page.reload();
  await expect(screen.locator('.configured-hours').first()).toHaveText('08:31 – 18:00');
  await expect(screen.locator('.configured-hours').nth(1)).toHaveText('08:30 – 18:00');
  await screen.getByRole('button', { name: 'Edit schedule', exact: true }).click();
  await expect(tuesday).toHaveValue('08:30');
  await tuesday.fill('09:00');
  await screen.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(screen.locator('.configured-hours').nth(1)).toHaveText('08:30 – 18:00');
  await page.getByRole('tab', { name: 'Summary', exact: true }).click();
  await expect(screen.locator('.day-tile').nth(1)).toContainText('08:30 – 18:00');
  expect(calls.filter((call) => call.method === 'PUT')).toHaveLength(1);
});
