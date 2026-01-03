import { Injectable } from '@angular/core';

/**
 * Service for generating PDF thumbnails using PDF.js
 * This service renders the first page of a PDF document as an image thumbnail
 */
@Injectable({
  providedIn: 'root'
})
export class PdfThumbnailService {
  private pdfjsLib: any = null;
  private loadingPromise: Promise<void> | null = null;

  /**
   * Lazy-load PDF.js library
   */
  private async loadPdfJs(): Promise<void> {
    if (this.pdfjsLib) {
      return;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = (async () => {
      try {
        // Dynamically import pdfjs-dist without type checking to avoid type definition issues
        const pdfjs: any = await import('pdfjs-dist');

        // Set worker source using CDN for the correct version
        const version = '4.10.38';
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;

        this.pdfjsLib = pdfjs;
      } catch (error) {
        console.error('Failed to load PDF.js:', error);
        throw new Error('PDF.js library could not be loaded');
      }
    })();

    return this.loadingPromise;
  }

  /**
   * Generate a thumbnail image from a PDF blob
   * @param pdfBlob The PDF file as a Blob
   * @param options Thumbnail generation options
   * @returns A promise that resolves to a data URL of the thumbnail image
   */
  async generateThumbnail(
    pdfBlob: Blob,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png';
      scale?: number;
    } = {}
  ): Promise<string> {
    const {
      width = 300,
      height = 400,
      quality = 0.85,
      format = 'jpeg',
      scale = 2 // Render at higher resolution for better quality
    } = options;

    try {
      await this.loadPdfJs();

      // Convert blob to ArrayBuffer
      const arrayBuffer = await pdfBlob.arrayBuffer();

      // Load PDF document
      const loadingTask = this.pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/cmaps/`,
        cMapPacked: true
      });

      const pdf = await loadingTask.promise;

      // Get first page
      const page = await pdf.getPage(1);

      // Calculate viewport
      const viewport = page.getViewport({ scale: 1 });
      const aspectRatio = viewport.width / viewport.height;

      // Calculate actual canvas size maintaining aspect ratio
      let canvasWidth = width * scale;
      let canvasHeight = height * scale;

      if (aspectRatio > 1) {
        // Landscape or square
        canvasHeight = canvasWidth / aspectRatio;
      } else {
        // Portrait
        canvasWidth = canvasHeight * aspectRatio;
      }

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Could not get canvas context');
      }

      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: page.getViewport({ scale: canvasWidth / viewport.width })
      };

      await page.render(renderContext).promise;

      // Clean up
      page.cleanup();
      pdf.destroy();

      // Convert canvas to data URL
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      return canvas.toDataURL(mimeType, quality);
    } catch (error) {
      console.error('Error generating PDF thumbnail:', error);
      throw error;
    }
  }

  /**
   * Generate thumbnail from a PDF data URL (base64)
   * @param pdfDataUrl PDF as data URL
   * @param options Thumbnail generation options
   * @returns A promise that resolves to a data URL of the thumbnail image
   */
  async generateThumbnailFromDataUrl(
    pdfDataUrl: string,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png';
      scale?: number;
    }
  ): Promise<string> {
    try {
      // Convert data URL to Blob
      const response = await fetch(pdfDataUrl);
      const blob = await response.blob();
      return this.generateThumbnail(blob, options);
    } catch (error) {
      console.error('Error generating thumbnail from data URL:', error);
      throw error;
    }
  }

  /**
   * Check if PDF.js is available and loaded
   */
  isPdfJsLoaded(): boolean {
    return this.pdfjsLib !== null;
  }

  async preload(): Promise<void> {
    try {
      await this.loadPdfJs();
    } catch (error) {
      console.warn('Failed to preload PDF.js:', error);
    }
  }
}
