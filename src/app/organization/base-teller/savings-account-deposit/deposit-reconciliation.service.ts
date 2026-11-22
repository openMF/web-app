/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, switchMap, throwError } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SavingsService } from 'app/savings/savings.service';
import { DepositReceiptContext, depositTransactionId } from './deposit-receipt.model';

export type NonPostingOutcome = 'NOT_POSTED' | 'REJECTED';
export interface NonPostingDecision {
  outcome: NonPostingOutcome | '';
  reference: string;
  evidence: string;
  reason: string;
  acknowledged: boolean;
}
export interface RecordedDepositDecision {
  noteId: string;
  reference: string;
  outcome: NonPostingOutcome;
}

/** Explicit checker adjudication, recorded through the existing savings-note API; never a financial POST. */
@Injectable({ providedIn: 'root' })
export class DepositReconciliationService {
  private readonly auth = inject(AuthenticationService);
  private readonly savings = inject(SavingsService);

  get canRecord(): boolean {
    const credentials = this.auth.getCredentials();
    const permissions = credentials?.permissions || [];
    // Do not bypass reconciliation authorization when legacy UI RBAC is disabled.
    return (
      !!depositTransactionId(credentials?.userId) &&
      (permissions.includes('ALL_FUNCTIONS') ||
        (permissions.includes('DEPOSIT_SAVINGSACCOUNT_CHECKER') &&
          permissions.includes('CREATE_SAVINGNOTE') &&
          (permissions.includes('READ_SAVINGNOTE') || permissions.includes('ALL_FUNCTIONS_READ')) &&
          (permissions.includes('READ_SAVINGSACCOUNT') || permissions.includes('ALL_FUNCTIONS_READ'))))
    );
  }

  record(context: DepositReceiptContext, decision: NonPostingDecision): Observable<RecordedDepositDecision> {
    if (
      !this.canRecord ||
      !depositTransactionId(context.accountId) ||
      !decision.acknowledged ||
      decision.reference !== context.receiptReference ||
      ![
        'NOT_POSTED',
        'REJECTED'
      ].includes(decision.outcome) ||
      decision.evidence.trim().length < 3 ||
      decision.evidence.length > 100 ||
      decision.reason.trim().length < 20 ||
      decision.reason.length > 400
    )
      return throwError(() => new Error('Invalid or unauthorized reconciliation decision'));
    const reviewerId = this.auth.getCredentials()!.userId;
    const outcome = decision.outcome as NonPostingOutcome;
    // Machine-readable evidence in a normal account note. The server supplies its actual author/time.
    const note = JSON.stringify({
      type: 'SAVINGS_DEPOSIT_RECONCILIATION',
      version: 1,
      outcome,
      requestReference: context.receiptReference,
      savingsAccountId: String(context.accountId),
      amount: context.amount,
      currency: context.account.currency?.code || context.account.currencyCode || null,
      transactionDate: context.date,
      reviewerId,
      evidence: decision.evidence.trim(),
      reason: decision.reason.trim(),
      acknowledged: true
    });
    const matchingNoteId = (notes: unknown): string | null => {
      if (!Array.isArray(notes)) return null;
      const match = notes.find(
        (item) =>
          item?.note === note && String(item.createdById) === String(reviewerId) && depositTransactionId(item.id)
      );
      return match ? depositTransactionId(match.id) : null;
    };
    const accountId = String(context.accountId);
    return this.savings.getSavingsNotes(accountId).pipe(
      switchMap((notes: unknown) => {
        const id = matchingNoteId(notes);
        if (id) return of(id);
        if (!Array.isArray(notes)) return throwError(() => new Error('Account notes unavailable'));
        return this.savings.createSavingsNote(accountId, { note }).pipe(
          // A lost note-write response is reconciled by GET, never treated as an accepted decision by itself.
          catchError(() => of(null)),
          switchMap(() => this.savings.getSavingsNotes(accountId)),
          map((saved: unknown) => {
            const recordedId = matchingNoteId(saved);
            if (!recordedId) throw new Error('Reconciliation decision not confirmed');
            return recordedId;
          })
        );
      }),
      map((noteId) => ({ noteId, reference: context.receiptReference, outcome }))
    );
  }
}
