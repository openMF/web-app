/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatomoTracker } from "@ngx-matomo/tracker";

/**
 * Delete signature dialog component.
 */
@Component({
  selector: 'mifosx-delete-signature-dialog',
  templateUrl: './delete-signature-dialog.component.html',
  styleUrls: ['./delete-signature-dialog.component.scss']
})
export class DeleteSignatureDialogComponent implements OnInit {

  /** Id of client signature in documents */
  signatureId: any;

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Documents data
   * @param {MatomoTracker} matomoTracker Matomo tracker service
   */
  constructor(public dialogRef: MatDialogRef<DeleteSignatureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any[], private matomoTracker: MatomoTracker) {
    const signature = this.data.find((document: any) => document.name === 'clientSignature') || {};
    this.signatureId = signature.id;
  }

  ngOnInit() {
    //set Matomo page info
    let title = document.title || "";
    this.matomoTracker.setDocumentTitle(`${title}`);

    //Track Matomo event for creating note
    this.matomoTracker.trackEvent('clients', 'deleteClientSignature',this.signatureId);
  }

}
