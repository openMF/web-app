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
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

import { CashInventoryFilters, CashInventoryService } from './cash-inventory.service';

describe('CashInventoryService', () => {
  let service: CashInventoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CashInventoryService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CashInventoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests the authoritative context endpoint', async () => {
    const response = firstValueFrom(service.getContext());
    const request = httpMock.expectOne('/v2/base-teller/cash-inventory/context');
    expect(request.request.method).toBe('GET');
    request.flush({ custodians: [], transactionTypes: [], currencies: [] });
    expect((await response).custodians).toEqual([]);
  });

  it.each([
    [
      'no filters',
      {},
      {}
    ],
    [
      'custodian',
      { custodianKey: 'TELLER:10' },
      { custodianKey: 'TELLER:10' }
    ],
    [
      'cash',
      { transactionType: 'CASH' },
      { transactionType: 'CASH' }
    ],
    [
      'check',
      { transactionType: 'CHECK' },
      { transactionType: 'CHECK' }
    ],
    [
      'currency',
      { currencyCode: 'MXN' },
      { currencyCode: 'MXN' }
    ],
    [
      'last cutoff',
      { showLastCutOff: true },
      { showLastCutOff: 'true' }
    ],
    [
      'combined filters',
      {
        custodianKey: 'VAULT:1',
        transactionType: 'CHECK',
        currencyCode: 'USD',
        showLastCutOff: true
      },
      {
        custodianKey: 'VAULT:1',
        transactionType: 'CHECK',
        currencyCode: 'USD',
        showLastCutOff: 'true'
      }
    ],
    [
      'empty optional values',
      { custodianKey: null, transactionType: null, currencyCode: null, showLastCutOff: false },
      {}
    ]
  ])('requests inventory with %s', async (_name, filters, expectedParams) => {
    const response = firstValueFrom(service.getInventory(filters as CashInventoryFilters));
    const request = httpMock.expectOne((candidate) => candidate.url === '/v2/base-teller/cash-inventory');
    expect(request.request.method).toBe('GET');
    expect(
      Object.fromEntries(
        request.request.params.keys().map((key) => [
          key,
          request.request.params.get(key)
        ])
      )
    ).toEqual(expectedParams);
    request.flush([]);
    expect(await response).toEqual([]);
  });
});
