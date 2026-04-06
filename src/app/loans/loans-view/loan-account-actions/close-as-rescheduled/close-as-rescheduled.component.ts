/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { Dates } from 'app/core/utils/dates';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

@Component({
  selector: 'mifosx-close-as-rescheduled',
  templateUrl: './close-as-rescheduled.component.html',
  styleUrls: ['./close-as-rescheduled.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ]
})
export class CloseAsRescheduledComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private dateUtils = inject(Dates);

  /** Close form. */
  closeLoanForm: UntypedFormGroup;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   */
  constructor() {
    super();
  }

  /**
   * Creates the close form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createCloseForm();
  }

  /**
   * Creates the create close form.
   */
  createCloseForm() {
    this.closeLoanForm = this.formBuilder.group({
      transactionDate: [
        new Date(this.dataObject.date) || new Date(),
        Validators.required
      ],
      note: []
    });
  }

  /**
   * Submits the close form and creates a close,
   * if successful redirects to view created close.
   */
  submit() {
    const closeLoanFormData = this.closeLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const transactionDate = this.closeLoanForm.value.transactionDate;
    if (closeLoanFormData.transactionDate instanceof Date) {
      closeLoanFormData.transactionDate = this.dateUtils.formatDate(transactionDate, dateFormat);
    }
    const data = {
      ...closeLoanFormData,
      dateFormat,
      locale
    };
    this.loanService.submitLoanActionButton(this.loanId, data, 'close-rescheduled').subscribe((response: any) => {
      this.gotoLoanDefaultView();
    });
  }
}
