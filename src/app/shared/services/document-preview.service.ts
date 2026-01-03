import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { PdfThumbnailService } from './pdf-thumbnail.service';

export type DocumentPreviewType = 'image' | 'pdf' | 'other';

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
  thumbnailUrl?: string; // For PDF thumbnails
}

@Injectable({
  providedIn: 'root'
})
export class DocumentPreviewService {
  private readonly previewCache = new Map<string, CachedPreview>();
  private pdfThumbnailService = inject(PdfThumbnailService);
  private readonly thumbnailGenerationQueue = new Map<string, Promise<string>>();

  constructor() {
    // Preload PDF.js once so first thumbnail generation doesn't block on library download
    this.pdfThumbnailService.preload().catch((error) => {
      console.warn('PDF.js preload failed, will lazy load on demand', error);
    });
  }

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
  ): Promise<{ url: string; type: DocumentPreviewType; thumbnailUrl?: string }> {
    const cached = this.previewCache.get(document.id);
    if (cached) {
      return { url: cached.url, type: cached.type, thumbnailUrl: cached.thumbnailUrl };
    }

    const inline = this.getInlineData(document);
    if (inline) {
      const type = this.detectType(inline.mimeType, document.fileName, document.fileData);
      const entry: CachedPreview = { url: inline.url, type, isObjectUrl: inline.isObjectUrl };

      // Generate PDF thumbnail if it's a PDF
      if (type === 'pdf') {
        entry.thumbnailUrl = await this.generatePdfThumbnailCached(document.id, inline.url);
      }

      this.previewCache.set(document.id, entry);
      return { url: inline.url, type, thumbnailUrl: entry.thumbnailUrl };
    }

    const blob = await firstValueFrom(downloadFn(document));
    const objectUrl = URL.createObjectURL(blob);
    const type = this.detectType(blob.type || document.mimeType, document.fileName, document.fileData);
    const entry: CachedPreview = { url: objectUrl, type, isObjectUrl: true };

    // Generate PDF thumbnail if it's a PDF
    if (type === 'pdf') {
      entry.thumbnailUrl = await this.generatePdfThumbnailCached(document.id, blob);
    }

    this.previewCache.set(document.id, entry);
    return { url: objectUrl, type, thumbnailUrl: entry.thumbnailUrl };
  }

  /**
   * Get the thumbnail URL for a PDF document (if available)
   */
  async getThumbnailUrl(
    document: DocumentDescriptor,
    downloadFn: (descriptor: DocumentDescriptor) => Observable<Blob>
  ): Promise<string | null> {
    const type = this.detectType(document.mimeType, document.fileName, document.fileData);
    if (type !== 'pdf') {
      return null;
    }

    const cached = this.previewCache.get(document.id);
    if (cached?.thumbnailUrl) {
      return cached.thumbnailUrl;
    }

    try {
      const preview = await this.resolvePreviewUrl(document, downloadFn);
      return preview.thumbnailUrl || null;
    } catch (error) {
      console.error('Failed to get thumbnail for PDF:', error);
      return null;
    }
  }

  /**
   * Generate PDF thumbnail with caching and queue management
   */
  private async generatePdfThumbnailCached(documentId: string, source: string | Blob): Promise<string | undefined> {
    // Check if already generating
    const existingQueue = this.thumbnailGenerationQueue.get(documentId);
    if (existingQueue) {
      return existingQueue;
    }

    const generationPromise = (async () => {
      try {
        if (typeof source === 'string') {
          // Data URL
          return await this.pdfThumbnailService.generateThumbnailFromDataUrl(source, {
            width: 300,
            height: 400,
            quality: 0.85,
            format: 'jpeg'
          });
        } else {
          // Blob
          return await this.pdfThumbnailService.generateThumbnail(source, {
            width: 300,
            height: 400,
            quality: 0.85,
            format: 'jpeg'
          });
        }
      } catch (error) {
        console.error('Failed to generate PDF thumbnail:', error);
        return undefined;
      } finally {
        this.thumbnailGenerationQueue.delete(documentId);
      }
    })();

    this.thumbnailGenerationQueue.set(documentId, generationPromise);
    return generationPromise;
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

  private extractMimeFromData(fileData?: string): string | undefined {
    if (!fileData || !fileData.startsWith('data:')) {
      return undefined;
    }
    const match = fileData.match(/^data:(.*?);/);
    return match ? match[1] : undefined;
  }
}
