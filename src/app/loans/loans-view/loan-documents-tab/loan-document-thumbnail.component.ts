/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnChanges,
  inject
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import type { PDFDocumentLoadingTask, RenderTask } from 'pdfjs-dist';
import { LoanDocumentMediaService } from './loan-document-media.service';
import { PresentedLoanDocument } from './loan-document-presentation.utils';
@Component({
  selector: 'mifosx-loan-document-thumbnail',
  imports: [
    MatIconModule,
    TranslateModule
  ],
  template: `@if (url) {
      <img [src]="url" [alt]="'loanDocuments.thumbnail' | translate" />
    } @else {
      <mat-icon aria-hidden="true">{{ loading ? 'hourglass_empty' : 'description' }}</mat-icon>
    }`,
  styles: [
    `
      :host {
        display: flex;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top;
      }
      mat-icon {
        opacity: 0.5;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanDocumentThumbnailComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) document: PresentedLoanDocument;
  @Input({ required: true }) loanId: string;
  private media = inject(LoanDocumentMediaService);
  private cdr = inject(ChangeDetectorRef);
  private destroyed = false;
  private revision = 0;
  private loadingTask?: PDFDocumentLoadingTask;
  private renderTask?: RenderTask;
  url = '';
  loading = true;
  ngOnChanges(): void {
    const revision = ++this.revision;
    this.renderTask?.cancel();
    void this.loadingTask?.destroy().catch((): void => undefined);
    this.url = '';
    this.loading = true;
    void this.media.bounded(() => this.render(revision)).catch((): void => undefined);
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    this.revision++;
    this.renderTask?.cancel();
    void this.loadingTask?.destroy().catch((): void => undefined);
  }
  private current(revision: number): boolean {
    return !this.destroyed && revision === this.revision;
  }
  private async render(revision: number): Promise<void> {
    // Each run owns its resources: an old run must never destroy a newer run's PDF task.
    let loadingTask: PDFDocumentLoadingTask | undefined;
    let renderTask: RenderTask | undefined;
    const doc = this.document;
    const loanId = this.loanId;
    try {
      if (!this.current(revision) || ![
          'PDF',
          'PNG',
          'JPG',
          'JPEG',
          'WEBP',
          'GIF',
          'BMP'
        ].includes(doc.extension) || doc.size > 20 * 1024 * 1024) return;
      const blob = await this.media.read(loanId, doc);
      if (!this.current(revision) || blob.size > 20 * 1024 * 1024) return;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;
      if (doc.extension === 'PDF') {
        const pdfjs = await import('pdfjs-dist');
        if (!this.current(revision)) return;
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('assets/pdfjs/pdf.worker.min.mjs', document.baseURI).href;
        const data = new Uint8Array(await blob.arrayBuffer());
        if (!this.current(revision)) return;
        loadingTask = pdfjs.getDocument({
          data,
          cMapUrl: new URL('assets/pdfjs/cmaps/', document.baseURI).href,
          cMapPacked: true,
          isEvalSupported: false,
          enableXfa: false
        });
        this.loadingTask = loadingTask;
        const pdf = await loadingTask.promise;
        if (!this.current(revision)) return;
        const page = await pdf.getPage(1);
        if (!this.current(revision)) return;
        const natural = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: 480 / natural.width });
        canvas.width = 480;
        canvas.height = Math.min(640, Math.ceil(viewport.height));
        renderTask = page.render({ canvas, canvasContext: context, viewport });
        this.renderTask = renderTask;
        await renderTask.promise;
      } else {
        const objectUrl = URL.createObjectURL(blob);
        try {
          const image = new Image();
          image.src = objectUrl;
          await image.decode();
          if (!this.current(revision)) return;
          canvas.width = 480;
          canvas.height = Math.min(640, Math.round((image.naturalHeight * 480) / image.naturalWidth));
          context.drawImage(image, 0, 0, 480, (image.naturalHeight * 480) / image.naturalWidth);
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      }
      if (this.current(revision)) this.url = canvas.toDataURL('image/jpeg', 0.8);
    } catch {
      /* A damaged thumbnail must not prevent document actions. */
    } finally {
      await loadingTask?.destroy().catch((): void => undefined);
      if (this.loadingTask === loadingTask) this.loadingTask = undefined;
      if (this.renderTask === renderTask) this.renderTask = undefined;
      if (this.current(revision)) {
        this.loading = false;
        this.cdr.markForCheck();
      }
    }
  }
}
