/** Angular Imports */
import { Component, DestroyRef, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { UploadDocumentDialogComponent } from '../custom-dialogs/upload-document-dialog/upload-document-dialog.component';

/** Custom Services */
import lightGallery from 'lightgallery';
import lgFullscreen from 'lightgallery/plugins/fullscreen';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import type { LightGallery } from 'lightgallery/lightgallery';
import type { GalleryItem } from 'lightgallery/lg-utils';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { TranslateService } from '@ngx-translate/core';
import { ClientsService } from '../../clients.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Identities Tab Component
 */
@Component({
  selector: 'mifosx-identities-tab',
  templateUrl: './identities-tab.component.html',
  styleUrls: ['./identities-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow
  ]
})
export class IdentitiesTabComponent implements OnDestroy {
  private destroyRef = inject(DestroyRef);

  /** Client Identities */
  clientIdentities: any;
  /** Client Identifier Template */
  clientIdentifierTemplate: any;
  /** Client Id */
  clientId: string;
  /** Identities Columns */
  identitiesColumns: string[] = [
    'id',
    'description',
    'type',
    'documentKey',
    'documents',
    'status',
    'actions'
  ];

  /** Identifiers Table */
  @ViewChild('identifiersTable', { static: true }) identifiersTable: MatTable<Element>;
  /** LightGallery host */
  @ViewChild('identityLightbox', { static: true }) identityLightbox: ElementRef<HTMLElement>;

  /** Cached thumbnails for previewable docs */
  previewThumbnails: Record<string, string> = {};
  private lightboxInstance: LightGallery | null = null;
  private readonly lightboxPlugins = [
    lgZoom,
    lgThumbnail,
    lgFullscreen
  ];

  /**
   * @param {ActivatedRoute} route Activated Route
   * @param {MatDialog} dialog Mat Dialog
   * @param {ClientsService} clientService Clients Service
   * @param {TranslateService} translateService Translate Service
   * @param {DocumentPreviewService} documentPreviewService Preview helper
   */
  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private clientService: ClientsService,
    private translateService: TranslateService,
    private documentPreviewService: DocumentPreviewService
  ) {
    this.clientId = this.route.parent.snapshot.paramMap.get('clientId');
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { clientIdentities: any; clientIdentifierTemplate: any }) => {
        this.clientIdentities = data.clientIdentities;
        this.clientIdentifierTemplate = data.clientIdentifierTemplate;
        this.prefetchThumbnails();
      });
  }

  ngOnDestroy(): void {
    this.destroyLightbox();
    if (Array.isArray(this.clientIdentities)) {
      this.clientIdentities.forEach((identity: any) => {
        identity.documents?.forEach((doc: any) => this.documentPreviewService.release(doc.id));
      });
    }
  }

  /** TrackBy function for documents ngFor */
  trackByDocumentId(_: number, doc: any): any {
    return doc?.id;
  }

  /**
   * Add Client Identifier with unified form (identifier + document upload)
   */
  addIdentifier() {
    // Translate document type names
    const translatedDocTypes = this.clientIdentifierTemplate.allowedDocumentTypes.map((docType: any) => ({
      ...docType,
      name: this.translateService.instant(`labels.catalogs.${docType.name}`)
    }));

    const statusOptions = [
      { label: this.translateService.instant('labels.catalogs.Active'), value: 'Active' },
      { label: this.translateService.instant('labels.catalogs.Inactive'), value: 'Inactive' }
    ];

    const dialogRef = this.dialog.open(UploadDocumentDialogComponent, {
      data: {
        documentIdentifier: true,
        allowedDocumentTypes: translatedDocTypes,
        statusOptions: statusOptions
      }
    });

    dialogRef.afterClosed().subscribe((response: any) => {
      if (response) {
        // Create identifier data
        const identifierData = {
          documentTypeId: response.documentTypeId,
          status: response.status,
          documentKey: response.documentKey,
          description: response.description
        };

        // First create the identifier
        this.clientService.addClientIdentifier(this.clientId, identifierData).subscribe({
          next: (res: any) => {
            const newIdentifierId = res.resourceId;
            const selectedDocType = this.clientIdentifierTemplate.allowedDocumentTypes.find(
              (doc: any) => doc.id === response.documentTypeId
            );

            // Create new identity entry
            const newIdentity: any = {
              id: newIdentifierId,
              description: response.description,
              documentType: selectedDocType,
              documentKey: response.documentKey,
              documents: [] as any[],
              clientId: this.clientId,
              status:
                response.status === 'Active'
                  ? 'clientIdentifierStatusType.active'
                  : 'clientIdentifierStatusType.inactive'
            };

            // If file was uploaded, attach document to the identifier
            if (response.file) {
              const formData: FormData = new FormData();
              formData.append('name', response.fileName);
              formData.append('file', response.file);
              this.clientService.uploadClientIdentifierDocument(newIdentifierId, formData).subscribe({
                next: (docRes: any) => {
                  const newDoc = {
                    id: docRes.resourceId,
                    parentEntityType: 'client_identifiers',
                    parentEntityId: newIdentifierId,
                    name: response.fileName,
                    fileName: response.file.name
                  };
                  newIdentity.documents.push(newDoc);
                  this.clientIdentities.push(newIdentity);
                  this.identifiersTable.renderRows();
                  this.setThumbnail(newDoc);
                },
                error: (err: any) => {
                  console.error('Failed to upload document', err);
                  // Still add the identifier even if document upload fails
                  this.clientIdentities.push(newIdentity);
                  this.identifiersTable.renderRows();
                }
              });
            } else {
              // No file, just add the identifier
              this.clientIdentities.push(newIdentity);
              this.identifiersTable.renderRows();
            }
          },
          error: (err: any) => {
            console.error('Failed to create identifier', err);
          }
        });
      }
    });
  }

  /**
   * Delete Client Identifier
   * @param {string} clientId Client Id
   * @param {string} identifierId Identifier Id
   * @param {number} index Index
   */
  deleteIdentifier(clientId: string, identifierId: string, index: number) {
    const deleteIdentifierDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `${this.translateService.instant('labels.heading.identifier id')} : ${identifierId}` }
    });
    deleteIdentifierDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientService.deleteClientIdentifier(clientId, identifierId).subscribe((res) => {
          this.clientIdentities.splice(index, 1);
          this.identifiersTable.renderRows();
        });
      }
    });
  }

  isPreviewable(document: any): boolean {
    return this.documentPreviewService.isPreviewable(document);
  }

  async openDocumentPreview(identity: any, document: any): Promise<void> {
    if (!this.isPreviewable(document)) {
      return;
    }
    try {
      const previewableDocs = (identity.documents || []).filter((doc: any) => this.isPreviewable(doc));
      const items: GalleryItem[] = [];
      for (const doc of previewableDocs) {
        try {
          const preview = await this.documentPreviewService.resolvePreviewUrl(doc, () =>
            this.clientService.downloadClientIdentificationDocument(doc.parentEntityId || identity.id, doc.id)
          );
          if (preview.type === 'image') {
            this.previewThumbnails[doc.id] = preview.url;
          }
          items.push({
            src: preview.url,
            thumb: preview.type === 'image' ? preview.url : undefined,
            subHtml: this.buildSubHtml(doc, identity),
            iframe: preview.type === 'pdf'
          });
        } catch (error) {
          console.error('Preview failed for document', doc.id, error);
        }
      }
      if (!items.length) {
        return;
      }
      const startIndex = Math.max(
        0,
        previewableDocs.findIndex((doc: any) => doc.id === document.id)
      );
      this.destroyLightbox();
      this.lightboxInstance = lightGallery(this.identityLightbox.nativeElement, {
        dynamic: true,
        dynamicEl: items,
        plugins: this.lightboxPlugins,
        licenseKey: '0000-0000-000-0000',
        download: false,
        escKey: true,
        closable: true,
        zoomFromOrigin: true
      });
      this.lightboxInstance.openGallery(startIndex);
    } catch (error) {
      console.error('Unable to open preview', error);
    }
  }

  private buildSubHtml(document: any, identity: any): string {
    const caption = document.description
      ? `<p class="lg-caption-text">${this.escapeHtml(document.description)}</p>`
      : '';
    const identityLabel = identity?.documentKey
      ? `<p class="lg-meta">${this.escapeHtml(identity.documentKey)}</p>`
      : '';
    return `<div class="lg-caption"><h4>${this.escapeHtml(document.name || 'Document')}</h4>${caption}${identityLabel}</div>`;
  }

  private escapeHtml(value: string): string {
    return value
      ? value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      : '';
  }

  private destroyLightbox(): void {
    if (this.lightboxInstance) {
      this.lightboxInstance.destroy();
      this.lightboxInstance = null;
    }
  }

  private setThumbnail(document: any): void {
    if (!this.documentPreviewService.isPreviewable(document)) {
      return;
    }
    this.documentPreviewService
      .resolvePreviewUrl(document, () =>
        this.clientService.downloadClientIdentificationDocument(document.parentEntityId || this.clientId, document.id)
      )
      .then((preview) => {
        if (preview.type === 'image') {
          this.previewThumbnails[document.id] = preview.url;
        }
      })
      .catch((): void => undefined);
  }

  private prefetchThumbnails(): void {
    if (!Array.isArray(this.clientIdentities)) {
      return;
    }
    this.clientIdentities.forEach((identity: any) => {
      identity.documents?.forEach((doc: any) => this.setThumbnail(doc));
    });
  }
}
