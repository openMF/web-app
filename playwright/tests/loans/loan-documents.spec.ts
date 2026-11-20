/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { test, expect, Page, TestInfo } from '@playwright/test';
import { readFile } from 'fs/promises';
import { jsPDF } from 'jspdf';
import { unzipSync } from 'fflate';

// All account data, attachments, credentials and writes are synthetic and intercepted.
// Run independently of live auth: npm run playwright -- loan-documents.spec.ts --project chromium --no-deps
const codes = [
  '04-COMPROBANTE_DOMICILIO',
  '07-REPORTE_CREDITO_ESPECIAL',
  '08-CARTA_AUTORIZACION_REPORTES',
  '12-CONSTANCIA_SITUACION_FISCAL',
  '13-CARATULA_ESTADO_CUENTA_BANCARIA',
  '15-CONSULTA_SUSTRAE_FIRA',
  '16-RESULTADO_EVALUACION_CAPACIDAD_PAGO',
  '17-AUTORIZACION_CREDITO',
  '18-CONTRATO_CREDITO_FIRMADO',
  '19-CARTA_COMPROMISO_PAGO'
];
const pdf = new jsPDF();
pdf.text('SYNTHETIC TEST DOCUMENT — WEB-1452', 20, 24);
for (let row = 0; row < 20; row++) pdf.text('Synthetic document content for interface verification', 20, 40 + row * 8);
const bytes = Buffer.from(pdf.output('arraybuffer'));
const loan = {
  id: 1452,
  accountNo: 'SYNTHETIC-1452',
  loanProductId: 1452,
  loanProductName: 'Synthetic document product',
  clientId: 1452,
  clientName: 'Synthetic borrower',
  clientAccountNo: 'TEST-1452',
  status: {
    id: 100,
    code: 'loanStatusType.submitted.and.pending.approval',
    value: 'Submitted and pending approval',
    pendingApproval: true,
    active: false
  },
  currency: { code: 'USD', decimalPlaces: 2, displaySymbol: '$', inMultiplesOf: 1 },
  summary: { totalOutstanding: 0, totalOverdue: 0 },
  timeline: { submittedOnDate: [
      2026,
      1,
      1
    ] },
  transactions: [],
  disbursementDetails: [],
  loanType: { id: 1, value: 'Individual' },
  repaymentSchedule: { periods: [] },
  charges: []
};
test.use({
  storageState: { cookies: [], origins: [] },
  viewport: { width: 1920, height: 1445 },
  launchOptions: { slowMo: 0 }
});
let records: any[];
let listReads: number;
let writes: string[];
async function captureWorkspace(page: Page, testInfo: TestInfo, filename: string): Promise<Buffer> {
  await expect(page.locator('.document-card')).toHaveCount(10);
  await page.locator('.documents-workspace').evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await expect(page.locator('mifosx-loan-document-thumbnail img').first()).toBeVisible();
  return page.screenshot({ path: testInfo.outputPath(filename), fullPage: true });
}
async function configureSyntheticScheme(page: Page) {
  // Development-only Angular debug API injects fixture configuration; no test rules ship in production.
  const available = await page.evaluate(() => !!(window as any).ng?.getComponent);
  test.skip(
    !available,
    'Configured-product browser fixture needs the Angular development debug API; production coverage is in Jest.'
  );
  await page.evaluate(() => {
    const ng = (window as any).ng;
    const component = ng.getComponent(document.querySelector('mifosx-loan-documents-tab'));
    component.scheme = {
      numbers: Array.from({ length: 19 }, (_, i) => i + 1),
      requirements: [
        { labelKey: 'loanDocuments.categories.contract', category: 'contract' },
        { labelKey: 'loanDocuments.document', number: 1 }
      ]
    };
    ng.applyChanges(component);
  });
}

