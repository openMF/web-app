/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports. */
import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder } from '@angular/forms';

/** Custom Services. */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';
/**
 * Undo Loan component.
 */
@Component({
  selector: 'mifosx-undo-approval',
  templateUrl: './undo-approval.component.html',
  styleUrls: ['./undo-approval.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class UndoApprovalComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);

  /** Form Controller. */
  note: UntypedFormControl;

  constructor() {
    super();
  }

  ngOnInit() {
    this.note = this.formBuilder.control('');
  }

  /**
   * Submits undo approval form.
   */
  submit() {
    const loanCommand: string = 'undoapproval';
    if (this.isLoanProduct) {
      this.loanService
        .loanActionButtons(this.loanId, loanCommand, { note: this.note.value })
        .subscribe((response: any) => {
          this.gotoLoanDefaultView();
        });
    } else if (this.isWorkingCapital) {
      this.loanService
        .applyWorkingCapitalLoanAccountCommand(this.loanId, loanCommand, { note: this.note.value })
        .subscribe((response: any) => {
          this.gotoLoanDefaultView();
        });
    }
  }
}
