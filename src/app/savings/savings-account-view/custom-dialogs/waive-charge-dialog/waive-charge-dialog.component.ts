/** Angular Imports */
import { Component, Inject } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';

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
  constructor(
    public dialogRef: MatDialogRef<WaiveChargeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
