/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';

/** Node Types */
import { Buffer } from 'buffer';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View signature dialog component.
 */
@Component({
  selector: 'mifosx-view-signature-dialog',
  templateUrl: './view-signature-dialog.component.html',
  styleUrls: ['./view-signature-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class ViewSignatureDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<ViewSignatureDialogComponent>>(MatDialogRef);
  private clientsService = inject(ClientsService);
  private sanitizer = inject(DomSanitizer);
  data = inject<{
    documents: any[];
    id: string;
  }>(MAT_DIALOG_DATA);

  /** Id of client signature in documents */
  signatureId: any;
  /** Signature Image */
  signatureImage: any;
  /** Client Id */
  clientId: any;

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Documents data
   */
  constructor() {
    const signature = this.data.documents.find((document: any) => document.name === 'clientSignature') || {};
    this.signatureId = signature.id;
    this.clientId = this.data.id;
  }

  ngOnInit() {
    if (this.signatureId) {
      this.clientsService.getClientSignatureImage(this.clientId, this.signatureId).subscribe(
        async (blob: any) => {
          const buffer = Buffer.from(await blob.arrayBuffer());
          this.signatureImage = 'data:' + blob.type + ';base64,' + buffer.toString('base64');
        },
        (error: any) => {}
      );
    }
  }
}
