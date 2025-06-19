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

@Component({
  selector: 'mifosx-release-amount-dialog',
  templateUrl: './release-amount-dialog.component.html',
  styleUrls: ['./release-amount-dialog.component.scss'],
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
export class ReleaseAmountDialogComponent {
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   */
  constructor(public dialogRef: MatDialogRef<ReleaseAmountDialogComponent>) {}
}
