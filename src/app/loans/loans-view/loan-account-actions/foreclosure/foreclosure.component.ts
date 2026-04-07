/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

/** Custom Services */
import { Dates } from 'app/core/utils/dates';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

@Component({
  selector: 'mifosx-foreclosure',
  templateUrl: './foreclosure.component.html',
  styleUrls: ['./foreclosure.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ]
})
export class ForeclosureComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private dateUtils = inject(Dates);

  foreclosureForm: UntypedFormGroup;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  foreclosuredata: any;

  constructor() {
    super();
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createforeclosureForm();
    this.onChanges();
  }

  createforeclosureForm() {
    this.foreclosureForm = this.formBuilder.group({
      transactionDate: [
        this.dataObject.date && new Date(this.dataObject.date),
        Validators.required
      ],
      outstandingPrincipalPortion: [{ value: this.dataObject.principalPortion || 0, disabled: true }],
      outstandingInterestPortion: [{ value: this.dataObject.interestPortion || 0, disabled: true }],
      outstandingFeeChargesPortion: [{ value: this.dataObject.feeChargesPortion || 0, disabled: true }],
      outstandingPenaltyChargesPortion: [{ value: this.dataObject.penaltyChargesPortion || 0, disabled: true }],
      transactionAmount: [{ value: this.dataObject.amount, disabled: true }],
      note: [
        '',
        Validators.required
      ]
    });
  }

  onChanges(): void {
    this.foreclosureForm.get('transactionDate').valueChanges.subscribe((val) => {
      this.retrieveLoanForeclosureTemplate(val);
    });
  }

  retrieveLoanForeclosureTemplate(val: any) {
    const dateFormat = this.settingsService.dateFormat;
    const transactionDateFormatted = this.dateUtils.formatDate(val, dateFormat);
    const data = {
      command: 'foreclosure',
      dateFormat: this.settingsService.dateFormat,
      locale: this.settingsService.language.code,
      transactionDate: transactionDateFormatted
    };
    this.loanService.getForeclosureData(this.loanId, data).subscribe((response: any) => {
      this.foreclosuredata = response;

      this.foreclosureForm.patchValue({
        outstandingPrincipalPortion: this.foreclosuredata.principalPortion,
        outstandingInterestPortion: this.foreclosuredata.interestPortion,
        outstandingFeeChargesPortion: this.foreclosuredata.feeChargesPortion,
        outstandingPenaltyChargesPortion: this.foreclosuredata.penaltyChargesPortion
      });
    });
  }

  submit() {
    const foreclosureFormData = this.foreclosureForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate = this.foreclosureForm.value.transactionDate;
    if (foreclosureFormData.transactionDate instanceof Date) {
      foreclosureFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...foreclosureFormData,
      dateFormat,
      locale
    };

    this.loanService.loanForclosureData(this.loanId, data).subscribe((response: any) => {
      this.gotoLoanDefaultView();
    });
  }
}
