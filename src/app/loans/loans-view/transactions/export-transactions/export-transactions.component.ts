/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ReportsService } from 'app/reports/reports.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Export Client Loans Transactions Component
 */
@Component({
  selector: 'mifosx-export-transactions',
  templateUrl: './export-transactions.component.html',
  styleUrls: ['./export-transactions.component.scss']
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
  /** Loans Account Id */
  loansAccountId: any;

  /**
   * Fetches loans account data from grandparent's `resolve`
   * @param {DomSanitizer} sanitizer DOM Sanitizer
   * @param {ReportsService} reportsService Reports Service
   * @param {FormBuilder} formBuilder Form Builder
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private sanitizer: DomSanitizer,
              private reportsService: ReportsService,
              private formBuilder: UntypedFormBuilder,
              private dateUtils: Dates,
              private route: ActivatedRoute) {
    this.route.parent.parent.data.subscribe((data: { loanDetailsData: any }) => {
      this.loansAccountId = data.loanDetailsData.accountNo;
    });
  }


  ngOnInit() {
    this.createTransactionsReportForm();
  }

  /**
   * Creates the transactions report form.
   */
  createTransactionsReportForm() {
    this.transactionsReportForm = this.formBuilder.group({
      'fromDate': ['', Validators.required],
      'toDate': ['', Validators.required],
    });
  }

  /**
   * Generates client loans transactions report.
   */
  generate() {
    const data = {
      'output-type':	'PDF',
      R_startDate:	this.dateUtils.formatDate(this.transactionsReportForm.value.fromDate, 'yyyy-MM-dd'),
      R_endDate:	this.dateUtils.formatDate(this.transactionsReportForm.value.toDate, 'yyyy-MM-dd'),
      R_selectLoan:	this.loansAccountId
    };
    this.reportsService.getPentahoRunReportData('Client Loan Account Schedule', data, 'default', 'en', 'dd MMMM yyyy')
      .subscribe( (res: any) => {
        const contentType = res.headers.get('Content-Type');
        const file = new Blob([res.body], {type: contentType});
        const filecontent = URL.createObjectURL(file);
        this.pentahoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(filecontent);
        this.hideOutput = false;
      });
  }

}
