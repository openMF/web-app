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
 * Disable dialog component.
 */
@Component({
  selector: 'mifosx-disable-dialog',
  templateUrl: './disable-dialog.component.html',
  styleUrls: ['./disable-dialog.component.scss'],
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
export class DisableDialogComponent {
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides a disableContext.
   */
  constructor(
    public dialogRef: MatDialogRef<DisableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
