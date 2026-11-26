/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { of, Subject } from 'rxjs';
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

    expect(preview!.type).toBe('pdf');
    expect(createdBlobs[0].type).toBe('application/pdf');
  });

  it('re-tags a PDF served without any content type', async () => {
    const document = { id: '2', fileName: 'receipt.pdf' };

    const preview = await service.resolvePreviewUrl(document, () => of(new Blob(['%PDF-1.4'])));

    expect(preview!.type).toBe('pdf');
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

    expect(preview!.type).toBe('image');
    expect(createdBlobs[0]).toBe(downloaded);
  });

  it('prefers the declared mime type over a generic one from the response', async () => {
    const document = { id: '5', fileName: 'scan', mimeType: 'application/pdf' };
    const downloaded = new Blob(['%PDF-1.4'], { type: 'application/octet-stream' });

    const preview = await service.resolvePreviewUrl(document, () => of(downloaded));

    expect(preview!.type).toBe('pdf');
    expect(createdBlobs[0].type).toBe('application/pdf');
  });

  it('does not let a parameterised generic content type shadow the declared mime type', async () => {
    const document = { id: '9', fileName: 'scan', mimeType: 'application/pdf' };
    const downloaded = new Blob(['%PDF-1.4'], { type: 'application/octet-stream; charset=binary' });

    const preview = await service.resolvePreviewUrl(document, () => of(downloaded));

    expect(preview!.type).toBe('pdf');
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
    expect(second!.url).toBe(first!.url);
  });

  it('releases a preview cached with a numeric id when the deletion flow passes a string id', async () => {
    const document = { id: 201, fileName: 'statement.pdf' };
    const downloadFn = jest.fn(() => of(new Blob(['%PDF-1.4'], { type: 'application/pdf' })));

    const preview = await service.resolvePreviewUrl(document, downloadFn);
    // Resolving with the same numeric id must hit the entry inserted above.
    await service.resolvePreviewUrl(document, downloadFn);
    expect(downloadFn).toHaveBeenCalledTimes(1);

    // The component releases the delete target by its string key.
    service.release('201');

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(preview!.url);
    await service.resolvePreviewUrl(document, downloadFn);
    expect(downloadFn).toHaveBeenCalledTimes(2);
  });

  it('still releases a preview cached with a string id', async () => {
    const document = { id: '202', fileName: 'statement.pdf' };
    const downloadFn = jest.fn(() => of(new Blob(['%PDF-1.4'], { type: 'application/pdf' })));

    const preview = await service.resolvePreviewUrl(document, downloadFn);

    service.release(202);

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(preview!.url);
    await service.resolvePreviewUrl(document, downloadFn);
    expect(downloadFn).toHaveBeenCalledTimes(2);
  });

  it('does not create or cache a preview whose document is released while downloading', async () => {
    const document = { id: 301, fileName: 'statement.pdf' };
    const download$ = new Subject<Blob>();
    const pending = service.resolvePreviewUrl(document, () => download$.asObservable());

    service.release(301);

    download$.next(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));
    download$.complete();

    await expect(pending).resolves.toBeNull();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it('caches a preview request started after the previous one was released', async () => {
    const document = { id: 302, fileName: 'statement.pdf' };
    const download$ = new Subject<Blob>();
    const invalidated = service.resolvePreviewUrl(document, () => download$.asObservable());
    service.release('302');

    const downloadFn = jest.fn(() => of(new Blob(['%PDF-1.4'], { type: 'application/pdf' })));
    const cached = await service.resolvePreviewUrl(document, downloadFn);
    expect(cached).not.toBeNull();
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);

    // The invalidated download finishing later must not disturb the newer entry.
    download$.next(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));
    download$.complete();
    await expect(invalidated).resolves.toBeNull();

    const fromCache = await service.resolvePreviewUrl(document, downloadFn);
    expect(downloadFn).toHaveBeenCalledTimes(1);
    expect(fromCache!.url).toBe(cached!.url);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it('does not let an older invalidated request overwrite or cancel a newer request', async () => {
    const document = { id: 303, fileName: 'statement.pdf' };
    const older$ = new Subject<Blob>();
    const newer$ = new Subject<Blob>();
    const older = service.resolvePreviewUrl(document, () => older$.asObservable());
    service.release(303);
    const newer = service.resolvePreviewUrl(document, () => newer$.asObservable());

    // The invalidated request finishes while the newer one is still downloading.
    older$.next(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));
    older$.complete();
    await expect(older).resolves.toBeNull();
    expect(URL.createObjectURL).not.toHaveBeenCalled();

    newer$.next(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));
    newer$.complete();
    const newerPreview = await newer;
    expect(newerPreview).not.toBeNull();
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);

    // The stale request did not clear the newer request's cache.
    const fromCache = await service.resolvePreviewUrl(document, () => of(new Blob(['should not download'])));
    expect(fromCache!.url).toBe(newerPreview!.url);
  });

  it('shares a single download between concurrent requests for the same document', async () => {
    const document = { id: 304, fileName: 'statement.pdf' };
    const download$ = new Subject<Blob>();
    const downloadFn = jest.fn(() => download$.asObservable());

    const first = service.resolvePreviewUrl(document, downloadFn);
    const second = service.resolvePreviewUrl(document, downloadFn);

    download$.next(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));
    download$.complete();

    const [
      firstPreview,
      secondPreview
    ] = await Promise.all([
      first,
      second
    ]);
    expect(downloadFn).toHaveBeenCalledTimes(1);
    expect(firstPreview).not.toBeNull();
    expect(secondPreview!.url).toBe(firstPreview!.url);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
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
