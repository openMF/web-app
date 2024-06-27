/** Angular Imports */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { MatomoTracker } from '@ngx-matomo/tracker';

/**
 * View signature dialog component.
 */
@Component({
  selector: 'mifosx-view-signature-dialog',
  templateUrl: './view-signature-dialog.component.html',
  styleUrls: ['./view-signature-dialog.component.scss'],
})
export class ViewSignatureDialogComponent implements OnInit {
  /** Id of client signature in documents */
  signatureId: any;
  /** Signature Image */
  signatureImage: any;
  /** Client Id */
  clientId: any;

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Documents data
   * @param {MatomoTracker} matomoTracker Matomo tracker service
   */
  constructor(
    public dialogRef: MatDialogRef<ViewSignatureDialogComponent>,
    private clientsService: ClientsService,
    private matomoTracker: MatomoTracker,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: { documents: any[]; id: string }
  ) {
    const signature = this.data.documents.find((document: any) => document.name === 'clientSignature') || {};
    this.signatureId = signature.id;
    this.clientId = this.data.id;
    console.log(this.clientId);
  }

  ngOnInit() {
    //set Matomo page info
    let title = document.title || '';
    this.matomoTracker.setDocumentTitle(`${title}`);

    if (this.signatureId) {
      this.clientsService.downloadClientDocument(this.clientId, this.signatureId).subscribe((res) => {
        const url = window.URL.createObjectURL(res);
        this.signatureImage = this.sanitizer.bypassSecurityTrustUrl(url);
        this.matomoTracker.trackEvent('clients', 'viewCLientSignature', this.signatureId);
      });
    }
  }
}
