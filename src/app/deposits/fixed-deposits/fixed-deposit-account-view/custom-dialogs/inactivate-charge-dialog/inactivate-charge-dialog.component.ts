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
 * Inactivate charge dialog component.
 */
@Component({
  selector: 'mifosx-inactivate-charge-dialog',
  templateUrl: './inactivate-charge-dialog.component.html',
  styleUrls: ['./inactivate-charge-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class InactivateChargeDialogComponent {
  dialogRef = inject<MatDialogRef<InactivateChargeDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
}
