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
import { AccountManagementApi } from './account-management-api.service';
import { AccountRelationshipsService } from './account-relationships.service';
import { GuaranteeSweepsService } from './guarantee-sweeps.service';
import { PlannedAccountsService } from './planned-accounts.service';
import { Arrangement, Pocket } from './account-management.model';
import { ACCOUNT_MANAGEMENT_REQUEST } from 'app/core/http/account-management-request';

describe('Account management verified API contracts', () => {
  let http: HttpTestingController;
  let main: AccountRelationshipsService;
  let sweeps: GuaranteeSweepsService;
  let planned: PlannedAccountsService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ] });
    http = TestBed.inject(HttpTestingController);
    main = TestBed.inject(AccountRelationshipsService);
    sweeps = TestBed.inject(GuaranteeSweepsService);
    planned = TestBed.inject(PlannedAccountsService);
  });
  afterEach(() => http.verify());
  it('uses the Main envelope and preserves an empty relationship', () => {
    main.main(7).subscribe((data) => expect(data.relationships).toEqual([]));
    http.expectOne('/savings/account-relationships/clients/7/main').flush('{"clientId":7,"relationships":[]}');
  });
  it('rejects a relationship for another customer', () => {
    const error = jest.fn();
    main.main(7).subscribe({ error });
    http
      .expectOne('/savings/account-relationships/clients/7/main')
      .flush('{"clientId":7,"relationships":[{"clientId":8}]}');
    expect(error).toHaveBeenCalled();
  });
  it('binds only savingsAccountId and never retries a conflict', () => {
    const error = jest.fn();
    main.bind(7, 18).subscribe({ error });
    const req = http.expectOne('/savings/account-relationships/clients/7/main');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ savingsAccountId: 18 });
    req.flush('{}', { status: 409, statusText: 'Conflict' });
    expect(error).toHaveBeenCalledTimes(1);
  });
  it('rejects invalid identifiers before HTTP', () => {
    expect(() => main.bind(7, 0)).toThrow();
    expect(() => main.main(NaN)).toThrow();
    expect(() => main.native(7, -1)).toThrow();
  });
  it('retains exact native money and verifies customer and account identity', () => {
    main.native(7, 18).subscribe((data) => expect(data.summary.accountBalance).toBe('9999999999999.123456'));
    const req = http.expectOne('/savingsaccounts/18');
    expect(req.request.context.get(ACCOUNT_MANAGEMENT_REQUEST)).toBe(true);
    req.flush('{"id":18,"clientId":7,"summary":{"accountBalance":9999999999999.123456}}');
    const error = jest.fn();
    main.native(7, 18).subscribe({ error });
    http.expectOne('/savingsaccounts/18').flush('{"id":18,"clientId":8}');
    expect(error).toHaveBeenCalled();
  });
  it('uses afterId and limit on Main history', () => {
    main.audit(7, 12).subscribe();
    const req = http.expectOne((r) => r.url.endsWith('/audit'));
    expect(req.request.params.get('afterId')).toBe('12');
    expect(req.request.params.get('limit')).toBe('25');
    req.flush('[]');
  });
  it('reads live capabilities from all three templates', () => {
    main.template().subscribe();
    sweeps.template().subscribe();
    planned.template().subscribe();
    for (const path of [
      'account-relationships',
      'guarantee-sweeps',
      'planned-savings'
    ]) http.expectOne('/savings/' + path + '/template').flush('{}');
  });
  it('paginates source and loan diagnostic IDs independently', () => {
    sweeps.sources(7, 18).subscribe();
    sweeps.loans(7, 31).subscribe();
    for (const [
      kind,
      cursor
    ] of [
      [
        'sources',
        '18'
      ],
      [
        'loans',
        '31'
      ]
    ]) {
      const req = http.expectOne((r) => r.url.endsWith('/' + kind));
      expect(req.request.params.get('afterId')).toBe(cursor);
      req.flush('[]');
    }
  });
  it('sends exact preview query amounts without a financial POST', () => {
    sweeps.preview(7, 31, 18, '9999999999999.12', 2).subscribe((data) => {
      expect(data.availableGuaranteeFunds).toBeNull();
      expect(data.nativeWithdrawableBalance).toBe('9999999999999.12');
    });
    const req = http.expectOne((r) => r.url.endsWith('/loans/31/preview'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('amount')).toBe('9999999999999.12');
    req.flush(
      '{"clientId":7,"loanId":31,"savingsAccountId":18,"availableGuaranteeFunds":null,"nativeWithdrawableBalance":9999999999999.12,"state":"BLOCKED_PENDING_POLICY"}'
    );
  });
  it.each([
    '0',
    '-1',
    '1e3',
    '1.001',
    'Infinity',
    '1,00',
    '10000000000000'
  ])('rejects invalid preview %s', (value) => {
    expect(() => sweeps.preview(7, 31, 18, value, 2)).toThrow();
  });
  it.each([
    409,
    422
  ])('preserves preview rejection %s without retry or success', (status) => {
    const error = jest.fn();
    sweeps.preview(7, 31, 18, '1.00', 2).subscribe({ error });
    http.expectOne((r) => r.url.endsWith('/preview')).flush('{}', { status, statusText: 'Rejected' });
    expect(error).toHaveBeenCalledTimes(1);
  });
  it('uses persisted execution and reconciliation URLs', () => {
    sweeps.execution(7, 31, 'execution-1').subscribe();
    sweeps.reconciliation(7, 31, 'execution-1').subscribe();
    http
      .expectOne('/savings/guarantee-sweeps/clients/7/loans/31/executions/execution-1')
      .flush('{"id":"execution-1","clientId":7,"loanId":31}');
    http
      .expectOne('/savings/guarantee-sweeps/clients/7/loans/31/executions/execution-1/reconciliation')
      .flush('{"executionId":"execution-1"}');
  });
  it('reads audit, allocations and blocked release status', () => {
    sweeps.audit(7, 31, 2).subscribe();
    sweeps.allocations(7, 31, 8).subscribe();
    sweeps.releaseStatus(7, 31).subscribe();
    for (const suffix of [
      'audit',
      'allocations',
      'release-status'
    ]) http.expectOne((r) => r.url.endsWith('/' + suffix)).flush(suffix === 'release-status' ? '{}' : '[]');
  });
  const uuid = 'd4a2587e-564a-4bb8-92f8-ad15ded9a400';
  it('reads contribution revision and sequence rather than inventing offset paging', () => {
    planned.contributions(7, { id: uuid, revision: 3 } as Arrangement, 25).subscribe();
    const req = http.expectOne((r) => r.url.endsWith('/contributions'));
    expect(req.request.params.get('revision')).toBe('3');
    expect(req.request.params.get('afterSequence')).toBe('25');
    req.flush('[]');
  });
  it('reads arrangements with a UUID cursor and rejects cross-customer data', () => {
    const error = jest.fn();
    planned.arrangements(7, uuid).subscribe({ error });
    const req = http.expectOne((r) => r.url.endsWith('/arrangements'));
    expect(req.request.params.get('afterId')).toBe(uuid);
    req.flush('[{"clientId":8}]');
    expect(error).toHaveBeenCalled();
  });
  it('preserves independent pocket native balances and verifies native identity', () => {
    planned.pockets(7).subscribe((rows) =>
      expect(rows.map((row) => row.nativeAccount.balance)).toEqual([
        '10.25',
        '52.10'
      ])
    );
    http
      .expectOne((r) => r.url.endsWith('/pockets'))
      .flush(
        '[{"clientId":7,"savingsAccountId":18,"nativeAccount":{"clientId":7,"savingsAccountId":18,"balance":10.25}},{"clientId":7,"savingsAccountId":19,"nativeAccount":{"clientId":7,"savingsAccountId":19,"balance":52.10}}]'
      );
    const error = jest.fn();
    planned.pockets(7).subscribe({ error });
    http
      .expectOne((r) => r.url.endsWith('/pockets'))
      .flush('[{"clientId":7,"savingsAccountId":18,"nativeAccount":{"clientId":7,"savingsAccountId":19}}]');
    expect(error).toHaveBeenCalled();
  });
  it('keeps native-linked account ownership checks on BE-10 snapshots', () => {
    const error = jest.fn();
    planned.native(7, 18).subscribe({ error });
    http.expectOne('/savings/planned-savings/clients/7/accounts/18').flush('{"clientId":8,"savingsAccountId":18}');
    expect(error).toHaveBeenCalled();
  });
  it('sends pocket naming metadata with the original revision and immutable Main identity', () => {
    const row = {
      clientId: 7,
      savingsAccountId: 18,
      mainSavingsAccountId: 20,
      revision: 4,
      policyVersion: 2,
      mainPolicyVersion: 3,
      relationshipStatus: 'LINKED'
    } as Pocket;
    planned.savePocket(7, row, 'Holiday').subscribe();
    const req = http.expectOne('/savings/planned-savings/clients/7/pockets/18');
    expect(req.request.body).toEqual({
      expectedRevision: 4,
      mainSavingsAccountId: 20,
      policyVersion: 2,
      mainPolicyVersion: 3,
      name: 'Holiday'
    });
    req.flush('{"clientId":7}');
    expect(() => planned.savePocket(7, row, ' bad ')).toThrow();
    expect(() => planned.savePocket(8, row, 'Holiday')).toThrow();
  });
  it('serializes contribution money as an exact numeric token', () => {
    planned.saveArrangement(7, uuid, 0, { contributionAmount: '9999999999999.123456' } as never).subscribe();
    const req = http.expectOne('/savings/planned-savings/clients/7/arrangements/' + uuid);
    expect(req.request.body).toContain('"contributionAmount":9999999999999.123456');
    req.flush('{"clientId":7}');
  });
  it('links only existing native identity and reads maturity, closure and snake-case audit', () => {
    planned.linkNative(7, { id: uuid, clientId: 7, revision: 2 } as Arrangement, 18).subscribe();
    const link = http.expectOne((r) => r.url.endsWith('/native-account'));
    expect(link.request.body).toEqual({ expectedRevision: 2, savingsAccountId: 18 });
    link.flush('{"clientId":7}');
    planned.maturity(7, uuid).subscribe();
    planned.closure(7, 18).subscribe();
    planned.history(7, 'pockets', 18, 5).subscribe((rows) => expect(rows[0].actor_id).toBe(9));
    http.expectOne((r) => r.url.endsWith('/maturity')).flush('{}');
    http.expectOne((r) => r.url.endsWith('/closure-eligibility')).flush('{}');
    http.expectOne((r) => r.url.endsWith('/audit')).flush('[{"id":6,"actor_id":9}]');
  });
  it('validates positive client scope through the shared API', () => {
    expect(() => TestBed.inject(AccountManagementApi).client('/test', 0)).toThrow();
  });
});
