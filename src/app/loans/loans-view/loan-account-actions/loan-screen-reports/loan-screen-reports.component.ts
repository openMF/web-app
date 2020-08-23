/** Angular Imports */
import { Component, OnInit, Renderer2, ViewChild, ElementRef, SecurityContext, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Loans Screen Reports Component.
 */
@Component({
  selector: 'mifosx-loan-screen-reports',
  templateUrl: './loan-screen-reports.component.html',
  styleUrls: ['./loan-screen-reports.component.scss']
})
export class LoanScreenReportsComponent implements OnInit {

  @Input() dataObject: any;
  /** Loan Screen Reportform. */
  loanScreenReportForm: FormGroup;
  /** Templates Data */
  templatesData: any;
  /** Loan Id */
  loanId: any;
  /** HTML Template */
  template: any;

  /** Screen report output reference */
  @ViewChild('screenReport', { static: true }) screenReportRef: ElementRef;

  /**
   * Fetches Loan Action Data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {LoansService} loansService Loans Service
   * @param {ActivatedRoute} route Activated Route
   * @param {DomSanitizer} sanitizer DOM Sanitizer
   * @param {Renderer2} renderer Renderer 2
   */
  constructor(private formBuilder: FormBuilder,
    private loansService: LoansService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2) {
    this.loanId = this.route.parent.snapshot.params['loanId'];
  }

  /**
   * Creates the loan screen report form.
   */
  ngOnInit() {
    this.templatesData = this.dataObject;
    this.createLoanScreenReportForm();
  }

  /**
   * Creates the loan screen report form.
   */
  createLoanScreenReportForm() {
    this.loanScreenReportForm = this.formBuilder.group({
      'templateId': ['']
    });
  }

  /**
   * Prints loan screen report
   */
  print() {
    const templateWindow = window.open('', 'Screen Report', 'height=400,width=600');
    templateWindow.document.write('<html><head>');
    templateWindow.document.write('</head><body>');
    templateWindow.document.write(this.template);
    templateWindow.document.write('</body></html>');
    templateWindow.print();
    templateWindow.close();
  }

  /**
   * Submits the form and generates screen report for the loan.
   */
  generate() {
    const templateId = this.loanScreenReportForm.get('templateId').value;
    this.loansService.getTemplateData(templateId, this.loanId).subscribe((response: any) => {
      this.template = this.sanitizer.sanitize(SecurityContext.HTML, response);
      this.renderer.setProperty(this.screenReportRef.nativeElement, 'innerHTML', this.template);
    });
  }

}
