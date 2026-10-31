/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { Page, Route } from '@playwright/test';
import { test, expect } from '../../fixtures/test-fixtures';
import { BEHAVIOR } from '../../config/behavior';
import { ReportsCatalogPage } from '../../pages/reports/reports-catalog.page';
import { RunReportPage } from '../../pages/reports/run-report.page';

/**
 * Reports · Pentaho run report — frame isolation regression test.
 *
 * ── What this pins ──────────────────────────────────────────────────
 *
 * The Pentaho renderer used to take the bytes Fineract returned from
 * `/runreports/<name>`, wrap them in a `Blob` typed with whatever
 * `Content-Type` the engine declared, mint a `blob:` URL and bind that
 * URL to a bare `<iframe>` through `bypassSecurityTrustResourceUrl` —
 * no `sandbox`. A `blob:` URL inherits the origin of the document that
 * created it, so a report body carrying markup ran as *this
 * application*: it could read `parent.document` and the credential blob
 * the app keeps in web storage (`mifosXCredentials`, the Fineract
 * Basic-auth key) and call the API as the reporting user. That was
 * measured on this stack: the payload below used to change the
 * top-level document's title to `PENTAHO_XSS_EXECUTED`.
 *
 * `BirtComponent` had already been hardened the other way
 * (`d3270984 fix(WEB-1239)`): `srcdoc` plus `sandbox="allow-scripts"`
 * for markup, a blob type pinned to `application/pdf` for the PDF
 * viewer, and a download for everything else. `PentahoComponent` now
 * follows the same model, and the assertions below are the negative of
 * the ones the exploit proof of concept used:
 *
 *   - markup is framed with `sandbox="allow-scripts"` and **without**
 *     `allow-same-origin`, so it runs on an opaque origin;
 *   - the payload still executes — reports are script-driven — but it
 *     cannot reach the application, and it never reaches web storage;
 *   - the title of the application's document is not changed;
 *   - the `Content-Type` the engine declares cannot promote a response
 *     into markup: non-PDF output is only ever offered as a download.
 *
 * ── Why the API is still stubbed ────────────────────────────────────
 *
 * Running a Pentaho report for real needs the Pentaho engine, which the
 * Fineract distribution no longer ships: no `.prpt` design, no engine
 * jar, and `GET /reports/template` offers Table / Chart / SMS only
 * (`allowedReportTypes`). The engines are an optional, server-side
 * addition — which is exactly why the renderer must not trust their
 * output. The stub therefore replaces *responses* only; no tenant data
 * is written and the code path exercised is the real component.
 */

/** Report the stubbed catalogue advertises. */
const PROBE_REPORT = {
  id: 4242,
  reportName: 'PENTAHO_FRAME_PROBE',
  reportType: 'Pentaho',
  // Any real category works; the catalogue groups its rows by it.
  reportCategory: 'Client'
};

/** Title the payload would write into the *top-level* document if it could reach it. */
const XSS_MARKER = 'PENTAHO_XSS_EXECUTED';

/**
 * Body returned for `/runreports/<name>`.
 *
 * Every step is observable from the outside, so the test can tell
 * "script ran" from "script reached the application":
 *
 *   - `data-payload` is set first, and proves the script executed;
 *   - `parent.sessionStorage` throws in a sandboxed frame, so
 *     `data-credentials` is only written when the frame shares the
 *     application's origin — and only a boolean ever reaches the DOM,
 *     never the credential itself;
 *   - `parent.document.title` is likewise only reachable same-origin.
 */
const PROBE_PAYLOAD = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Pentaho report output</title>
  </head>
  <body>
    <p>Pentaho report output</p>
    <script>
      document.body.setAttribute('data-payload', 'executed');
      var credentials = parent.sessionStorage.getItem('${BEHAVIOR.authStorageKey}');
      document.body.setAttribute('data-credentials', credentials ? 'readable' : 'absent');
      parent.document.title = '${XSS_MARKER}';
    </script>
  </body>
