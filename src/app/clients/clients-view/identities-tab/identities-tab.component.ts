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
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  MatRow,
  MatFooterCellDef,
  MatFooterCell,
  MatFooterRowDef,
  MatFooterRow
} from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

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
import { DocumentPreviewService, PDF_GALLERY_THUMBNAIL } from 'app/shared/services/document-preview.service';
import { SpreadsheetPreview, SpreadsheetPreviewService } from 'app/shared/services/spreadsheet-preview.service';
import { SpreadsheetPreviewDialogComponent } from 'app/shared/documents/spreadsheet-preview-dialog/spreadsheet-preview-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { ClientIdentifierPayload, ClientsService } from '../../clients.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { Dates } from 'app/core/utils/dates';
import { downloadBlob } from 'app/core/utils/file-download.utils';
import { SettingsService } from 'app/settings/settings.service';
import { AlertService } from 'app/core/alert/alert.service';

/** How much of a sheet fits legibly on a card before it stops being a glance and starts being noise. */
const THUMBNAIL_ROWS = 5;
const THUMBNAIL_COLUMNS = 4;

interface ClientIdentifierDocumentType {
  id: number | string;
  name: string;
}

interface ClientIdentifierDocument {
  id: string;
  parentEntityId?: string;
  fileName?: string;
  name?: string;
  description?: string;
}

interface ClientIdentifierIdentity {
  id: string;
  clientId?: string;
  documentType: ClientIdentifierDocumentType;
  documentKey: string;
  description?: string;
  status: string;
  issuanceDate?: Date | number[] | string | null;
  expiryDate?: Date | number[] | string | null;
  documents?: ClientIdentifierDocument[];
}

interface ClientIdentifierDialogResult {
  documentTypeId: number | string;
  status?: 'Active' | 'Inactive';
  documentKey: string;
  description?: string;
  issuanceDate?: Date | string | null;
  expiryDate?: Date | string | null;
  fileName?: string;
  file?: File;
}

/**
 * Identities Tab Component
 */
