/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
  inject
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

/** PDF.js renders the returned bytes without relying on a browser PDF plugin or an HTML iframe. */
@Component({
  selector: 'mifosx-birt-pdf-preview',
  templateUrl: './pdf-preview.component.html',
  styleUrls: ['./pdf-preview.component.scss'],
  imports: [
    MatButtonModule,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfPreviewComponent implements AfterViewInit, OnChanges, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  @Input() data: ArrayBuffer;
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('pages', { static: true }) pages: ElementRef<HTMLElement>;
  loading = true;
  documentFailed = false;
  pageRenderFailed = false;
  pageNumber = 1;
  totalPages = 0;
  pageText = '';
  private pdf: PDFDocumentProxy | null = null;
  private loadingTask: PDFDocumentLoadingTask | null = null;
  private renderTask: RenderTask | null = null;
  private viewReady = false;
  private destroyed = false;
  private documentRevision = 0;
  private renderRevision = 0;
  private scale: number | null = null;
  private renderedScale = 1;

  get failed(): boolean {
    return this.documentFailed || this.pageRenderFailed;
  }

  get documentLoaded(): boolean {
    return this.pdf !== null;
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    void this.loadDocument();
  }

  ngOnChanges(): void {
    if (this.viewReady) {
      void this.loadDocument();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.documentRevision++;
    this.renderRevision++;
    this.renderTask?.cancel();
    void this.loadingTask?.destroy();
  }

  previous(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.pages.nativeElement.scrollTop = 0;
      void this.renderPage();
    }
  }

  next(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.pages.nativeElement.scrollTop = 0;
      void this.renderPage();
    }
  }

  zoom(amount: number): void {
    const currentScale = this.scale ?? this.renderedScale;
    this.scale = Math.max(Math.min(0.25, currentScale), Math.min(4, currentScale + amount));
    void this.renderPage();
  }

  fit(): void {
    this.scale = null;
    void this.renderPage();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.scale === null) {
      void this.renderPage();
    }
  }

  private async loadDocument(): Promise<void> {
    const revision = ++this.documentRevision;
    this.renderRevision++;
    this.renderTask?.cancel();
    this.pdf = null;
    this.loading = true;
    this.documentFailed = false;
    this.pageRenderFailed = false;
    this.totalPages = 0;
    this.pageText = '';
    this.scale = null;
    try {
      await this.loadingTask?.destroy();
      if (!this.data || this.destroyed || revision !== this.documentRevision) {
        return;
      }
      const pdfjs = await import('pdfjs-dist');
      if (this.destroyed || revision !== this.documentRevision) {
        return;
      }
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('assets/pdfjs/pdf.worker.min.mjs', document.baseURI).href;
      this.loadingTask = pdfjs.getDocument({
        // PDF.js transfers data to its worker; keep the caller's response usable for downloads/re-runs.
        data: new Uint8Array(this.data.slice(0)),
        standardFontDataUrl: new URL('assets/pdfjs/standard_fonts/', document.baseURI).href,
        cMapUrl: new URL('assets/pdfjs/cmaps/', document.baseURI).href,
        cMapPacked: true,
        wasmUrl: new URL('assets/pdfjs/wasm/', document.baseURI).href,
        isEvalSupported: false,
        enableXfa: false
      });
      const pdf = await this.loadingTask.promise;
      if (this.destroyed || revision !== this.documentRevision) {
        await pdf.destroy();
        return;
      }
      this.pdf = pdf;
      this.totalPages = pdf.numPages;
      this.pageNumber = 1;
      await this.renderPage();
    } catch {
      if (!this.destroyed && revision === this.documentRevision) {
        this.documentFailed = true;
      }
    } finally {
      if (!this.destroyed && revision === this.documentRevision) {
        this.loading = false;
        this.cdr.markForCheck();
      }
    }
  }

  private async renderPage(): Promise<void> {
    if (!this.pdf || this.destroyed) {
      return;
    }
    const revision = ++this.renderRevision;
    const previous = this.renderTask;
    previous?.cancel();
    try {
      await previous?.promise.catch((): void => undefined);
      const page = await this.pdf.getPage(this.pageNumber);
      if (this.destroyed || revision !== this.renderRevision) {
        return;
      }
      const width = this.pages.nativeElement.clientWidth || 800;
      const natural = page.getViewport({ scale: 1 });
      const scale = this.scale ?? Math.min(2, Math.max(1, width - 32) / natural.width);
      const viewport = page.getViewport({ scale });
      const canvas = this.canvas.nativeElement;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas unavailable');
      }
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(viewport.width * ratio);
      canvas.height = Math.ceil(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      this.renderTask = page.render({
        canvas,
        canvasContext: context,
        viewport,
        transform: ratio === 1 ? undefined : [
                ratio,
                0,
                0,
                ratio,
                0,
                0
              ]
      });
      await this.renderTask.promise;
      if (!this.destroyed && revision === this.renderRevision) {
        const content = await page.getTextContent();
        if (this.destroyed || revision !== this.renderRevision) {
          return;
        }
        this.pageText = content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
        this.renderedScale = scale;
        this.pageRenderFailed = false;
        this.cdr.markForCheck();
      }
    } catch {
      if (!this.destroyed && revision === this.renderRevision) {
        this.pageRenderFailed = true;
        this.pageText = '';
        this.cdr.markForCheck();
      }
    }
  }
}
