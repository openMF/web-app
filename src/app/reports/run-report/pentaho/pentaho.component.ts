/** Angular Imports */
import { Component, OnChanges, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/** Custom Services */
import { ReportsService } from '../../reports.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Pentaho Component
 */
@Component({
  selector: 'mifosx-pentaho',
  templateUrl: './pentaho.component.html',
  styleUrls: ['./pentaho.component.scss']
})
export class PentahoComponent implements OnChanges {

  /** Run Report Data */
  @Input() dataObject: any;

  /** substitute for resolver */
  hideOutput = true;
  /** trusted resource url for pentaho output */
  pentahoUrl: any;

  /**
   * @param {DomSanitizer} sanitizer DOM Sanitizer
   * @param {ReportsService} reportsService Reports Service
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private sanitizer: DomSanitizer,
              private reportsService: ReportsService, private settingsService: SettingsService) { }

  /**
   * Fetches run report data post changes in run report form.
   */
  ngOnChanges() {
    this.hideOutput = true;
    this.getRunReportData();
  }

  getRunReportData() {
    this.reportsService.getPentahoRunReportData(this.dataObject.report.name, this.dataObject.formData, 'default', this.settingsService.language.code, this.settingsService.dateFormat)
      .subscribe( (res: any) => {
        const contentType = res.headers.get('Content-Type');
        const file = new Blob([res.body], {type: contentType});
        const filecontent = URL.createObjectURL(file);
        this.pentahoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(filecontent);
        this.hideOutput = false;
      });
  }

}
