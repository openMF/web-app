/** Angular Imports */
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * Reject share dialog component.
 */
@Component({
  selector: 'mifosx-reject-share-dialog',
  templateUrl: './reject-share-dialog.component.html',
  styleUrls: ['./reject-share-dialog.component.scss']
})
export class RejectShareDialogComponent {

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides a deleteContext.
   */
  constructor(public dialogRef: MatDialogRef<RejectShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

}
