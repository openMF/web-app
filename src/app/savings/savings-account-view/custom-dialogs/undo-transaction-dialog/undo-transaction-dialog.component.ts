/** Angular Imports */
import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

/**
 * Undo transaction dialog component.
 */
@Component({
  selector: 'mifosx-undo-transaction-dialog',
  templateUrl: './undo-transaction-dialog.component.html',
  styleUrls: ['./undo-transaction-dialog.component.scss']
})
export class UndoTransactionDialogComponent {
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   */
  constructor(public dialogRef: MatDialogRef<UndoTransactionDialogComponent>) {}
}
