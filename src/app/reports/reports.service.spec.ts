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
});
