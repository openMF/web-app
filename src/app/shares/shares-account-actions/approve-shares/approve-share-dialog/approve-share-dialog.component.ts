/** Angular Imports */
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * Approve share dialog component.
 */
@Component({
  selector: 'mifosx-approve-share-dialog',
  templateUrl: './approve-share-dialog.component.html',
  styleUrls: ['./approve-share-dialog.component.scss']
})
export class ApproveShareDialogComponent {

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides a deleteContext.
   */
  constructor(public dialogRef: MatDialogRef<ApproveShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

}
