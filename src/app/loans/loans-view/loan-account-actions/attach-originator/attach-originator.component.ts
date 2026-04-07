/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports. */
import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

/** Custom Services. */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanOriginator } from 'app/loans/models/loan-account.model';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

/**
 * Attach Loan Originator component.
 */
@Component({
  selector: 'mifosx-attach-originator',
  templateUrl: './attach-originator.component.html',
  styleUrl: './attach-originator.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class AttachOriginatorComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);

  /** Attach Loan Originator Loan form. */
  attachLoanOriginatorForm: UntypedFormGroup;
  /** Loan data. */
  loanOriginators: LoanOriginator[] = [];

  constructor() {
    super();
  }

  ngOnInit() {
    this.setAttachLoanOriginatorForm();
    this.loanOriginators = [];
    this.dataObject.forEach((loanOriginator: LoanOriginator) => {
      if (loanOriginator.status === 'ACTIVE') {
        this.loanOriginators.push(loanOriginator);
      }
    });
  }

  /**
   * Set Attach Loan Originator form.
   */
  setAttachLoanOriginatorForm() {
    this.attachLoanOriginatorForm = this.formBuilder.group({
      originatorId: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Submits Approve form.
   */
  submit() {
    const approveLoanFormData = this.attachLoanOriginatorForm.value;
    this.loanService.attachLoanOriginator(this.loanId, approveLoanFormData.originatorId).subscribe((response: any) => {
      this.gotoLoanDefaultView();
    });
  }
}
