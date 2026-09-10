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
import { serializeMakerCheckerDate } from './checker-inbox-and-tasks-tabs/checker-inbox/maker-checker-date-serializer';

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

  it('sends locale-independent Maker Checker dates and preserves the remaining filters', () => {
    const from = serializeMakerCheckerDate(new Date(2016, 0, 2));
    const to = serializeMakerCheckerDate(new Date(2026, 8, 9));
    service
      .getMakerCheckerData({
        makerDateTimeFrom: from,
        makerDateTimeTo: to,
        clientId: 42,
        actionName: 'CREATE',
        entityName: 'CLIENT'
      })
      .subscribe();

    const request = httpMock.expectOne((req) => req.url === '/makercheckers');
    expect(request.request.params.get('makerDateTimeFrom')).toBe('02 January 2016');
    expect(request.request.params.get('makerDateTimeTo')).toBe('09 September 2026');
    expect(request.request.params.has('makerDateTimeto')).toBe(false);
    expect(request.request.params.get('clientId')).toBe('42');
    expect(request.request.params.get('actionName')).toBe('CREATE');
    expect(request.request.params.get('entityName')).toBe('CLIENT');
    expect(request.request.urlWithParams).not.toContain('enero');
    expect(request.request.urlWithParams).not.toContain('septiembre');
    request.flush([]);
  });

  it('serializes the same selected calendar date independently of display locale', () => {
    const englishCalendarSelection = new Date(2016, 0, 2);
    const spanishCalendarSelection = new Date(2016, 0, 2);
    const frenchCalendarSelection = new Date(2016, 0, 2);

    // The serializer deliberately does not use the Web App locale or DatePipe.
    expect(serializeMakerCheckerDate(englishCalendarSelection)).toBe('02 January 2016');
    expect(serializeMakerCheckerDate(spanishCalendarSelection)).toBe('02 January 2016');
    expect(serializeMakerCheckerDate(frenchCalendarSelection)).toBe('02 January 2016');
    expect(serializeMakerCheckerDate(spanishCalendarSelection)).not.toContain('enero');
    expect(serializeMakerCheckerDate(frenchCalendarSelection)).not.toContain('janvier');
  });

  it('preserves a date-only calendar value without a timezone shift', () => {
    const selectedDate = new Date(2026, 8, 9, 23, 30);

    expect(serializeMakerCheckerDate(selectedDate)).toBe('09 September 2026');
  });

  it('pads Maker Checker years below four digits', () => {
    const selectedDate = new Date(0);
    selectedDate.setFullYear(100, 0, 2);

    expect(serializeMakerCheckerDate(selectedDate)).toBe('02 January 0100');
  });

  it('sends only populated Maker Checker date filters and omits invalid values', () => {
    service
      .getMakerCheckerData({
        makerDateTimeFrom: serializeMakerCheckerDate(new Date(2016, 0, 2)),
        makerDateTimeTo: serializeMakerCheckerDate(undefined),
        invalid: serializeMakerCheckerDate(new Date('invalid'))
      })
      .subscribe();

    const fromOnlyRequest = httpMock.expectOne((req) => req.url === '/makercheckers');
    expect(fromOnlyRequest.request.params.get('makerDateTimeFrom')).toBe('02 January 2016');
    expect(fromOnlyRequest.request.params.has('makerDateTimeTo')).toBe(false);
    expect(fromOnlyRequest.request.params.has('invalid')).toBe(false);
    fromOnlyRequest.flush([]);

    service.getMakerCheckerData({ makerDateTimeTo: serializeMakerCheckerDate(new Date(2026, 8, 9)) }).subscribe();

    const toOnlyRequest = httpMock.expectOne((req) => req.url === '/makercheckers');
    expect(toOnlyRequest.request.params.has('makerDateTimeFrom')).toBe(false);
    expect(toOnlyRequest.request.params.get('makerDateTimeTo')).toBe('09 September 2026');
    toOnlyRequest.flush([]);

    service
      .getMakerCheckerData({
        makerDateTimeFrom: serializeMakerCheckerDate(null),
        makerDateTimeTo: serializeMakerCheckerDate(undefined)
      })
      .subscribe();

    const emptyDatesRequest = httpMock.expectOne((req) => req.url === '/makercheckers');
    expect(emptyDatesRequest.request.params.has('makerDateTimeFrom')).toBe(false);
    expect(emptyDatesRequest.request.params.has('makerDateTimeTo')).toBe(false);
    expect(emptyDatesRequest.request.urlWithParams).not.toContain('Invalid%20Date');
    emptyDatesRequest.flush([]);
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

  it('converts the epoch-seconds madeOnDate served by /makercheckers to milliseconds', () => {
    let records: any[];
    service.getMakerCheckerData().subscribe((response: any[]) => (records = response));

    httpMock
      .expectOne((req) => req.url === '/makercheckers')
      .flush([
        { id: 23, madeOnDate: 1789064261.492617 },
        { id: 24 }
      ]);

    expect(records[0].madeOnDate).toBe(1789064261493);
    expect(records[1].madeOnDate).toBeUndefined();
  });

  it('converts the epoch-seconds madeOnDate served by /audits/{id} to milliseconds', () => {
    let detail: any;
    service.getCheckerInboxDetail(23).subscribe((response: any) => (detail = response));

    httpMock.expectOne('/audits/23').flush({ id: 23, madeOnDate: 1789064261.492617 });

    expect(detail.madeOnDate).toBe(1789064261493);
  });

  it('leaves a non-numeric madeOnDate and the rest of the record untouched', () => {
    let records: any[];
    service.getMakerCheckerData().subscribe((response: any[]) => (records = response));

    httpMock
      .expectOne((req) => req.url === '/makercheckers')
      .flush([{ id: 23, madeOnDate: '2026-09-10T18:17:41Z', actionName: 'UPDATE', resourceId: 1 }]);

    expect(records[0]).toEqual({
      id: 23,
      madeOnDate: '2026-09-10T18:17:41Z',
      actionName: 'UPDATE',
      resourceId: 1
    });
  });
});