test.beforeEach(async ({ page }) => {
  records = codes.map((code, index) => ({
    id: index + 1,
    name: `TEST900101HDFXXX09-${code}.pdf`,
    fileName: `TEST900101HDFXXX09-${code}.pdf`,
    type: 'application/pdf',
    size: bytes.length
  }));
  listReads = 0;
  writes = [];
  await page.addInitScript(() => {
    const credentials = JSON.stringify({
      authenticated: true,
      base64EncodedAuthenticationKey: 'synthetic-test-key',
      permissions: ['ALL_FUNCTIONS'],
      roles: [],
      userId: 1452,
      username: 'Synthetic tester',
      officeId: 1,
      officeName: 'Synthetic office',
      shouldRenewPassword: false
    });
    sessionStorage.setItem('mifosXCredentials', credentials);
    localStorage.setItem('mifosXServerURL', location.origin);
    localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en' }));
  });
  await page.route('**/fineract-provider/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path.endsWith('/loans/1452/documents')) {
      if (request.method() === 'GET') {
        listReads++;
        await route.fulfill({ json: records });
        return;
      }
      if (request.method() === 'POST') {
        writes.push('POST');
        const body = request.postDataBuffer()?.toString() || '';
        const fileName = body.match(/filename="([^"]+)"/)?.[1] || 'synthetic.pdf';
        const name = body.match(/name="name"\r\n\r\n([^\r]+)/)?.[1] || 'Synthetic upload';
        const id = Math.max(...records.map((r) => r.id), 0) + 1;
        records.push({ id, name, fileName, type: 'application/pdf', size: bytes.length });
        await route.fulfill({ json: { resourceId: id } });
        return;
      }
    }
    if (/\/loans\/1452\/documents\/\d+\/attachment$/.test(path)) {
      await route.fulfill({ contentType: 'application/pdf', body: bytes });
      return;
    }
    if (/\/loans\/1452\/documents\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop());
      writes.push(request.method());
      if (request.method() === 'DELETE') records = records.filter((doc) => doc.id !== id);
      if (request.method() === 'PUT') {
        const name = request
          .postDataBuffer()
          ?.toString()
          .match(/name="name"\r\n\r\n([^\r]+)/)?.[1];
        records = records.map((doc) => (doc.id === id ? { ...doc, name: name || doc.name } : doc));
      }
      await route.fulfill({ json: { resourceId: id } });
      return;
    }
    if (path.endsWith('/loans/1452')) {
      await route.fulfill({ json: loan });
      return;
    }
    if (path.includes('/configurations')) {
      await route.fulfill({ json: { value: 0, enabled: false } });
      return;
    }
    if (path.includes('/actuator/')) {
      await route.fulfill({ json: { status: 'UP' } });
      return;
    }
    await route.fulfill({ json: [] });
  });
  await page.goto('/#/loans/1452/loan-documents');
  await expect(page.locator('.document-card')).toHaveCount(10);
});

