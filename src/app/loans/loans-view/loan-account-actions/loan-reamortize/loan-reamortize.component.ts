/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RepaymentSchedule } from 'app/loans/models/loan-account.model';
import { CodeValue } from 'app/shared/models/general.model';
import { OptionData } from 'app/shared/models/option-data.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ReAmortizePreviewDialogComponent } from './re-amortize-preview-dialog/re-amortize-preview-dialog.component';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

@Component({
  selector: 'mifosx-loan-reamortize',
  templateUrl: './loan-reamortize.component.html',
  styleUrls: ['./loan-reamortize.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class LoanReamortizeComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private dialog = inject(MatDialog);

  /** ReAmortize Loan Form */
  reamortizeLoanForm: UntypedFormGroup;
  reAmortizationReasonOptions: CodeValue[] = [];
  reAmortizationInterestHandlingOptions: OptionData[] = [];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.reAmortizationReasonOptions = this.dataObject?.reAmortizationReasonOptions || [];
    this.reAmortizationInterestHandlingOptions = this.dataObject?.reAmortizationInterestHandlingOptions || [];

    this.createReAmortizeLoanForm();
  }

  createReAmortizeLoanForm() {
    this.reamortizeLoanForm = this.formBuilder.group({
      reAmortizationInterestHandling: [
        this.reAmortizationInterestHandlingOptions[0] || null
      ],
      reasonCodeValueId: null,
      note: '',
      externalId: ''
    });
  }

  private prepareReAmortizeData() {
    const data = this.reamortizeLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;

    return {
      ...data,
      dateFormat,
      locale
    };
  }

  private prepareReAmortizePreviewData() {
    const reamortizeLoanFormData = { ...this.reamortizeLoanForm.value };
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;

    // Prepare reAmortizationInterestHandling for preview API
    let reAmortizationInterestHandling = reamortizeLoanFormData.reAmortizationInterestHandling;
    if (reAmortizationInterestHandling && typeof reAmortizationInterestHandling === 'object') {
      reAmortizationInterestHandling = reAmortizationInterestHandling.id;
    }
    // If no value selected, use "default" for preview
    if (!reAmortizationInterestHandling && reAmortizationInterestHandling !== 0) {
      reAmortizationInterestHandling = 'default';
    }

    delete reamortizeLoanFormData.reAmortizationInterestHandling;

    return {
      ...reamortizeLoanFormData,
      reAmortizationInterestHandling: reAmortizationInterestHandling,
      dateFormat,
      locale
    };
  }

  preview(): void {
    if (this.reamortizeLoanForm.invalid) {
      return;
    }
    const data = this.prepareReAmortizePreviewData();

    this.loanService.getReAmortizePreview(this.loanId, data).subscribe({
      next: (response: RepaymentSchedule) => {
        const currencyCode = response.currency?.code;

        if (!currencyCode) {
          console.error('Currency code is not available in API response');
          return;
        }

        this.dialog.open(ReAmortizePreviewDialogComponent, {
          data: {
            repaymentSchedule: response,
            currencyCode: currencyCode
          },
          width: '95%',
          maxWidth: '1400px',
          height: '90vh'
        });
      },
      error: (error) => {
        console.error('Error loading re-amortize preview:', error);
      }
    });
  }

  submit(): void {
    const data = this.prepareReAmortizeData();
    this.loanService.submitLoanActionButton(this.loanId, data, 'reAmortize').subscribe((response: any) => {
      this.gotoLoanView('transactions');
    });
  }

  trackByInterestHandlingOption(index: number, option: OptionData): string | number {
    return option.id ?? index;
  }

  trackByReasonOption(index: number, option: CodeValue): string | number {
    return option.id ?? index;
  }
}
