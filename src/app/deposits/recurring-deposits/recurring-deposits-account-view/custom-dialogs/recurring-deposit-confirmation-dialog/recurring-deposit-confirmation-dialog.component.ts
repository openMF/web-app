import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-recurring-deposit-confirmation-action',
  templateUrl: './recurring-deposit-confirmation-dialog.component.html',
  styleUrls: ['./recurring-deposit-confirmation-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class RecurringDepositConfirmationDialogComponent {
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides a confirmation for all the recurring deposit actions.
   */
  constructor(
    public dialogRef: MatDialogRef<RecurringDepositConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
