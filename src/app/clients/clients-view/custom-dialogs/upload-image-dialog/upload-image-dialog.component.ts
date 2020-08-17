/** Angular Imports */
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

/**
 * Upload image dialog component.
 */
@Component({
  selector: 'mifosx-upload-image-dialog',
  templateUrl: './upload-image-dialog.component.html',
  styleUrls: ['./upload-image-dialog.component.scss']
})
export class UploadImageDialogComponent {

  /** Client Image */
  image: File;

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   */
  constructor(public dialogRef: MatDialogRef<UploadImageDialogComponent>) { }

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
