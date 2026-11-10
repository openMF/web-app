/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect, Page } from '@playwright/test';

// Frontend contract tests: every API response and client is synthetic. These do not
// establish that Pentaho is installed or that report SQL enforces client/office scope.
test.use({ storageState: { cookies: [], origins: [] } });

function syntheticPdf(): Buffer {
  const stream = 'BT /F1 12 Tf 32 120 Td (Synthetic KYC fixture) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 180] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}

async function prepare(
  page: Page,
  options: {
    production?: boolean;
    authorized?: boolean;
    enabled?: boolean;
    spanish?: boolean;
    language?: string;
    masked?: boolean;
  } = {}
) {
  const language = options.language || (options.spanish ? 'es-MX' : 'en-US');
  await page.route('**/assets/env.js', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `window.env = ${JSON.stringify({
        productionMode: options.production ?? true,
        fineractApiUrl: 'http://localhost:4200',
        fineractPlatformTenantId: 'synthetic-kyc',
        complianceHideClientData: options.masked ?? false,
        defaultLanguage: language
      })};`
    })
  );
  await page.addInitScript(
    ({ authorized, language }) => {
      localStorage.setItem(
        'mifosXCredentials',
        JSON.stringify({
          authenticated: true,
          rememberMe: true,
          userId: 9000,
          username: 'synthetic-kyc-user',
          officeId: 1,
          officeName: 'Synthetic Office',
          roles: [],
          permissions: authorized ? ['ALL_FUNCTIONS_READ'] : ['READ_CLIENT'],
          base64EncodedAuthenticationKey: btoa('synthetic:fixture'),
          shouldRenewPassword: false
        })
      );
      localStorage.setItem('mifosXLanguage', JSON.stringify({ code: language.slice(0, 2), name: language }));
    },
    { authorized: options.authorized ?? true, language }
  );
  await page.route('**/fineract-provider/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.split('/api/v1')[1] || '';
    if (path.startsWith('/runreports/')) {
      await route.fulfill({ contentType: 'application/pdf', body: syntheticPdf() });
      return;
    }
    const client = path.match(/^\/clients\/(9001|9002)$/);
    let json: unknown = [];
    if (client) {
      const entity = client[1] === '9002';
      json = {
        id: Number(client[1]),
        accountNo: client[1],
        displayName: entity ? 'Synthetic Entity' : 'Synthetic Person',
        officeId: 1,
        officeName: 'Synthetic Office',
        active: true,
        groups: [],
        legalForm: { id: entity ? '2' : '1' },
        status: { id: 300, value: 'Active', code: 'clientStatusType.active' },
        timeline: { submittedOnDate: [
            2026,
            1,
            1
          ] }
      };
    } else if (path === '/configurations') {
      json = { globalConfiguration: [{ name: 'enable-kyc-validation', enabled: options.enabled ?? true }] };
    } else if (path === '/notifications') {
      json = { pageItems: [], totalFilteredRecords: 0 };
    } else if (path === '/clients/template' || path.endsWith('/identifiers/template')) {
      json = {};
    } else if (path.startsWith('/datatables/')) {
      json = { data: [], columnHeaders: [] };
    } else if (path.endsWith('/images')) {
      await route.fulfill({ contentType: 'text/plain', body: '' });
      return;
    }
    await route.fulfill({ json });
  });
}

