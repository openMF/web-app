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
  /** Id of client signature in documents */
  signatureId: any;

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Documents data
   */
  constructor(
    public dialogRef: MatDialogRef<DeleteSignatureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any[]
  ) {
    const signature = this.data.find((document: any) => document.name === 'clientSignature') || {};
    this.signatureId = signature.id;
  }
}
