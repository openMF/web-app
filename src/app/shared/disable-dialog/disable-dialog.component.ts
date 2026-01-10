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
 * Disable dialog component.
 */
@Component({
  selector: 'mifosx-disable-dialog',
  templateUrl: './disable-dialog.component.html',
  styleUrls: ['./disable-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class DisableDialogComponent {
  dialogRef = inject<MatDialogRef<DisableDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
}
