/** Angular Imports */
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormControl } from '@angular/forms';

/**
 * Revert transaction dialog component.
 */
@Component({
  selector: 'mifosx-revert-transaction',
  templateUrl: './revert-transaction.component.html',
  styleUrls: ['./revert-transaction.component.scss']
})
export class RevertTransactionComponent {

  /** Comments input form control. */
  comments = new UntypedFormControl('');

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides comments or reverted transaction ID.
   */
  constructor(public dialogRef: MatDialogRef<RevertTransactionComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

}
