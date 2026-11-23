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
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import lightGallery from 'lightgallery';
import lgFullscreen from 'lightgallery/plugins/fullscreen';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import type { LightGallery } from 'lightgallery/lightgallery';
import type { GalleryItem } from 'lightgallery/lg-utils';
import { UploadDocumentDialogComponent } from 'app/clients/clients-view/custom-dialogs/upload-document-dialog/upload-document-dialog.component';
import { ClientsService } from 'app/clients/clients.service';
import { LoansService } from 'app/loans/loans.service';
import { SavingsService } from 'app/savings/savings.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { Observable } from 'rxjs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { DualDateComponent } from 'app/shared/dual-date/dual-date.component';
import { KYM_DOCUMENTS } from 'app/clients/kym/kym.models';

/** A date as yyyy-MM-dd, or null. */
function isoDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'mifosx-entity-documents-tab',
  templateUrl: './entity-documents-tab.component.html',
  styleUrls: ['./entity-documents-tab.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    DualDateComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityDocumentsTabComponent implements OnInit, OnDestroy {
  dialog = inject(MatDialog);
  private savingsService = inject(SavingsService);
  private loansService = inject(LoansService);
  private clientsService = inject(ClientsService);
  private documentPreviewService = inject(DocumentPreviewService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  @ViewChild('lightboxRoot', { static: true }) lightboxRoot: ElementRef<HTMLElement>;

  @Input() entityId: string;
  @Input() entityType: string;
  @Input() entityDocuments: any;

  @Input() callbackUpload: (documentData: FormData) => Observable<any>;
  @Input() callbackDelete: (documentId: string) => void;
  /** Saves an edited document (PUT .../documents/{documentId}); without it, cards show no Edit action. */
  @Input() callbackUpdate: (documentId: string, documentData: FormData) => Observable<any>;

  previewThumbnails: Record<string, string> = {};
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
      width: '56rem',
      maxWidth: '95vw'
    });
    uploadDocumentDialogRef.afterClosed().subscribe((dialogResponse: any) => {
      if (dialogResponse) {
        const formData: FormData = new FormData();
        formData.append('name', dialogResponse.fileName);
        formData.append('file', dialogResponse.file);
        formData.append('description', dialogResponse.description);
        // Issue and expiry dates (fineract-dbug ADR 0020): strictly yyyy-MM-dd, and left out when blank, because the
        // server can't read an empty date.
        const issuanceDate = isoDate(dialogResponse.issuanceDate);
        const expiryDate = isoDate(dialogResponse.expiryDate);
        if (issuanceDate) formData.append('issuanceDate', issuanceDate);
        if (expiryDate) formData.append('expiryDate', expiryDate);
        this.callbackUpload(formData).subscribe((res: any) => {
          const newDocument = {
            id: res.resourceId,
            parentEntityType: this.entityType,
            parentEntityId: this.entityId,
            name: dialogResponse.fileName,
            description: dialogResponse.description,
            issuanceDate: issuanceDate,
            expiryDate: expiryDate,
            fileName: dialogResponse.file.name
          };
          this.entityDocuments.push(newDocument);
          this.setThumbnail(newDocument);
          this.changeDetectorRef.markForCheck();
        });
      }
    });
  }

  /**
   * Edits a document in the upload dialog, pre-filled: name, description, issue and expiry dates, and
   * optionally a new file of the same type (none keeps the stored file). The dialog stays open until the
   * save succeeds, so an error from the server is shown in it; then the card is updated in place.
   */
  editDocument(document: any): void {
    const dialogRef = this.dialog.open(UploadDocumentDialogComponent, {
      data: {
        documentIdentifier: false,
        entityType: '',
        document,
        // Only a member's documents count towards the KYM.
        kymDocumentNames: this.entityType === 'clients' ? Object.values(KYM_DOCUMENTS).flat() : []
      },
      width: '56rem',
      maxWidth: '95vw'
    });
    dialogRef.componentInstance.submitted.subscribe((value: any) => {
      const formData = new FormData();
      formData.append('name', value.fileName);
      formData.append('description', value.description ?? '');
      const issuanceDate = isoDate(value.issuanceDate);
      const expiryDate = isoDate(value.expiryDate);
      if (issuanceDate) formData.append('issuanceDate', issuanceDate);
      if (expiryDate) formData.append('expiryDate', expiryDate);
      const newFile: File | null = value.file instanceof File ? value.file : null;
      if (newFile) formData.append('file', newFile);

      this.callbackUpdate(document.id, formData).subscribe({
        next: () => {
          // The server ignores a blank description or date and keeps the stored one, and keeps the stored
          // file name when the file is replaced, so the card shows the same.
          const updated = {
            ...document,
            name: value.fileName,
            description: value.description || document.description,
            issuanceDate: issuanceDate || document.issuanceDate,
            expiryDate: expiryDate || document.expiryDate
          };
          const index = this.entityDocuments.findIndex((doc: any) => doc.id === document.id);
          if (index !== -1) {
            this.entityDocuments[index] = updated;
          }
          if (newFile) {
            // The stored file changed: drop the cached preview so the new file is shown.
            this.documentPreviewService.release(document.id);
            delete this.previewThumbnails[document.id];
            this.setThumbnail(updated);
          }
          this.changeDetectorRef.markForCheck();
          dialogRef.close();
        },
        error: (err: any) => dialogRef.componentInstance.applyServerError(err)
      });
    });
  }

  deleteDocument(documentId: string, name: string): void {
    const deleteDocumentDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Document: ${name}` }
    });
    deleteDocumentDialogRef.afterClosed().subscribe((response: any) => {
      if (response?.delete) {
        this.callbackDelete(documentId);
        const index = this.entityDocuments.findIndex((doc: any) => doc.id === documentId);
        if (index !== -1) {
          this.entityDocuments.splice(index, 1);
        }
        this.documentPreviewService.release(documentId);
        delete this.previewThumbnails[documentId];
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  downloadDocument(document: any): void {
    this.getDownloadObservable(document.id).subscribe((blob: Blob) => {
      const objectUrl = URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = document.fileName || document.name || 'document';
      anchor.click();
      // Revoking straight after click() can cancel the download in some browsers.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    });
  }

  /** Upper-case extension of the stored file ("PDF"), or '' when there is none. */
  fileExtension(document: any): string {
    const match = /\.([a-z0-9]{1,5})$/i.exec(document.fileName || '');
    return match ? match[1].toUpperCase() : '';
  }

  fileIcon(document: any): string {
    switch (this.fileExtension(document)) {
      case 'PDF':
        return 'file-pdf';
      case 'DOC':
      case 'DOCX':
        return 'file-word';
      case 'XLS':
      case 'XLSX':
      case 'CSV':
        return 'file-excel';
      default:
        return 'file';
    }
  }

  isPreviewable(document: any): boolean {
    return this.documentPreviewService.isPreviewable(document);
  }

  async openPreview(document: any): Promise<void> {
    if (!this.isPreviewable(document)) {
      return;
    }
    try {
      const previewables = this.entityDocuments.filter((doc: any) => this.isPreviewable(doc));
      const galleryItems: GalleryItem[] = [];

      for (const item of previewables) {
        try {
          const preview = await this.documentPreviewService.resolvePreviewUrl(item, (descriptor) =>
            this.getDownloadObservable(descriptor.id)
          );
          if (preview.type === 'image') {
            this.previewThumbnails[item.id] = preview.url;
          }
          galleryItems.push({
            src: preview.url,
            thumb: preview.type === 'image' ? preview.url : undefined,
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

  private destroyLightbox(): void {
    if (this.lightboxInstance) {
      this.lightboxInstance.destroy();
      this.lightboxInstance = null;
    }
  }

  private getDownloadObservable(documentId: string): Observable<Blob> {
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

  private setThumbnail(document: any): void {
    if (!this.documentPreviewService.isPreviewable(document)) {
      return;
    }
    this.documentPreviewService
      .resolvePreviewUrl(document, () => this.getDownloadObservable(document.id))
      .then((preview) => {
        if (preview.type === 'image') {
          this.previewThumbnails[document.id] = preview.url;
          this.changeDetectorRef.markForCheck();
        }
      })
      .catch((): void => undefined);
  }

  private prefetchThumbnails(): void {
    if (!Array.isArray(this.entityDocuments)) {
      return;
    }
    this.entityDocuments.forEach((doc: any) => this.setThumbnail(doc));
  }
}
