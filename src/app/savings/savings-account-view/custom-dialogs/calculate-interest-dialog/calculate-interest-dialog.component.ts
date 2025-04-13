/** Angular Imports */
import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

/**
 * Calculate interest dialog component.
 */
@Component({
  selector: 'mifosx-calculate-interest-dialog',
  templateUrl: './calculate-interest-dialog.component.html',
  styleUrls: ['./calculate-interest-dialog.component.scss']
})
export class CalculateInterestDialogComponent {
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   */
  constructor(public dialogRef: MatDialogRef<CalculateInterestDialogComponent>) {}
}
