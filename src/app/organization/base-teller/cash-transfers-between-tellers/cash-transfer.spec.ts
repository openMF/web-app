/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { CashTransferService } from './cash-transfer.service';
import { CashTransfersBetweenTellersComponent } from './cash-transfers-between-tellers.component';
import {
  CashTransferContext,
  CashTransferRecord,
  CashTransferRequest,
  PendingCashTransfer,
  isBalanced,
  isCompletedTransfer
} from './cash-transfer.models';
import { cashTransferGuard } from './cash-transfer.guard';
import { cashTransferError, hasCashTransferError } from './cash-transfer-error';
import en from '../../../../assets/translations/en-US.json';
const source = {
  cashierId: 1,
  staffId: 11,
  cashierName: 'Source',
  tellerId: 4,
  tellerName: 'Teller',
  officeId: 3,
  officeName: 'Office',
  closed: false
};
const destination = { ...source, cashierId: 2, staffId: 12, cashierName: 'Destination' };
const context: CashTransferContext = {
  businessDate: '2026-10-16',
  source,
  destinations: [destination],
  permissions: [
    'READ_BASE_TELLER_CASH_TRANSFER',
    'CREATE_BASE_TELLER_CASH_TRANSFER',
    'REPRINT_BASE_TELLER_CASH_TRANSFER'
  ],
  currencies: [
    {
      currencyCode: 'AAA',
      decimalPlaces: 2,
      denominations: [
        {
          denominationId: 'note',
          denominationType: 'BANKNOTE',
          denominationValue: '0.10',
          currencyCode: 'AAA',
          availableQuantity: 4
        },
        {
          denominationId: 'coin',
          denominationType: 'COIN',
          denominationValue: '0.05',
          currencyCode: 'AAA',
          availableQuantity: 5
        }
      ]
    },
    {
      currencyCode: 'BBB',
      decimalPlaces: 0,
      denominations: [
        {
          denominationId: 'other',
          denominationType: 'BANKNOTE',
          denominationValue: '50',
          currencyCode: 'BBB',
          availableQuantity: 3
        }
      ]
    }
  ]
};
const request: CashTransferRequest = {
  destinationCashierId: 2,
  currencies: [{ currencyCode: 'AAA', denominations: [{ denominationId: 'note', quantity: 1 }] }]
};
const preview: CashTransferRecord = {
  source,
  destination,
  businessDate: context.businessDate,
  operation: 'CASH_TRANSFER_BETWEEN_TELLERS',
  status: 'PREVIEW',
  createdBy: 8,
  createdByUsername: 'teller',
  balanced: true,
  inflowsByCurrency: [{ currencyCode: 'AAA', amount: '0.10' }],
  outflowsByCurrency: [{ currencyCode: 'AAA', amount: '0.10' }],
  currencies: [
    {
      currencyCode: 'AAA',
      decimalPlaces: 2,
      total: '0.10',
      denominations: [
        { denominationId: 'note', denominationType: 'BANKNOTE', denominationValue: '0.10', quantity: 1, amount: '0.10' }
      ]
    }
  ]
};
const completed: CashTransferRecord = {
  ...preview,
  id: 9,
  reference: 'CT-test',
  status: 'COMPLETED',
  completedAt: '2026-10-16T10:00:00Z'
};
beforeEach(() => {
  Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: () => 'test-stable-key' });
});
const auth = { getCredentials: () => ({ userId: 8, permissions: ['ALL_FUNCTIONS'] }) };
describe('cash transfer HTTP and recovery contract', () => {
  let service: CashTransferService;
  let http: HttpTestingController;
  beforeEach(() => {
    const storage = new Map<string, string>();
    (sessionStorage.getItem as jest.Mock).mockImplementation((key: string) => storage.get(key) ?? null);
    (sessionStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => storage.set(key, value));
    (sessionStorage.removeItem as jest.Mock).mockImplementation((key: string) => storage.delete(key));
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthenticationService, useValue: auth }
      ] });
    service = TestBed.inject(CashTransferService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('loads exact context and preserves decimal tokens', () => {
    service.context().subscribe((value) => expect(value.currencies[0].denominations[0].denominationValue).toBe('0.10'));
    http.expectOne('/v2/base-teller/cash-transfers/context').flush(JSON.stringify(context).replace('"0.10"', '0.10'));
  });
  it('sends quantities only to preview and create', () => {
    service.preview(request).subscribe();
    const pre = http.expectOne('/v2/base-teller/cash-transfers/preview');
    expect(pre.request.body).toEqual(request);
    pre.flush(JSON.stringify(preview));
    const final = { ...request, idempotencyKey: 'stable-key' };
    service.create(final).subscribe();
    const post = http.expectOne('/v2/base-teller/cash-transfers');
    expect(post.request.body).toEqual(final);
    post.flush(JSON.stringify(completed));
  });
  it('retrieves historical details and receipt', () => {
    service.retrieve(9).subscribe();
    http.expectOne('/v2/base-teller/cash-transfers/9').flush(JSON.stringify(completed));
    service.receipt(9).subscribe();
    http.expectOne('/v2/base-teller/cash-transfers/9/receipt').flush(JSON.stringify(completed));
  });
  it('persists a stable request across service reconstruction, scoped by user and server', () => {
    const pending = { request: { ...request, idempotencyKey: 'stable-key' }, preview };
    service.remember(pending);
    expect(TestBed.runInInjectionContext(() => new CashTransferService()).pending).toEqual(pending);
    localStorage.setItem('mifosXServerURL', 'another-server');
    expect(service.pending).toBeUndefined();
    localStorage.removeItem('mifosXServerURL');
    expect(service.pending).toEqual(pending);
    service.clearPending();
    expect(service.pending).toBeUndefined();
  });
});
describe('cash transfer workflow', () => {
  let component: CashTransfersBetweenTellersComponent;
  let service: {
    context: jest.Mock;
    preview: jest.Mock;
    create: jest.Mock;
    remember: jest.Mock;
    clearPending: jest.Mock;
    retrieve: jest.Mock;
    receipt: jest.Mock;
    pending?: PendingCashTransfer;
  };
  beforeEach(() => {
    service = {
      context: jest.fn(() => of(JSON.parse(JSON.stringify(context)) as CashTransferContext)),
      preview: jest.fn(() => of(preview)),
      create: jest.fn(() => of(completed)),
      remember: jest.fn(),
      clearPending: jest.fn(),
      retrieve: jest.fn(() => of(completed)),
      receipt: jest.fn(() => of(completed))
    };
    TestBed.configureTestingModule({ providers: [
        FormBuilder,
        provideRouter([]),
        { provide: CashTransferService, useValue: service },
        { provide: AuthenticationService, useValue: auth },
        { provide: ActivatedRoute, useValue: { queryParamMap: of(new Map()), snapshot: { queryParamMap: new Map() } } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn(), detectChanges: jest.fn() } }
      ] });
    component = TestBed.runInInjectionContext(() => new CashTransfersBetweenTellersComponent());
    component.ngOnInit();
  });
  function select() {
    component.form.controls.destinationCashierId.setValue(2);
    component.rows[0].quantities.at(0).setValue(1);
  }
  it('loads source identity, eligible destinations, denominations, and currencies', () => {
    expect(component.context?.source).toEqual(source);
    expect(component.destinations).toEqual([destination]);
    expect(component.rows.map((r) => r.currencyCode)).toEqual([
      'AAA',
      'BBB'
    ]);
    expect(component.rows[0].denominations[1].denominationType).toBe('COIN');
  });
  it('blocks no destination, self transfer and forged destinations', () => {
    component.rows[0].quantities.at(0).setValue(1);
    for (const value of [
      null,
      1,
      999
    ]) {
      component.form.controls.destinationCashierId.setValue(value);
      expect(component.canContinue).toBe(false);
    }
  });
  it('excludes closed, same-staff, self and other-office destinations', () => {
    component.context!.destinations.push(
      source,
      { ...destination, closed: true },
      { ...destination, staffId: source.staffId },
      { ...destination, officeId: 999 }
    );
    expect(component.destinations).toEqual([destination]);
  });
  it.each([
    -1,
    0.5,
    5,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1
  ])('blocks invalid or unavailable quantity %s', (q) => {
    select();
    component.rows[0].quantities.at(0).setValue(q);
    component.continue();
    expect(component.canContinue).toBe(false);
    expect(service.preview).not.toHaveBeenCalled();
  });
  it('rejects malformed and empty quantities', () => {
    select();
    component.rows[0].quantities.at(0).setValue('x' as never);
    expect(component.form.invalid).toBe(true);
    component.rows[0].quantities.at(0).setValue(null as never);
    expect(component.form.invalid).toBe(true);
  });
  it('blocks an empty cash selection', () => {
    component.form.controls.destinationCashierId.setValue(2);
    expect(component.canContinue).toBe(false);
  });
  it('calculates exact bills, coins, line and currency totals', () => {
    select();
    component.rows[0].quantities.at(0).setValue(3);
    component.rows[0].quantities.at(1).setValue(2);
    component.rows[1].quantities.at(0).setValue(1);
    expect(component.amount(component.rows[0], 0)).toBe('0.30');
    expect(component.total(component.rows[0], 'BILL')).toBe('0.30');
    expect(component.total(component.rows[0], 'COIN')).toBe('0.10');
    expect(component.total(component.rows[0])).toBe('0.40');
    expect(component.total(component.rows[1])).toBe('50');
  });
  it('previews exact selection without monetary totals or source IDs', () => {
    select();
    component.continue();
    expect(service.preview).toHaveBeenCalledWith(request);
    expect(component.preview).toBe(preview);
    expect(component.step).toBe(2);
    expect(component.rows[0].denominations[0].availableQuantity).toBe(4);
  });
  it('blocks double preview while pending', () => {
    select();
    service.preview.mockReturnValue(new Subject());
    component.continue();
    component.continue();
    expect(service.preview).toHaveBeenCalledTimes(1);
  });
  it('invalidates preview when destination or denomination quantity changes', () => {
    select();
    component.continue();
    component.form.controls.destinationCashierId.setValue(999);
    expect(component.preview).toBeUndefined();
    expect(component.canConfirm).toBe(false);
    component.form.controls.destinationCashierId.setValue(2);
    component.continue();
    component.rows[0].quantities.at(0).setValue(2);
    expect(component.preview).toBeUndefined();
  });
  it('requires a balanced server preview', () => {
    select();
    service.preview.mockReturnValue(of({ ...preview, balanced: false }));
    component.continue();
    component.confirm();
    expect(component.error).toBe('cashTellerTransfer.unbalanced');
    expect(service.create).not.toHaveBeenCalled();
  });
  it('does not confirm before preview', () => {
    select();
    component.confirm();
    expect(service.create).not.toHaveBeenCalled();
  });
  it('prevents double confirmation and refreshes inventory after authoritative completion', () => {
    select();
    component.continue();
    const response = new Subject<CashTransferRecord>();
    service.create.mockReturnValue(response);
    component.confirm();
    component.confirm();
    expect(service.create).toHaveBeenCalledTimes(1);
    expect(service.remember).toHaveBeenCalled();
    response.next(completed);
    response.complete();
    expect(component.result).toBe(completed);
    expect(component.step).toBe(3);
    expect(service.context).toHaveBeenCalledTimes(2);
    expect(service.clearPending).toHaveBeenCalled();
  });
  it('preserves request/key after timeout and retries unchanged without another preview', () => {
    select();
    component.continue();
    service.create.mockReturnValue(throwError(() => ({ status: 0 })));
    component.confirm();
    const original = service.create.mock.calls[0][0];
    component.cancel();
    component.back();
    expect(component.pending?.request).toEqual(original);
    expect(component.error).toBe('cashTellerTransfer.uncertain');
    service.create.mockReturnValue(of(completed));
    component.confirm();
    expect(service.create.mock.calls[1][0]).toBe(original);
    expect(service.preview).toHaveBeenCalledTimes(1);
  });
  it('resumes recovery before loading potentially closed assignments', () => {
    service.pending = { request: { ...request, idempotencyKey: 'saved-key' }, preview };
    component.ngOnInit();
    expect(component.step).toBe(2);
    expect(component.canConfirm).toBe(true);
  });
  it('retains recovery on server failure', () => {
    select();
    component.continue();
    service.create.mockReturnValue(throwError(() => ({ status: 503 })));
    component.confirm();
    expect(component.pending).toBeDefined();
    expect(service.clearPending).not.toHaveBeenCalled();
  });

  it.each([
    403,
    409
  ])('resolves a namespaced idempotency conflict (%s) and requires a new preview', (status) => {
    select();
    component.continue();
    service.create.mockReturnValue(
      throwError(() => ({
        status,
        error: JSON.stringify({
          errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.cash.transfer.idempotency.conflict' }]
        })
      }))
    );
    component.confirm();
    expect(component.error).toBe('cashTellerTransfer.duplicate');
    expect(component.pending).toBeUndefined();
    expect(component.preview).toBeUndefined();
    expect(service.clearPending).toHaveBeenCalledTimes(1);
    expect(service.context).toHaveBeenCalledTimes(2);
    expect(component.form.enabled).toBe(true);
    expect(component.canConfirm).toBe(false);
    component.confirm();
    expect(service.create).toHaveBeenCalledTimes(1);
  });
  it.each([
    0,
    408,
    429,
    500,
    503
  ])('keeps the original request/key for an uncertain HTTP outcome %s', (status) => {
    select();
    component.continue();
    service.create.mockReturnValue(
      throwError(() => ({ status, error: { userMessageGlobalisationCode: 'error.msg.other.idempotency.conflict' } }))
    );
    component.confirm();
    const saved = component.pending;
    component.recoveryReviewed.setValue(true);
    component.discardPending();
    expect(component.pending).toBe(saved);
    expect(service.clearPending).not.toHaveBeenCalled();
    component.confirm();
    expect(service.create.mock.calls[1][0]).toBe(service.create.mock.calls[0][0]);
  });
  it.each([
    undefined,
    'error.msg.other.idempotency.conflict',
    'error.msg.base.teller.cash.transfer.inventory.insufficient',
    'error.msg.base.teller.cash.transfer.idempotency.conflict.extra'
  ])('requires persisted review and acknowledged discard for an unresolved 409 (%s)', (code) => {
    select();
    component.continue();
    component.recoveryReviewed.setValue(true);
    service.create.mockReturnValue(throwError(() => ({ status: 409, error: { userMessageGlobalisationCode: code } })));
    component.confirm();
    const submittedRequest = service.create.mock.calls[0][0];
    expect(component.pending?.request).toBe(submittedRequest);
    expect(component.pending?.request.idempotencyKey).toBe('test-stable-key');
    expect(component.pending?.requiresReview).toBe(true);
    expect(service.remember).toHaveBeenLastCalledWith(component.pending);
    expect(component.recoveryReviewed.value).toBe(false);
    expect(component.canConfirm).toBe(false);
    component.confirm();
    component.cancel();
    component.back();
    component.reload();
    component.discardPending();
    expect(service.create).toHaveBeenCalledTimes(1);
    expect(service.context).toHaveBeenCalledTimes(1);
    expect(service.clearPending).not.toHaveBeenCalled();
    expect(component.pending?.request).toBe(submittedRequest);
    component.recoveryReviewed.setValue(true);
    component.discardPending();
    expect(service.clearPending).toHaveBeenCalledTimes(1);
    expect(component.pending).toBeUndefined();
    expect(component.preview).toBeUndefined();
    expect(component.step).toBe(0);
    expect(component.form.enabled).toBe(true);
    expect(service.context).toHaveBeenCalledTimes(2);
    expect(service.create).toHaveBeenCalledTimes(1);
  });
  it.each([
    'FAILED',
    'PROCESSING',
    'PREVIEW'
  ])('offers persisted review and confirmed discard for unexpected create status %s', (status) => {
    select();
    component.continue();
    service.create.mockReturnValue(of({ ...completed, status }));
    component.confirm();
    expect(component.result).toBeUndefined();
    expect(component.pending?.requiresReview).toBe(true);
    expect(service.remember).toHaveBeenLastCalledWith(expect.objectContaining({ requiresReview: true }));
    const key = component.pending?.request.idempotencyKey;
    component.confirm();
    expect(service.create).toHaveBeenCalledTimes(1);
    component.discardPending();
    expect(component.pending?.request.idempotencyKey).toBe(key);
    expect(service.clearPending).not.toHaveBeenCalled();
    component.recoveryReviewed.setValue(true);
    component.discardPending();
    expect(component.pending).toBeUndefined();
    expect(component.preview).toBeUndefined();
    expect(service.clearPending).toHaveBeenCalledTimes(1);
    expect(component.step).toBe(0);
    expect(component.canConfirm).toBe(false);
    expect(service.context).toHaveBeenCalledTimes(2);
  });
  it('does not accept a malformed COMPLETED create response', () => {
    select();
    component.continue();
    service.create.mockReturnValue(of({ ...completed, inflowsByCurrency: [] }));
    component.confirm();
    expect(component.result).toBeUndefined();
    expect(component.pending?.requiresReview).toBe(true);
    expect(service.clearPending).not.toHaveBeenCalled();
  });
  it('restores review-required recovery with acknowledgement reset', () => {
    service.pending = { request: { ...request, idempotencyKey: 'saved-review-key' }, preview, requiresReview: true };
    component.ngOnInit();
    expect(component.pending?.requiresReview).toBe(true);
    expect(component.recoveryReviewed.value).toBe(false);
    expect(component.canConfirm).toBe(false);
    component.confirm();
    expect(service.create).not.toHaveBeenCalled();
  });
  it('does not lose recovery state when confirmed discard cannot clear storage', () => {
    select();
    component.continue();
    service.create.mockReturnValue(of({ ...completed, status: 'FAILED' }));
    component.confirm();
    service.clearPending.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    component.recoveryReviewed.setValue(true);
    component.discardPending();
    expect(component.pending?.requiresReview).toBe(true);
    expect(component.error).toBe('cashTellerTransfer.storage');
  });
  it('clears preview and refreshes after definitive validation rejection', () => {
    select();
    component.continue();
    service.create.mockReturnValue(
      throwError(() => ({
        status: 403,
        error: {
          errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.cash.transfer.inventory.insufficient' }]
        }
      }))
    );
    component.confirm();
    expect(component.preview).toBeUndefined();
    expect(component.pending).toBeUndefined();
    expect(component.error).toBe('cashTellerTransfer.insufficient');
    expect(service.context).toHaveBeenCalledTimes(2);
  });
  it('does not submit if recovery storage fails', () => {
    select();
    component.continue();
    service.remember.mockImplementation(() => {
      throw new Error();
    });
    component.confirm();
    expect(service.create).not.toHaveBeenCalled();
    expect(component.error).toBe('cashTellerTransfer.storage');
  });
  it('shows safe context and preview errors', () => {
    service.context.mockReturnValue(throwError(() => ({ status: 500, error: '<SQL stack>' })));
    component.reload();
    expect(component.inventoryError).toBe('cashTellerTransfer.unavailable');
    expect(component.context).toBeUndefined();
  });
  it('fetches persisted receipt for every print and reprint', fakeAsync(() => {
    const print = jest.spyOn(window, 'print').mockImplementation(() => undefined);
    component.result = completed;
    component.printReceipt();
    tick();
    component.printReceipt();
    tick();
    expect(service.receipt).toHaveBeenCalledTimes(2);
    expect(component.receipt).toBe(completed);
    expect(print).toHaveBeenCalledTimes(2);
    print.mockRestore();
  }));

  const invalidRecords: [
    string,
    (record: CashTransferRecord) => void
  ][] = [
    [
      'missing inflow leg',
      (record) => {
        record.inflowsByCurrency = [];
      }
    ],
    [
      'malformed denomination value',
      (record) => {
        record.currencies[0].denominations[0].denominationValue = 'invalid';
      }
    ],
    [
      'mismatched identifier',
      (record) => {
        record.id = 10;
      }
    ],
    [
      'invalid completion timestamp',
      (record) => {
        record.completedAt = 'not-a-date';
      }
    ],
    [
      'non-completed status',
      (record) => {
        record.status = 'PROCESSING';
      }
    ]
  ];
  it.each(invalidRecords)('rejects retrieved history with %s before rendering', (_label, change) => {
    const invalid = JSON.parse(JSON.stringify(completed)) as CashTransferRecord;
    change(invalid);
    service.retrieve.mockReturnValue(of(invalid));
    const route = TestBed.inject(ActivatedRoute) as unknown as { queryParamMap: Observable<Map<string, string>> };
    route.queryParamMap = of(
      new Map([[
          'transferId',
          '9'
        ]])
    );
    component.ngOnInit();
    expect(component.result).toBeUndefined();
    expect(component.step).not.toBe(3);
    expect(component.error).toBe('cashTellerTransfer.unavailable');
  });
  it.each(invalidRecords)(
    'rejects receipt with %s without printing stale data',
    fakeAsync((_label: string, change: (record: CashTransferRecord) => void) => {
      const print = jest.spyOn(window, 'print').mockImplementation(() => undefined);
      const invalid = JSON.parse(JSON.stringify(completed)) as CashTransferRecord;
      change(invalid);
      component.result = completed;
      component.receipt = completed;
      service.receipt.mockReturnValue(of(invalid));
      component.printReceipt();
      tick();
      expect(component.receipt).toBeUndefined();
      expect(component.error).toBe('cashTellerTransfer.unavailable');
      expect(print).not.toHaveBeenCalled();
      print.mockRestore();
    })
  );
  it('reloads historical details when the transfer query parameter changes on the same route', () => {
    const parameters = new BehaviorSubject(new Map<string, string>());
    const route = TestBed.inject(ActivatedRoute) as unknown as { queryParamMap: typeof parameters };
    route.queryParamMap = parameters;
    component.ngOnInit();
    component.receipt = completed;
    parameters.next(
      new Map([[
          'transferId',
          '9'
        ]])
    );
    expect(service.retrieve).toHaveBeenCalledWith(9);
    expect(component.result).toBe(completed);
    expect(component.receipt).toBeUndefined();
    expect(component.context).toBeUndefined();
  });
  it('explains that the current business date needs an open funded source assignment', () => {
    select();
    component.continue();
    service.context.mockReturnValue(
      throwError(() => ({
        status: 403,
        error: JSON.stringify({
          errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.cash.transfer.source.assignment' }]
        })
      }))
    );
    component.reload();
    expect(component.context).toBeUndefined();
    expect(component.rows).toEqual([]);
    expect(component.preview).toBeUndefined();
    expect(component.inventoryError).toBe('cashTellerTransfer.sourceAssignmentRequired');
    expect(component.canOpenSourceDrawer).toBe(true);
    expect(component.canContinue).toBe(false);
    expect(service.create).not.toHaveBeenCalled();
  });
  it('rejects unsafe inventory precision', () => {
    const invalid = JSON.parse(JSON.stringify(context)) as CashTransferContext;
    invalid.currencies[0].denominations[0].availableQuantity = Number.MAX_SAFE_INTEGER + 1;
    service.context.mockReturnValue(of(invalid));
    component.reload();
    expect(component.rows).toEqual([]);
    expect(component.canContinue).toBe(false);
  });
});
describe('cash transfer balance verification and safe error mapping', () => {
  it('distinguishes a missing staff link from a closed, unfunded, or ambiguous assignment', () => {
    expect(
      cashTransferError({
        status: 403,
        error: { userMessageGlobalisationCode: 'error.msg.base.teller.cash.transfer.source.forbidden' }
      })
    ).toBe('cashTellerTransfer.staffAssignmentRequired');
    expect(
      cashTransferError({
        status: 403,
        error: { errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.cash.transfer.source.assignment' }] }
      })
    ).toBe('cashTellerTransfer.sourceAssignmentRequired');
  });

  it.each([
    [
      'error.msg.resource.not.found',
      404
    ],
    [
      'error.msg.other.source.assignment',
      404
    ],
    [
      'error.msg.request.invalid',
      400
    ],
    [
      'error.msg.loan.amount.invalid',
      400
    ],
    [
      'error.msg.other.destination.invalid',
      400
    ],
    [
      'wrapped.error.msg.base.teller.cash.transfer.source.assignment',
      404
    ]
  ])('does not mistake generic code %s for a transfer error', (code, status) => {
    for (const error of [
      { userMessageGlobalisationCode: code },
      { errors: [{ userMessageGlobalisationCode: code }] }
    ]) {
      expect(cashTransferError({ status: status as number, error })).toBe('cashTellerTransfer.unavailable');
      expect(cashTransferError({ status: status as number, error: JSON.stringify(error) })).toBe(
        'cashTellerTransfer.unavailable'
      );
    }
  });
  it('requires the exact namespaced conflict code when resolving a 409', () => {
    expect(
      hasCashTransferError(
        { error: { userMessageGlobalisationCode: 'error.msg.base.teller.cash.transfer.idempotency.conflict' } },
        'idempotency.conflict'
      )
    ).toBe(true);
    expect(
      hasCashTransferError(
        { error: { userMessageGlobalisationCode: 'error.msg.other.idempotency.conflict' } },
        'idempotency.conflict'
      )
    ).toBe(false);
    expect(
      hasCashTransferError(
        { error: { userMessageGlobalisationCode: 'error.msg.base.teller.cash.transfer.idempotency.conflict.extra' } },
        'idempotency.conflict'
      )
    ).toBe(false);
  });
  it.each([
    'invalid',
    '-0.10',
    '0',
    '0.001'
  ])('rejects unsafe denomination value %s even when legs and line totals balance', (value) => {
    const invalid = JSON.parse(JSON.stringify(completed)) as CashTransferRecord;
    invalid.currencies[0].denominations[0].denominationValue = value;
    expect(isBalanced(invalid)).toBe(false);
    expect(isCompletedTransfer(invalid, 9)).toBe(false);
  });
  it('checks denomination multiplication and safe whole quantities', () => {
    const invalid = JSON.parse(JSON.stringify(completed)) as CashTransferRecord;
    invalid.currencies[0].denominations[0].denominationValue = '0.07';
    expect(isBalanced(invalid)).toBe(false);
    invalid.currencies[0].denominations[0].denominationValue = '0.10';
    invalid.currencies[0].denominations[0].quantity = 1.5;
    expect(isBalanced(invalid)).toBe(false);
    expect(isBalanced(null)).toBe(false);
    expect(isBalanced(undefined)).toBe(false);
    expect(isBalanced({ ...preview, source: undefined as never })).toBe(false);
  });
  it('accepts matching exact inflows and outflows', () => expect(isBalanced(preview)).toBe(true));
  it('rejects mismatched legs and missing currency legs', () => {
    expect(isBalanced({ ...preview, inflowsByCurrency: [] })).toBe(false);
    expect(isBalanced({ ...preview, outflowsByCurrency: [{ currencyCode: 'AAA', amount: '0.11' }] })).toBe(false);
  });
  it.each([
    'source.assignment',
    'destination.invalid',
    'inventory.insufficient',
    'idempotency.conflict',
    'quantity.invalid',
    'currency.unsupported'
  ])('maps structured text errors %s safely', (code) => {
    const key = cashTransferError({
      status: 403,
      error: JSON.stringify({
        errors: [
          {
            userMessageGlobalisationCode: 'error.msg.base.teller.cash.transfer.' + code,
            defaultUserMessage: 'SQL SECRET'
          }
        ]
      })
    });
    expect(key.startsWith('cashTellerTransfer.')).toBe(true);
    expect(key).not.toContain('SECRET');
  });
});
describe('cash transfer route authorization', () => {
  it.each([
    ['READ_BASE_TELLER_CASH_TRANSFER'],
    ['ALL_FUNCTIONS'],
    ['ALL_FUNCTIONS_READ']
  ])('allows backend read grants %s', (permission) => {
    TestBed.configureTestingModule({ providers: [
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: [permission] }) } },
        provideRouter([])
      ] });
    expect(TestBed.runInInjectionContext(() => cashTransferGuard({} as never, {} as never))).toBe(true);
  });
  it('denies direct navigation even when legacy RBAC is disabled', () => {
    const original = environment.productionModeEnableRBAC;
    environment.productionModeEnableRBAC = false;
    try {
      TestBed.configureTestingModule({ providers: [
          { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['READ_TELLER'] }) } },
          provideRouter([])
        ] });
      expect(TestBed.runInInjectionContext(() => cashTransferGuard({} as never, {} as never))).not.toBe(true);
    } finally {
      environment.productionModeEnableRBAC = original;
    }
  });
});
describe('cash transfer rendered workflow', () => {
  it.each([
    'saved recovery',
    'unresolved 409'
  ])('renders acknowledgement before discarding %s', async (scenario) => {
    const service = {
      context: () => of(context),
      pending: {
        request: { ...request, idempotencyKey: 'review-key' },
        preview,
        requiresReview: scenario === 'saved recovery'
      },
      create: jest.fn(() => throwError(() => ({ status: 409 }))),
      remember: jest.fn(),
      clearPending: jest.fn()
    };
    await TestBed.configureTestingModule({ imports: [
        CashTransfersBetweenTellersComponent,
        TranslateModule.forRoot()
      ], providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: CashTransferService, useValue: service },
        { provide: AuthenticationService, useValue: auth }
      ] }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', en);
    translate.use('en-US');
    const fixture = TestBed.createComponent(CashTransfersBetweenTellersComponent);
    fixture.detectChanges();
    if (scenario === 'unresolved 409') {
      fixture.componentInstance.confirm();
      fixture.detectChanges();
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.remember).toHaveBeenLastCalledWith(expect.objectContaining({ requiresReview: true }));
    }
    const page: HTMLElement = fixture.nativeElement;
    const discard = Array.from(page.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Discard and start over'
    )!;
    expect(discard.disabled).toBe(true);
    expect(page.textContent).toContain('does not undo a transfer');
    expect(page.textContent).not.toContain('cashTellerTransfer.');
    expect(Array.from(page.querySelectorAll('button')).some((button) => button.textContent?.trim() === 'Retry')).toBe(
      false
    );
    fixture.componentInstance.recoveryReviewed.setValue(true);
    fixture.detectChanges();
    expect(discard.disabled).toBe(false);
    discard.click();
    fixture.detectChanges();
    expect(service.clearPending).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.pending).toBeUndefined();
  });

  it.each([
    ['ALL_FUNCTIONS'],
    ['READ_BASE_TELLER_CASH_TRANSFER']
  ])('renders an actionable source setup state respecting opening permissions %s', async (permission) => {
    const service = {
      context: jest.fn(() =>
        throwError(() => ({
          status: 403,
          error: { errors: [{ userMessageGlobalisationCode: 'error.msg.base.teller.cash.transfer.source.assignment' }] }
        }))
      ),
      pending: undefined as undefined
    };
    await TestBed.configureTestingModule({ imports: [
        CashTransfersBetweenTellersComponent,
        TranslateModule.forRoot()
      ], providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: CashTransferService, useValue: service },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: [permission] }) } }
      ] }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', en);
    translate.use('en-US');
    const fixture = TestBed.createComponent(CashTransfersBetweenTellersComponent);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('open, funded drawer for the current business date');
    expect(page.textContent).not.toContain('Source drawer is no longer available.');
    expect(page.textContent).not.toContain('cashTellerTransfer.');
    const openingLink = page.querySelector('a[href="/organization/base-teller/cash-allocations"]');
    expect(!!openingLink).toBe(permission === 'ALL_FUNCTIONS');
    expect(Array.from(page.querySelectorAll('button')).some((button) => button.textContent?.trim() === 'Next')).toBe(
      false
    );
    Array.from(page.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Refresh Inventory'))!
      .click();
    expect(service.context).toHaveBeenCalledTimes(2);
  });

  it('renders translated identities, banknotes, coins, quantities, and a balanced confirmation', async () => {
    const service = { context: () => of(context), preview: () => of(preview), pending: undefined as undefined };
    await TestBed.configureTestingModule({ imports: [
        CashTransfersBetweenTellersComponent,
        TranslateModule.forRoot()
      ], providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: CashTransferService, useValue: service },
        { provide: AuthenticationService, useValue: auth }
      ] }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', en);
    translate.use('en-US');
    const fixture = TestBed.createComponent(CashTransfersBetweenTellersComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cash Transfers Between Tellers');
    expect(fixture.nativeElement.textContent).toContain('Source');
    const component = fixture.componentInstance;
    component.form.controls.destinationCashierId.setValue(2);
    component.next();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Bills');
    expect(fixture.nativeElement.textContent).toContain('Coins');
    expect(fixture.nativeElement.querySelectorAll('input[type=number]').length).toBe(3);
    component.rows[0].quantities.at(0).setValue(1);
    component.continue();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('General Transaction');
    expect(fixture.nativeElement.textContent).toContain('Outflows');
    expect(fixture.nativeElement.textContent).toContain('Inflows');
    expect(fixture.nativeElement.textContent).not.toContain('cashTellerTransfer.');
  });
});
