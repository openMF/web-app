import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

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
    const objectUrl = URL.createObjectURL(blob);
    const type = this.detectType(blob.type || document.mimeType, document.fileName, document.fileData);
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

  private extractMimeFromData(fileData?: string): string | undefined {
    if (!fileData || !fileData.startsWith('data:')) {
      return undefined;
    }
    const match = fileData.match(/^data:(.*?);/);
    return match ? match[1] : undefined;
  }
}