test('navigates with real thumbnails, readable titles, categories and debounced search', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Contrato de crédito firmado', exact: true })).toBeVisible();
  await expect(page.locator('.document-title').filter({ hasText: 'TEST900101' })).toHaveCount(0);
  await expect(page.locator('.number-badge')).toHaveCount(0);
  await expect(page.locator('mifosx-loan-document-thumbnail img').first()).toBeVisible();
  await page.getByRole('button', { name: 'Consultation 2', exact: true }).click();
  await expect(page.locator('.document-card')).toHaveCount(2);
  await page.getByRole('textbox', { name: 'Search documents' }).fill('SUSTRAE');
  await expect(page.locator('.document-card')).toHaveCount(1);
});
test('reloads a retained thumbnail when an upload refresh cancels its pending attachment read', async ({ page }) => {
  // Finish the initial thumbnail before intercepting reads from the reloaded workspace.
  // Let the first page finish its own read first, so only the reloaded page's reads are counted.
  await expect(page.locator('[data-document-id="1"] mifosx-loan-document-thumbnail img')).toBeVisible();
  let attempts = 0;
  await page.route('**/loans/1452/documents/1/attachment', async (route) => {
    attempts++;
    if (attempts === 1) return;
    await route.fulfill({ contentType: 'application/pdf', body: bytes });
  });
  await page.reload();
  await expect.poll(() => attempts).toBe(1);
  const retainedCard = await page.locator('[data-document-id="1"]').elementHandle();
  await page.locator('.upload-button').click();
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: 'thumbnail-refresh.pdf', mimeType: 'application/pdf', buffer: bytes });
  await page.getByRole('dialog').getByRole('button', { name: 'Upload', exact: true }).click();
  await expect(page.getByText('Uploaded successfully', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.locator('[data-document-id="1"] mifosx-loan-document-thumbnail img')).toBeVisible();
  expect(attempts).toBe(2);
  expect(await retainedCard!.evaluate((element) => element.isConnected)).toBe(true);
});
test('switches grid/list, sorts and persists preferences without a document-list request', async ({ page }) => {
  const before = listReads;
  await page.getByRole('radio', { name: 'List', exact: true }).click();
  await expect(page.locator('table.document-table')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Number', exact: true })).toHaveCount(0);
  expect(listReads).toBe(before);
  await page.getByRole('combobox', { name: 'Sort by' }).click();
  await page.getByRole('option', { name: 'Name', exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem('mifosx.loan-documents.sort'))).toBe('name');
  await page.reload();
  await expect(page.locator('table.document-table')).toBeVisible();
});
test('previews through the existing service and downloads original bytes and filename', async ({ page }) => {
  const card = page.locator('.document-card').first();
  await card.getByRole('button', { name: 'Preview: Comprobante de domicilio', exact: true }).last().click();
  await expect(page.locator('mat-dialog-content iframe')).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  const waiting = page.waitForEvent('download');
  await card.getByRole('button', { name: 'Download: Comprobante de domicilio', exact: true }).click();
  const download = await waiting;
  expect(download.suggestedFilename()).toBe(records[0].fileName);
  expect(await readFile((await download.path())!)).toEqual(bytes);
});
test('previews a real synthetic XLSX workbook locally', async ({ page }) => {
  const excel = await import('exceljs');
  const Workbook = excel.Workbook || excel.default.Workbook;
  const workbook = new Workbook();
  workbook.addWorksheet('Synthetic sheet').addRow([
    'Synthetic cell',
    1452
  ]);
  const spreadsheet = Buffer.from(await workbook.xlsx.writeBuffer());
  records[0] = {
    id: 1,
    name: 'Synthetic spreadsheet',
    fileName: 'synthetic.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: spreadsheet.length
  };
  await page.route('**/loans/1452/documents/1/attachment', (route) =>
    route.fulfill({ contentType: records[0].type, body: spreadsheet })
  );
  await page.reload();
  await page
    .locator('.document-card')
    .filter({ hasText: 'Synthetic spreadsheet' })
    .getByRole('button', { name: 'Preview: Synthetic spreadsheet', exact: true })
    .last()
    .click();
  await expect(page.getByRole('dialog')).toContainText('Synthetic cell');
  await expect(page.getByRole('dialog')).toContainText('Synthetic sheet');
});
test('preserves CSV previews through the upstream reader', async ({ page }) => {
  const spreadsheet = Buffer.from('name,value\nSynthetic CSV cell,1452\n');
  records[0] = {
    id: 1,
    name: 'Synthetic CSV document',
    fileName: 'synthetic.csv',
    type: 'application/pdf',
    size: spreadsheet.length
  };
  await page.route('**/loans/1452/documents/1/attachment', (route) =>
    route.fulfill({ contentType: 'application/pdf', body: spreadsheet })
  );
  await page.reload();
  await page
    .locator('.document-card')
    .filter({ hasText: 'Synthetic CSV document' })
    .getByRole('button', { name: 'Preview: Synthetic CSV document', exact: true })
    .last()
    .click();
  await expect(page.getByRole('dialog')).toContainText('Synthetic CSV cell');
});
test('exports only filtered documents as a ZIP with correct contents', async ({ page }) => {
  await page.getByRole('button', { name: 'Contract 2', exact: true }).click();
  const waiting = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download all (.zip)', exact: true }).click();
  const download = await waiting;
  const archive = unzipSync(await readFile((await download.path())!));
  expect(Object.keys(archive)).toHaveLength(2);
  for (const name of Object.keys(archive)) {
    expect(name).toMatch(/CONTRATO|COMPROMISO/);
    expect(Buffer.from(archive[name])).toEqual(bytes);
  }
});
test('requires confirmation before deleting and refreshes real response state', async ({ page }) => {
  const card = page.locator('.document-card').first();
  await card.getByRole('button', { name: /More actions/ }).click();
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Comprobante de domicilio');
  expect(writes).toHaveLength(0);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(writes).toHaveLength(0);
  await card.getByRole('button', { name: /More actions/ }).click();
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.locator('.document-card')).toHaveCount(9);
  expect(writes).toEqual(['DELETE']);
});
test('uploads multiple files independently and preserves their original names', async ({ page }) => {
  await page.locator('.upload-button').click();
  await page.locator('input[type="file"]').setInputFiles([
    { name: 'synthetic-a.pdf', mimeType: 'application/pdf', buffer: bytes },
    { name: 'synthetic-b.pdf', mimeType: 'application/pdf', buffer: bytes }
  ]);
  await expect(page.locator('.upload-entry')).toHaveCount(2);
  await page.getByRole('dialog').getByRole('button', { name: 'Upload', exact: true }).click();
  await expect(page.getByText('Uploaded successfully', { exact: true })).toHaveCount(2);
  expect(writes).toEqual([
    'POST',
    'POST'
  ]);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.locator('.document-card')).toHaveCount(12);
});
test('updates metadata without uploading a binary', async ({ page }) => {
  await page
    .locator('.document-card')
    .first()
    .getByRole('button', { name: /More actions/ })
    .click();
  await page.getByRole('menuitem', { name: 'Edit metadata' }).click();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Garantía_2026');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Garantía_2026' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Search documents' }).fill('Garantia_2026');
  await expect(page.locator('.document-card')).toHaveCount(1);
  expect(writes).toEqual(['PUT']);
});
test('locks metadata fields while a save is pending and closes after success', async ({ page }) => {
  let releaseSave = () => {};
  const pendingSave = new Promise<void>((resolve) => {
    releaseSave = resolve;
  });
  await page.route('**/loans/1452/documents/1', async (route) => {
    if (route.request().method() === 'PUT') await pendingSave;
    await route.fallback();
  });
  await page
    .locator('.document-card')
    .first()
    .getByRole('button', { name: /More actions/ })
    .click();
  await page.getByRole('menuitem', { name: 'Edit metadata' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('Pending metadata save');
  await dialog.getByRole('button', { name: 'Save', exact: true }).click();
  try {
    await expect(dialog.getByRole('textbox', { name: 'Name', exact: true })).toBeDisabled();
    await expect(dialog.getByRole('textbox', { name: 'Description', exact: true })).toBeDisabled();
    await expect(dialog.locator('input[formControlName="issuanceDate"]')).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  } finally {
    releaseSave();
  }
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Pending metadata save', exact: true })).toBeVisible();
});
test('shows configured dossier and pending checklist, locates slots and prefills missing slots', async ({
  page
}, testInfo) => {
  await expect(page.locator('.dossier')).toHaveCount(0);
  await configureSyntheticScheme(page);
  await expect(page.locator('.dossier')).toContainText('10 / 19');
  await expect(page.locator('.checklist')).toBeVisible();
  await expect(page.locator('.number-badge')).toHaveCount(10);
  await testInfo.attach('configured-dossier', {
    body: await captureWorkspace(page, testInfo, 'configured-dossier.png'),
    contentType: 'image/png'
  });
  await page.getByRole('button', { name: 'Number 18: Uploaded', exact: true }).click();
  await expect(page.locator('[data-document-id="9"]')).toHaveClass(/highlighted/);
  await page.getByRole('button', { name: 'Number 1: No document', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Expected document number: 1');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('radio', { name: 'List', exact: true }).click();
  await expect(page.getByRole('columnheader', { name: 'Number', exact: true })).toBeVisible();
});
for (const width of [
  1920,
  1280,
  768,
  390
]) {
  test(`fits ${width}px without workspace overflow`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.locator('.document-grid')).toBeVisible();
    const layout = await page.locator('mifosx-loan-documents-tab').evaluate((el) => ({
      width: el.clientWidth,
      scroll: el.scrollWidth,
      columns: getComputedStyle(el.querySelector('.document-grid')!).gridTemplateColumns.split(' ').length
    }));
    expect(layout.scroll).toBeLessThanOrEqual(layout.width + 1);
    expect(layout.columns).toBe(width === 1920 ? 4 : width === 1280 ? 3 : width === 768 ? 2 : 1);
    await testInfo.attach(`documents-${width}`, {
      body: await captureWorkspace(page, testInfo, `documents-${width}.png`),
      contentType: 'image/png'
    });
  });
}
test('supports dark theme and keyboard preview', async ({ page }, testInfo) => {
  await page.evaluate(() => {
    localStorage.setItem('mifosXThemeDarkEnabled', 'true');
  });
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/dark-theme/);
  await testInfo.attach('documents-dark', {
    body: await captureWorkspace(page, testInfo, 'documents-dark.png'),
    contentType: 'image/png'
  });
  const button = page.locator('.thumbnail').first();
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
});
