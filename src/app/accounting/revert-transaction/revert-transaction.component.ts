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
import { NgIf } from '@angular/common';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Revert transaction dialog component.
 */
@Component({
  selector: 'mifosx-revert-transaction',
  templateUrl: './revert-transaction.component.html',
  styleUrls: ['./revert-transaction.component.scss'],
  imports: [
    NgIf,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslatePipe,
    NgxTranslatePipe
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
