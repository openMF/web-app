/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnChanges, Input, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/** rxjs Imports */
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/** Custom Services */
import { ReportsService } from '../../reports.service';
import { SettingsService } from 'app/settings/settings.service';
import { ProgressBarService } from 'app/core/progress-bar/progress-bar.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * BIRT Component
 */
@Component({
  selector: 'mifosx-birt',
  templateUrl: './birt.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class BirtComponent implements OnChanges {
  private sanitizer = inject(DomSanitizer);
  private reportsService = inject(ReportsService);
  private settingsService = inject(SettingsService);
  private progressBarService = inject(ProgressBarService);

  /** Run Report Data */
  @Input() dataObject: any;

  /** substitute for resolver */
  hideOutput = true;
  /** trusted resource url for BIRT output */
  birtUrl: any;

  /**
   * Fetches run report data post changes in run report form.
   */
  ngOnChanges() {
    this.hideOutput = true;
    this.getRunReportData();
  }

  getRunReportData() {
    this.reportsService
      .getBirtRunReportData(
        this.dataObject.report.name,
        this.dataObject.formData,
        'default',
        this.settingsService.language.code,
        this.settingsService.dateFormat
      )
      .pipe(
        finalize(() => this.progressBarService.decrease()),
        catchError((error) => {
          console.error('Error loading BIRT report:', error);
          this.hideOutput = true;
          this.birtUrl = null;
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res) {
          const contentType = res.headers.get('Content-Type');
          const file = new Blob([res.body], { type: contentType });
          const filecontent = URL.createObjectURL(file);
          this.birtUrl = this.sanitizer.bypassSecurityTrustResourceUrl(filecontent);
          this.hideOutput = false;
        }
      });
  }
}
