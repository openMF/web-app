/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { firstValueFrom, of, throwError } from 'rxjs';
import { unzipSync } from 'fflate';
import { buildDocumentZip, LOAN_DOCUMENT_ZIP_LIMIT, safeArchiveNames } from './loan-document-zip.utils';
function blob(bytes: number[]): Blob {
  const data = new Uint8Array(bytes);
  return { size: data.length, arrayBuffer: async () => data.buffer } as Blob;
}
describe('loan ZIP export', () => {
  it('uses safe flat deterministic case-insensitive unique names', () => {
    const names = safeArchiveNames([
      { id: 1, fileName: '../../a.pdf' },
      { id: 2, fileName: 'C:\\temp\\a.pdf' },
      { id: 3, fileName: 'A.PDF' },
      { id: 4, fileName: '..' },
      { id: 5, fileName: '__proto__' }
    ]);
    expect(names).toEqual([
      'a.pdf',
      'a (2).pdf',
      'A (3).PDF',
      'document-4',
      '__proto__ (2)'
    ]);
    expect(names.every((name) => !/[\\/]/.test(name))).toBe(true);
  });
  it('archives only supplied filtered documents with correct bytes', async () => {
    const download = jest.fn(() =>
      of(
        blob([
          1,
          2,
          3
        ])
      )
    );
    const progress = jest.fn();
    // Capture output Blob parts: jsdom does not implement Blob.arrayBuffer.
    const NativeBlob = global.Blob;
    const parts: BlobPart[][] = [];
    global.Blob = class {
      constructor(data: BlobPart[]) {
        parts.push(data);
      }
    } as any;
    try {
      await firstValueFrom(buildDocumentZip([{ id: 2, fileName: 'safe.pdf' }], download, progress));
      expect(download).toHaveBeenCalledTimes(1);
      expect(progress).toHaveBeenCalledWith(1, 1);
      expect(unzipSync(parts[0][0] as Uint8Array)['safe.pdf']).toEqual(
        new Uint8Array([
          1,
          2,
          3
        ])
      );
    } finally {
      global.Blob = NativeBlob;
    }
  });
  it('rejects known oversize archives before downloading', async () => {
    const download = jest.fn();
    await expect(
      firstValueFrom(buildDocumentZip([{ id: 1, size: LOAN_DOCUMENT_ZIP_LIMIT + 1 }], download, () => undefined))
    ).rejects.toThrow('zipLimit');
    expect(download).not.toHaveBeenCalled();
  });
  it('enforces actual size and never silently omits failed files', async () => {
    await expect(
      firstValueFrom(
        buildDocumentZip(
          [{ id: 1 }],
          () => of({ size: LOAN_DOCUMENT_ZIP_LIMIT + 1 } as Blob),
          () => undefined
        )
      )
    ).rejects.toThrow('zipLimit');
    await expect(
      firstValueFrom(
        buildDocumentZip(
          [
            { id: 1 },
            { id: 2 }
          ],
          (doc) => (doc.id === 1 ? of(blob([1])) : throwError(() => new Error('denied'))),
          () => undefined
        )
      )
    ).rejects.toThrow('denied');
  });
  it('rejects empty and excessive file counts', async () => {
    for (const docs of [
      [],
      Array.from({ length: 501 }, (_, id) => ({ id }))
    ])
      await expect(
        firstValueFrom(
          buildDocumentZip(
            docs,
            () => of(blob([])),
            () => undefined
          )
        )
      ).rejects.toThrow('zipLimit');
  });
});
