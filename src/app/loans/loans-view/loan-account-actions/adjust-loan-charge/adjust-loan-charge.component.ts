/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { OrganizationService } from 'app/organization/organization.service';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';
import { InputAmountComponent } from 'app/shared/input-amount/input-amount.component';

@Component({
  selector: 'mifosx-adjust-loan-charge',
  templateUrl: './adjust-loan-charge.component.html',
  styleUrls: ['./adjust-loan-charge.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatSlideToggle,
    CdkTextareaAutosize,
    InputAmountComponent
  ]
})
export class AdjustLoanChargeComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private organizationService = inject(OrganizationService);

  /** Loan Id */
  loanId: string;
  chargeId: string;

  /** Payment Type Options */
  paymentTypes: any = [];
  chargeData: any = [];
  loanDetailsData: any = [];

  /** Show payment details */
  showPaymentDetails = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Repayment Loan Form */
  adjustLoanChargeForm: UntypedFormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   */
  constructor() {
    super();
    this.chargeId = this.route.snapshot.params['id'];
    this.route.data.subscribe((data: { loansAccountCharge: any; loanDetailsData: any }) => {
      this.chargeData = data.loansAccountCharge;
      this.loanDetailsData = data.loanDetailsData;
    });
  }

  /**
   * Creates the repayment loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.maxDate = this.settingsService.maxAllowedDate;
    this.createAdjustLoanChargeForm();
    this.setRepaymentLoanDetails();
  }

  /**
   * Creates the create close form.
   */
  createAdjustLoanChargeForm() {
    this.adjustLoanChargeForm = this.formBuilder.group({
      amount: [
        this.chargeData.amount,
        Validators.required
      ],
      externalId: '',
      paymentTypeId: '',
      note: ''
    });
  }

  setRepaymentLoanDetails() {
    this.organizationService.getPaymentTypes().subscribe((paymentTypes: any) => {
      this.paymentTypes = paymentTypes;
    });
  }

  /**
   * Add payment detail fields to the UI.
   */
  addPaymentDetails() {
    this.showPaymentDetails = !this.showPaymentDetails;
    if (this.showPaymentDetails) {
      this.adjustLoanChargeForm.addControl('accountNumber', new UntypedFormControl(''));
      this.adjustLoanChargeForm.addControl('checkNumber', new UntypedFormControl(''));
      this.adjustLoanChargeForm.addControl('routingCode', new UntypedFormControl(''));
      this.adjustLoanChargeForm.addControl('receiptNumber', new UntypedFormControl(''));
      this.adjustLoanChargeForm.addControl('bankNumber', new UntypedFormControl(''));
    } else {
      this.adjustLoanChargeForm.removeControl('accountNumber');
      this.adjustLoanChargeForm.removeControl('checkNumber');
      this.adjustLoanChargeForm.removeControl('routingCode');
      this.adjustLoanChargeForm.removeControl('receiptNumber');
      this.adjustLoanChargeForm.removeControl('bankNumber');
    }
  }

  /** Submits the repayment form */
  submit() {
    const adjustLoanChargeFormData = this.adjustLoanChargeForm.value;
    const locale = this.settingsService.language.code;
    const data = {
      ...adjustLoanChargeFormData,
      locale
    };
    const command = 'adjustment';
    this.loanService.executeLoansAccountChargesCommand(this.loanId, command, data, this.chargeId).subscribe({
      next: (response: any) => {
        this.gotoLoanChargesView();
      },
      error: (error) => {}
    });
  }

  gotoLoanChargesView(): void {
    this.gotoLoanView('../charges');
  }
}
