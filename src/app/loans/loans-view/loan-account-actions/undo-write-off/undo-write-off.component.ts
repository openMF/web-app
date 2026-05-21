/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, Input, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { AlertService } from 'app/core/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { Dates } from 'app/core/utils/dates';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

/**
 * Loan Undo Write-off Action
 */
@Component({
  selector: 'mifosx-undo-write-off',
  templateUrl: './undo-write-off.component.html',
  styleUrls: ['./undo-write-off.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UndoWriteOffComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private dateUtils = inject(Dates);
  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Undo Write-off Loan Form */
  undoWriteOffLoanForm: UntypedFormGroup;

  constructor() {
    super();
  }

  /**
   * Creates the undo write-off loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createUndoWriteOffLoanForm();
  }

  /**
   * Creates the undo write-off loan form
   */
  createUndoWriteOffLoanForm() {
    this.undoWriteOffLoanForm = this.formBuilder.group({
      note: ['']
    });
  }

  /** Submits the undo write-off form */
  submit() {
    const undoWriteOffLoanFormData = this.undoWriteOffLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const operationDate = this.settingsService.businessDate;
    const data = {
      ...undoWriteOffLoanFormData,
      transactionDate: this.dateUtils.formatDate(operationDate && new Date(operationDate), dateFormat),
      transactionAmount: 0,
      dateFormat,
      locale
    };

    this.loanService.submitLoanActionButton(this.loanId, data, 'undowriteoff').subscribe({
      next: (response: any) => {
        this.gotoLoanDefaultView();
      },
      error: (error) => {
        console.error('Undo write-off failed:', error);
        this.alertService.alert({
          type: this.translateService.instant('errors.loans.undoWriteOff.type'),
          message: this.translateService.instant('errors.loans.undoWriteOff.message')
        });
      }
    });
  }
}
