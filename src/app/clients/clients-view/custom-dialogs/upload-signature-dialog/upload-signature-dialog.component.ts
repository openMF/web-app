/** Angular Imports */
import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { FileUploadComponent } from '../../../../shared/file-upload/file-upload.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Upload signature dialog component.
 */
@Component({
  selector: 'mifosx-upload-signature-dialog',
  templateUrl: './upload-signature-dialog.component.html',
  styleUrls: ['./upload-signature-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    FileUploadComponent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class UploadSignatureDialogComponent {
  dialogRef = inject<MatDialogRef<UploadSignatureDialogComponent>>(MatDialogRef);

  /** Client Signature */
  signature: File;

  /**
   * Sets file form control value.
   * @param {any} $event file change event.
   */
  onFileSelect($event: any) {
    if ($event.target.files.length > 0) {
      this.signature = $event.target.files[0];
    }
  }
}
