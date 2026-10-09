/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import lightGallery from 'lightgallery';
import lgFullscreen from 'lightgallery/plugins/fullscreen';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import type { LightGallery } from 'lightgallery/lightgallery';
import type { GalleryItem } from 'lightgallery/lg-utils';
import { UploadDocumentDialogComponent } from 'app/clients/clients-view/custom-dialogs/upload-document-dialog/upload-document-dialog.component';
import { AlertService } from 'app/core/alert/alert.service';
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { downloadBlob } from 'app/core/utils/file-download.utils';
import { LoansService } from 'app/loans/loans.service';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { DocumentPreviewService, PDF_GALLERY_THUMBNAIL } from 'app/shared/services/document-preview.service';
import { SpreadsheetPreview, SpreadsheetPreviewService } from 'app/shared/services/spreadsheet-preview.service';
import { SpreadsheetPreviewDialogComponent } from 'app/shared/documents/spreadsheet-preview-dialog/spreadsheet-preview-dialog.component';
import { Observable, firstValueFrom, throwError } from 'rxjs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { TranslateService } from '@ngx-translate/core';

/** How much of a sheet fits legibly on a card before it stops being a glance and starts being noise. */
const THUMBNAIL_ROWS = 5;
const THUMBNAIL_COLUMNS = 4;

