/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LoansService } from 'app/loans/loans.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
describe('loan document API contracts', () => {
  let service: LoansService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Dates, useValue: {} },
        { provide: SettingsService, useValue: {} }
      ] });
    service = TestBed.inject(LoansService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('retains the existing upload response contract', () => {
    const callback = jest.fn();
    const form = new FormData();
    service.loadLoanDocument('42', form).subscribe(callback);
    const req = http.expectOne('/loans/42/documents');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(form);
    expect(req.request.reportProgress).toBe(false);
    req.flush({ resourceId: 1 });
    expect(callback).toHaveBeenCalledWith({ resourceId: 1 });
  });
  it('opts into progress on the same authenticated HttpClient endpoint', () => {
    service.uploadLoanDocumentWithProgress('42', new FormData()).subscribe();
    const req = http.expectOne('/loans/42/documents');
    expect(req.request.reportProgress).toBe(true);
    req.flush({ resourceId: 1 });
  });
  it('uses multipart PUT for metadata only', () => {
    const form = new FormData();
    form.set('name', 'Changed');
    service.updateLoanDocumentMetadata('42', '7', form).subscribe();
    const req = http.expectOne('/loans/42/documents/7');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBe(form);
    expect(form.has('file')).toBe(false);
    req.flush({ resourceId: 7 });
  });
});
