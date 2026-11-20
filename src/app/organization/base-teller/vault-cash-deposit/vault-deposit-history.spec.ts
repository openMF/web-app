/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { canReadVaultHistory } from './vault-cash-deposit.guard';
import { VaultDepositHistoryComponent } from './vault-deposit-history.component';
import { VaultDepositDetailDialogComponent } from './vault-deposit-detail-dialog.component';
import {
  VaultDepositDetail,
  VaultDepositHistoryItem,
  VaultDepositHistoryResponse,
  vaultAttemptStatusLabel,
  vaultBlockerLabel
} from './vault-deposit-history.models';
import { VaultDepositHistoryService, vaultHistoryErrorKey } from './vault-deposit-history.service';

const path = '/v2/base-teller/vault-cash-deposits';
const reference = 'VDA-12345678-1234-1234-1234-123456789abc';
const permissions = [
  'READ_BASE_TELLER_CASH_INVENTORY',
  'READ_BASE_TELLER_TRANSACTION_HISTORY'
];
// Synthetic BLOCKED data is confined to mocked unit tests, never the runtime UI.
const item: VaultDepositHistoryItem = {
  attemptReference: reference,
  recordKind: 'DEPOSIT_ATTEMPT',
  status: 'BLOCKED',
  operationType: 'VAULT_CASH_DEPOSIT',
  branch: { id: 8, name: 'Original synthetic branch' },
  vault: { key: 'VAULT:8', officeId: 8, name: 'Original synthetic vault', status: 'UNKNOWN' },
  businessDate: '2026-10-29',
  createdAt: '2026-10-29T12:00:00Z',
  currencies: [{ currencyCode: 'USD', decimalPlaces: 2, proposedCash: '200.03' }],
  receiptEligibility: { eligible: false, reason: 'NOT_POSTED' },
  permittedActions: [
    'VIEW_DETAILS',
    'VIEW_AUDIT'
  ]
};
const page: VaultDepositHistoryResponse = { items: [item], totalFilteredRecords: 1, offset: 0, limit: 25 };
const detail: VaultDepositDetail = {
  recordKind: 'DEPOSIT_ATTEMPT',
  receiptEligibility: item.receiptEligibility,
  permittedActions: item.permittedActions,
  attempt: {
    attemptReference: reference,
    operationType: item.operationType,
    status: 'BLOCKED',
    branch: item.branch,
    vault: item.vault,
    businessDate: item.businessDate,
    createdAt: item.createdAt,
    initiatedBy: 15,
    accountingStatus: 'NOT_POSTED',
    executionAllowed: false,
    blockers: [{ code: 'APPROVAL_POLICY_UNAVAILABLE', message: 'raw diagnostic must not display' }],
    currencies: [
      {
        currencyCode: 'USD',
        decimalPlaces: 2,
        banknotes: [{ denominationId: 'old-note', value: '100.00', quantity: 2, subtotal: '200.00' }],
        coins: [{ denominationId: 'old-coin', value: '0.01', quantity: 3, subtotal: '0.03' }],
        banknotesTotal: '200.00',
        coinsTotal: '0.03',
        totalCash: '200.03',
        generalTransaction: {
          perspective: 'VAULT',
          inflows: { cash: '200.03', checks: { supported: false }, vouchers: { supported: false } },
          outflows: { cash: '0.00', checks: { supported: false }, vouchers: { supported: false } }
        }
      }
    ]
  }
};
const evidence = {
  attemptReference: reference,
  events: [
    {
      eventId: reference,
      eventType: 'BLOCKED_ATTEMPT_RECORDED',
      actorId: 15,
      timestamp: item.createdAt,
      newState: 'BLOCKED'
    }
  ]
};
const localeRoot = resolve(__dirname, '../../../../assets/translations');

