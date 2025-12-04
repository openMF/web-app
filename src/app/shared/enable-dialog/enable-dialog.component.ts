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
 * Enable dialog component.
 */
@Component({
  selector: 'mifosx-enable-dialog',
  templateUrl: './enable-dialog.component.html',
  styleUrls: ['./enable-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class EnableDialogComponent {
  dialogRef = inject<MatDialogRef<EnableDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
}
