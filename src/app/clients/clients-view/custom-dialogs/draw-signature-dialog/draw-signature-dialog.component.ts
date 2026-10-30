/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject
} from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** External Imports */
import SignaturePad, { BasicPoint, PointGroup } from 'signature_pad';

/** Tools available on the signature pad */
export type SignatureTool = 'draw' | 'erase';

/** A stroke recorded on the pad together with the tool that produced it */
interface SignatureStroke {
  tool: SignatureTool;
  /** Point group captured from the pad; keeps the original pen options for redraws */
  group: PointGroup;
}

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
    MatDialogClose,
    MatButtonToggleGroup,
    MatButtonToggle,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrawSignatureDialogComponent implements AfterViewInit, OnDestroy {
  dialogRef = inject<MatDialogRef<DrawSignatureDialogComponent>>(MatDialogRef);
  private cdr = inject(ChangeDetectorRef);

  /** Canvas element reference */
  @ViewChild('signatureCanvas', { static: true }) signatureCanvas: ElementRef<HTMLCanvasElement>;

  /** Signature pad instance */
  private signaturePad: SignaturePad;

  /** 2D rendering context of the signature canvas */
  private canvasContext: CanvasRenderingContext2D;

  /** Currently selected tool; drawing is the default */
  tool: SignatureTool = 'draw';

  /** Stroke history in the order it was made; the source of truth for redraws */
  private strokes: SignatureStroke[] = [];

  /** Whether the pad has content */
  isEmpty = true;

  /** Width (in CSS pixels) of the eraser preview stroke */
  private readonly eraserWidth = 20;

  /** Default pen widths restored when switching back to drawing */
  private drawMinWidth: number;
  private drawMaxWidth: number;

  ngAfterViewInit() {
    const canvas = this.signatureCanvas.nativeElement;
    this.canvasContext = canvas.getContext('2d');
    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)'
    });

    this.drawMinWidth = this.signaturePad.minWidth;
    this.drawMaxWidth = this.signaturePad.maxWidth;

    this.signaturePad.addEventListener('endStroke', () => {
      this.recordStroke();
      this.isEmpty = !this.hasVisibleInk();
      this.cdr.markForCheck();
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
    this.strokes = [];
    this.signaturePad.clear();
  }

  /** Switches between drawing and erasing without losing recorded strokes */
  setTool(tool: SignatureTool) {
    this.tool = tool;
    if (tool === 'erase') {
      // Erasing previews as a thick white stroke over the white canvas background
      this.signaturePad.penColor = 'rgb(255, 255, 255)';
      this.signaturePad.minWidth = this.eraserWidth;
      this.signaturePad.maxWidth = this.eraserWidth;
    } else {
      this.signaturePad.penColor = 'black';
      this.signaturePad.minWidth = this.drawMinWidth;
      this.signaturePad.maxWidth = this.drawMaxWidth;
    }
  }

  /** Captures the finished stroke and replays the canvas with erasing applied */
  private recordStroke() {
    const data = this.signaturePad.toData();
    const group = data[data.length - 1];
    if (!group) {
      return;
    }

    // Erasing over an empty canvas has no effect and must not make the pad non-empty
    if (this.tool !== 'erase' || this.hasDrawnContent()) {
      this.strokes.push({ tool: this.tool, group });
    }
    this.replay();
  }

  /** Re-renders the canvas by replaying every stroke in the order it was made */
  private replay() {
    const canvas = this.signatureCanvas.nativeElement;
    const ctx = this.canvasContext;

    // Rebuild the canvas from scratch so each stroke lands exactly where it
    // sits in the history; an eraser stroke only removes ink drawn before it
    this.signaturePad.clear();
    for (const stroke of this.strokes) {
      if (stroke.tool === 'draw') {
        // Draw strokes append with their original pen options
        this.signaturePad.fromData([stroke.group], { clear: false });
      } else {
        this.punchErase(stroke.group.points);
      }
    }

    // Keep the canvas (and exported image) on an opaque white background
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  /** Punches an eraser stroke through the canvas content that predates it */
  private punchErase(points: BasicPoint[]) {
    const ctx = this.canvasContext;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Slightly wider than the preview so no ink remnants survive at curve apexes
    ctx.lineWidth = this.eraserWidth + 2;
    this.strokePath(points);
    ctx.restore();
  }

  /** Strokes a path through the given points with the current context settings */
  private strokePath(points: BasicPoint[]) {
    const ctx = this.canvasContext;
    ctx.beginPath();
    if (points.length > 1) {
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
    } else if (points.length === 1) {
      // A single point becomes a dot thanks to the round line cap
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[0].x + 0.01, points[0].y);
    }
    ctx.stroke();
    ctx.closePath();
  }

  /** Whether at least one stroke has been drawn (regardless of later erasing) */
  private hasDrawnContent(): boolean {
    return this.strokes.some((stroke) => stroke.tool === 'draw');
  }

  /** Whether any visible ink remains, i.e. the canvas holds a non-white pixel */
  private hasVisibleInk(): boolean {
    const canvas = this.signatureCanvas.nativeElement;
    const { data } = this.canvasContext.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] !== 0 && (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255)) {
        return true;
      }
    }
    return false;
  }

  /** Clears the signature pad */
  clear() {
    this.strokes = [];
    this.signaturePad.clear();
    this.isEmpty = true;
  }

  /** Converts the drawn signature to a File and closes the dialog */
  confirm() {
    if (!this.hasVisibleInk()) {
      return;
    }

    const canvas = this.signatureCanvas.nativeElement;
    canvas.toBlob((blob: Blob) => {
      const file = new File([blob], 'clientSignature.png', { type: 'image/png' });
      this.dialogRef.close(file);
    }, 'image/png');
  }
}
