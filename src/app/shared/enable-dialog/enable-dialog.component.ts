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
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides a enableContext.
   */
  constructor(
    public dialogRef: MatDialogRef<EnableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
