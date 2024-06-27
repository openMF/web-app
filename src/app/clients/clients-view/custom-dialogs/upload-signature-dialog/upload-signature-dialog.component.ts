/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatomoTracker } from "@ngx-matomo/tracker";

/**
 * Upload signature dialog component.
 */
@Component({
  selector: 'mifosx-upload-signature-dialog',
  templateUrl: './upload-signature-dialog.component.html',
  styleUrls: ['./upload-signature-dialog.component.scss']
})
export class UploadSignatureDialogComponent implements OnInit{

  /** Client Signature */
  signature: File;

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {MatomoTracker} matomoTracker Matomo tracker service
   */
  constructor(public dialogRef: MatDialogRef<UploadSignatureDialogComponent>, private matomoTracker: MatomoTracker) { }

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
      this.signature = $event.target.files[0];

      //Track Matomo event for selecting signature
    this.matomoTracker.trackEvent('clients', 'chooseSignatureStart');
    }
  }

}