@Component({
  selector: 'mifosx-identities-tab',
  templateUrl: './identities-tab.component.html',
  styleUrls: ['./identities-tab.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatIconButton,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatFooterCellDef,
    MatFooterCell,
    MatFooterRowDef,
    MatFooterRow
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentitiesTabComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private clientService = inject(ClientsService);
  private translateService = inject(TranslateService);
  private documentPreviewService = inject(DocumentPreviewService);
  private spreadsheetPreviewService = inject(SpreadsheetPreviewService);
  private ngZone = inject(NgZone);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);
  private alertService = inject(AlertService);

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
    'issuanceDate',
    'expiryDate',
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

  /**
   * @param {ActivatedRoute} route Activated Route
   * @param {MatDialog} dialog Mat Dialog
   * @param {ClientsService} clientService Clients Service
   * @param {TranslateService} translateService Translate Service
   * @param {DocumentPreviewService} documentPreviewService Preview helper
   */
  constructor() {
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
        const identifierData = this.buildIdentifierPayload(response, true);

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
              issuanceDate: response.issuanceDate || null,
              expiryDate: response.expiryDate || null,
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
   * Edit Client Identifier.
   *
   * @param {ClientIdentifierIdentity} identity Client Identifier
   */
  editIdentifier(identity: ClientIdentifierIdentity) {
    const translatedDocTypes = this.clientIdentifierTemplate.allowedDocumentTypes.map(
      (docType: ClientIdentifierDocumentType) => ({
        ...docType,
        name: this.translateService.instant(`labels.catalogs.${docType.name}`)
      })
    );

    const statusOptions = [
      { label: this.translateService.instant('labels.catalogs.Active'), value: 'Active' },
      { label: this.translateService.instant('labels.catalogs.Inactive'), value: 'Inactive' }
    ];

    const dialogRef = this.dialog.open(UploadDocumentDialogComponent, {
      data: {
        documentIdentifier: true,
        editIdentifier: true,
        identifier: identity,
        allowedDocumentTypes: translatedDocTypes,
        statusOptions: statusOptions
      }
    });

    dialogRef.afterClosed().subscribe((response: ClientIdentifierDialogResult | undefined) => {
      if (response) {
        const identifierData = this.buildIdentifierPayload(response, false);
        this.clientService.editClientIdentifier(this.clientId, identity.id, identifierData).subscribe({
          next: () => {
            const selectedDocType = this.clientIdentifierTemplate.allowedDocumentTypes.find(
              (doc: ClientIdentifierDocumentType) => doc.id === response.documentTypeId
            );
            identity.description = response.description;
            identity.documentType = selectedDocType || identity.documentType;
            identity.documentKey = response.documentKey;
            identity.issuanceDate = response.issuanceDate || null;
            identity.expiryDate = response.expiryDate || null;
            if (response.file) {
              const formData: FormData = new FormData();
              formData.append('name', response.fileName);
              formData.append('file', response.file);
              this.clientService.uploadClientIdentifierDocument(identity.id, formData).subscribe({
                next: (docRes: any) => {
                  const newDoc = {
                    id: docRes.resourceId,
                    parentEntityType: 'client_identifiers',
                    parentEntityId: identity.id,
                    name: response.fileName,
                    fileName: response.file.name
                  };
                  identity.documents = identity.documents || [];
                  identity.documents.push(newDoc);
                  this.setThumbnail(newDoc, identity);
                  this.changeDetectorRef.markForCheck();
                },
                error: (err: any) => {
                  console.error('Failed to upload document', err);
                  this.alertService.alert({
                    type: 'error',
                    message: 'Failed to upload document'
                  });
                }
              });
            }
            this.identifiersTable.renderRows();
            this.changeDetectorRef.markForCheck();
          },
          error: (err: any) => {
            console.error('Failed to update identifier', err);
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
      if (response?.delete) {
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

  isSpreadsheet(document: any): boolean {
    return this.isPreviewable(document) && this.documentPreviewService.getPreviewType(document) === 'spreadsheet';
  }

  /** Rows shown on the card itself, as a taste of the sheet rather than a usable grid. */
  spreadsheetThumbnailRows(document: any): string[][] {
    const sheet = this.spreadsheetPreviews[document?.id]?.sheets?.[0];
    return (sheet?.rows ?? []).slice(0, THUMBNAIL_ROWS).map((row) => row.slice(0, THUMBNAIL_COLUMNS));
  }

  /**
   * Save the identifier document to disk. Offered for every document, not just the ones without a
   * preview: for file types the browser cannot render inline — spreadsheets, word processor
   * documents, plain text — this is the only way to get at the contents at all.
   */
  downloadDocument(identity: any, document: any): void {
    const identifierId = document?.parentEntityId || identity?.id;
    if (!identifierId || !document?.id) {
      return;
    }
    this.clientService.downloadClientIdentificationDocument(identifierId, document.id).subscribe({
      next: (blob: Blob) => downloadBlob(blob, this.resolveDownloadName(document)),
      error: (error: any) => console.error('Unable to download document', document.id, error)
    });
  }

  /**
   * Open whichever viewer suits the document: a spreadsheet becomes a grid in its own dialog,
   * everything else a slide in the lightbox carousel.
   */
  async openDocumentPreview(identity: any, document: any): Promise<void> {
    if (!this.isPreviewable(document)) {
      return;
    }
    if (this.isSpreadsheet(document)) {
      await this.openSpreadsheetPreview(identity, document);
      return;
    }
    try {
      const previewableDocs = (identity.documents || []).filter((doc: any) =>
        this.documentPreviewService.isGalleryPreviewable(doc)
      );
      const items: GalleryItem[] = [];
      for (const doc of previewableDocs) {
        try {
          const preview = await this.documentPreviewService.resolvePreviewUrl(doc, () =>
            this.clientService.downloadClientIdentificationDocument(doc.parentEntityId || identity.id, doc.id)
          );
          if (preview.type === 'image') {
            this.setPreviewThumbnail(doc.id, preview.url);
          }
          items.push({
            src: preview.url,
            thumb: preview.type === 'image' ? preview.url : PDF_GALLERY_THUMBNAIL,
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

  /** The stored file name carries the extension the browser needs to open the download. */
  private resolveDownloadName(document: any): string {
    return document?.fileName || document?.name || `document-${document?.id}`;
  }

  private async openSpreadsheetPreview(identity: any, document: any): Promise<void> {
    try {
      const preview = await this.resolveSpreadsheetPreview(identity, document);
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
      this.ngZone.run(() =>
        this.alertService.alert({
          type: 'error',
          message: this.translateService.instant('labels.text.SpreadsheetPreviewFailed')
        })
      );
    }
  }

  /** Parse once per document: the card's mini grid and the dialog share the same result. */
  private resolveSpreadsheetPreview(identity: any, document: any): Promise<SpreadsheetPreview> {
    const cached = this.spreadsheetPreviews[document.id];
    if (cached) {
      return Promise.resolve(cached);
    }
    const pending = this.spreadsheetLoads.get(document.id);
    if (pending) {
      return pending;
    }
    const load = this.loadSpreadsheetPreview(identity, document).finally(() =>
      this.spreadsheetLoads.delete(document.id)
    );
    this.spreadsheetLoads.set(document.id, load);
    return load;
  }

  private async loadSpreadsheetPreview(identity: any, document: any): Promise<SpreadsheetPreview> {
    const identifierId = document.parentEntityId || identity?.id;
    if (!identifierId) {
      throw new Error('Unable to resolve the identifier for this document.');
    }
    const blob = await firstValueFrom(
      this.clientService.downloadClientIdentificationDocument(identifierId, document.id)
    );
    const preview = await this.spreadsheetPreviewService.load(blob, document.fileName || document.name);
    // The spreadsheet reader is pulled in with a dynamic import, and that promise is native — zone.js
    // does not patch it — so everything after the await runs outside Angular's zone. Publishing the
    // result there would mark the view dirty without any tick ever being scheduled to flush it, and
    // the card would sit on its placeholder forever.
    this.ngZone.run(() => {
      this.spreadsheetPreviews = { ...this.spreadsheetPreviews, [document.id]: preview };
      this.changeDetectorRef.markForCheck();
    });
    return preview;
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

  private setThumbnail(document: any, identity?: any): void {
    if (!this.documentPreviewService.isPreviewable(document)) {
      return;
    }
    if (this.isSpreadsheet(document)) {
      // A failure here only costs the card its mini grid; the click path reports it properly.
      this.resolveSpreadsheetPreview(identity, document).catch((error) =>
        console.error('Unable to read spreadsheet', document?.id, error)
      );
      return;
    }
    const identifierId = document.parentEntityId || identity?.id;
    if (!identifierId) {
      return;
    }
    this.documentPreviewService
      .resolvePreviewUrl(document, () =>
        this.clientService.downloadClientIdentificationDocument(identifierId, document.id)
      )
      .then((preview) => {
        if (preview.type === 'image') {
          this.setPreviewThumbnail(document.id, preview.url);
        } else if (preview.type === 'pdf') {
          this.pdfThumbnails = {
            ...this.pdfThumbnails,
            [document.id]: this.sanitizer.bypassSecurityTrustResourceUrl(
              `${preview.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
            )
          };
          this.changeDetectorRef.markForCheck();
        }
      })
      .catch((): void => undefined);
  }

  private setPreviewThumbnail(documentId: string, thumbnailUrl: string): void {
    this.previewThumbnails = {
      ...this.previewThumbnails,
      [documentId]: thumbnailUrl
    };
    this.changeDetectorRef.markForCheck();
  }

  private prefetchThumbnails(): void {
    if (!Array.isArray(this.clientIdentities)) {
      return;
    }
    this.clientIdentities.forEach((identity: any) => {
      identity.documents?.forEach((doc: any) => this.setThumbnail(doc, identity));
    });
  }

  private buildIdentifierPayload(
    response: ClientIdentifierDialogResult,
    includeStatus: boolean
  ): ClientIdentifierPayload {
    const dateFormat = this.settingsService.dateFormat;
    const identifierData: ClientIdentifierPayload = {
      documentTypeId: response.documentTypeId,
      documentKey: response.documentKey,
      description: response.description,
      dateFormat,
      locale: this.settingsService.language.code,
      issuanceDate: null,
      expiryDate: null
    };
    if (includeStatus && response.status) {
      identifierData.status = response.status;
    }
    this.setIdentifierDate(identifierData, 'issuanceDate', response.issuanceDate, dateFormat);
    this.setIdentifierDate(identifierData, 'expiryDate', response.expiryDate, dateFormat);
    return identifierData;
  }

  private setIdentifierDate(
    identifierData: ClientIdentifierPayload,
    key: 'issuanceDate' | 'expiryDate',
    value: Date | string | null | undefined,
    dateFormat: string
  ): void {
    identifierData[key] = value ? this.dateUtils.formatDate(value, dateFormat) : null;
  }
}
