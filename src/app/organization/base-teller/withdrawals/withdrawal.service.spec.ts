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
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalRequest } from './withdrawal.models';
import { webcrypto } from 'node:crypto';
import { TextEncoder } from 'node:util';

describe('WEB-1263 exact API and recovery contracts', () => {
  let api: WithdrawalService;
  let http: HttpTestingController;
  let stored: Map<string, string>;
  let tenant = 'tenant-a';
  const root = '/v2/base-teller/withdrawals';
  const request: WithdrawalRequest = {
    clientId: 7,
    accountId: 8,
    method: 'CASH',
    amount: '9007199254740.99',
    paymentTypeId: 4,
    identificationTypeId: 5,
    identificationReference: 'private-1234',
    denominations: [{ denominationId: 'server-id', quantity: 1 }],
    idempotencyKey: 'fixed-key'
  };
  beforeEach(() => {
    stored = new Map();
    (sessionStorage.getItem as jest.Mock).mockImplementation((key) => stored.get(key) ?? null);
    (sessionStorage.setItem as jest.Mock).mockImplementation((key, value) => stored.set(key, value));
    (sessionStorage.removeItem as jest.Mock).mockImplementation((key) => stored.delete(key));
    sessionStorage.clear();
    tenant = 'tenant-a';
    Object.defineProperty(globalThis, 'TextEncoder', { configurable: true, value: TextEncoder });
    Object.defineProperty(globalThis.crypto, 'subtle', { configurable: true, value: webcrypto.subtle });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ userId: 10 }) } },
        {
          provide: SettingsService,
          useValue: {
            baseServerUrl: 'https://backend/api',
            get tenantIdentifier() {
              return tenant;
            }
          }
        }
      ]
    });
    api = TestBed.inject(WithdrawalService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    stored = new Map();
    (sessionStorage.getItem as jest.Mock).mockImplementation((key) => stored.get(key) ?? null);
    (sessionStorage.setItem as jest.Mock).mockImplementation((key, value) => stored.set(key, value));
    (sessionStorage.removeItem as jest.Mock).mockImplementation((key) => stored.delete(key));
    sessionStorage.clear();
  });
  it('loads context and both catalogs, and preserves monetary JSON tokens', () => {
    api.context().subscribe((value) => expect(value.denominations[0].denominationValue).toBe('9007199254740.99'));
    http.expectOne(root + '/context').flush('{"denominations":[{"denominationValue":9007199254740.99}]}');
    api.banks().subscribe((value) => expect(value).toEqual([]));
    http.expectOne(root + '/banks').flush('[]');
    api.checkTypes().subscribe((value) => expect(value).toEqual([]));
    http.expectOne(root + '/check-types').flush('[]');
  });
  it('uses the actual bounded clientNumber search and account endpoints', () => {
    api.customers('clientNumber', 'C7', 10, 10).subscribe();
    const search = http.expectOne((r) => r.url === root + '/customers');
    expect(search.request.params.get('clientNumber')).toBe('C7');
    expect(search.request.params.get('offset')).toBe('10');
    expect(search.request.params.get('limit')).toBe('10');
    search.flush('{"pageItems":[],"totalFilteredRecords":0}');
    api.accounts(7).subscribe();
    http.expectOne(root + '/customers/7/accounts').flush('[]');
    api.account(8).subscribe();
    http.expectOne(root + '/accounts/8').flush('{}');
  });
  it('posts numeric decimal amounts and the same body idempotency key without inferred financial fields', () => {
    api.preview(request).subscribe();
    const preview = http.expectOne(root + '/preview');
    expect(preview.request.method).toBe('POST');
    expect(preview.request.body).toContain('"amount":9007199254740.99');
    expect(preview.request.headers.get('Content-Type')).toBe('application/json');
    preview.flush('{}');
    api.create(request).subscribe();
    const create = http.expectOne(root);
    expect(create.request.body).toContain('"idempotencyKey":"fixed-key"');
    expect(JSON.parse(create.request.body)).not.toHaveProperty('currencyCode');
    create.flush('{}');
  });
  it('retrieves historical record and receipt independently', () => {
    api.retrieve(12).subscribe();
    http.expectOne(root + '/12').flush('{}');
    api.receipt(12).subscribe();
    http.expectOne(root + '/12/receipt').flush('{}');
  });
  it('never persists identification values and recovers only the original identity', async () => {
    await api.remember(request);
    expect(Array.from(stored.values()).join('')).not.toContain('private-1234');
    expect(Array.from(stored.values()).join('')).not.toContain('identificationReference');
    expect(await api.recover('wrong')).toBeNull();
    expect(await api.recover('private-1234')).toEqual(request);
    api.clearPending();
    expect(api.pending).toBeNull();
  });
  it('scopes pending withdrawals by tenant and operator/backend identity', async () => {
    await api.remember(request);
    tenant = 'tenant-b';
    expect(api.pending).toBeNull();
    tenant = 'tenant-a';
    expect(api.pending?.request.idempotencyKey).toBe('fixed-key');
  });
});
