import { Component, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-recurring-deposit-confirmation-action',
  templateUrl: './recurring-deposit-confirmation-dialog.component.html',
  styleUrls: ['./recurring-deposit-confirmation-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class RecurringDepositConfirmationDialogComponent {
  dialogRef = inject<MatDialogRef<RecurringDepositConfirmationDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
}
