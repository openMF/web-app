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
  let createObjectURL: jest.Mock;

  beforeEach(() => {
    service = new DocumentPreviewService();
    createObjectURL = jest.fn(() => 'blob:preview');
    (URL as any).createObjectURL = createObjectURL;
    (URL as any).revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    service.clear();
    jest.restoreAllMocks();
  });

  /** Fineract commonly serves document attachments as `application/octet-stream`. */
  it('stamps application/pdf onto a PDF served as octet-stream', async () => {
    const blob = new Blob(['%PDF-1.4'], { type: 'application/octet-stream' });

    const preview = await service.resolvePreviewUrl({ id: '1', fileName: 'statement.pdf' }, () => of(blob));

    expect(preview.type).toBe('pdf');
    expect(preview.url).toBe('blob:preview');
    expect((createObjectURL.mock.calls[0][0] as Blob).type).toBe('application/pdf');
  });

  it('stamps an image MIME type onto an image served as octet-stream', async () => {
    const blob = new Blob(['bytes'], { type: 'application/octet-stream' });

    const preview = await service.resolvePreviewUrl({ id: '2', fileName: 'photo.JPG' }, () => of(blob));

    expect(preview.type).toBe('image');
    expect((createObjectURL.mock.calls[0][0] as Blob).type).toBe('image/jpeg');
  });

  it('keeps a correct Content-Type from the server', async () => {
    const blob = new Blob(['bytes'], { type: 'image/png' });

    const preview = await service.resolvePreviewUrl({ id: '3', fileName: 'photo.png' }, () => of(blob));

    expect(preview.type).toBe('image');
    expect((createObjectURL.mock.calls[0][0] as Blob).type).toBe('image/png');
  });

  it('caches the resolved preview so a document is downloaded once', async () => {
    const downloadFn = jest.fn(() => of(new Blob(['%PDF-1.4'], { type: 'application/pdf' })));

    await service.resolvePreviewUrl({ id: '4', fileName: 'a.pdf' }, downloadFn as any);
    await service.resolvePreviewUrl({ id: '4', fileName: 'a.pdf' }, downloadFn as any);

    expect(downloadFn).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      'photo.png',
      true,
      false
    ],
    [
      'statement.pdf',
      false,
      true
    ],
    [
      'notes.txt',
      false,
      false
    ]
  ])('classifies %s', (fileName, isImage, isPdf) => {
    const document = { id: '5', fileName };

    expect(service.isImage(document)).toBe(isImage);
    expect(service.isPreviewable(document)).toBe(isImage || isPdf);
  });
});
