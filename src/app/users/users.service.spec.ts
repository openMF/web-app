/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsersService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('uses merged backoffice endpoint to list self-service users', async () => {
    const request = firstValueFrom(service.getSelfServiceUsers());
    const req = httpMock.expectOne('/selfservice/users');
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await expect(request).resolves.toEqual([]);
  });

  it('uses merged backoffice endpoints for self-service user mutations', () => {
    service.activateSelfServiceUser(1).subscribe();
    expect(httpMock.expectOne('/selfservice/users/1/activate').request.method).toBe('PUT');

    service.inactivateSelfServiceUser(1).subscribe();
    expect(httpMock.expectOne('/selfservice/users/1/inactivate').request.method).toBe('PUT');

    service.linkSelfServiceUserClient(1, 2).subscribe();
    expect(httpMock.expectOne('/selfservice/users/1/clients/2').request.method).toBe('PUT');

    service.delinkSelfServiceUserClient(1, 2).subscribe();
    expect(httpMock.expectOne('/selfservice/users/1/clients/2').request.method).toBe('DELETE');

    service.deleteSelfServiceUser(1).subscribe();
    expect(httpMock.expectOne('/selfservice/users/1').request.method).toBe('DELETE');
  });
});
