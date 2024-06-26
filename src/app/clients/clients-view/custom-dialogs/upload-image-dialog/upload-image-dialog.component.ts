/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatomoTracker } from "@ngx-matomo/tracker";

/**
 * Upload image dialog component.
 */
@Component({
  selector: 'mifosx-upload-image-dialog',
  templateUrl: './upload-image-dialog.component.html',
  styleUrls: ['./upload-image-dialog.component.scss']
})
export class UploadImageDialogComponent implements OnInit {

  /** Client Image */
  image: File;

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {MatomoTracker} matomoTracker Matomo tracker service
   */
  constructor(public dialogRef: MatDialogRef<UploadImageDialogComponent>, private matomoTracker: MatomoTracker) { }

  ngOnInit() {
    //set Matomo page info
    let title = document.title || "";
    this.matomoTracker.setDocumentTitle(`${title}`);
  }

  /**
   * Sets file form control value.
   * @param {any} $event file change event.
   */
  onFileSelect($event: any) {
    if ($event.target.files.length > 0) {
      this.image = $event.target.files[0];
    }
    //Track Matomo event for selecting img
    this.matomoTracker.trackEvent('clients', 'chooseImageStart');
  }

}
