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
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Revert transaction dialog component.
 */
@Component({
  selector: 'mifosx-revert-transaction',
  templateUrl: './revert-transaction.component.html',
  styleUrls: ['./revert-transaction.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class RevertTransactionComponent {
  /** Comments input form control. */
  comments = new UntypedFormControl('');

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides comments or reverted transaction ID.
   */
  constructor(
    public dialogRef: MatDialogRef<RevertTransactionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
