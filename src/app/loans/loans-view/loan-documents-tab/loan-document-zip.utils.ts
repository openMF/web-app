/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Observable, defer, from, mergeMap, map, toArray, switchMap } from 'rxjs';
import { LoanDocument } from './loan-document-presentation.utils';
/** Explicit browser memory budget, independent of backend upload limits. No partial archives. */
export const LOAN_DOCUMENT_ZIP_LIMIT = 100 * 1024 * 1024;
export const LOAN_DOCUMENT_ZIP_MAX_FILES = 500;
export function safeArchiveNames(documents: LoanDocument[]): string[] {
  const used = new Set<string>();
  return documents.map((doc) => {
    const base =
      (doc.fileName || `document-${doc.id}`)
        .normalize('NFKC')
        .split(/[\\/]/)
        .pop()
        .replace(/[\u0000-\u001f\u007f<>:"|?*]/g, '_')
        .replace(/^\.+|[. ]+$/g, '')
        .slice(0, 180) || `document-${doc.id}`;
    let name = base;
    let suffix = 2;
    while (used.has(name.toLowerCase()) || [
        '__proto__',
        'constructor',
        'prototype'
      ].includes(name.toLowerCase())) {
      const dot = base.lastIndexOf('.');
      name = dot > 0 ? `${base.slice(0, dot)} (${suffix++})${base.slice(dot)}` : `${base} (${suffix++})`;
    }
    used.add(name.toLowerCase());
    return name;
  });
}
export function buildDocumentZip(
  documents: LoanDocument[],
  download: (document: LoanDocument) => Observable<Blob>,
  progress: (done: number, total: number) => void
): Observable<Blob> {
  return defer(() => {
    if (
      !documents.length ||
      documents.length > LOAN_DOCUMENT_ZIP_MAX_FILES ||
      documents.reduce((sum, doc) => sum + Math.max(0, doc.size || 0), 0) > LOAN_DOCUMENT_ZIP_LIMIT
    ) {
      throw new Error('zipLimit');
    }
    const names = safeArchiveNames(documents);
    let bytes = 0;
    let done = 0;
    return from(documents.map((document, index) => ({ document, index }))).pipe(
      mergeMap(
        ({ document, index }) =>
          download(document).pipe(
            switchMap((blob) => {
              bytes += blob.size;
              if (bytes > LOAN_DOCUMENT_ZIP_LIMIT) throw new Error('zipLimit');
              return from(blob.arrayBuffer()).pipe(
                map((buffer) => {
                  progress(++done, documents.length);
                  return { name: names[index], data: new Uint8Array(buffer) };
                })
              );
            })
          ),
        2
      ),
      toArray(),
      switchMap((entries) =>
        from(import('fflate')).pipe(
          map(({ zipSync }) => {
            const files: Record<string, Uint8Array> = Object.create(null);
            for (const entry of entries) files[entry.name] = entry.data;
            // PDFs/images are already compressed; STORE avoids a second expensive compression pass.
            const archive = zipSync(files, { level: 0 });
            return new Blob([archive as BlobPart], { type: 'application/zip' });
          })
        )
      )
    );
  });
}
