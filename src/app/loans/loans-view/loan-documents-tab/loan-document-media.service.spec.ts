/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { LoansService } from 'app/loans/loans.service';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { LoanDocumentMediaService } from './loan-document-media.service';
import { presentDocument } from './loan-document-presentation.utils';
describe('loan-scoped attachment memory and rendering queue', () => {
  let service: LoanDocumentMediaService;
  let loans: any;
  let previews: any;
  beforeEach(() => {
    loans = { downloadLoanDocument: jest.fn(() => of(new Blob(['synthetic']))) };
    previews = { clear: jest.fn() };
    TestBed.configureTestingModule({ providers: [
        LoanDocumentMediaService,
        { provide: LoansService, useValue: loans },
        { provide: DocumentPreviewService, useValue: previews }
      ] });
    service = TestBed.inject(LoanDocumentMediaService);
  });
  it('deduplicates in-flight and cached reads without mixing loan accounts', async () => {
    const pending = new Subject<Blob>();
    loans.downloadLoanDocument.mockReturnValueOnce(pending);
    const doc = presentDocument({ id: 1, fileName: 'test.pdf' });
    const a = service.read('42', doc);
    const b = service.read('42', doc);
    expect(a).toBe(b);
    pending.next(new Blob(['synthetic']));
    pending.complete();
    await a;
    await service.read('42', doc);
    expect(loans.downloadLoanDocument).toHaveBeenCalledTimes(1);
    await service.read('43', doc);
    expect(loans.downloadLoanDocument).toHaveBeenCalledTimes(2);
  });
  it('evicts older blobs and clears cache after mutations', async () => {
    for (let id = 1; id <= 5; id++) await service.read('42', presentDocument({ id }));
    await service.read('42', presentDocument({ id: 1 }));
    expect(loans.downloadLoanDocument).toHaveBeenCalledTimes(6);
    service.invalidate();
    expect(previews.clear).toHaveBeenCalled();
    await service.read('42', presentDocument({ id: 1 }));
    expect(loans.downloadLoanDocument).toHaveBeenCalledTimes(7);
  });
  it('limits simultaneous rendering to two without losing queued work', async () => {
    const releases: (() => void)[] = [];
    let active = 0;
    let peak = 0;
    const work = () =>
      new Promise<void>((resolve) => {
        active++;
        peak = Math.max(active, peak);
        releases.push(() => {
          active--;
          resolve();
        });
      });
    const tasks = [
      service.bounded(work),
      service.bounded(work),
      service.bounded(work)
    ];
    expect(active).toBe(2);
    releases.shift()!();
    await tasks[0];
    await Promise.resolve();
    expect(peak).toBe(2);
    releases.splice(0).forEach((release) => release());
    await Promise.all(tasks);
    expect(active).toBe(0);
  });
});