describe('Vault deposit history and detail (mocked HTTP)', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<VaultDepositHistoryComponent | VaultDepositDetailDialogComponent> | undefined;
  let authenticated: boolean;
  let granted: string[];
  beforeEach(async () => {
    authenticated = true;
    granted = [...permissions];
    fixture = undefined;
    await TestBed.configureTestingModule({
      imports: [
        VaultDepositHistoryComponent,
        VaultDepositDetailDialogComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: AuthenticationService,
          useValue: { isAuthenticated: () => authenticated, getCredentials: () => ({ permissions: granted }) }
        },
        { provide: MAT_DIALOG_DATA, useValue: { reference } },
        { provide: MatDialogRef, useValue: { close: jest.fn() } }
      ]
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', JSON.parse(readFileSync(resolve(localeRoot, 'en-US.json'), 'utf8')));
    translate.use('en-US');
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    fixture?.destroy();
    http.verify();
  });
  function history() {
    const f = TestBed.createComponent(VaultDepositHistoryComponent);
    fixture = f;
    f.detectChanges();
    return f;
  }
  function details(value: VaultDepositDetail = detail, audit = true) {
    const f = TestBed.createComponent(VaultDepositDetailDialogComponent);
    fixture = f;
    f.detectChanges();
    http.expectOne(path + '/' + reference).flush(value);
    if (audit) http.expectOne(path + '/' + reference + '/audit').flush(evidence);
    f.detectChanges();
    return f;
  }
  function search() {
    return http.expectOne((request) => request.url === path + '/history');
  }
  function text() {
    return fixture!.nativeElement.textContent as string;
  }

  it('loads a server page and labels amounts and references as attempts, without success', () => {
    const f = history();
    expect(f.componentInstance.loading()).toBe(true);
    const request = search();
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('offset')).toBe('0');
    expect(request.request.params.get('limit')).toBe('25');
    request.flush(page);
    f.detectChanges();
    for (const value of [
      'Deposit Attempt Reference',
      reference,
      'Proposed Cash',
      '200.03',
      'Blocked — Not Posted',
      'not completed financial transactions'
    ]) expect(text()).toContain(value);
    expect(text()).not.toContain('vaultDeposit.');
    expect(text()).not.toContain('Successfully Completed');
    expect(f.componentInstance.loading()).toBe(false);
  });
  it('uses database pagination and keeps each currency separate', () => {
    const f = history();
    search().flush(page);
    f.componentInstance.changePage({ pageIndex: 2, pageSize: 10, length: 100 });
    const request = search();
    expect(request.request.params.get('offset')).toBe('20');
    expect(request.request.params.get('limit')).toBe('10');
    request.flush({ ...page, items: [{ ...item, currencies: [
            ...item.currencies,
            { currencyCode: 'JPY', decimalPlaces: 0, proposedCash: '1000' }
          ] }] });
    f.detectChanges();
    expect(text()).toContain('JPY 1,000');
    expect(text()).not.toContain('1,200.03');
  });
  it('keeps the paginator mounted and focused during and after a page request', () => {
    const f = history();
    search().flush({ ...page, totalFilteredRecords: 75 });
    f.detectChanges();
    const paginator = f.nativeElement.querySelector('mat-paginator');
    const table = f.nativeElement.querySelector('table');
    const next = paginator.querySelector('.mat-mdc-paginator-navigation-next') as HTMLButtonElement;
    next.focus();
    expect(document.activeElement).toBe(next);
    next.click();
    const request = search();
    expect(request.request.params.get('offset')).toBe('25');
    f.detectChanges();
    expect(f.componentInstance.loading()).toBe(true);
    expect(f.nativeElement.querySelector('mat-paginator')).toBe(paginator);
    expect(f.nativeElement.querySelector('table')).toBe(table);
    expect(document.activeElement).toBe(next);

    const nextReference = 'VDA-87654321-4321-4321-4321-cba987654321';
    request.flush({
      ...page,
      offset: 25,
      totalFilteredRecords: 75,
      items: [{ ...item, attemptReference: nextReference }]
    });
    f.detectChanges();
    expect(f.componentInstance.loading()).toBe(false);
    expect(f.nativeElement.querySelector('mat-paginator')).toBe(paginator);
    expect(document.activeElement).toBe(next);
    expect(text()).toContain(nextReference);
  });
  it('maps only actual filters, resets pagination and normalizes historical currency', () => {
    const f = history();
    search().flush(page);
    f.componentInstance.pageIndex = 3;
    f.componentInstance.filtersForm.setValue({
      fromDate: '2026-01-01',
      toDate: '2026-10-30',
      officeId: '8',
      vaultKey: 'VAULT:8',
      currencyCode: 'usd',
      status: 'BLOCKED',
      reference
    });
    f.componentInstance.applyFilters();
    const request = search();
    expect(
      Object.fromEntries(
        request.request.params.keys().map((key) => [
          key,
          request.request.params.get(key)
        ])
      )
    ).toEqual({
      fromDate: '2026-01-01',
      toDate: '2026-10-30',
      officeId: '8',
      vaultKey: 'VAULT:8',
      currencyCode: 'USD',
      status: 'BLOCKED',
      reference,
      offset: '0',
      limit: '25'
    });
    request.flush(page);
    expect(f.componentInstance.pageIndex).toBe(0);
  });
  it.each([
    { fromDate: '2026-10-30', toDate: '2026-01-01' },
    { fromDate: '2026-02-30' },
    { officeId: '0' },
    { vaultKey: 'VAULT:0' },
    { officeId: '8', vaultKey: 'VAULT:9' },
    { currencyCode: 'US' },
    { reference: 'wildcard*' }
  ])('rejects invalid filters without HTTP: %j', (filters) => {
    const f = history();
    search().flush(page);
    f.componentInstance.filtersForm.patchValue(filters);
    f.componentInstance.applyFilters();
    expect(f.componentInstance.filtersForm.invalid).toBe(true);
    http.expectNone(path + '/history');
  });
  it('cancels stale searches and retains only the latest response', () => {
    const f = history();
    const first = search();
    f.componentInstance.resetFilters();
    expect(first.cancelled).toBe(true);
    search().flush({ ...page, items: [], totalFilteredRecords: 0 });
    f.detectChanges();
    expect(text()).toContain('No vault deposit attempts match');
    expect(f.componentInstance.loading()).toBe(false);
  });
  it('reset clears applied filters and errors', () => {
    const f = history();
    search().flush({}, { status: 500, statusText: 'Unavailable' });
    f.componentInstance.filtersForm.patchValue({ currencyCode: 'USD' });
    f.componentInstance.applyFilters();
    search().flush(page);
    f.componentInstance.resetFilters();
    const request = search();
    expect(request.request.params.has('currencyCode')).toBe(false);
    request.flush(page);
    expect(f.componentInstance.error()).toBe('');
  });
  it.each([
    401,
    403,
    404,
    400,
    500,
    0
  ])('renders safe HTTP %s failures, without raw diagnostics or stale history', (status) => {
    const f = history();
    search().flush(page);
    f.detectChanges();
    expect(f.nativeElement.querySelector('table')).toBeTruthy();
    f.componentInstance.refresh();
    search().flush({ developerMessage: 'SQL secret' }, { status, statusText: 'failure' });
    f.detectChanges();
    expect(f.componentInstance.error()).toBeTruthy();
    expect(f.componentInstance.page()).toBeNull();
    expect(f.componentInstance.loading()).toBe(false);
    expect(text()).not.toContain('SQL secret');
    expect(text()).not.toContain('vaultDeposit.');
  });
  it.each(
    [
      [],
      ['READ_BASE_TELLER_TRANSACTION_HISTORY'],
      ['READ_BASE_TELLER_CASH_INVENTORY']
    ].map((rights) => [rights])
  )('requires both permissions before any data access: %j', (rights) => {
    granted = rights;
    const f = history();
    expect(f.componentInstance.error()).toBe('vaultDeposit.errors.forbidden');
    http.expectNone(() => true);
  });
  it('requires authentication before history access', () => {
    authenticated = false;
    history();
    http.expectNone(() => true);
    expect(text()).toContain('session has expired');
  });
  it.each([
    false,
    true
  ])('clears previously loaded history when access is revoked (authenticated=%s)', (signedIn) => {
    const f = history();
    search().flush(page);
    f.detectChanges();
    expect(f.nativeElement.querySelector('mat-paginator')).toBeTruthy();
    authenticated = signedIn;
    granted = [];
    f.componentInstance.refresh();
    f.detectChanges();
    expect(f.componentInstance.page()).toBeNull();
    expect(f.nativeElement.querySelector('table')).toBeNull();
    expect(f.nativeElement.querySelector('mat-paginator')).toBeNull();
    expect(f.componentInstance.error()).toBe(
      signedIn ? 'vaultDeposit.errors.forbidden' : 'vaultDeposit.errors.unauthenticated'
    );
    http.expectNone(() => true);
  });
  it('respects permitted details actions and opens the real persisted reference', () => {
    const f = history();
    search().flush(page);
    const open = jest.spyOn(TestBed.inject(MatDialog), 'open').mockReturnValue({} as MatDialogRef<unknown>);
    f.componentInstance.openDetail({ ...item, permittedActions: [] });
    expect(open).not.toHaveBeenCalled();
    f.componentInstance.openDetail(item);
    expect(open).toHaveBeenCalledWith(
      VaultDepositDetailDialogComponent,
      expect.objectContaining({ data: { reference } })
    );
  });
  it('renders original snapshot denominations and actor, without catalog requests or transaction identity', () => {
    details();
    for (const value of [
      'Original synthetic branch',
      reference,
      '200.03',
      '0.03',
      '100.00',
      'Initiating Staff ID',
      'Not Posted',
      'maker-checker'
    ]) expect(text()).toContain(value);
    expect(text()).not.toContain('raw diagnostic');
    expect(text()).not.toContain('vaultDeposit.');
    http.expectNone((request) => request.url.includes('/denominations') || request.method === 'POST');
  });
  it('orders returned audit events chronologically without inserting events', () => {
    const f = TestBed.createComponent(VaultDepositDetailDialogComponent);
    fixture = f;
    f.detectChanges();
    http.expectOne(path + '/' + reference).flush(detail);
    http.expectOne(path + '/' + reference + '/audit').flush({
      ...evidence,
      events: [
        { ...evidence.events[0], eventId: 'later', timestamp: '2026-10-29T13:00:00Z' },
        { ...evidence.events[0], eventId: 'earlier', timestamp: '2026-10-29T11:00:00Z' }
      ]
    });
    f.detectChanges();
    expect(f.componentInstance.audit()?.events.map((event) => event.eventId)).toEqual([
      'earlier',
      'later'
    ]);
    expect(f.nativeElement.querySelectorAll('.timeline li')).toHaveLength(2);
  });
  it('does not fetch audit without its backend permitted action', () => {
    details({ ...detail, permittedActions: ['VIEW_DETAILS'] }, false);
    http.expectNone(path + '/' + reference + '/audit');
    expect(text()).toContain('Permission Denied');
  });
  it('rejects an audit response for a different reference', () => {
    const f = TestBed.createComponent(VaultDepositDetailDialogComponent);
    fixture = f;
    f.detectChanges();
    http.expectOne(path + '/' + reference).flush(detail);
    http.expectOne(path + '/' + reference + '/audit').flush({ ...evidence, attemptReference: 'another' });
    expect(f.componentInstance.audit()).toBeNull();
    expect(f.componentInstance.auditError()).toBeTruthy();
  });
  it('allows retry of an unavailable audit without losing persisted detail', () => {
    const f = TestBed.createComponent(VaultDepositDetailDialogComponent);
    fixture = f;
    f.detectChanges();
    http.expectOne(path + '/' + reference).flush(detail);
    http.expectOne(path + '/' + reference + '/audit').flush({}, { status: 500, statusText: 'failure' });
    expect(f.componentInstance.detail()).toEqual(detail);
    f.componentInstance.loadAudit();
    http.expectOne(path + '/' + reference + '/audit').flush(evidence);
    expect(f.componentInstance.auditError()).toBe('');
  });
  it('checks the actual receipt endpoint once and renders authoritative NOT_POSTED denial', () => {
    const f = details();
    f.componentInstance.checkReceipt();
    f.componentInstance.checkReceipt();
    const request = http.expectOne(path + '/' + reference + '/receipt');
    expect(request.request.method).toBe('GET');
    request.flush(
      { userMessageGlobalisationCode: 'error.msg.base.teller.vault.receipt.not_posted' },
      { status: 409, statusText: 'Conflict' }
    );
    f.detectChanges();
    expect(f.componentInstance.receiptLoading()).toBe(false);
    expect(text()).toContain('Receipt unavailable');
    expect(f.nativeElement.querySelectorAll('button[disabled]')).toHaveLength(1);
    http.expectNone(() => true);
  });
  it('handles unauthorized receipt lookup without disclosing diagnostics', () => {
    const f = details();
    f.componentInstance.checkReceipt();
    http
      .expectOne(path + '/' + reference + '/receipt')
      .flush({ developerMessage: 'private metadata' }, { status: 403, statusText: 'Forbidden' });
    f.detectChanges();
    expect(text()).toContain('Permission Denied');
    expect(text()).not.toContain('private metadata');
  });
  it('never treats HTTP 200 as an implemented completed receipt', () => {
    const f = details();
    const print = jest.spyOn(window, 'print').mockImplementation(() => undefined);
    f.componentInstance.checkReceipt();
    http.expectOne(path + '/' + reference + '/receipt').flush({ unexpected: true });
    f.detectChanges();
    expect(text()).toContain('unsupported receipt representation');
    expect(print).not.toHaveBeenCalled();
    print.mockRestore();
  });
  it.each([
    'POSTED',
    'PENDING_APPROVAL',
    'REJECTED',
    'FAILED',
    'UNKNOWN'
  ])('rejects unsupported %s detail without inventing a transaction or receipt', (status) => {
    const f = details({ ...detail, attempt: { ...detail.attempt, status: status as 'BLOCKED' } }, false);
    expect(f.componentInstance.detail()).toBeNull();
    expect(f.componentInstance.error()).toBeTruthy();
    http.expectNone(() => true);
  });
  it('cancels detail reads when the dialog is destroyed', () => {
    const f = TestBed.createComponent(VaultDepositDetailDialogComponent);
    fixture = f;
    f.detectChanges();
    const request = http.expectOne(path + '/' + reference);
    f.destroy();
    fixture = undefined;
    expect(request.cancelled).toBe(true);
  });
  it('preserves six decimal monetary tokens in history and details', () => {
    const service = TestBed.inject(VaultDepositHistoryService);
    let value: unknown;
    service.search().subscribe((result) => (value = result.items[0].currencies[0].proposedCash));
    search().flush('{"items":[{"currencies":[{"proposedCash":9999999999.123456}]}]}');
    expect(value).toBe('9999999999.123456');
    service.getDetail(reference).subscribe((result) => (value = result.attempt.currencies[0].totalCash));
    http.expectOne(path + '/' + reference).flush('{"attempt":{"currencies":[{"totalCash":9999999999.123456}]}}');
    expect(value).toBe('9999999999.123456');
  });
  it('encodes references as a single path component', () => {
    TestBed.inject(VaultDepositHistoryService).getDetail('bad/ref?x=1').subscribe();
    http.expectOne(path + '/bad%2Fref%3Fx%3D1').flush({});
  });
  it('covers every new label in all supported locales', () => {
    const source = [
      'vault-deposit-history.component.html',
      'vault-deposit-detail-dialog.component.html',
      'vault-deposit-breakdown.component.html',
      'vault-transaction-preview-dialog.component.html'
    ]
      .map((name) => readFileSync(resolve(__dirname, name), 'utf8'))
      .join('');
    const keys = [
      ...source.matchAll(/'((?:vaultDeposit|cashAllocation|cashInventory|cashExchange|labels)\.[A-Za-z.]+)'/g)
    ]
      .map((match) => match[1])
      .filter((key) => !key.endsWith('.'));
    for (const locale of readdirSync(localeRoot).filter((name) => name.endsWith('.json'))) {
      const values = JSON.parse(readFileSync(resolve(localeRoot, locale), 'utf8'));
      for (const key of keys)
        expect(key.split('.').reduce((node, part) => node?.[part], values)).toEqual(expect.any(String));
    }
  });
});

