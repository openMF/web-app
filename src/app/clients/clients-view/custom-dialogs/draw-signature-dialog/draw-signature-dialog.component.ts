/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** External Imports */
import SignaturePad from 'signature_pad';

/**
 * Draw signature dialog component.
 */
@Component({
  selector: 'mifosx-draw-signature-dialog',
  templateUrl: './draw-signature-dialog.component.html',
  styleUrls: ['./draw-signature-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    MatDialogActions,
    MatDialogClose
  ]
})
export class DrawSignatureDialogComponent implements AfterViewInit, OnDestroy {
  dialogRef = inject<MatDialogRef<DrawSignatureDialogComponent>>(MatDialogRef);

  /** Canvas element reference */
  @ViewChild('signatureCanvas', { static: true }) signatureCanvas: ElementRef<HTMLCanvasElement>;

  /** Signature pad instance */
  private signaturePad: SignaturePad;

  /** Whether the pad has content */
  isEmpty = true;

  ngAfterViewInit() {
    const canvas = this.signatureCanvas.nativeElement;
    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)'
    });

    this.signaturePad.addEventListener('endStroke', () => {
      this.isEmpty = this.signaturePad.isEmpty();
    });

    this.resizeCanvas();
  }

  ngOnDestroy() {
    if (this.signaturePad) {
      this.signaturePad.off();
    }
  }

  /** Resizes canvas to match its display size for crisp rendering */
  private resizeCanvas() {
    const canvas = this.signatureCanvas.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
    this.signaturePad.clear();
  }

  /** Clears the signature pad */
  clear() {
    this.signaturePad.clear();
    this.isEmpty = true;
  }

  /** Converts the drawn signature to a File and closes the dialog */
  confirm() {
    if (this.signaturePad.isEmpty()) {
      return;
    }

    const canvas = this.signatureCanvas.nativeElement;
    canvas.toBlob((blob: Blob) => {
      const file = new File([blob], 'clientSignature.png', { type: 'image/png' });
      this.dialogRef.close(file);
    }, 'image/png');
  }
}
