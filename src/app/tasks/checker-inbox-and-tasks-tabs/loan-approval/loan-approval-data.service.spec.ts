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
import { SettingsService } from 'app/settings/settings.service';
import { LoanApprovalDataService } from './loan-approval-data.service';

describe('LoanApprovalDataService API boundary', () => {
  let service: LoanApprovalDataService;
  let http: HttpTestingController;
  beforeEach(() => {
    const stored = new Map<string, string>();
    jest.mocked(localStorage.getItem).mockImplementation((key) => stored.get(key) ?? null);
    jest.mocked(localStorage.setItem).mockImplementation((key, value) => {
      stored.set(key, value);
    });
    jest.mocked(localStorage.removeItem).mockImplementation((key) => {
      stored.delete(key);
    });
    jest.mocked(localStorage.clear).mockImplementation(() => stored.clear());
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SettingsService, useValue: { serverUrl: 'synthetic', tenantIdentifier: 'default' } }
      ] });
    service = TestBed.inject(LoanApprovalDataService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    jest.restoreAllMocks();
    localStorage.clear();
  });
  const row = (id = 1, status = 100) => ({
    id,
    status: { id: status, pendingApproval: status === 100 },
    principal: 100.1
  });
  it('uses verified status/paging semantics and preserves principal decimal tokens', () => {
    service.page(1000, 0).subscribe((snapshot) => {
      expect(snapshot.complete).toBe(true);
      expect(snapshot.rows[0].principal).toBe('1234567890123.45');
    });
    const request = http.expectOne((req) => req.url === '/loans');
    expect(request.request.params.get('status')).toBe('100');
    expect(request.request.params.get('offset')).toBe('0');
    expect(request.request.params.get('limit')).toBe('1000');
    expect(request.request.params.has('sqlSearch')).toBe(false);
    request.flush(
      '{"totalFilteredRecords":1,"pageItems":[{"id":1,"status":{"id":100,"pendingApproval":true},"principal":1234567890123.45}]}'
    );
  });
  it('filters active records and refuses to claim a complete total for a mixed-status response', () => {
    service.page(1000, 0).subscribe((snapshot) => {
      expect(snapshot.rows).toHaveLength(1);
      expect(snapshot.total).toBeNull();
      expect(snapshot.complete).toBe(false);
    });
    http
      .expectOne((req) => req.url === '/loans')
      .flush(
        JSON.stringify({ totalFilteredRecords: 2, pageItems: [
            row(),
            row(2, 300)
          ] })
      );
  });
  it.each([
    { totalFilteredRecords: 1001, pageItems: [row()] },
    { pageItems: [row()] },
    { totalFilteredRecords: 2, pageItems: [
        row(),
        row()
      ] }
  ])('does not imply global completeness for truncated, uncounted or duplicate results', (response) => {
    service.page(1000, 0).subscribe((snapshot) => expect(snapshot.complete).toBe(false));
    http.expectOne((req) => req.url === '/loans').flush(JSON.stringify(response));
  });
  it('retains a reduced authoritative total for an empty page beyond the last record', () => {
    service.page(10, 120).subscribe((snapshot) => {
      expect(snapshot.total).toBe(100);
      expect(snapshot.complete).toBe(false);
    });
    http.expectOne((req) => req.url === '/loans').flush('{"totalFilteredRecords":100,"pageItems":[]}');
  });
  it('rejects malformed lists', () => {
    service.page(10, 0).subscribe({
      next: () => {
        throw new Error('Unexpected');
      },
      error: (error) => expect(error).toBeTruthy()
    });
    http.expectOne((req) => req.url === '/loans').flush('{}');
  });
  it('retains the existing approval-template path, templateType and associations', () => {
    service.review({ id: 7 } as any).subscribe((review) => expect(review.template.approvalAmount).toBe('0.10'));
    http.expectOne('/loans/7').flush('{"id":7}');
    const request = http.expectOne((req) => req.url === '/loans/7/template');
    expect(request.request.params.get('templateType')).toBe('approval');
    expect(request.request.params.get('associations')).toBe('delinquency');
    request.flush('{"approvalAmount":0.10}');
  });
  it('keeps command locks across queue reuse', () => {
    service.lock(7);
    expect(service.locked(7)).toBe(true);
    expect(service.locked(8)).toBe(false);
  });
  it('retains attempt markers in a fresh service after reload, scoped to both server and tenant', () => {
    expect(service.lock(7)).toBe(true);
    const reloaded = TestBed.runInInjectionContext(() => new LoanApprovalDataService());
    expect(reloaded.locked(7)).toBe(true);
    const settings = TestBed.inject(SettingsService) as any;
    settings.tenantIdentifier = 'other';
    expect(reloaded.locked(7)).toBe(false);
    settings.tenantIdentifier = 'default';
    settings.serverUrl = 'other-server';
    expect(reloaded.locked(7)).toBe(false);
    settings.serverUrl = 'synthetic';
    expect(reloaded.locked(7)).toBe(true);
    reloaded.unlock(7);
    expect(reloaded.locked(7)).toBe(false);
    expect(TestBed.runInInjectionContext(() => new LoanApprovalDataService()).locked(7)).toBe(false);
  });
  it('fails closed when durable storage cannot be written or read', () => {
    jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(service.lock(7)).toBe(false);
    jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('unavailable');
    });
    expect(service.locked(7)).toBe(true);
  });
  it('keeps the in-memory and durable lock when removal fails', () => {
    service.lock(7);
    jest.spyOn(localStorage, 'removeItem').mockImplementation(() => {
      throw new Error('unavailable');
    });
    service.unlock(7);
    expect(service.locked(7)).toBe(true);
    expect(TestBed.runInInjectionContext(() => new LoanApprovalDataService()).locked(7)).toBe(true);
  });
});
