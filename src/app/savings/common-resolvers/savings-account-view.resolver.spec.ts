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
import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SavingsService } from '../savings.service';
import { SavingsAccountViewResolver } from './savings-account-view.resolver';

describe('Savings transaction account data resolution', () => {
  let resolver: SavingsAccountViewResolver;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SavingsAccountViewResolver,
        SavingsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    resolver = TestBed.inject(SavingsAccountViewResolver);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const route = (id: string) =>
    ({
      paramMap: convertToParamMap({}),
      parent: { paramMap: convertToParamMap({ savingAccountId: id }) }
    }) as ActivatedRouteSnapshot;

  it('passes through the account externalId using one existing account request per navigation', async () => {
    for (const id of [
      '101',
      '102'
    ]) {
      const result = firstValueFrom(resolver.resolve(route(id)));
      const request = httpMock.expectOne(`/savingsaccounts/${id}?associations=all`);
      expect(request.request.method).toBe('GET');
      const account = { id: Number(id), externalId: `ACCOUNT-DEMO-${id}`, clientId: 1 };
      request.flush(account);
      expect(await result).toEqual(account);
      httpMock.expectNone('/clients/1');
    }
  });

  it('preserves the existing account API error without fetching a fallback identifier', async () => {
    const result = firstValueFrom(resolver.resolve(route('101')));
    const rejected = expect(result).rejects.toMatchObject({ status: 500 });
    httpMock.expectOne('/savingsaccounts/101?associations=all').flush('Unavailable', {
      status: 500,
      statusText: 'Internal Server Error'
    });
    await rejected;
  });
});
