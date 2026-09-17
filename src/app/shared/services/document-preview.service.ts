/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

export type DocumentPreviewType = 'image' | 'pdf' | 'other';

const PDF_MIME_TYPE = 'application/pdf';

/** MIME types that carry no information about the file and must not short-circuit detection. */
const GENERIC_MIME_TYPES = [
  '',
  'application/octet-stream',
  'binary/octet-stream',
  'application/download'
];

const IMAGE_EXTENSIONS: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  webp: 'image/webp',
  svg: 'image/svg+xml'
};

export interface DocumentDescriptor {
  id: string;
  name?: string;
  description?: string;
  fileName?: string;
  fileData?: string;
  mimeType?: string;
}

interface CachedPreview {
  url: string;
  type: DocumentPreviewType;
  isObjectUrl: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentPreviewService {
  private readonly previewCache = new Map<string, CachedPreview>();

  /**
   * Determine whether the document can be previewed inline.
   */
  isPreviewable(document: DocumentDescriptor): boolean {
    const type = this.detectType(document.mimeType, document.fileName, document.fileData);
    return type === 'image' || type === 'pdf';
  }

  /**
   * Whether the document is an image, i.e. whether a grid thumbnail can be rendered for it.
   */
  isImage(document: DocumentDescriptor): boolean {
    return this.detectType(document?.mimeType, document?.fileName, document?.fileData) === 'image';
  }

  /**
   * Resolve a preview URL for a document, caching object URLs to avoid duplicate downloads.
   */
  async resolvePreviewUrl(
    document: DocumentDescriptor,
    downloadFn: (descriptor: DocumentDescriptor) => Observable<Blob>
  ): Promise<{ url: string; type: DocumentPreviewType }> {
    const cached = this.previewCache.get(document.id);
    if (cached) {
      return { url: cached.url, type: cached.type };
    }

    const inline = this.getInlineData(document);
    if (inline) {
      const type = this.detectType(inline.mimeType, document.fileName, document.fileData);
      this.previewCache.set(document.id, { url: inline.url, type, isObjectUrl: inline.isObjectUrl });
      return { url: inline.url, type };
    }

    const blob = await firstValueFrom(downloadFn(document));
    // Prefer the metadata we control over the response Content-Type: Fineract commonly
    // serves document attachments as `application/octet-stream`, which is truthy but
    // useless for type detection.
    let type = this.detectType(document.mimeType, document.fileName, document.fileData);
    if (type === 'other') {
      type = this.detectType(blob.type, document.fileName, document.fileData);
    }

    // Re-wrap the blob with a concrete MIME type. `<img>` sniffs the bytes and renders
    // regardless, but `<embed>`/`<iframe>` obey the type, so an octet-stream blob URL
    // makes the browser download the PDF instead of previewing it.
    const mimeType = this.getMimeType(type, blob.type, document.fileName);
    const typedBlob = mimeType && mimeType !== blob.type ? new Blob([blob], { type: mimeType }) : blob;
    const objectUrl = URL.createObjectURL(typedBlob);
    this.previewCache.set(document.id, { url: objectUrl, type, isObjectUrl: true });
    return { url: objectUrl, type };
  }

  /**
   * Revoke an object URL if it was created by this service.
   */
  release(documentId: string): void {
    const cached = this.previewCache.get(documentId);
    if (cached?.isObjectUrl) {
      URL.revokeObjectURL(cached.url);
    }
    this.previewCache.delete(documentId);
  }

  /**
   * Clean up all cached URLs.
   */
  clear(): void {
    this.previewCache.forEach((cached) => {
      if (cached.isObjectUrl) {
        URL.revokeObjectURL(cached.url);
      }
    });
    this.previewCache.clear();
  }

  private getInlineData(document: DocumentDescriptor): { url: string; mimeType?: string; isObjectUrl: boolean } | null {
    if (!document.fileData) {
      return null;
    }
    const mimeMatch = document.fileData.match(/^data:(.*?);/);
    return {
      url: document.fileData,
      mimeType: mimeMatch ? mimeMatch[1] : document.mimeType,
      isObjectUrl: false
    };
  }

  private detectType(mimeType?: string, fileName?: string, fileData?: string): DocumentPreviewType {
    const normalizedMime = (mimeType || this.extractMimeFromData(fileData) || '').toLowerCase();
    if (!GENERIC_MIME_TYPES.includes(normalizedMime)) {
      if (normalizedMime.includes('pdf')) {
        return 'pdf';
      }
      if (normalizedMime.startsWith('image/')) {
        return 'image';
      }
    }

    const extension = this.getExtension(fileName);
    if (extension === 'pdf') {
      return 'pdf';
    }
    if (extension && IMAGE_EXTENSIONS[extension]) {
      return 'image';
    }

    return 'other';
  }

  /**
   * Resolve the MIME type to stamp onto the preview blob, so that `<embed>`/`<iframe>`
   * render it rather than offering it as a download.
   */
  private getMimeType(type: DocumentPreviewType, blobMimeType?: string, fileName?: string): string | undefined {
    const normalizedMime = (blobMimeType || '').toLowerCase();
    if (type === 'pdf') {
      return PDF_MIME_TYPE;
    }
    if (type === 'image') {
      if (normalizedMime.startsWith('image/')) {
        return normalizedMime;
      }
      return IMAGE_EXTENSIONS[this.getExtension(fileName)];
    }
    return undefined;
  }

  private getExtension(fileName?: string): string {
    return (fileName || '').split('.').pop()?.toLowerCase() || '';
  }

  private extractMimeFromData(fileData?: string): string | undefined {
    if (!fileData || !fileData.startsWith('data:')) {
      return undefined;
    }
    const match = fileData.match(/^data:(.*?);/);
    return match ? match[1] : undefined;
  }
}
