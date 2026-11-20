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

import { ReportsService } from './reports.service';
import { SelectOption } from './common-models/select-option.model';

describe('ReportsService report output formats', () => {
  let service: ReportsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReportsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ReportsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('strips the hierarchy dots Fineract prefixes onto office names', () => {
    let options: SelectOption[];
    service.getSelectOptions('OfficeIdSelectOne').subscribe((response) => (options = response));

    httpMock
      .expectOne((request) => request.url === '/runreports/OfficeIdSelectOne')
      .flush({
        data: [
          { row: [
              1,
              'Head Office'
            ] },
          { row: [
              2,
              '....Saudi Branch'
            ] },
          { row: [
              3,
              '........Dubai Branch'
            ] }
        ]
      });

    expect(options.map((option) => option.name)).toEqual([
      'Head Office',
      'Saudi Branch',
      'Dubai Branch'
    ]);
    expect(options.map((option) => option.id)).toEqual([
      1,
      2,
      3
    ]);
  });

  it('leaves names without leading dots and non-string names untouched', () => {
    let options: SelectOption[];
    service.getSelectOptions('currencyIdSelectAll').subscribe((response) => (options = response));

    httpMock
      .expectOne((request) => request.url === '/runreports/currencyIdSelectAll')
      .flush({
        data: [
          { row: [
              'USD',
              'US Dollar'
            ] },
          { row: [
              'XOF',
              'CFA Franc B.C.E.A.O.'
            ] },
          { row: [
              -10,
              10
            ] }
        ]
      });

    expect(options.map((option) => option.name)).toEqual([
      'US Dollar',
      'CFA Franc B.C.E.A.O.',
      10
    ]);
    expect(options.map((option) => option.id)).toEqual([
      'USD',
      'XOF',
      -10
    ]);
  });

  it('sends XML as the selected Pentaho output type', () => {
    service
      .getPentahoRunReportData('Client Details', { 'output-type': 'XML' }, 'default', 'en', 'dd MMMM yyyy')
      .subscribe();

    const req = httpMock.expectOne((request) => request.url === '/runreports/Client Details');
    expect(req.request.params.get('output-type')).toBe('XML');
    expect(req.request.responseType).toBe('arraybuffer');
    req.flush(new ArrayBuffer(0));
  });

  it('sends XML as the selected BIRT output type', () => {
    service
      .getBirtRunReportData('Client Details', { 'output-type': 'XML' }, 'default', 'en', 'dd MMMM yyyy')
      .subscribe();

    const req = httpMock.expectOne((request) => request.url === '/runreports/Client Details');
    expect(req.request.params.get('output-type')).toBe('XML');
    expect(req.request.responseType).toBe('arraybuffer');
    req.flush(new ArrayBuffer(0));
  });
  it.each([
    'KYCNaturalPerson',
    'KYCLegalPerson'
  ])('requests %s as PDF for the current client and tenant', (report) => {
    let response: any;
    service
      .getPentahoRunReportData(
        report,
        { 'output-type': 'PDF', R_clientId: '123' },
        'synthetic-tenant',
        'es-MX',
        'yyyy-MM-dd'
      )
      .subscribe((value) => (response = value));
    const request = httpMock.expectOne((req) => req.url === `/runreports/${report}`);
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('arraybuffer');
    expect(request.request.params.get('tenantIdentifier')).toBe('synthetic-tenant');
    expect(request.request.params.get('locale')).toBe('es-MX');
    expect(request.request.params.get('dateFormat')).toBe('yyyy-MM-dd');
    expect(request.request.params.get('output-type')).toBe('PDF');
    expect(request.request.params.get('R_clientId')).toBe('123');
    const body = new ArrayBuffer(8);
    request.flush(body, { headers: { 'Content-Type': 'application/pdf' } });
    expect(response.body).toBe(body);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
  });

  it('propagates a report permission failure without retrying', () => {
    const error = jest.fn();
    service
      .getPentahoRunReportData(
        'KYCLegalPerson',
        { 'output-type': 'PDF', R_clientId: '123' },
        'synthetic-tenant',
        'en',
        'yyyy-MM-dd'
      )
      .subscribe({ error });
    httpMock
      .expectOne((req) => req.url === '/runreports/KYCLegalPerson')
      .flush(new ArrayBuffer(0), { status: 403, statusText: 'Forbidden' });
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ status: 403 }));
  });
});
