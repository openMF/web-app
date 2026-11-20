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

const office = { id: 1, name: 'Services contract fixture', hierarchy: '.', openingDate: [
    2020,
    1,
    1
  ] };
const initialService = {
  id: 71,
  officeId: 1,
  serviceName: 'Dépósitos',
  serviceExternalId: 'deposit-fixture',
  workingHours: '08:00–18:00'
};

async function mockServices(
  page: Page,
  options: {
    permissions?: string[];
    scheduleError?: number;
    serviceError?: number;
    freeForm?: boolean;
    writeError?: boolean;
  } = {}
) {
  const calls: { method: string; path: string; payload: any }[] = [];
  let services = [{ ...initialService, ...(options.freeForm ? { workingHours: 'Mon–Thu by appointment' } : {}) }];
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
          officeName: 'Services contract fixture',
          permissions,
          roles: [],
          shouldRenewPassword: false
        })
      );
    },
    { permissions: options.permissions ?? ['ALL_FUNCTIONS'] }
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
    const path = new URL(request.url()).pathname.replace('/fineract-provider/api', '');
    const method = request.method();
    const payload = request.postDataJSON();
    calls.push({ method, path, payload });
    let body: unknown = [];
    if (path === '/v1/offices') body = [office];
    else if (path === '/v1/offices/1') body = office;
    else if (path === '/v2/offices/1/schedules') {
      if (options.scheduleError) {
        await route.fulfill({ status: options.scheduleError, json: { error: 'Not Found' } });
        return;
      }
      body = {
        officeId: 1,
        days: [
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
          'SATURDAY',
          'SUNDAY'
        ].map((weekday, index) => ({
          weekday,
          enabled: index < 5,
          ...(index < 5 ? { openingTime: '08:00', closingTime: '18:00' } : {})
        }))
      };
    } else if (path.startsWith('/v2/offices/1/services')) {
      if (options.serviceError || (options.writeError && method !== 'GET')) {
        await route.fulfill({ status: options.serviceError || 500, json: { error: 'Not Found' } });
        return;
      }
      if (method === 'POST') {
        services = [
          ...services,
          { ...payload, id: 82, officeId: 1 }
        ];
        body = { entityId: 82 };
      } else if (method === 'PUT') {
        services = services.map((service) =>
          service.id === Number(path.split('/').pop()) ? { ...service, ...payload } : service
        );
        body = { entityId: 82 };
      } else if (method === 'DELETE') {
        services = services.filter((service) => service.id !== Number(path.split('/').pop()));
        body = { entityId: 82 };
      } else body = services;
    } else if (path.includes('/notifications')) body = { pageItems: [], totalFilteredRecords: 0 };
    await route.fulfill({ json: body });
  });
  await page.goto('/#/organization/offices/1/services');
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

