import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'mifosx-release-amount-dialog',
  templateUrl: './release-amount-dialog.component.html',
  styleUrls: ['./release-amount-dialog.component.scss']
})
export class ReleaseAmountDialogComponent {
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   */
  constructor(public dialogRef: MatDialogRef<ReleaseAmountDialogComponent>) {}
}
