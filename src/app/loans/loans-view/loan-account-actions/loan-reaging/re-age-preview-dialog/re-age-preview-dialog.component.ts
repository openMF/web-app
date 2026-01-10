import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { RepaymentSchedule } from 'app/loans/models/loan-account.model';
import { RepaymentScheduleTabComponent } from '../../../repayment-schedule-tab/repayment-schedule-tab.component';

export interface ReAgePreviewDialogData {
  repaymentSchedule: RepaymentSchedule;
  currencyCode: string;
}

@Component({
  selector: 'mifosx-re-age-preview-dialog',
  templateUrl: './re-age-preview-dialog.component.html',
  styleUrls: ['./re-age-preview-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    RepaymentScheduleTabComponent
  ]
})
export class ReAgePreviewDialogComponent {
  dialogRef = inject<MatDialogRef<ReAgePreviewDialogComponent>>(MatDialogRef);
  data = inject<ReAgePreviewDialogData>(MAT_DIALOG_DATA);

  repaymentSchedule: RepaymentSchedule;
  currencyCode: string;

  constructor() {
    const data = this.data;

    this.repaymentSchedule = data.repaymentSchedule;
    this.currencyCode = data.currencyCode;
  }

  close(): void {
    this.dialogRef.close();
  }
}
