/** Angular Imports */
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * Toggle withhold tax dialog dialog component.
 */
@Component({
  selector: 'mifosx-toggle-withhold-tax-dialog',
  templateUrl: './toggle-withhold-tax-dialog.component.html',
  styleUrls: ['./toggle-withhold-tax-dialog.component.scss']
})
export class ToggleWithholdTaxDialogComponent {

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data.
   */
  constructor(public dialogRef: MatDialogRef<ToggleWithholdTaxDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

}
