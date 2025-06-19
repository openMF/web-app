/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { ReportsService } from 'app/reports/reports.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgIf } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Export Client Savings Transactions Component
 */
@Component({
  selector: 'mifosx-export-transactions',
  templateUrl: './export-transactions.component.html',
  styleUrls: ['./export-transactions.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatError,
    MatButton,
    RouterLink,
    FaIconComponent,
    NgIf,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class ExportTransactionsComponent implements OnInit {
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Transactions Report Form */
  transactionsReportForm: any;
  /** substitute for resolver */
  hideOutput = true;
  /** trusted resource url for pentaho output */
  pentahoUrl: any;
  /** Savings Account Id */
  savingsAccountId: any;

  /**
   * Fetches savings account data from grandparent's `resolve`
   * @param {DomSanitizer} sanitizer DOM Sanitizer
   * @param {ReportsService} reportsService Reports Service
   * @param {FormBuilder} formBuilder Form Builder
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private sanitizer: DomSanitizer,
    private reportsService: ReportsService,
    private formBuilder: UntypedFormBuilder,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private settingsService: SettingsService
  ) {
    this.route.parent.parent.data.subscribe((data: { savingsAccountData: any }) => {
      this.savingsAccountId = data.savingsAccountData.accountNo;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createTransactionsReportForm();
  }

  /**
   * Creates the transactions report form.
   */
  createTransactionsReportForm() {
    this.transactionsReportForm = this.formBuilder.group({
      fromDate: [
        '',
        Validators.required
      ],
      toDate: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Generates client savings transactions report.
   */
  generate() {
    const data = {
      'output-type': 'PDF',
      R_startDate: this.dateUtils.formatDate(
        this.transactionsReportForm.value.fromDate,
        this.settingsService.dateFormat
      ),
      R_endDate: this.dateUtils.formatDate(this.transactionsReportForm.value.toDate, this.settingsService.dateFormat),
      R_savingsAccountId: this.savingsAccountId
    };
    this.reportsService
      .getPentahoRunReportData(
        'Client Saving Transactions',
        data,
        'default',
        this.settingsService.language.code,
        this.settingsService.dateFormat
      )
      .subscribe((res: any) => {
        const contentType = res.headers.get('Content-Type');
        const file = new Blob([res.body], { type: contentType });
        const filecontent = URL.createObjectURL(file);
        this.pentahoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(filecontent);
        this.hideOutput = false;
      });
  }
}
