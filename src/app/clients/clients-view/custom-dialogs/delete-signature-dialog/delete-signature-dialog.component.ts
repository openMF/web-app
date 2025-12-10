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
 * Delete signature dialog component.
 */
@Component({
  selector: 'mifosx-delete-signature-dialog',
  templateUrl: './delete-signature-dialog.component.html',
  styleUrls: ['./delete-signature-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class DeleteSignatureDialogComponent {
  dialogRef = inject<MatDialogRef<DeleteSignatureDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  /** Id of client signature in documents */
  signatureId: any;

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Documents data
   */
  constructor() {
    const signature = this.data.find((document: any) => document.name === 'clientSignature') || {};
    this.signatureId = signature.id;
  }
}
