/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SavingsService } from 'app/savings/savings.service';
import { DepositReceiptContext } from './deposit-receipt.model';
import { DepositReconciliationService, NonPostingDecision } from './deposit-reconciliation.service';

const context: DepositReceiptContext = {
  customer: { id: 10 },
  accountId: 77,
  account: { currency: { code: 'USD', decimalPlaces: 2 } },
  amount: 50,
  date: [
    2026,
    11,
    22
  ],
  depositType: 'CASH',
  paymentMethod: 'Cash',
  note: '',
  receiptReference: 'original-reference'
};
const decision: NonPostingDecision = {
  outcome: 'NOT_POSTED',
  reference: 'original-reference',
  evidence: 'CASE-1470',
  reason: 'The final bank reconciliation confirmed the original request never reached posting.',
  acknowledged: true
};

describe('DepositReconciliationService', () => {
  let service: DepositReconciliationService;
  let savings: { getSavingsNotes: jest.Mock; createSavingsNote: jest.Mock };
  let permissions: string[];
  let notes: { id: number; createdById: number; note: string }[];
  beforeEach(() => {
    permissions = [
      'DEPOSIT_SAVINGSACCOUNT_CHECKER',
      'CREATE_SAVINGNOTE',
      'READ_SAVINGNOTE',
      'READ_SAVINGSACCOUNT'
    ];
    notes = [];
    savings = {
      getSavingsNotes: jest.fn(() => of(notes)),
      createSavingsNote: jest.fn((_id: string, payload: { note: string }) => {
        notes = [{ id: 501, createdById: 1, note: payload.note }];
        return of({ resourceId: 501 });
      })
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ userId: 1, permissions }) } },
        { provide: SavingsService, useValue: savings }
      ]
    });
    service = TestBed.inject(DepositReconciliationService);
  });

  it.each([
    'NOT_POSTED',
    'REJECTED'
  ] as const)('records an explicit %s decision and verifies its canonical note before returning', async (outcome) => {
    expect(await firstValueFrom(service.record(context, { ...decision, outcome }))).toEqual({
      noteId: '501',
      reference: context.receiptReference,
      outcome
    });
    expect(savings.createSavingsNote).toHaveBeenCalledWith('77', { note: expect.any(String) });
    expect(JSON.parse(notes[0].note)).toMatchObject({
      outcome,
      requestReference: context.receiptReference,
      currency: 'USD',
      reviewerId: 1,
      acknowledged: true
    });
    expect(savings.getSavingsNotes).toHaveBeenCalledTimes(2);
  });

  it('does not record or release a decision for a teller lacking checker or note permissions', async () => {
    permissions = [
      'DEPOSIT_SAVINGSACCOUNT',
      'READ_SAVINGSACCOUNT'
    ];
    expect(service.canRecord).toBe(false);
    await expect(firstValueFrom(service.record(context, decision))).rejects.toThrow('unauthorized');
    expect(savings.getSavingsNotes).not.toHaveBeenCalled();
    expect(savings.createSavingsNote).not.toHaveBeenCalled();
  });

  it.each([
    { acknowledged: false },
    { reference: 'different' },
    { evidence: '' },
    { reason: '' },
    { outcome: '' }
  ])('rejects incomplete or mismatched adjudication %j', async (changes) => {
    await expect(
      firstValueFrom(service.record(context, { ...decision, ...changes } as NonPostingDecision))
    ).rejects.toThrow();
    expect(savings.createSavingsNote).not.toHaveBeenCalled();
  });

  it('does not confuse a successful/queued note command with a persisted decision', async () => {
    savings.createSavingsNote.mockImplementation(() => of({ commandId: 77 }));
    await expect(firstValueFrom(service.record(context, decision))).rejects.toThrow('not confirmed');
  });

  it('keeps the outcome unresolved if note retrieval fails', async () => {
    savings.getSavingsNotes.mockImplementation(() => throwError(() => ({ status: 404 })));
    await expect(firstValueFrom(service.record(context, decision))).rejects.toEqual({ status: 404 });
    expect(savings.createSavingsNote).not.toHaveBeenCalled();
  });

  it('recovers a lost note response by reading the real note and avoids duplicate notes on explicit retry', async () => {
    savings.createSavingsNote.mockImplementation((_id: string, payload: { note: string }) => {
      notes = [{ id: 501, createdById: 1, note: payload.note }];
      return throwError(() => ({ status: 0 }));
    });
    expect((await firstValueFrom(service.record(context, decision))).noteId).toBe('501');
    expect((await firstValueFrom(service.record(context, decision))).noteId).toBe('501');
    expect(savings.createSavingsNote).toHaveBeenCalledTimes(1);
  });

  it('rejects a copied record attributed to another operator', async () => {
    savings.createSavingsNote.mockImplementation((_id: string, payload: { note: string }) => {
      notes = [{ id: 501, createdById: 2, note: payload.note }];
      return of({ resourceId: 501 });
    });
    await expect(firstValueFrom(service.record(context, decision))).rejects.toThrow('not confirmed');
  });
});
