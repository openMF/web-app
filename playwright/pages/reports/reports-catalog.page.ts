/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { ROUTES } from '../../config/routes';
import { REPORTS_CATALOG_SELECTORS } from '../../config/selectors';

/**
 * Reports catalogue (`/#/reports`).
 *
 * The catalogue is the entry point to every report, and the only screen
 * that exposes the engine filter. It is also the screen that renders
 * whatever `reportType` the backend hands it, which is why a spec that
 * needs a Pentaho report on a tenant that cannot create one stubs the
 * catalogue response and then walks this page.
 *
 * Rows are matched by the report name they display: the list re-orders
 * itself whenever the engine chip, the search box or the paginator
 * changes, so positional locators are not safe here.
 */
export class ReportsCatalogPage extends BasePage {
  readonly url = ROUTES.reports;

  /** Engine filter chips, excluding the pinned strip and the rows. */
  get engineChips(): Locator {
    return this.page.locator(REPORTS_CATALOG_SELECTORS.engineChip);
  }

  /** All catalogue rows, in render order. */
  get reportRows(): Locator {
    return this.page.locator(REPORTS_CATALOG_SELECTORS.reportRow);
  }

  /**
   * A single engine chip, e.g. `Pentaho`.
   * @param engine Report engine as it appears on the chip.
   */
  engineChip(engine: string): Locator {
    return this.engineChips.filter({ hasText: engine });
  }

  /**
   * The catalogue row for one report, matched on its displayed name.
   *
   * The name span is matched exactly rather than with `hasText`, because
   * a substring match would also select longer names that contain the
   * requested one (`Client Listing` vs `Client Listing by Office`) and
   * make the subsequent click ambiguous.
   * @param reportName Name shown in the row.
   */
  reportRow(reportName: string): Locator {
    return this.reportRows.filter({
      has: this.page.locator(REPORTS_CATALOG_SELECTORS.reportRowName).getByText(reportName, { exact: true })
    });
  }

  /**
   * Narrow the catalogue to a single engine.
   * @param engine Report engine as it appears on the chip.
   */
  async filterByEngine(engine: string): Promise<void> {
    await this.engineChip(engine).click();
  }

  /**
   * Open a report's run screen. Navigation happens inside the SPA, so
   * the caller must wait on the run screen itself (or use the
   * {@link RunReportPage} it navigated to) rather than on a page load.
   * @param reportName Name shown in the row.
   */
  async openReport(reportName: string): Promise<void> {
    await this.reportRow(reportName).click();
  }

  /**
   * Overrides the default `networkidle` wait: the catalogue is ready as
   * soon as its first row is painted, and the shell keeps background
   * traffic running, so `networkidle` is both slower and flakier here.
   */
  override async waitForLoad(): Promise<void> {
    await this.reportRows.first().waitFor({ state: 'visible' });
  }
}
