/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { FrameLocator, Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { ROUTES } from '../../config/routes';
import { RUN_REPORT_SELECTORS } from '../../config/selectors';

/**
 * Identity of the report a run screen is displaying.
 *
 * The screen takes its name from the path and its engine and id from
 * the query string, so a run screen cannot be described by a URL alone.
 */
export interface RunReportTarget {
  /** Report name, as it appears in the catalogue. */
  name: string;
  /** Engine: `Table`, `Chart`, `Pentaho`, `BIRT` or `SMS`. */
  type: string;
  /** Numeric report id — used to fetch engine-specific parameters. */
  id: number;
}

/**
 * Run-report screen (`/#/reports/run/:name?type=&id=`).
 *
 * Two things about this screen shape every test written against it:
 *
 * 1. **Parameters are a form.** `Run Report` is
 *    `[disabled]="!reportForm.valid || isProcessing"`, and Pentaho and
 *    BIRT reports add a `required` output-type control on top of the
 *    report's own parameters. A parameter-free Pentaho report is
 *    therefore runnable after a single tile click; anything else needs
 *    its parameters filled first.
 *
 * 2. **The screen is reachable two ways.** {@link BasePage.navigate}
 *    drives it by URL, which is what a spec that only cares about the
 *    output should do. Reaching it through the catalogue
 *    ({@link ReportsCatalogPage.openReport}) additionally proves the
 *    report is discoverable, and this class works either way because
 *    every locator below is page-scoped, not navigation-scoped.
 */
export class RunReportPage extends BasePage {
  /** URL of this screen, built from the Layer-2 route registry. */
  readonly url: string;

  /** The report this instance points at. */
  private readonly target: RunReportTarget;

  constructor(page: Page, target: RunReportTarget) {
    super(page);
    this.target = target;
    this.url = ROUTES.reportRun(target.name, target.type, target.id);
  }

  /** The report being run. */
  get reportName(): string {
    return this.target.name;
  }

  /** Primary run button; disabled until the form is valid. */
  get runReportButton(): Locator {
    return this.page.locator(RUN_REPORT_SELECTORS.runReportButton);
  }

  /** Results shell, rendered only after a run. */
  get results(): Locator {
    return this.page.locator(RUN_REPORT_SELECTORS.resultsShell);
  }

  /**
   * The Pentaho renderer's frame.
   *
   * Kept as a plain `Locator` (attribute assertions) rather than a `FrameLocator` so specs can pin
   * the framing attributes themselves; {@link pentahoOutput} is the way into the framed document.
   */
  get pentahoFrame(): Locator {
    return this.page.locator(RUN_REPORT_SELECTORS.pentahoFrame);
  }

  /**
   * The document rendered inside the Pentaho frame.
   *
   * A test harness reaches it through the browser, not through the page — the frame is sandboxed
   * without `allow-same-origin`, so the application itself cannot touch this document.
   */
  get pentahoOutput(): FrameLocator {
    return this.page.frameLocator(RUN_REPORT_SELECTORS.pentahoFrame);
  }

  /** Download link the renderer shows for an output it will not preview. */
  get downloadLink(): Locator {
    return this.page.locator(RUN_REPORT_SELECTORS.pentahoDownloadLink);
  }

  /**
   * One output-type tile, matched on its value tag (`PDF`, `HTML`,
   * `XLS`, `XLSX`, `CSV`, `XML`) rather than on its translated label.
   *
   * The tag is matched exactly: `XLS` is a prefix of `XLSX`, so a
   * substring filter would return both tiles and make the click
   * ambiguous when XLS is selected.
   * @param value Output type value.
   */
  outputTypeTile(value: string): Locator {
    return this.page.locator(RUN_REPORT_SELECTORS.outputTypeTile).filter({
      has: this.page.locator(RUN_REPORT_SELECTORS.outputTypeTag).getByText(value, { exact: true })
    });
  }

  /**
   * Select the report's output type. Required before the run button
   * enables for Pentaho and BIRT reports.
   * @param value Output type value, e.g. `HTML`.
   */
  async selectOutputType(value: string): Promise<void> {
    await this.outputTypeTile(value).click();
  }

  /** Submit the run form. */
  async runReport(): Promise<void> {
    await this.runReportButton.click();
  }

  /**
   * Wait for the Pentaho frame to be attached and visible, which happens
   * only once the response bytes have been turned into a URL and bound.
   */
  async waitForPentahoOutput(): Promise<void> {
    await this.pentahoFrame.waitFor({ state: 'visible' });
  }

  /**
   * Overrides the default `networkidle` wait: the run form is ready as
   * soon as its run button is on screen, and the shell keeps background
   * traffic running, so `networkidle` is both slower and flakier here.
   */
  override async waitForLoad(): Promise<void> {
    await this.runReportButton.waitFor({ state: 'visible' });
  }
}