@Component({
  selector: 'mifosx-entity-documents-tab',
  templateUrl: './entity-documents-tab.component.html',
  styleUrls: ['./entity-documents-tab.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatIconButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityDocumentsTabComponent implements OnInit, OnDestroy {
  dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private savingsService = inject(SavingsService);
  private loansService = inject(LoansService);
  private clientsService = inject(ClientsService);
  private settingsService = inject(SettingsService);
  private documentPreviewService = inject(DocumentPreviewService);
  private spreadsheetPreviewService = inject(SpreadsheetPreviewService);
  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);
  private ngZone = inject(NgZone);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('lightboxRoot', { static: true }) lightboxRoot: ElementRef<HTMLElement>;

  @Input() entityId: string;
  @Input() entityType: string;
  @Input() entityDocuments: any;

  @Input() callbackUpload: (documentData: FormData) => Observable<any>;
  @Input() callbackDelete: (documentId: string) => void;

  previewThumbnails: Record<string, string> = {};
  pdfThumbnails: Record<string, SafeResourceUrl> = {};
  /** Parsed spreadsheets, reused by both the card's mini grid and the viewer dialog. */
  spreadsheetPreviews: Record<string, SpreadsheetPreview> = {};
  /**
   * Parses in flight, keyed by document id. The card starts one on load and a click can arrive
   * before it settles, so callers share the pending promise rather than each fetching the file.
   */
  private spreadsheetLoads = new Map<string, Promise<SpreadsheetPreview>>();
  private lightboxInstance: LightGallery | null = null;
  private readonly lightboxPlugins = [
    lgZoom,
    lgThumbnail,
    lgFullscreen
  ];

  ngOnInit(): void {
    this.prefetchThumbnails();
  }

  ngOnDestroy(): void {
    this.destroyLightbox();
    if (Array.isArray(this.entityDocuments)) {
      this.entityDocuments.forEach((doc: any) => this.documentPreviewService.release(doc.id));
    }
  }

  /** TrackBy function for documents ngFor */
  trackByDocumentId(_: number, doc: any): any {
    return doc?.id;
  }

  uploadDocument(): void {
    const uploadDocumentDialogRef = this.dialog.open(UploadDocumentDialogComponent, {
      data: { documentIdentifier: false, entityType: '' },
      width: '33rem'
    });
    uploadDocumentDialogRef.afterClosed().subscribe((dialogResponse: any) => {
      if (dialogResponse) {
        const formData: FormData = new FormData();
        formData.append('name', dialogResponse.fileName);
        formData.append('file', dialogResponse.file);
        formData.append('description', dialogResponse.description);
        formData.append('dateFormat', Dates.DEFAULT_DATEFORMAT);
        formData.append('locale', this.settingsService.language.code);
        this.appendOptionalDate(formData, 'issuanceDate', dialogResponse.issuanceDate);
        this.appendOptionalDate(formData, 'expiryDate', dialogResponse.expiryDate);
        this.callbackUpload(formData).subscribe((res: any) => {
          const newDocument = {
            id: res.resourceId,
            parentEntityType: this.entityType,
            parentEntityId: this.entityId,
            name: dialogResponse.fileName,
            description: dialogResponse.description,
            issuanceDate: this.formatDocumentDate(dialogResponse.issuanceDate),
            expiryDate: this.formatDocumentDate(dialogResponse.expiryDate),
            fileName: dialogResponse.file.name
          };
          this.entityDocuments.push(newDocument);
          this.setThumbnail(newDocument);
          this.cdr.markForCheck();
        });
      }
    });
  }

  deleteDocument(documentId: string, name: string): void {
    if (!this.isValidDocumentId(documentId)) {
      return;
    }
    const deleteDocumentDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Document: ${name}` }
    });
    deleteDocumentDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.callbackDelete(documentId);
        const index = this.entityDocuments.findIndex((doc: any) => doc.id === documentId);
        if (index !== -1) {
          this.entityDocuments.splice(index, 1);
        }
        this.documentPreviewService.release(documentId);
        this.previewThumbnails = { ...this.previewThumbnails };
        delete this.previewThumbnails[documentId];
        this.pdfThumbnails = { ...this.pdfThumbnails };
        delete this.pdfThumbnails[documentId];
        this.spreadsheetPreviews = { ...this.spreadsheetPreviews };
        delete this.spreadsheetPreviews[documentId];
        this.spreadsheetLoads.delete(documentId);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Save the document to disk. Offered for every document, not just the ones without a preview:
   * for file types the browser cannot render inline — spreadsheets, word processor documents,
   * plain text — this is the only way to get at the contents at all.
   */
  downloadDocument(document: any): void {
    if (!this.isValidDocumentId(document?.id)) {
      return;
    }
    this.getDownloadObservable(document.id).subscribe({
      next: (blob: Blob) => downloadBlob(blob, this.resolveDownloadName(document)),
      error: (error: any) => console.error('Unable to download document', document.id, error)
    });
  }

  isPreviewable(document: any): boolean {
    return this.isValidDocumentId(document?.id) && this.documentPreviewService.isPreviewable(document);
  }

  /** Rows shown on the card itself, as a taste of the sheet rather than a usable grid. */
  spreadsheetThumbnailRows(document: any): string[][] {
    const sheet = this.spreadsheetPreviews[document?.id]?.sheets?.[0];
    return (sheet?.rows ?? []).slice(0, THUMBNAIL_ROWS).map((row) => row.slice(0, THUMBNAIL_COLUMNS));
  }

  isSpreadsheet(document: any): boolean {
    return this.isPreviewable(document) && this.documentPreviewService.getPreviewType(document) === 'spreadsheet';
  }

  /**
   * Open whichever viewer suits the document: a spreadsheet becomes a grid in its own dialog,
   * everything else a slide in the lightbox carousel.
   */
  async openPreview(document: any): Promise<void> {
    if (!this.isPreviewable(document)) {
      return;
    }
    if (this.isSpreadsheet(document)) {
      await this.openSpreadsheetPreview(document);
      return;
    }
    try {
      const previewables = this.entityDocuments.filter((doc: any) =>
        this.documentPreviewService.isGalleryPreviewable(doc)
      );
      const galleryItems: GalleryItem[] = [];

      for (const item of previewables) {
        try {
          const preview = await this.documentPreviewService.resolvePreviewUrl(item, (descriptor) =>
            this.getDownloadObservable(descriptor.id)
          );
          if (preview.type === 'image') {
            this.previewThumbnails = { ...this.previewThumbnails, [item.id]: preview.url };
            this.cdr.markForCheck();
          }
          galleryItems.push({
            src: preview.url,
            thumb: preview.type === 'image' ? preview.url : PDF_GALLERY_THUMBNAIL,
            subHtml: this.buildSubHtml(item),
            iframe: preview.type === 'pdf'
          });
        } catch (error) {
          console.error('Preview failed for document', item.id, error);
        }
      }

      if (!galleryItems.length) {
        return;
      }

      const startIndex = Math.max(
        0,
        previewables.findIndex((item: any) => item.id === document.id)
      );
      this.destroyLightbox();
      this.lightboxInstance = lightGallery(this.lightboxRoot.nativeElement, {
        dynamic: true,
        dynamicEl: galleryItems,
        plugins: this.lightboxPlugins,
        download: false,
        closable: true,
        escKey: true,
        zoomFromOrigin: true
      });

      this.lightboxInstance.openGallery(startIndex);
    } catch (error) {
      console.error('Unable to open preview', error);
    }
  }

  private async openSpreadsheetPreview(document: any): Promise<void> {
    try {
      const preview = await this.resolveSpreadsheetPreview(document);
      // Back inside Angular's zone: see loadSpreadsheetPreview. A dialog opened outside it is
      // attached but never change-detected, so it renders nothing at all.
      this.ngZone.run(() =>
        this.dialog.open(SpreadsheetPreviewDialogComponent, {
          data: { name: document.fileName || document.name, preview },
          width: '56rem',
          maxWidth: '95vw'
        })
      );
    } catch (error) {
      console.error('Unable to open spreadsheet preview', document?.id, error);
      this.reportSpreadsheetFailure();
    }
  }

  /** A preview that cannot be built has to say so; silence is indistinguishable from a dead button. */
  private reportSpreadsheetFailure(): void {
    this.ngZone.run(() =>
      this.alertService.alert({
        type: 'error',
        message: this.translateService.instant('labels.text.SpreadsheetPreviewFailed')
      })
    );
  }

  /** Parse once per document: the card's mini grid and the dialog share the same result. */
  private resolveSpreadsheetPreview(document: any): Promise<SpreadsheetPreview> {
    const cached = this.spreadsheetPreviews[document.id];
    if (cached) {
      return Promise.resolve(cached);
    }
    const pending = this.spreadsheetLoads.get(document.id);
    if (pending) {
      return pending;
    }
    const load = this.loadSpreadsheetPreview(document).finally(() => this.spreadsheetLoads.delete(document.id));
    this.spreadsheetLoads.set(document.id, load);
    return load;
  }

  private async loadSpreadsheetPreview(document: any): Promise<SpreadsheetPreview> {
    const blob = await firstValueFrom(this.getDownloadObservable(document.id));
    const preview = await this.spreadsheetPreviewService.load(blob, document.fileName || document.name);
    // The spreadsheet reader is pulled in with a dynamic import, and that promise is native — zone.js
    // does not patch it — so everything after the await runs outside Angular's zone. Publishing the
    // result there would mark the view dirty without any tick ever being scheduled to flush it, and
    // the card would sit on its placeholder forever.
    this.ngZone.run(() => {
      this.spreadsheetPreviews = { ...this.spreadsheetPreviews, [document.id]: preview };
      this.cdr.markForCheck();
    });
    return preview;
  }

  private destroyLightbox(): void {
    if (this.lightboxInstance) {
      this.lightboxInstance.destroy();
      this.lightboxInstance = null;
    }
  }

  private getDownloadObservable(documentId: string): Observable<Blob> {
    if (!this.isValidDocumentId(documentId)) {
      return throwError(() => new Error('Invalid document id.'));
    }
    if (this.entityType === 'savings') {
      return this.savingsService.downloadSavingsDocument(this.entityId, documentId);
    }
    if (this.entityType === 'loans') {
      return this.loansService.downloadLoanDocument(this.entityId, documentId);
    }
    return this.clientsService.downloadClientDocument(this.entityId, documentId);
  }

  private buildSubHtml(document: any): string {
    const description = document.description
      ? `<p class="lg-caption-text">${this.escapeHtml(document.description)}</p>`
      : '';
    const filename = document.fileName ? `<p class="lg-meta">${this.escapeHtml(document.fileName)}</p>` : '';
    return `<div class="lg-caption"><h4>${this.escapeHtml(document.name || 'Document')}</h4>${description}${filename}</div>`;
  }

  private escapeHtml(value: string): string {
    return value
      ? value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      : '';
  }

  private appendOptionalDate(formData: FormData, key: string, value: Date | string | null | undefined): void {
    const formattedDate = this.formatDocumentDate(value);
    if (formattedDate) {
      formData.append(key, formattedDate);
    }
  }

  private formatDocumentDate(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }
    if (value instanceof Date) {
      const month = `${value.getMonth() + 1}`.padStart(2, '0');
      const day = `${value.getDate()}`.padStart(2, '0');
      return `${value.getFullYear()}-${month}-${day}`;
    }
    return value;
  }

  private setThumbnail(document: any): void {
    if (!this.isPreviewable(document)) {
      return;
    }
    if (this.isSpreadsheet(document)) {
      // A failure here only costs the card its mini grid; the click path reports it properly.
      this.resolveSpreadsheetPreview(document).catch((error) =>
        console.error('Unable to read spreadsheet', document?.id, error)
      );
      return;
    }
    this.documentPreviewService
      .resolvePreviewUrl(document, () => this.getDownloadObservable(document.id))
      .then((preview) => {
        if (preview.type === 'image') {
          this.previewThumbnails = { ...this.previewThumbnails, [document.id]: preview.url };
          this.cdr.markForCheck();
        } else if (preview.type === 'pdf') {
          this.pdfThumbnails = { ...this.pdfThumbnails, [document.id]: this.buildPdfThumbnailUrl(preview.url) };
          this.cdr.markForCheck();
        }
      })
      .catch((): void => undefined);
  }

  /**
   * Point the card's iframe at the PDF with the browser viewer's chrome switched off, fitted to
   * the card width. The URL is trusted because it is an object URL this app created itself.
   */
  private buildPdfThumbnailUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`);
  }

  private prefetchThumbnails(): void {
    if (!Array.isArray(this.entityDocuments)) {
      return;
    }
    this.entityDocuments.forEach((doc: any) => this.setThumbnail(doc));
  }

  /** The stored file name carries the extension the browser needs to open the download. */
  private resolveDownloadName(document: any): string {
    return document?.fileName || document?.name || `document-${document?.id}`;
  }

  private isValidDocumentId(documentId: string | number | null | undefined): boolean {
    const parsedDocumentId = Number(documentId);
    return Number.isFinite(parsedDocumentId) && parsedDocumentId > 0;
  }
}
