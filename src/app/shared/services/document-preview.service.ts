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

/** Content types that say nothing about the payload, so they must not shadow a better source. */
const GENERIC_MIME_TYPES = [
  'application/octet-stream',
  'binary/octet-stream'
];

/**
 * Filmstrip thumbnail for PDF slides. lightGallery writes `thumb` straight into an `<img src>`,
 * so leaving it undefined renders a broken image in the gallery's thumbnail strip. A document
 * glyph keeps the strip legible without having to rasterise the page.
 */
export const PDF_GALLERY_THUMBNAIL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MCA2MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiMyZjJmMmYiLz48cGF0aCBkPSJNMTggMTFoMTZsMTAgMTB2MjhhMiAyIDAgMCAxLTIgMkgxOGEyIDIgMCAwIDEtMi0yVjEzYTIgMiAwIDAgMSAyLTJ6IiBmaWxsPSIjZjJmMmYyIi8+PHBhdGggZD0iTTM0IDExbDEwIDEwSDM2YTIgMiAwIDAgMS0yLTJ6IiBmaWxsPSIjYzRjNGM0Ii8+PHRleHQgeD0iMzAiIHk9IjQzIiBmb250LWZhbWlseT0iSGVsdmV0aWNhLEFyaWFsLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjYzAzOTJiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QREY8L3RleHQ+PC9zdmc+';

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
    const type = this.detectType(
      this.preferSpecificMimeType(blob.type, document.mimeType),
      document.fileName,
      document.fileData
    );
    const objectUrl = URL.createObjectURL(this.withPreviewableMimeType(blob, type));
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
    if (normalizedMime.includes('pdf')) {
      return 'pdf';
    }
    if (normalizedMime.startsWith('image/')) {
      return 'image';
    }

    const extension = (fileName || '').split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      return 'pdf';
    }
    if (extension && [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'bmp',
        'webp',
        'svg'
      ].includes(extension)) {
      return 'image';
    }

    return 'other';
  }

  /**
   * Pick the most informative content type available. Attachments are commonly served as
   * `application/octet-stream`, which must not take precedence over the type the document
   * itself declares.
   */
  private preferSpecificMimeType(...candidates: (string | undefined)[]): string | undefined {
    return candidates.find((candidate) => candidate && !this.isGenericMimeType(candidate)) ?? candidates.find(Boolean);
  }

  private isGenericMimeType(mimeType: string): boolean {
    return GENERIC_MIME_TYPES.includes(this.toMediaType(mimeType));
  }

  /**
   * Reduce a content type to its media type, dropping any `; charset=...` parameters so that
   * comparisons are not defeated by a parameterised header.
   */
  private toMediaType(mimeType: string): string {
    return mimeType.split(';', 1)[0].trim().toLowerCase();
  }

  /**
   * Re-tag the downloaded blob so its object URL can be rendered inline. A `blob:` URL typed
   * `application/octet-stream` is downloaded rather than displayed when the PDF preview points
   * an iframe at it, which leaves the lightbox blank. Images never hit this because `<img>`
   * sniffs the bytes and ignores the content type.
   */
  private withPreviewableMimeType(blob: Blob, type: DocumentPreviewType): Blob {
    if (type !== 'pdf' || this.toMediaType(blob.type) === PDF_MIME_TYPE) {
      return blob;
    }
    return new Blob([blob], { type: PDF_MIME_TYPE });
  }

  private extractMimeFromData(fileData?: string): string | undefined {
    if (!fileData || !fileData.startsWith('data:')) {
      return undefined;
    }
    const match = fileData.match(/^data:(.*?);/);
    return match ? match[1] : undefined;
  }
}
