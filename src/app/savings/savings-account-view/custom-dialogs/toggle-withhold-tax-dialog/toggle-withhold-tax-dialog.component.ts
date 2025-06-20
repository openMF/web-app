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
 * Toggle withhold tax dialog dialog component.
 */
@Component({
  selector: 'mifosx-toggle-withhold-tax-dialog',
  templateUrl: './toggle-withhold-tax-dialog.component.html',
  styleUrls: ['./toggle-withhold-tax-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class ToggleWithholdTaxDialogComponent {
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data.
   */
  constructor(
    public dialogRef: MatDialogRef<ToggleWithholdTaxDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