</html>`;

/**
 * Every API path the reports module reads, plus the configurations
 * resolver the run-report route carries. Host- and tenant-agnostic on
 * purpose: the same expression matches a direct `:8443` backend and a
 * same-origin proxied deployment.
 */
const REPORT_ENDPOINTS = /\/(?:(?:run)?reports(?:\/\d+)?|configurations)(?:[?/]|$)/;

/**
 * Fulfilled responses are cross-origin from the browser's point of view,
 * so they need the CORS headers the real server would send. `*` is safe
 * because the app's XHRs are not credentialled — the session lives in an
 * `Authorization` header the interceptor sets, not in a cookie.
 */
const CORS_HEADERS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,OPTIONS',
  'access-control-allow-headers':
    'authorization,content-type,accept,fineract-platform-tenantid,fineract-platform-tfa-token'
};

/** JSON fulfilment with CORS headers and a real content type. */
function jsonResponse(body: unknown): { status: number; headers: Record<string, string>; body: string } {
  return {
    status: 200,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    body: JSON.stringify(body)
  };
}

/**
 * Answers the five read paths the reports module exercises:
 *
 *   - `GET /configurations`                      → run-report route resolver
 *   - `GET /reports`                             → catalogue (`ReportsResolver`)
 *   - `GET /reports/:id?fields=reportParameters` → Pentaho parameter mapping
 *   - `GET /runreports/FullParameterList`        → run-report route resolver
 *   - `GET /runreports/:name`                    → the report bytes themselves
 *
 * The last one declares the content type the caller asks for, because what the engine claims its
 * bytes are is one of the inputs this test varies.
 * @param page Page whose requests should be answered locally.
 * @param options contentType Content type to declare for the report body.
 */
async function stubPentahoReportBackend(page: Page, options: { contentType: string }): Promise<void> {
  await page.route(REPORT_ENDPOINTS, async (route: Route) => {
    const request = route.request();

    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS_HEADERS });
      return;
    }

    const path = new URL(request.url()).pathname;

    if (path.endsWith('/configurations')) {
      await route.fulfill(jsonResponse({ globalConfiguration: [] }));
      return;
    }

    if (path.endsWith('/runreports/FullParameterList')) {
      // `paramData` is mapped from `data`, so an empty array means the report takes no parameters
      // and the run form validates on output type alone.
      await route.fulfill(jsonResponse({ data: [] }));
      return;
    }

    if (/\/reports\/\d+$/.test(path)) {
      await route.fulfill(jsonResponse({ reportParameters: [] }));
      return;
    }

    if (path.endsWith('/reports')) {
      await route.fulfill(jsonResponse([PROBE_REPORT]));
      return;
    }

    if (path.includes('/runreports/')) {
      await route.fulfill({
        status: 200,
        headers: { ...CORS_HEADERS, 'content-type': options.contentType },
        body: PROBE_PAYLOAD
      });
      return;
    }

    await route.fallback();
  });
}

test.describe('Reports · Pentaho run report frame isolation', () => {
  test.beforeEach(async ({ page }) => {
    // Playwright's storageState only restores localStorage, while the app reads its credentials
    // from sessionStorage at boot — mirror them before any script runs on the page. The payload
    // looks for exactly this key when it tries to reach the session it is framed inside.
    await page.addInitScript((authStorageKey: string) => {
      const credentials = localStorage.getItem(authStorageKey);
      if (credentials) {
        sessionStorage.setItem(authStorageKey, credentials);
      }
    }, BEHAVIOR.authStorageKey);
  });

  /**
   * Reaches the renderer the way an operator would — catalogue, engine chip, report row — without
   * running it, so a test can inspect or change the output type first.
   * @param page Page under test.
   * @returns The run screen, ready to be submitted.
   */
  async function openProbeReport(page: Page): Promise<RunReportPage> {
    const catalog = new ReportsCatalogPage(page);
    const runReport = new RunReportPage(page, {
      name: PROBE_REPORT.reportName,
      type: PROBE_REPORT.reportType,
      id: PROBE_REPORT.id
    });

    await catalog.navigate();
    await catalog.filterByEngine(PROBE_REPORT.reportType);
    await catalog.openReport(PROBE_REPORT.reportName);

    // "Run Report" stays disabled until an output type is chosen.
    await runReport.waitForLoad();
    return runReport;
  }

  /**
   * Reaches the renderer and runs it with the given output type.
   * @param page Page under test.
   * @param outputType Output type tile to select, e.g. `HTML`.
   * @returns The run screen, already submitted.
   */
  async function runProbeReport(page: Page, outputType: string): Promise<RunReportPage> {
    const runReport = await openProbeReport(page);
    await runReport.selectOutputType(outputType);
    await runReport.runReport();

    return runReport;
  }

  test('contains report markup in a sandboxed frame instead of the application origin', async ({ page }) => {
    await stubPentahoReportBackend(page, { contentType: 'text/html; charset=utf-8' });
    const runReport = await runProbeReport(page, 'HTML');
    await runReport.waitForPentahoOutput();

    // Markup travels as `srcdoc`, so no object URL of ours is ever framed.
    await expect(runReport.pentahoFrame).toHaveAttribute('srcdoc', /Pentaho report output/);
    await expect(runReport.pentahoFrame).not.toHaveAttribute('src', /.+/);

    // Sandboxed without allow-same-origin: the frame is an opaque origin.
    await expect(runReport.pentahoFrame).toHaveAttribute('sandbox', /allow-scripts/);
    await expect(runReport.pentahoFrame).not.toHaveAttribute('sandbox', /allow-same-origin/);

    // The payload did run — reports are script-driven — but it stayed inside the box, while a
    // same-origin frame would have written both attributes and renamed the application's document.
    await expect(runReport.pentahoOutput.locator('body')).toHaveAttribute('data-payload', 'executed');
    await expect(runReport.pentahoOutput.locator('body')).not.toHaveAttribute('data-credentials', /.+/);
    await expect(page).not.toHaveTitle(XSS_MARKER);
  });

  test('selects XLS and XLSX output types without matching each other', async ({ page }) => {
    await stubPentahoReportBackend(page, { contentType: 'application/octet-stream' });
    const runReport = await openProbeReport(page);

    await runReport.selectOutputType('XLS');
    await expect(runReport.outputTypeTile('XLS')).toHaveClass(/active/);
    await expect(runReport.outputTypeTile('XLSX')).not.toHaveClass(/active/);

    await runReport.selectOutputType('XLSX');
    await expect(runReport.outputTypeTile('XLSX')).toHaveClass(/active/);
    await expect(runReport.outputTypeTile('XLS')).not.toHaveClass(/active/);
  });

  test('does not parse report bytes as markup when the engine labels them a PDF', async ({ page }) => {
    await stubPentahoReportBackend(page, { contentType: 'application/pdf' });
    const runReport = await runProbeReport(page, 'PDF');
    await runReport.waitForPentahoOutput();

    // A PDF keeps the blob URL, because Chrome will not run its viewer inside a sandboxed frame.
    // The pinned application/pdf type is what keeps the document away from the markup parser, so a
    // body the engine *claims* is a PDF cannot execute even if it is really markup.
    await expect(runReport.pentahoFrame).toHaveAttribute('src', /^blob:/);
    await expect(runReport.pentahoFrame).not.toHaveAttribute('srcdoc', /.+/);

    const blobType = await runReport.pentahoFrame.evaluate(async (frame) => {
      const url = (frame as HTMLIFrameElement).src;
      const response = await fetch(url);
      return (await response.blob()).type;
    });
    expect(blobType).toBe('application/pdf');
    await expect(page).not.toHaveTitle(XSS_MARKER);
  });

  test('offers spreadsheet and data output as a download instead of framing it', async ({ page }) => {
    await stubPentahoReportBackend(page, { contentType: 'application/octet-stream' });
    const runReport = await runProbeReport(page, 'CSV');

    await expect(runReport.downloadLink).toBeVisible();
    await expect(runReport.downloadLink).toHaveAttribute('href', /^blob:/);
    await expect(runReport.pentahoFrame).toHaveCount(0);
    await expect(page).not.toHaveTitle(XSS_MARKER);
  });
});