describe('Vault backend lifecycle and authorization labels', () => {
  it.each(
    [
      permissions,
      ['ALL_FUNCTIONS'],
      ['ALL_FUNCTIONS_READ']
    ].map((rights) => [rights])
  )('allows both permissions or backend read wildcards: %j', (rights) =>
    expect(canReadVaultHistory(rights)).toBe(true)
  );
  it('never calls unsupported lifecycle states posted', () => {
    expect(vaultAttemptStatusLabel('POSTED')).toBe('vaultDeposit.history.unknownStatus');
    expect(vaultAttemptStatusLabel('BLOCKED')).toBe('vaultDeposit.history.blocked');
  });
  it('maps approval, source and accounting blockers to safe text', () => {
    expect(vaultBlockerLabel('APPROVAL_POLICY_UNAVAILABLE')).toBe('vaultDeposit.confirmation.approvalPolicy');
    expect(vaultBlockerLabel('POSTING_MODEL_UNAVAILABLE')).toBe('vaultDeposit.confirmation.postingModel');
    expect(vaultBlockerLabel('unknown')).toBe('vaultDeposit.preview.missingPolicy');
  });
  it('keeps malformed text errors safe', () =>
    expect(vaultHistoryErrorKey(new HttpErrorResponse({ status: 409, error: 'SQL stack' }))).toBe(
      'vaultDeposit.history.errors.unavailable'
    ));
});
