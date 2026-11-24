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
import { Valuer, ValuerInput, ValuersService, fiscalYearLabel } from './valuers.service';

describe('ValuersService', () => {
  let service: ValuersService;
  let http: HttpTestingController;
  let todayBs: { year: number; month: number; day: number } | null;

  beforeEach(() => {
    todayBs = { year: 2083, month: 8, day: 8 };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BsCalendarService, useValue: { todayBs: () => todayBs } }
      ]
    });
    service = TestBed.inject(ValuersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists the active valuers, and the inactive ones too with all=true', () => {
    service.list().subscribe();
    expect(http.expectOne('/nepal/lending/valuers').request.params.has('all')).toBe(false);

    service.list(true).subscribe();
    expect(http.expectOne((r) => r.url === '/nepal/lending/valuers').request.params.get('all')).toBe('true');
  });

  it('reads a field missing from the answer as null', () => {
    let rows: Valuer[] = [];
    service.list().subscribe((r) => (rows = r));
    http.expectOne('/nepal/lending/valuers').flush([{ id: 1, name: 'Ram', registered: false, active: true }]);

    expect(rows[0]).toEqual({
      id: 1,
      name: 'Ram',
      registered: false,
      registrationNo: null,
      fiscalYear: null,
      phone: null,
      address: null,
      active: true,
      listedThisYear: false
    });
  });

  it('adds with POST and changes with PUT', () => {
    const body: ValuerInput = {
      name: 'Sita',
      registered: true,
      registrationNo: 'TV-12',
      fiscalYear: 2083,
      phone: null,
      address: null,
      active: true
    };
    service.add(body).subscribe();
    const add = http.expectOne('/nepal/lending/valuers');
    expect(add.request.method).toBe('POST');
    expect(add.request.body).toEqual(body);
    add.flush({ id: 5, ...body });

    service.update(5, { ...body, active: false }).subscribe();
    const put = http.expectOne('/nepal/lending/valuers/5');
    expect(put.request.method).toBe('PUT');
    expect(put.request.body.active).toBe(false);
    put.flush({ id: 5, ...body, active: false });
  });

  it('knows the fiscal year starts on 1 Shrawan', () => {
    todayBs = { year: 2083, month: 4, day: 1 };
    expect(service.currentFiscalYear()).toBe(2083);
    todayBs = { year: 2083, month: 3, day: 32 };
    expect(service.currentFiscalYear()).toBe(2082);
    todayBs = null;
    expect(service.currentFiscalYear()).toBeNull();
  });

  it('shows a fiscal year as 2083/84', () => {
    expect(fiscalYearLabel(2083)).toBe('2083/84');
    expect(fiscalYearLabel(2099)).toBe('2099/00');
    expect(fiscalYearLabel(null)).toBe('');
  });
});
