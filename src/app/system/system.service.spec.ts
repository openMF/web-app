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
import { firstValueFrom } from 'rxjs';

import { SystemService } from './system.service';

describe('SystemService datatable entries', () => {
  let service: SystemService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SystemService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(SystemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('updates a one-to-many datatable row with the selected row id', async () => {
    const payload = {
      first_name: 'Ada Jane',
      active: false,
      percentage: 0,
      locale: 'en',
      dateFormat: 'yyyy-MM-dd'
    };
    const resultPromise = firstValueFrom(
      service.editEntityDatatableEntryOneToMany('99', '7', 'client_extra_data', payload)
    );

    const req = httpMock.expectOne(
      (request) => request.url === '/datatables/client_extra_data/99/7' && request.method === 'PUT'
    );
    expect(req.request.params.get('genericResultSet')).toBe('true');
    expect(req.request.body).toEqual(payload);
    req.flush({ resourceId: 7 });

    await expect(resultPromise).resolves.toEqual({ resourceId: 7 });
  });
});
