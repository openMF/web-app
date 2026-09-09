/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Dates } from 'app/core/utils/dates';
import {
  EditableRepaymentSchedule,
  EditablePeriod,
  ScheduleChangeRecord,
  ScheduleDeleteRecord
} from 'app/loans/models/loan-account.model';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { RepaymentScheduleTabComponent } from '../../repayment-schedule-tab/repayment-schedule-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

@Component({
  selector: 'mifosx-edit-repayment-schedule',
  templateUrl: './edit-repayment-schedule.component.html',
  styleUrls: ['./edit-repayment-schedule.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RepaymentScheduleTabComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditRepaymentScheduleComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private dialog = inject(MatDialog);
  private dateUtils = inject(Dates);
  private translateService = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  /** Indicates If the Schedule has been changed */
  wasChanged = false;
  /** Indicates If the Schedule has been validated */
  wasValidated = false;
  /** Stores the Repayment Schedule data */
  repaymentScheduleDetails: EditableRepaymentSchedule | null = null;
  /** Stores the Installments changed */
  repaymentScheduleChanges: Record<string, ScheduleChangeRecord> = {};
  /** Stores the Installments marked for deletion, keyed by their unmodified due date */
  deletedInstallments: Record<string, boolean> = {};

  constructor() {
    super();
    this.getRepaymentSchedule();
  }

  ngOnInit(): void {
    this.repaymentScheduleChanges = {};
  }

  getRepaymentSchedule(): void {
    this.loanService.getLoanAccountResource(this.loanId, 'repaymentSchedule').subscribe({
      next: (response: { repaymentSchedule: EditableRepaymentSchedule }) => {
        this.repaymentScheduleDetails = response.repaymentSchedule;
        // Async HTTP response arrives outside template events, so OnPush needs an explicit mark.
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load repayment schedule:', err);
      }
    });
  }

  /** Number of installments with a pending modification or deletion. */
  get pendingChangesCount(): number {
    return Object.keys(this.repaymentScheduleChanges).length + Object.keys(this.deletedInstallments).length;
  }

  /** Registers a single-row installment change emitted by the schedule table. */
  onInstallmentEdited(change: ScheduleChangeRecord): void {
    if (change.installmentAmount === undefined && change.modifiedDueDate === undefined) {
      // The row was edited back to its original values: drop it from the payload.
      delete this.repaymentScheduleChanges[change.dueDate];
    } else {
      this.repaymentScheduleChanges[change.dueDate] = change;
    }
    this.wasChanged = this.pendingChangesCount > 0;
  }

  /** Registers the delete/restore toggle of an installment emitted by the schedule table. */
  onInstallmentDeleteToggled(change: ScheduleDeleteRecord): void {
    if (change.deleted) {
      // The table already reverted the row edit; keep the payload consistent with it.
      delete this.repaymentScheduleChanges[change.dueDate];
      this.deletedInstallments[change.dueDate] = true;
    } else {
      delete this.deletedInstallments[change.dueDate];
    }
    this.wasChanged = this.pendingChangesCount > 0;
  }

  /** Asks for confirmation before leaving when there are pending changes. */
  cancel(): void {
    if (!this.wasChanged) {
      this.gotoLoanDefaultView();
      return;
    }
    const cancelDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Discard Changes'),
        dialogContext: this.translateService.instant(
          'labels.dialogContext.Are you sure you want to leave this page and lose all inputted data'
        )
      }
    });
    cancelDialogRef.afterClosed().subscribe((responseConfirmation: { confirm?: boolean }) => {
      if (responseConfirmation?.confirm) {
        this.gotoLoanDefaultView();
      }
    });
  }

  applyPattern(): void {
    if (!this.repaymentScheduleDetails) {
      return;
    }

    const periods: Array<{ idx: number; dueDate: string }> = [];
    this.repaymentScheduleDetails.periods.forEach((period: EditablePeriod) => {
      if (period.period) {
        periods.push({
          idx: period.period,
          dueDate: this.dateUtils.formatDate(period.dueDate, this.settingsService.dateFormat)
        });
      }
    });
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'fromPeriod',
        label: 'From Date',
        value: '',
        options: { label: 'dueDate', value: 'idx', data: periods },
        required: true
      }),
      new SelectBase({
        controlName: 'toPeriod',
        label: 'To Date',
        value: '',
        options: { label: 'dueDate', value: 'idx', data: periods },
        required: true
      }),
      new InputBase({
        controlName: 'amount',
        label: 'Installment Amount',
        value: '',
        type: 'number',
        required: true
      })
    ];
    const data = {
      title: 'Pattern Update',
      formfields: formfields
    };
    const addDialogRef = this.dialog.open(FormDialogComponent, { data });
    addDialogRef
      .afterClosed()
      .subscribe((response: { data?: { value?: { fromPeriod: number; toPeriod: number; amount: number } } }) => {
        if (response?.data?.value && this.repaymentScheduleDetails) {
          const fromPeriod = response.data.value.fromPeriod;
          const toPeriod = response.data.value.toPeriod;
          const amount = response.data.value.amount;
          const periodsVariation: EditablePeriod[] = [];
          this.repaymentScheduleDetails.periods.forEach((period: EditablePeriod) => {
            const dueDate = this.dateUtils.formatDate(period.dueDate, this.settingsService.dateFormat);
            if (period.period && fromPeriod <= period.period && toPeriod >= period.period) {
              if (period.totalDueForPeriod !== amount) {
                period.totalDueForPeriod = amount;
                this.repaymentScheduleChanges[dueDate] = { dueDate: dueDate, installmentAmount: amount };
                this.wasChanged = true;
                period.changed = true;
              }
            }
            periodsVariation.push(period);
          });
          // New object reference so the OnPush schedule table picks up the change via ngOnChanges;
          // dialog afterClosed runs outside this component's template events, hence the explicit mark.
          this.repaymentScheduleDetails = { ...this.repaymentScheduleDetails, periods: periodsVariation };
          this.cdr.markForCheck();
        }
      });
  }

  reset(): void {
    const recoverScheduleDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Recover Original Schedule'),
        dialogContext: this.translateService.instant(
          'labels.dialogContext.Are you sure you want recover the Original Schedule'
        )
      }
    });
    recoverScheduleDialogRef.afterClosed().subscribe((responseConfirmation: { confirm?: boolean }) => {
      if (responseConfirmation?.confirm) {
        this.loanService.applyCommandLoanScheduleVariations(this.loanId, 'deleteVariations', {}).subscribe({
          next: () => {
            this.getRepaymentSchedule();
            this.wasChanged = false;
            this.wasValidated = false;
            this.repaymentScheduleChanges = {};
            this.deletedInstallments = {};
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Failed to delete schedule variations:', err);
          }
        });
      }
    });
  }

  validate(): void {
    if (!this.repaymentScheduleDetails) {
      return;
    }

    this.loanService
      .applyCommandLoanScheduleVariations(this.loanId, 'calculateLoanSchedule', this.getPayload())
      .subscribe({
        next: (response: EditableRepaymentSchedule) => {
          if (this.repaymentScheduleDetails) {
            const periods = response.periods.map((period: EditablePeriod) => ({ ...period, changed: true }));
            // New object reference so the OnPush schedule table re-renders the calculated periods.
            this.repaymentScheduleDetails = { ...this.repaymentScheduleDetails, periods };
            this.wasValidated = true;
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          console.error('Failed to calculate loan schedule:', err);
        }
      });
  }

  submit(): void {
    this.loanService.applyCommandLoanScheduleVariations(this.loanId, 'addVariations', this.getPayload()).subscribe({
      next: () => {
        this.gotoLoanView('repayment-schedule');
      },
      error: (err) => {
        console.error('Failed to add schedule variations:', err);
      }
    });
  }

  private getPayload(): {
    exceptions: { modifiedinstallments: ScheduleChangeRecord[]; deletedinstallments?: { dueDate: string }[] };
    dateFormat: string;
    locale: string;
  } {
    const modifiedinstallments: ScheduleChangeRecord[] = [];
    Object.keys(this.repaymentScheduleChanges).forEach((key: string) => {
      modifiedinstallments.push(this.repaymentScheduleChanges[key]);
    });
    const exceptions: { modifiedinstallments: ScheduleChangeRecord[]; deletedinstallments?: { dueDate: string }[] } = {
      modifiedinstallments
    };
    const deletedinstallments = Object.keys(this.deletedInstallments).map((dueDate: string) => ({ dueDate }));
    if (deletedinstallments.length > 0) {
      exceptions.deletedinstallments = deletedinstallments;
    }
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    return {
      exceptions,
      dateFormat,
      locale
    };
  }
}
