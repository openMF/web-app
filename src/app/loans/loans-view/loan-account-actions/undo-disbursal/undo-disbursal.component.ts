/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

/**
 * Undo Disbursal component.
 */
@Component({
  selector: 'mifosx-undo-disbursal',
  templateUrl: './undo-disbursal.component.html',
  styleUrls: ['./undo-disbursal.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UndoDisbursalComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);

  @Input() actionName: string;

  /** Undo disbursal form. */
  note: UntypedFormControl;

  constructor() {
    super();
  }

  /**
   * Creates the undo disbursal form.
   */
  ngOnInit() {
    this.note = this.formBuilder.control('', Validators.required);
  }

  /**
   * Submits the undo disbursal form.
   */
  submit() {
    let loanCommand = 'undodisbursal';
    if (this.actionName === 'Undo Last Disbursal') {
      loanCommand = 'undolastdisbursal';
    }
    const request$ = this.isLoanProduct
      ? this.loanService.loanActionButtons(this.loanId, loanCommand, { note: this.note.value })
      : this.isWorkingCapital
        ? this.loanService.applyWorkingCapitalLoanAccountCommand(this.loanId, loanCommand, { note: this.note.value })
        : undefined;

    if (!request$) {
      return;
    }

    request$.subscribe({
      next: () => this.gotoLoanDefaultView(),
      error: () => {
        this.note.setErrors({ submitFailed: true });
      }
    });
  }
}
