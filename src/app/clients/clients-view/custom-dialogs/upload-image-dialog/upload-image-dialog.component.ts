/** Angular Imports */
import { Component } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { FileUploadComponent } from '../../../../shared/file-upload/file-upload.component';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Upload image dialog component.
 */
@Component({
  selector: 'mifosx-upload-image-dialog',
  templateUrl: './upload-image-dialog.component.html',
  styleUrls: ['./upload-image-dialog.component.scss'],
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
export class UploadImageDialogComponent {
  /** Client Image */
  image: File;

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   */
  constructor(public dialogRef: MatDialogRef<UploadImageDialogComponent>) {}

  /**
   * Sets file form control value.
   * @param {any} $event file change event.
   */
  onFileSelect($event: any) {
    if ($event.target.files.length > 0) {
      this.image = $event.target.files[0];
    }
  }
}
