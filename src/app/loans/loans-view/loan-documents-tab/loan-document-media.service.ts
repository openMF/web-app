/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, OnDestroy, inject } from '@angular/core';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { LoansService } from 'app/loans/loans.service';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { PresentedLoanDocument } from './loan-document-presentation.utils';
/** Scoped to one workspace. Bounded LRU and shared in-flight reads; never global customer state. */
@Injectable()
export class LoanDocumentMediaService implements OnDestroy {
  private loans = inject(LoansService);
  private preview = inject(DocumentPreviewService);
  private cache = new Map<string, Blob>();
  private pending = new Map<string, Promise<Blob>>();
  private stop = new Subject<void>();
  private bytes = 0;
  private active = 0;
  private waiters: (() => void)[] = [];
  private destroyed = false;
  private generation = 0;
  async bounded<T>(work: () => Promise<T>): Promise<T> {
    if (this.active >= 2) await new Promise<void>((resolve) => this.waiters.push(resolve));
    else this.active++;
    if (this.destroyed) throw new Error('destroyed');
    try {
      return await work();
    } finally {
      const next = this.waiters.shift();
      if (next) next();
      else this.active--;
    }
  }
  read(loanId: string, doc: PresentedLoanDocument): Promise<Blob> {
    const key = `${loanId}:${doc.id}`;
    const cached = this.cache.get(key);
    if (cached) {
      this.cache.delete(key);
      this.cache.set(key, cached);
      return Promise.resolve(cached);
    }
    if (this.pending.has(key)) return this.pending.get(key);
    const generation = this.generation;
    const load = firstValueFrom(this.loans.downloadLoanDocument(loanId, String(doc.id)).pipe(takeUntil(this.stop)))
      .then((blob) => {
        if (!this.destroyed && generation === this.generation && blob.size <= 16 * 1024 * 1024) {
          while (this.cache.size && (this.bytes + blob.size > 32 * 1024 * 1024 || this.cache.size >= 4)) {
            const first = this.cache.keys().next().value;
            this.bytes -= this.cache.get(first).size;
            this.cache.delete(first);
          }
          this.cache.set(key, blob);
          this.bytes += blob.size;
        }
        return blob;
      })
      .finally(() => {
        if (this.pending.get(key) === load) this.pending.delete(key);
      });
    this.pending.set(key, load);
    return load;
  }
  invalidate(): void {
    this.generation++;
    this.stop.next();
    this.cache.clear();
    this.pending.clear();
    this.bytes = 0;
    this.preview.clear();
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    this.invalidate();
    this.stop.complete();
    this.waiters.splice(0).forEach((resolve) => resolve());
  }
}