test('services dashboard remains readable at reference widths, themes and longer translations', async ({
  page
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const calls = await mockServices(page);
  const screen = page.locator('mifosx-office-services-tab');
  await expect(screen.locator('.services-table .mat-mdc-row')).toHaveCount(1);
  await expect(screen.locator('.coverage-bar')).toHaveCount(2);
  await expect(screen.locator('.catalog-unavailable')).toContainText('Catalog unavailable');
  await expect(screen.locator('.services-sidebar a, .services-sidebar button')).toHaveCount(0);
  await expect(screen.locator('.coverage-note').last()).toContainText('Service weekdays are not recorded');
  await expect(screen.locator('.coverage-context')).toContainText('not today');
  const bar = screen.locator('.branch-bar.coverage-bar');
  await expect(bar).toHaveAttribute('style', /left: 12.5%; width: 62.5%/);
  for (const theme of [
    'light',
    'dark'
  ]) {
    await page.evaluate((theme) => {
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(theme + '-theme');
    }, theme);
    for (const width of [
      1920,
      1280,
      768,
      390
    ]) {
      await page.setViewportSize({ width, height: width < 960 ? 2000 : 1200 });
      await settleLayout(page, width);
      await expect(screen.locator('.add-service')).toBeVisible();
      await expect(screen.locator('.working-hours').first()).toBeVisible();
      expect(await screen.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      if (width === 390) {
        await expect(screen.locator('.mobile-field-label').filter({ hasText: 'Working Hours' })).toBeVisible();
        await expect(screen.locator('.mobile-field-label').filter({ hasText: 'Status' })).toBeVisible();
        const badge = await screen.locator('.configured-badge').boundingBox();
        expect(badge!.width).toBeGreaterThan(64);
        expect(badge!.height).toBeLessThan(48);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const sidebar = await screen.locator('.services-sidebar').boundingBox();
      const main = await screen.locator('.services-main').boundingBox();
      expect(width >= 1280 ? sidebar!.x > main!.x : sidebar!.y >= main!.y + main!.height).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(`services-${theme}-${width}.png`),
        fullPage: true,
        animations: 'disabled'
      });
    }
  }
  const search = screen.getByRole('searchbox');
  await search.fill('DEPOSITOS');
  await expect(screen.locator('.mat-mdc-row')).toHaveCount(1);
  await search.fill('does not exist');
  await expect(screen).toContainText('No matching services');
  await expect(page.locator('.office-tab .tab-count').last()).toHaveText('1');
  await search.fill('');
  expect(calls.filter((call) => call.path.endsWith('/services'))).toHaveLength(1);
  expect(calls.filter((call) => call.path.endsWith('/schedules'))).toHaveLength(1);
  for (const [
    language,
    heading
  ] of [
    [
      'Español (Spanish)',
      'Servicios de la sucursal'
    ],
    [
      /^Deutsch/,
      'Filialdienste'
    ]
  ] as const) {
    await page.setViewportSize({ width: 1920, height: 1200 });
    await settleLayout(page, 1920);
    await page.locator('mifosx-toolbar mifosx-language-selector mat-select').first().click();
    await page.getByRole('option', { name: language, exact: typeof language === 'string' }).click();
    await expect(screen.locator('h2')).toHaveText(heading);
    await page.setViewportSize({ width: 390, height: 2000 });
    await settleLayout(page, 390);
    expect(await screen.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`services-${heading}-390.png`),
      fullPage: true,
      animations: 'disabled'
    });
  }
  expect(errors).toEqual([]);
});

test('existing dialogs create, edit and confirmation-delete through scoped APIs', async ({ page }) => {
  const calls = await mockServices(page);
  const screen = page.locator('mifosx-office-services-tab');
  await screen.getByRole('button', { name: 'Add service', exact: true }).click();
  const form = page.locator('mifosx-form-dialog');
  await form.getByRole('textbox', { name: 'Service Name', exact: true }).fill('Synthetic contract service');
  await form.getByRole('textbox', { name: 'External Id', exact: true }).fill('synthetic-1438');
  await form.getByRole('textbox', { name: 'Working Hours', exact: true }).fill('05:00:05–23:15:10');
  await form.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(screen.locator('.mat-mdc-row')).toHaveCount(2);
  const row = screen.locator('.mat-mdc-row').filter({ hasText: 'Synthetic contract service' });
  await row.getByRole('button', { name: 'Edit: Synthetic contract service', exact: true }).click();
  await form.getByRole('textbox', { name: 'Working Hours', exact: true }).fill(' Fri by appointment ');
  await form.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(row).toContainText('Fri by appointment');
  await expect(screen.locator('.coverage-bar')).toHaveCount(2);
  const actions = row.getByRole('button', { name: 'Actions: Synthetic contract service', exact: true });
  await actions.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
  const confirmation = page.locator('mifosx-delete-dialog');
  expect(calls.filter((call) => call.method === 'DELETE')).toHaveLength(0);
  await confirmation.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(row).toBeVisible();
  await actions.click();
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
  await confirmation.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(screen.locator('.mat-mdc-row')).toHaveCount(1);
  expect(calls.filter((call) => call.method === 'POST')).toEqual([
    {
      method: 'POST',
      path: '/v2/offices/1/services',
      payload: {
        serviceName: 'Synthetic contract service',
        serviceExternalId: 'synthetic-1438',
        workingHours: '05:00:05–23:15:10'
      }
    }
  ]);
  expect(calls.find((call) => call.method === 'PUT')).toEqual({
    method: 'PUT',
    path: '/v2/offices/1/services/82',
    payload: {
      serviceName: 'Synthetic contract service',
      serviceExternalId: 'synthetic-1438',
      workingHours: ' Fri by appointment '
    }
  });
  expect(calls.filter((call) => call.method === 'DELETE').map((call) => call.path)).toEqual([
    '/v2/offices/1/services/82'
  ]);
  expect(calls.filter((call) => call.method === 'GET' && call.path.endsWith('/services'))).toHaveLength(4);
});

