/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { VaultCashDepositService } from './vault-cash-deposit.service';

describe('VaultCashDepositService (mocked HTTP)', () => {
  let service: VaultCashDepositService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ] });
    service = TestBed.inject(VaultCashDepositService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('uses exactly the four read-only plugin contracts and server-resolved office', () => {
    service.getVaultContext().subscribe();
    service.getSupportedCurrencies().subscribe();
    service.getDenominations('USD').subscribe();
    service.getVaultInventory('USD').subscribe();
    const requests = http.match(() => true);
    expect(requests.map((r) => r.request.urlWithParams)).toEqual([
      '/v2/base-teller/vault/context',
      '/v2/base-teller/vault/currencies',
      '/v2/base-teller/vault/denominations?currencyCode=USD',
      '/v2/base-teller/vault/inventory?currencyCode=USD'
    ]);
    for (const request of requests) {
      expect(request.request.method).toBe('GET');
      expect(request.request.body).toBeNull();
      expect(request.request.params.has('officeId')).toBe(false);
      request.flush({});
    }
  });

  it('preserves exact monetary JSON tokens and uses the real non-mutating POST route', () => {
    const body = {
      businessDate: '2026-10-28',
      currencies: [{ currencyCode: 'USD', denominations: [{ denominationId: 'n', quantity: 1 }] }]
    };
    let result: unknown;
    service.previewVaultCashDeposit(body).subscribe((data) => (result = data));
    const request = http.expectOne('/v2/base-teller/vault-cash-deposits/preview');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush(
      '{"currencies":[{"totalCash":9999999999999.999999,"banknotesTotal":0.100000,"coinsTotal":0.200000}]}'
    );
    expect(result).toEqual({
      currencies: [{ totalCash: '9999999999999.999999', banknotesTotal: '0.100000', coinsTotal: '0.200000' }]
    });
    http.expectNone(() => true);
  });

  it('propagates backend errors without fake fallback data', () => {
    let status = 0;
    service
      .getVaultContext()
      .subscribe({ next: () => fail('must not fabricate context'), error: (e) => (status = e.status) });
    http.expectOne('/v2/base-teller/vault/context').flush({}, { status: 403, statusText: 'Forbidden' });
    expect(status).toBe(403);
  });
});
