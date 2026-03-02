/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnChanges, OnDestroy, Input, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/** Custom Services */
import { ReportsService } from '../../reports.service';
import { SettingsService } from 'app/settings/settings.service';
import { ProgressBarService } from 'app/core/progress-bar/progress-bar.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Pentaho Component
 */
@Component({
  selector: 'mifosx-pentaho',
  templateUrl: './pentaho.component.html',
  styleUrls: ['./pentaho.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class PentahoComponent implements OnChanges, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private reportsService = inject(ReportsService);
  private settingsService = inject(SettingsService);
  private progressBarService = inject(ProgressBarService);

  /** Run Report Data */
  @Input() dataObject: any;

  /** substitute for resolver */
  hideOutput = true;
  /** trusted resource url for pentaho output */
  pentahoUrl: any;
  /** current blob URL to track and revoke */
  private currentBlobUrl: string | null = null;

  /**
   * Fetches run report data post changes in run report form.
   */
  ngOnChanges() {
    this.hideOutput = true;
    this.getRunReportData();
  }

  getRunReportData() {
    this.reportsService
      .getPentahoRunReportData(
        this.dataObject.report.name,
        this.dataObject.formData,
        'default',
        this.settingsService.language.code,
        this.settingsService.dateFormat
      )
      .subscribe((res: any) => {
        const contentType = res.headers.get('Content-Type');
        const file = new Blob([res.body], { type: contentType });

        if (this.currentBlobUrl) {
          URL.revokeObjectURL(this.currentBlobUrl);
        }

        let filecontent = URL.createObjectURL(file);
        this.currentBlobUrl = filecontent;

        if (this.isTicketReport()) {
          filecontent += '#zoom=500';
        }

        this.pentahoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(filecontent);
        this.hideOutput = false;
        this.progressBarService.decrease();
      });
  }

  isTicketReport(): boolean {
    return this.dataObject?.report?.name?.toLowerCase().includes('-ticket') || false;
  }

  ngOnDestroy() {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
    }
  }
}
