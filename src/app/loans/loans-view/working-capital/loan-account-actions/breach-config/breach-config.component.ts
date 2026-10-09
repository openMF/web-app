/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorHandlerService } from 'app/core/error-handler/error-handler.service';
import { LoanAccountActionsBaseComponent } from 'app/loans/loans-view/loan-account-actions/loan-account-actions-base.component';
import { LoansService } from 'app/loans/loans.service';
import { WorkingCapitalBreachActionRequest } from 'app/loans/models/working-capital/working-capital-loan-account.model';
import { InputAmountComponent } from 'app/shared/input-amount/input-amount.component';
import { InputPositiveIntegerComponent } from 'app/shared/input-positive-integer/input-positive-integer.component';
import { StringEnumOptionData } from 'app/shared/models/option-data.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { catchError } from 'rxjs';

@Component({
  selector: 'mifosx-breach-config',
  templateUrl: './breach-config.component.html',
  styleUrl: './breach-config.component.scss',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputPositiveIntegerComponent,
    InputAmountComponent
  ]
})
export class BreachConfigComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private loansService = inject(LoansService);
  private errorHandler = inject(ErrorHandlerService);
  private cdr = inject(ChangeDetectorRef);

  isSubmitting = false;
  breachConfigForm: FormGroup | null = null;
  frequencyTypeOptions: StringEnumOptionData[] = [];
  minimumPaymentTypeOptions: StringEnumOptionData[] = [];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.frequencyTypeOptions = this.dataObject.breachFrequencyTypeOptions || [];
    this.minimumPaymentTypeOptions = this.dataObject.breachAmountCalculationTypeOptions || [];
    this.breachConfigForm = this.formBuilder.group({
      frequency: [
        null,
        Validators.required
      ],
      frequencyType: [
        null,
        Validators.required
      ],
      minimumPayment: [
        null,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],
      minimumPaymentType: [
        null,
        Validators.required
      ]
    });
    this.cdr.markForCheck();
  }

  submit(): void {
    if (!this.breachConfigForm || this.breachConfigForm.invalid) {
      this.breachConfigForm?.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const locale = this.settingsService.language.code;
    const action = 'RESCHEDULE';
    const payload: WorkingCapitalBreachActionRequest = {
      action,
      ...this.breachConfigForm.getRawValue(),
      locale
    };
    this.loansService
      .addWorkingCapitalBreachAction(this.loanId, payload)
      .pipe(catchError((error) => this.errorHandler.handleError(error, 'Breach Configuration Update')))
      .subscribe({
        next: () => {
          this.gotoLoanView('breach-actions');
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        }
      });
  }
}
