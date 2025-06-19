/** Angular Imports */
import { Component } from '@angular/core';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
/**
 * Undo transaction dialog component.
 */
@Component({
  selector: 'mifosx-undo-transaction-dialog',
  templateUrl: './undo-transaction-dialog.component.html',
  styleUrls: ['./undo-transaction-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    NgxTranslatePipe
  ]
})
export class UndoTransactionDialogComponent {
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   */
  constructor(public dialogRef: MatDialogRef<UndoTransactionDialogComponent>) {}
}
