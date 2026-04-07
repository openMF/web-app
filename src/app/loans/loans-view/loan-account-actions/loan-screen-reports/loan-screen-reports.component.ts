/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, Renderer2, ViewChild, ElementRef, SecurityContext, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';

/** Custom Services */
import { DomSanitizer } from '@angular/platform-browser';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

/**
 * Loans Screen Reports Component.
 */
@Component({
  selector: 'mifosx-loan-screen-reports',
  templateUrl: './loan-screen-reports.component.html',
  styleUrls: ['./loan-screen-reports.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ]
})
export class LoanScreenReportsComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private sanitizer = inject(DomSanitizer);
  private renderer = inject(Renderer2);

  /** Loan Screen Reportform. */
  loanScreenReportForm: UntypedFormGroup;
  /** Templates Data */
  templatesData: any;
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
  constructor() {
    super();
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
      templateId: ['']
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
    this.loanService.getTemplateData(templateId, this.loanId).subscribe((response: any) => {
      this.template = this.sanitizer.sanitize(SecurityContext.HTML, response);
      this.renderer.setProperty(this.screenReportRef.nativeElement, 'innerHTML', this.template);
    });
  }
}
