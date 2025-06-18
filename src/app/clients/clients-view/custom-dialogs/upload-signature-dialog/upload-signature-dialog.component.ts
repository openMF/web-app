/** Angular Imports */
import { Component } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { FileUploadComponent } from '../../../../shared/file-upload/file-upload.component';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Upload signature dialog component.
 */
@Component({
  selector: 'mifosx-upload-signature-dialog',
  templateUrl: './upload-signature-dialog.component.html',
  styleUrls: ['./upload-signature-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    FileUploadComponent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class UploadSignatureDialogComponent {
  /** Client Signature */
  signature: File;

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   */
  constructor(public dialogRef: MatDialogRef<UploadSignatureDialogComponent>) {}

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
