/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TasksService } from './tasks.service';

describe('TasksService maker-checker search', () => {
  let service: TasksService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TasksService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TasksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('preserves the makerDateTimeTo parameter sent by the checker inbox', () => {
    service
      .getMakerCheckerData({ makerDateTimeFrom: '01 January 2026', makerDateTimeTo: '31 January 2026' })
      .subscribe();

    const request = httpMock.expectOne(
      '/makercheckers?makerDateTimeFrom=01%20January%202026&makerDateTimeTo=31%20January%202026'
    );
    expect(request.request.params.get('makerDateTimeTo')).toBe('31 January 2026');
    expect(request.request.params.has('makerDateTimeto')).toBe(false);
    request.flush([]);
  });

  it('requests credit applications with only populated server-side parameters', () => {
    service
      .getCreditApplications({
        submittedFrom: '2026-01-01',
        submittedTo: '',
        productId: 7,
        minAmount: 1000,
        currencyCode: 'USD',
        offset: 20,
        limit: 10,
        orderBy: 'submittedOnDate',
        sortOrder: 'DESC'
      })
      .subscribe();

    const request = httpMock.expectOne((req) => req.url === '/v2/credit-applications');
    expect(request.request.params.get('submittedFrom')).toBe('2026-01-01');
    expect(request.request.params.has('submittedTo')).toBe(false);
    expect(request.request.params.get('productId')).toBe('7');
    expect(request.request.params.get('minAmount')).toBe('1000');
    expect(request.request.params.get('currencyCode')).toBe('USD');
    expect(request.request.params.get('offset')).toBe('20');
    expect(request.request.params.get('limit')).toBe('10');
    expect(request.request.params.get('orderBy')).toBe('submittedOnDate');
    expect(request.request.params.get('sortOrder')).toBe('DESC');
    request.flush({ totalFilteredRecords: 0, pageItems: [] });
  });
});
