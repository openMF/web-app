/** Angular Imports */
import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Continue Setup Dialog Component.
 */
@Component({
  selector: 'mifosx-continue-setup-dialog',
  templateUrl: './continue-setup-dialog.component.html',
  styleUrls: ['./continue-setup-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
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
