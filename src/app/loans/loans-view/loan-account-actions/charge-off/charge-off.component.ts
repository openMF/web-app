/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Dates } from 'app/core/utils/dates';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

@Component({
  selector: 'mifosx-charge-off',
  templateUrl: './charge-off.component.html',
  styleUrls: ['./charge-off.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ]
})
export class ChargeOffComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private dateUtils = inject(Dates);

  /** Payment Type Options */
  paymentTypes: any;
  /** Show payment details */
  showPaymentDetails = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Repayment Loan Form */
  chargeoffLoanForm: UntypedFormGroup;

  chargeOffReasonOptions: any = [];

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   */
  constructor() {
    super();
  }

  /**
   * Creates the repayment loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.chargeOffReasonOptions = this.dataObject.chargeOffReasonOptions;
    this.createChargeoffLoanForm();
  }

  /**
   * Creates the create close form.
   */
  createChargeoffLoanForm() {
    this.chargeoffLoanForm = this.formBuilder.group({
      transactionDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      externalId: '',
      chargeOffReasonId: '',
      note: ''
    });
  }

  submit() {
    const chargeoffLoanFormData = this.chargeoffLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.chargeoffLoanForm.value.transactionDate;
    if (chargeoffLoanFormData.transactionDate instanceof Date) {
      chargeoffLoanFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...chargeoffLoanFormData,
      dateFormat,
      locale
    };
    const command = 'charge-off';
    this.loanService.submitLoanActionButton(this.loanId, data, command).subscribe((response: any) => {
      this.gotoLoanDefaultView();
    });
  }
}
