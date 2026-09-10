/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { of } from 'rxjs';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

import { DocumentPreviewService } from './document-preview.service';

describe('DocumentPreviewService', () => {
  let service: DocumentPreviewService;
  let createdBlobs: Blob[];

  // jsdom implements neither of these, so they are installed for the duration of the suite.
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    service = new DocumentPreviewService();
    createdBlobs = [];
    URL.createObjectURL = jest.fn((blob: any) => {
      createdBlobs.push(blob);
      return `blob:preview-${createdBlobs.length}`;
    }) as any;
    URL.revokeObjectURL = jest.fn() as any;
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('re-tags a PDF served as application/octet-stream so the iframe renders it inline', async () => {
    const document = { id: '1', fileName: 'statement.pdf' };
    const downloaded = new Blob(['%PDF-1.4'], { type: 'application/octet-stream' });

    const preview = await service.resolvePreviewUrl(document, () => of(downloaded));

    expect(preview.type).toBe('pdf');
    expect(createdBlobs[0].type).toBe('application/pdf');
  });

  it('re-tags a PDF served without any content type', async () => {
    const document = { id: '2', fileName: 'receipt.pdf' };

    const preview = await service.resolvePreviewUrl(document, () => of(new Blob(['%PDF-1.4'])));

    expect(preview.type).toBe('pdf');
    expect(createdBlobs[0].type).toBe('application/pdf');
  });

  it('leaves a correctly typed PDF blob untouched', async () => {
    const document = { id: '3', fileName: 'license.pdf' };
    const downloaded = new Blob(['%PDF-1.4'], { type: 'application/pdf' });

    await service.resolvePreviewUrl(document, () => of(downloaded));

    expect(createdBlobs[0]).toBe(downloaded);
  });

  it('leaves image blobs untouched', async () => {
    const document = { id: '4', fileName: 'photo.png' };
    const downloaded = new Blob(['png-bytes'], { type: 'application/octet-stream' });

    const preview = await service.resolvePreviewUrl(document, () => of(downloaded));

    expect(preview.type).toBe('image');
    expect(createdBlobs[0]).toBe(downloaded);
  });

  it('prefers the declared mime type over a generic one from the response', async () => {
    const document = { id: '5', fileName: 'scan', mimeType: 'application/pdf' };
    const downloaded = new Blob(['%PDF-1.4'], { type: 'application/octet-stream' });

    const preview = await service.resolvePreviewUrl(document, () => of(downloaded));

    expect(preview.type).toBe('pdf');
    expect(createdBlobs[0].type).toBe('application/pdf');
  });

  it('does not let a parameterised generic content type shadow the declared mime type', async () => {
    const document = { id: '9', fileName: 'scan', mimeType: 'application/pdf' };
    const downloaded = new Blob(['%PDF-1.4'], { type: 'application/octet-stream; charset=binary' });

    const preview = await service.resolvePreviewUrl(document, () => of(downloaded));

    expect(preview.type).toBe('pdf');
    expect(createdBlobs[0].type).toBe('application/pdf');
  });

  it('leaves a parameterised PDF blob untouched', async () => {
    const document = { id: '10', fileName: 'statement.pdf' };
    const downloaded = new Blob(['%PDF-1.4'], { type: 'application/pdf; charset=binary' });

    await service.resolvePreviewUrl(document, () => of(downloaded));

    expect(createdBlobs[0]).toBe(downloaded);
  });

  it('downloads a document only once and serves the cached preview afterwards', async () => {
    const document = { id: '6', fileName: 'statement.pdf' };
    const downloadFn = jest.fn(() => of(new Blob(['%PDF-1.4'], { type: 'application/octet-stream' })));

    const first = await service.resolvePreviewUrl(document, downloadFn as any);
    const second = await service.resolvePreviewUrl(document, downloadFn as any);

    expect(downloadFn).toHaveBeenCalledTimes(1);
    expect(second.url).toBe(first.url);
  });

  it('treats PDFs as previewable from the file extension alone', () => {
    expect(service.isPreviewable({ id: '7', fileName: 'statement.pdf' })).toBe(true);
    expect(service.isPreviewable({ id: '8', fileName: 'notes.txt' })).toBe(false);
  });

  describe('spreadsheet detection', () => {
    it.each([
      'ledger.xlsx',
      'ledger.csv',
      'LEDGER.XLSX'
    ])('classifies %s as a spreadsheet', (fileName) => {
      expect(service.getPreviewType({ id: '11', fileName })).toBe('spreadsheet');
      expect(service.isPreviewable({ id: '11', fileName })).toBe(true);
    });

    it('classifies a spreadsheet by content type when the name has no extension', () => {
      const document = {
        id: '12',
        fileName: 'attachment',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };

      expect(service.getPreviewType(document)).toBe('spreadsheet');
    });

    it('does not claim the legacy .xls format, which the reader cannot open', () => {
      expect(service.getPreviewType({ id: '13', fileName: 'old.xls' })).toBe('other');
      expect(service.isPreviewable({ id: '13', fileName: 'old.xls' })).toBe(false);
    });

    it('does not treat application/vnd.ms-excel as readable, since .csv is served with it too', () => {
      expect(service.getPreviewType({ id: '14', fileName: 'mystery', mimeType: 'application/vnd.ms-excel' })).toBe(
        'other'
      );
    });

    it('trusts the .csv extension over a misleading legacy excel content type', () => {
      const document = { id: '15', fileName: 'export.csv', mimeType: 'application/vnd.ms-excel' };

      expect(service.getPreviewType(document)).toBe('spreadsheet');
    });

    it('keeps spreadsheets out of the lightbox carousel', () => {
      expect(service.isGalleryPreviewable({ id: '16', fileName: 'ledger.xlsx' })).toBe(false);
      expect(service.isGalleryPreviewable({ id: '17', fileName: 'statement.pdf' })).toBe(true);
      expect(service.isGalleryPreviewable({ id: '18', fileName: 'photo.png' })).toBe(true);
    });

    it('still refuses word processor documents', () => {
      expect(service.getPreviewType({ id: '19', fileName: 'contract.docx' })).toBe('other');
    });
  });
});
