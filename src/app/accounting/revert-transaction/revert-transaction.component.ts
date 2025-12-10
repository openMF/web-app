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
  dialogRef = inject<MatDialogRef<RevertTransactionComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  /** Comments input form control. */
  comments = new UntypedFormControl('');
}
