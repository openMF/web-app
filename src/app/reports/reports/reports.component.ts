/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/**
 * Report component.
 */

@Component({
  selector: 'mifosx-report',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  /** Report form. */
  reportForm: FormGroup;
  /** Office data. */
  officeData: any;
  /** Currency data. */
  currencyData: any;
  /** Loan Purpose data. */
  loanPurposeData: any;
  /** Fund data. */
  fundData: any;
  /** Output Type data. */
  outputTypeData: any;
  /** Decimal Places data. */
  decimalPlacesData: any;
  reportsForm: FormGroup;

  /**
   * Retrieves the offices, currency, loan purpose, fund, PAR calculation, output type and decimal places data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router){

  }

  /**
   * Creates the frequent postings form and sets the affected gl entry form array.
   */
  ngOnInit() {
    this.createReportsForm();
  }

  /**
   * Creates the report form.
   */
  createReportsForm() {
    this.reportForm = this.formBuilder.group({
      'office': ['', Validators.required],
      'currencyCode': ['', Validators.required],
      'loanPurpose': [''],
      'fund': [''],
      'parCalculation': [''],
      'receiptNumber': [''],
      'outputType': [''],
      'decimalPlaces': ['']
    });
  }
}