for (const production of [
  false,
  true
]) {
  for (const width of [
    390,
    768,
    1280,
    1920
  ]) {
    test(`PERSON and ENTITY preview/download, production=${production}, width=${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await prepare(page, { production });
      for (const [
        clientId,
        report
      ] of [
        [
          9001,
          'KYCNaturalPerson'
        ],
        [
          9002,
          'KYCLegalPerson'
        ]
      ] as const) {
        await page.goto(`/#/clients/${clientId}/personal-data`);
        const exportButton = page.getByRole('button', { name: 'Export KYC', exact: true });
        await expect(exportButton).toBeVisible();
        const header = page.locator('.button-header');
        await expect(header).toHaveCSS('justify-content', 'flex-end');
        const section = page.locator('mifosx-personal-data-tab .section').first();
        expect((await exportButton.boundingBox())!.y).toBeLessThan((await section.boundingBox())!.y);
        const requestPromise = page.waitForRequest((request) => request.url().includes(`/runreports/${report}?`));
        await exportButton.click();
        const request = await requestPromise;
        expect(request.method()).toBe('GET');
        expect(request.headers()['authorization']).toBe('Basic ' + Buffer.from('synthetic:fixture').toString('base64'));
        const params = new URL(request.url()).searchParams;
        expect(params.get('R_clientId')).toBe(String(clientId));
        expect(params.get('output-type')).toBe('PDF');
        expect(params.get('locale')).toBe('en');
        expect(params.get('dateFormat')).toBe('dd MMMM yyyy');
        expect(params.get('tenantIdentifier')).toBe('synthetic-kyc');
        const dialog = page.getByRole('dialog', { name: 'Export KYC' });
        await expect(dialog).toBeVisible();
        if (production && [
            390,
            1280
          ].includes(width)) {
          await page.screenshot({ path: test.info().outputPath(`client-${clientId}-preview.png`) });
        }
        await expect(dialog.locator('embed')).toHaveAttribute('src', /^blob:/);
        const downloadPromise = page.waitForEvent('download');
        await dialog.getByRole('button', { name: 'Download PDF' }).click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBe(`KYC-${clientId}.pdf`);
        const stream = await download.createReadStream();
        const chunks: Buffer[] = [];
        for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
        expect(Buffer.concat(chunks)).toEqual(syntheticPdf());
        if (production && [
            390,
            1280
          ].includes(width)) {
          await page.screenshot({ path: test.info().outputPath(`client-${clientId}-preview.png`) });
        }
        await dialog.getByRole('button', { name: 'Close', exact: true }).press('Escape');
        await expect(dialog).toBeHidden();
        await expect(exportButton).toBeFocused();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      }
    });
  }
}

for (const [
  status,
  contentType,
  body
] of [
  [
    404,
    'application/json',
    '{}'
  ],
  [
    403,
    'application/json',
    '{}'
  ],
  [
    200,
    'text/html',
    '<html>Error</html>'
  ],
  [
    200,
    'application/json',
    '{}'
  ]
] as const) {
  test(`rejects report response ${status} ${contentType}`, async ({ page }) => {
    await prepare(page);
    await page.goto('/#/clients/9001/personal-data');
    await page.route('**/runreports/**', (route) => route.fulfill({ status, contentType, body }));
    await page.getByRole('button', { name: 'Export KYC', exact: true }).click();
    await expect(page.getByText('Failed to load KYC PDF report.', { exact: true })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Export KYC' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Export KYC', exact: true })).toBeEnabled();
  });
}

test('prevents duplicates and cancels the old client export during navigation', async ({ page }) => {
  await prepare(page);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requests = 0;
  await page.route('**/runreports/**', async (route) => {
    requests++;
    await gate;
    await route.fulfill({ contentType: 'application/pdf', body: syntheticPdf() }).catch(() => {});
  });
  await page.goto('/#/clients/9001/personal-data');
  const button = page.getByRole('button', { name: 'Export KYC', exact: true });
  await button.click();
  await expect(button).toBeDisabled();
  await expect.poll(() => requests).toBe(1);
  const duplicateRequest = page
    .waitForRequest((request) => new URL(request.url()).pathname.includes('/runreports/'), { timeout: 500 })
    .then(() => true)
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'TimeoutError') return false;
      throw error;
    });
  await button.dispatchEvent('click');
  expect(await duplicateRequest).toBe(false);
  await expect.poll(() => requests).toBe(1);
  await page.evaluate(() => {
    location.hash = '/clients/9002/personal-data';
  });
  await expect(page.locator('mifosx-entity-production-personal-data')).toBeVisible();
  release();
  await expect(page.getByRole('dialog', { name: 'Export KYC' })).toBeHidden();
  await expect(button).toBeEnabled();
});

for (const options of [
  { authorized: false },
  { enabled: false },
  { masked: true }
]) {
  test(`respects export availability ${JSON.stringify(options)}`, async ({ page }) => {
    await prepare(page, options);
    await page.goto('/#/clients/9001/personal-data');
    await expect(page.locator('mifosx-person-production-personal-data')).toBeVisible();
    await expect(page.locator('.export-kyc-button')).toBeHidden();
    if (options.enabled !== false) await expect(page.locator('.validate-docs-button')).toBeVisible();
  });
}

test('uses the existing Spanish export, download and close translations', async ({ page }) => {
  await prepare(page, { spanish: true });
  await page.goto('/#/clients/9002/personal-data');
  await page.getByRole('button', { name: 'Exportar KYC', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Descargar PDF' })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('places PDF before the translated Nepali download action', async ({ page }) => {
  await prepare(page, { language: 'ne-NE' });
  await page.goto('/#/clients/9002/personal-data');
  await page.locator('.export-kyc-button').click();
  await expect(
    page.getByRole('dialog').getByRole('button', { name: 'PDF डाउनलोड गर्नुहोस्', exact: true })
  ).toBeVisible();
});
