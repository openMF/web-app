/** Angular Imports */
import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Cancel dialog component.
 */
@Component({
  selector: 'mifosx-cancel-dialog',
  templateUrl: './cancel-dialog.component.html',
  styleUrls: ['./cancel-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class CancelDialogComponent {
  dialogRef = inject<MatDialogRef<CancelDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
}
