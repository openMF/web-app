/** Angular Imports */
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Cancel dialog component.
 */
@Component({
  selector: 'mifosx-cancel-dialog',
  templateUrl: './cancel-dialog.component.html',
  styleUrls: ['./cancel-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    NgIf,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class CancelDialogComponent {
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   */
  constructor(
    public dialogRef: MatDialogRef<CancelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
