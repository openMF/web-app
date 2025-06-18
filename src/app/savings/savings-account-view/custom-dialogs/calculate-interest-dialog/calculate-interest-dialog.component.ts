/** Angular Imports */
import { Component } from '@angular/core';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';

/**
 * Calculate interest dialog component.
 */
@Component({
  selector: 'mifosx-calculate-interest-dialog',
  templateUrl: './calculate-interest-dialog.component.html',
  styleUrls: ['./calculate-interest-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    NgxTranslatePipe
  ]
})
export class CalculateInterestDialogComponent {
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   */
  constructor(public dialogRef: MatDialogRef<CalculateInterestDialogComponent>) {}
}
