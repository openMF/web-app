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
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Enable dialog component.
 */
@Component({
  selector: 'mifosx-enable-dialog',
  templateUrl: './enable-dialog.component.html',
  styleUrls: ['./enable-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslatePipe,
    NgxTranslatePipe
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
