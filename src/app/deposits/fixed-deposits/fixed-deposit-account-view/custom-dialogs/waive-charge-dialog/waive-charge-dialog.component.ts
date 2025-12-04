/** Angular Imports */
import { Component, inject } from '@angular/core';
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
 * Waive charge dialog component.
 */
@Component({
  selector: 'mifosx-waive-charge-dialog',
  templateUrl: './waive-charge-dialog.component.html',
  styleUrls: ['./waive-charge-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class WaiveChargeDialogComponent {
  dialogRef = inject<MatDialogRef<WaiveChargeDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
}
