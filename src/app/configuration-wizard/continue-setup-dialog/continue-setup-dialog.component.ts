/** Angular Imports */
import { Component, Inject } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';

/**
 * Continue Setup Dialog Component.
 */
@Component({
  selector: 'mifosx-continue-setup-dialog',
  templateUrl: './continue-setup-dialog.component.html',
  styleUrls: ['./continue-setup-dialog.component.scss']
})
export class ContinueSetupDialogComponent {
  /* Current Step Name*/
  stepName: number;

  /**
   * @param {MatDialogRef<ContinueSetupDialogComponent>} dialogRef MatDialogRef<ContinueSetupDialogComponent>.
   */
  constructor(
    public dialogRef: MatDialogRef<ContinueSetupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.stepName = data.stepName;
  }
}