test('read-only permissions hide management controls and preserve compact General summary', async ({ page }) => {
  const calls = await mockServices(page, { permissions: ['READ_OFFICE'], freeForm: true });
  const screen = page.locator('mifosx-office-services-tab');
  await expect(screen.locator('.mat-mdc-row')).toHaveCount(1);
  await expect(screen.locator('.add-service, .row-actions button')).toHaveCount(0);
  await expect(screen.locator('.catalog-add-guidance')).toHaveCount(0);
  await expect(screen).toContainText('Mon–Thu by appointment');
  await page.getByRole('tab', { name: 'Summary', exact: true }).click();
  await expect(screen.locator('.service-summary-row')).toHaveCount(1);
  await expect(screen.locator('.services-dashboard, input, button')).toHaveCount(0);
  expect(calls.filter((call) => call.path.endsWith('/schedules'))).toHaveLength(2); // One dashboard request and one General schedule summary request.
});

test('schedule failures preserve service management and plugin failures remain distinct', async ({ page }) => {
  await mockServices(page, { scheduleError: 500 });
  const screen = page.locator('mifosx-office-services-tab');
  await expect(screen.locator('.schedule-feedback')).toContainText('could not be loaded');
  await expect(screen.locator('.mat-mdc-row')).toHaveCount(1);
  await expect(screen.locator('.add-service')).toBeEnabled();
  const retried = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith('/v2/offices/1/schedules') && response.request().method() === 'GET'
  );
  await screen.locator('.schedule-feedback').getByRole('button', { name: 'Retry' }).click();
  await retried;
  await expect(screen.locator('.mat-mdc-row')).toHaveCount(1);
});

test('unavailable service plugin is not shown as an empty collection', async ({ page }) => {
  await mockServices(page, { serviceError: 404 });
  const screen = page.locator('mifosx-office-services-tab');
  await expect(screen.locator('.unavailable-state')).toBeVisible();
  await expect(screen.locator('.empty-state')).toHaveCount(0);
  await expect(screen.locator('.add-service')).toBeDisabled();
  await expect(screen.locator('.catalog-add-guidance')).toHaveCount(0);
  await expect(page.locator('.office-header')).toContainText(office.name);
});

test('failed writes retain existing records and do not retry automatically', async ({ page }) => {
  const calls = await mockServices(page, { writeError: true });
  const screen = page.locator('mifosx-office-services-tab');
  await screen.getByRole('button', { name: 'Edit: Dépósitos', exact: true }).click();
  const form = page.locator('mifosx-form-dialog');
  await form.getByRole('textbox', { name: 'Working Hours', exact: true }).fill('By appointment');
  await form.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(screen.locator('[role="alert"]')).toContainText('could not be saved');
  await expect(screen.locator('.mat-mdc-row')).toContainText('08:00–18:00');
  expect(calls.filter((call) => call.method === 'PUT')).toHaveLength(1);
  expect(calls.filter((call) => call.path.endsWith('/services') && call.method === 'GET')).toHaveLength(1);
});

test('full-day axis fits at 320px and subpixel intervals keep their true geometry', async ({ page }) => {
  await mockServices(page);
  await page.route('**/v2/offices/1/services', (route) =>
    route.fulfill({
      json: [
        { ...initialService, workingHours: '00:00:00–23:59:59' },
        { id: 72, serviceName: 'Short interval', workingHours: '21:59:55–22:00:00' }
      ]
    })
  );
  await page.reload();
  await page.setViewportSize({ width: 320, height: 2000 });
  await settleLayout(page, 320);
  const screen = page.locator('mifosx-office-services-tab');
  await expect(screen.locator('.coverage-bar')).toHaveCount(3);
  const axis = screen.locator('.coverage-axis');
  const box = await axis.boundingBox();
  const labels = await axis.locator('span:visible').all();
  let previousRight = box!.x;
  for (const label of labels) {
    const bounds = (await label.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(previousRight - 1);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(box!.x + box!.width + 1);
    previousRight = bounds.x + bounds.width;
  }
  const shortRow = screen.locator('.coverage-row').filter({ hasText: 'Short interval' });
  const track = (await shortRow.locator('.coverage-track').boundingBox())!;
  const bar = (await shortRow.locator('.coverage-bar').boundingBox())!;
  expect(bar.width).toBeLessThan(1);
  expect(bar.width).toBeCloseTo((track.width * 5) / 86400, 1);
  expect(bar.x + bar.width).toBeLessThanOrEqual(track.x + track.width);
  expect(await screen.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
});
