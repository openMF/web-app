/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { catchError } from 'rxjs';

/** Custom Services */
import { ErrorHandlerService } from 'app/core/error-handler/error-handler.service';
import { LoanAccountActionsBaseComponent } from 'app/loans/loans-view/loan-account-actions/loan-account-actions-base.component';
import { WorkingCapitalUndoWriteOffRequest } from 'app/loans/models/working-capital/working-capital-loan-account.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Working Capital Loan Undo Write-Off action.
 *
 * Reopens a written-off loan to ACTIVE and restores the balance. Posts to
 * POST /working-capital-loans/{loanId}/transactions?command=undoWriteOff.
 * Acts as a confirmation screen with optional reversalExternalId and note.
 */
@Component({
  selector: 'mifosx-working-capital-undo-write-off',
  templateUrl: './undo-write-off.component.html',
  styleUrl: './undo-write-off.component.scss',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkingCapitalUndoWriteOffComponent extends LoanAccountActionsBaseComponent {
  private formBuilder = inject(FormBuilder);
  private errorHandler = inject(ErrorHandlerService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** Whether a submit request is in flight. */
  isSubmitting = false;

  /** Typed Undo Write-Off form (all fields optional). */
  undoWriteOffForm = this.formBuilder.group({
    reversalExternalId: this.formBuilder.control<string>(''),
    note: this.formBuilder.control<string>('', Validators.maxLength(1000))
  });

  constructor() {
    super();
  }

  /** Submits the undo write-off form. */
  submit(): void {
    if (this.undoWriteOffForm.invalid) {
      this.undoWriteOffForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const locale = this.settingsService.language.code;
    const formValue = this.undoWriteOffForm.getRawValue();

    // Undo write-off accepts only reversalExternalId, note and locale (no dateFormat).
    const payload: WorkingCapitalUndoWriteOffRequest = { locale };
    const reversalExternalId = formValue.reversalExternalId?.trim();
    if (reversalExternalId) {
      payload.reversalExternalId = reversalExternalId;
    }
    const note = formValue.note?.trim();
    if (note) {
      payload.note = note;
    }

    this.loanService
      .applyWorkingCapitalLoanActionCommand(this.loanId, payload, 'undoWriteOff')
      .pipe(
        catchError((error) => this.errorHandler.handleError(error, 'Loan Undo Write-Off')),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.gotoLoanDefaultView();
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        }
      });
  }
}
