/** Angular Imports */
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * Waive charge dialog component.
 */
@Component({
  selector: 'mifosx-waive-charge-dialog',
  templateUrl: './waive-charge-dialog.component.html',
  styleUrls: ['./waive-charge-dialog.component.scss']
})
export class WaiveChargeDialogComponent {

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data.
   */
  constructor(public dialogRef: MatDialogRef<WaiveChargeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

}
