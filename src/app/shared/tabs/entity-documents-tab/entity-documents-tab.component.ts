import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'mifosx-entity-documents-tab',
  templateUrl: './entity-documents-tab.component.html',
  styleUrls: ['./entity-documents-tab.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ]
})
export class EntityDocumentsTabComponent implements OnInit, OnDestroy {
  @ViewChild('lightboxRoot', { static: true }) lightboxRoot: ElementRef<HTMLElement>;

  @Input() entityId: string;
  @Input() entityType: string;
  @Input() entityDocuments: any;

  @Input() callbackUpload: (documentData: FormData) => Observable<any>;
  @Input() callbackDelete: (documentId: string) => void;

  previewThumbnails: Record<string, string> = {};
  private lightboxInstance: LightGallery | null = null;
  private readonly lightboxPlugins = [
    lgZoom,
    lgThumbnail,
    lgFullscreen
  ];

  constructor(
    public dialog: MatDialog,
    private savingsService: SavingsService,
    private loansService: LoansService,
    private clientsService: ClientsService,
    private documentPreviewService: DocumentPreviewService
  ) {}

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
        this.callbackUpload(formData).subscribe((res: any) => {
          const newDocument = {
            id: res.resourceId,
            parentEntityType: this.entityType,
            parentEntityId: this.entityId,
            name: dialogResponse.fileName,
            description: dialogResponse.description,
            fileName: dialogResponse.file.name
          };
          this.entityDocuments.push(newDocument);
          this.setThumbnail(newDocument);
        });
      }
    });
  }

  deleteDocument(documentId: string, name: string): void {
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
        delete this.previewThumbnails[documentId];
      }
    });
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
