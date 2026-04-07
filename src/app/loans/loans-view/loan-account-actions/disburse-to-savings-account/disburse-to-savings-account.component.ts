/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Dates } from 'app/core/utils/dates';
import { Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

@Component({
  selector: 'mifosx-disburse-to-savings-account',
  templateUrl: './disburse-to-savings-account.component.html',
  styleUrls: ['./disburse-to-savings-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    CdkTextareaAutosize,
    FormatNumberPipe
  ]
})
export class DisburseToSavingsAccountComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private dateUtils = inject(Dates);

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Disbursement Loan form. */
  disbursementForm: UntypedFormGroup;
  currency: Currency;

  constructor() {
    super();
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setDisbursementToSavingsForm();
    if (this.dataObject.currency) {
      this.currency = this.dataObject.currency;
    }

    // Get delinquency data for available disbursement amount with over applied
    this.loanService.getLoanDelinquencyDataForTemplate(this.loanId).subscribe((delinquencyData: any) => {
      // Check if the field is at root level
      if (delinquencyData.availableDisbursementAmountWithOverApplied !== undefined) {
        this.dataObject.availableDisbursementAmountWithOverApplied =
          delinquencyData.availableDisbursementAmountWithOverApplied;
      }
      // Also check if it's in delinquent object
      if (delinquencyData.delinquent) {
        this.dataObject.delinquent = delinquencyData.delinquent;
      }
    });
  }

  /**
   * Set Disbursement Loan form.
   */
  setDisbursementToSavingsForm() {
    this.disbursementForm = this.formBuilder.group({
      actualDisbursementDate: [
        new Date(),
        Validators.required
      ],
      transactionAmount: [
        this.dataObject.amount,
        Validators.required
      ],
      note: ['']
    });
    if (this.dataObject.fixedEmiAmount) {
      this.disbursementForm.addControl(
        'fixedEmiAmount',
        new UntypedFormControl(this.dataObject.fixedEmiAmount, [Validators.required])
      );
    }
  }

  /**
   * Submit Disburse Form.
   */
  submit() {
    const disbursementLoanFormData = this.disbursementForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevActualDisbursementDate: Date = this.disbursementForm.value.actualDisbursementDate;
    if (disbursementLoanFormData.actualDisbursementDate instanceof Date) {
      disbursementLoanFormData.actualDisbursementDate = this.dateUtils.formatDate(
        prevActualDisbursementDate,
        dateFormat
      );
    }
    const data = {
      ...disbursementLoanFormData,
      dateFormat,
      locale
    };
    data['transactionAmount'] = data['transactionAmount'] * 1;
    this.loanService.loanActionButtons(this.loanId, 'disbursetosavings', data).subscribe((response: any) => {
      this.router.navigate(['../../general'], {
        queryParams: {
          productType: this.loanProductService.productType.value
        },
        relativeTo: this.route
      });
    });
  }
}
