/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports. */
import { Component, OnInit, Input, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

/**
 * Write Off component.
 */
@Component({
  selector: 'mifosx-write-off-page',
  templateUrl: './write-off-page.component.html',
  styleUrls: ['./write-off-page.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ]
})
export class WriteOffPageComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private dateUtils = inject(Dates);

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /** Write Off form. */
  writeOffForm: UntypedFormGroup;
  writeOffReasonOptions: any[] = [];

  constructor() {
    super();
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setWriteOffForm();
    this.writeOffReasonOptions = this.dataObject.writeOffReasonOptions;
  }

  /**
   * Set Write Off form.
   */
  setWriteOffForm() {
    this.writeOffForm = this.formBuilder.group({
      transactionDate: [
        this.dataObject.date && new Date(this.dataObject.date),
        Validators.required
      ],
      amount: [{ value: this.dataObject.amount, disabled: true }],
      writeoffReasonId: [''],
      note: ['']
    });
  }

  /**
   * Submits write off form.
   */
  submit() {
    const writeOffFormData = this.writeOffForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate = this.writeOffForm.value.transactionDate;
    if (writeOffFormData.transactionDate instanceof Date) {
      writeOffFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    if (writeOffFormData.writeoffReasonId === null || writeOffFormData.writeoffReasonId === '') {
      delete writeOffFormData.writeoffReasonId;
    }
    const data = {
      ...writeOffFormData,
      dateFormat,
      locale
    };
    delete data.amount;
    this.loanService.submitLoanActionButton(this.loanId, data, 'writeoff').subscribe((response: any) => {
      this.gotoLoanDefaultView();
    });
  }
}
