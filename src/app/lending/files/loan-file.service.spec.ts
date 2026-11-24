/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BsCalendarService } from 'app/core/bs-calendar/bs-calendar.service';
import { LoanFile, LoanFileService, WorkPage, isReadOnlyStage } from './loan-file.service';

describe('LoanFileService', () => {
  let service: LoanFileService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: BsCalendarService,
          useValue: {
            toBs: (v: string) => (v === '2026-11-18' ? { year: 2083, month: 8, day: 3 } : null),
            formatLong: (bs: { day: number; year: number } | null) => (bs ? `${bs.day} Mangsir ${bs.year}` : '')
          }
        }
      ]
    });
    service = TestBed.inject(LoanFileService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('asks the work page for one stage, one officer and one page, leaving blank filters out', () => {
    service
      .workPage({ stage: 'DOCUMENTS', officer: 'me', officeId: 1, search: ' Sita ', offset: 50, limit: 25 })
      .subscribe();
    const req = http.expectOne((r) => r.url === '/nepal/lending/files');
    expect(req.request.params.get('stage')).toBe('DOCUMENTS');
    expect(req.request.params.get('officer')).toBe('me');
    expect(req.request.params.get('officeId')).toBe('1');
    expect(req.request.params.get('search')).toBe('Sita');
    expect(req.request.params.get('offset')).toBe('50');
    expect(req.request.params.get('limit')).toBe('25');

    service.workPage({ stage: 'APPRAISAL', search: ' ', offset: 0, limit: 25 }).subscribe();
    const other = http.expectOne((r) => r.url === '/nepal/lending/files');
    expect(other.request.params.has('officer')).toBe(false);
    expect(other.request.params.has('officeId')).toBe(false);
    expect(other.request.params.has('search')).toBe(false);
  });

  it('reads fields and counts missing from the work page answer as null or zero', () => {
    let page: WorkPage;
    service.workPage({ stage: 'APPRAISAL', offset: 0, limit: 25 }).subscribe((p) => (page = p));
    http
      .expectOne((r) => r.url === '/nepal/lending/files')
      .flush({
        counts: { DOCUMENTS: 12 },
        total: 1,
        rows: [{ loanId: 81, accountNo: '000000081', clientName: 'Sita', amount: 300000, daysInStage: 4 }]
      });

    expect(page.counts).toEqual({ DOCUMENTS: 12, APPRAISAL: 0, APPROVED: 0 });
    expect(page.rows[0].officerName).toBeNull();
    expect(page.rows[0].registerNumber).toBeNull();
    expect(page.rows[0].missing).toBeNull();
  });

  it('reads a loan file with its optional fields missing', () => {
    let file: LoanFile;
    service.get(81).subscribe((f) => (file = f));
    http.expectOne('/nepal/lending/files/81'.replace('/nepal', '/nepal')).flush({
      loanId: 81,
      stage: 'DOCUMENTS',
      documents: [{ code: 'TRACE_MAP', label: 'Trace map', required: true, applies: true }],
      missing: ['TRACE_MAP']
    });

    expect(file.registerNumber).toBeNull();
    expect(file.security).toEqual([]);
    expect(file.history).toEqual([]);
    expect(file.documents[0].status).toBeNull();
    expect(file.documents[0].documentId).toBeNull();
  });

  it('ticks, undoes, completes, returns and notes through the file endpoints', () => {
    service.tick(81, 'PHOTO', { status: 'DONE', documentId: 33 }).subscribe();
    const tick = http.expectOne('/nepal/lending/files/81/documents/PHOTO');
    expect(tick.request.method).toBe('PUT');
    expect(tick.request.body).toEqual({ status: 'DONE', documentId: 33 });
    tick.flush({});

    service.undo(81, 'PHOTO').subscribe();
    const undo = http.expectOne('/nepal/lending/files/81/documents/PHOTO');
    expect(undo.request.method).toBe('DELETE');
    undo.flush({});

    service.complete(81).subscribe();
    const complete = http.expectOne('/nepal/lending/files/81/complete');
    expect(complete.request.method).toBe('POST');
    complete.flush({ registerNumber: '2083/84-0042' });

    service.reopen(81, 'Missing page').subscribe();
    const reopen = http.expectOne('/nepal/lending/files/81/reopen');
    expect(reopen.request.body).toEqual({ reason: 'Missing page' });
    reopen.flush({});

    service.addNote(81, 'Called the member').subscribe();
    const note = http.expectOne('/nepal/lending/files/81/notes');
    expect(note.request.body).toEqual({ text: 'Called the member' });
    note.flush({});
  });

  it('shows an AD date in BS and nothing for a missing date', () => {
    expect(service.bsDate('2026-11-18')).toBe('3 Mangsir 2083');
    expect(service.bsDate('2026-11-18T10:02:11+05:45')).toBe('3 Mangsir 2083');
    expect(service.bsDate(null)).toBe('');
  });

  it('treats a file as read only once it is past the Appraisal stage', () => {
    expect(isReadOnlyStage('DOCUMENTS')).toBe(false);
    expect(isReadOnlyStage('APPRAISAL')).toBe(false);
    expect(isReadOnlyStage('APPROVED')).toBe(true);
    expect(isReadOnlyStage('ACTIVE')).toBe(true);
  });
});
