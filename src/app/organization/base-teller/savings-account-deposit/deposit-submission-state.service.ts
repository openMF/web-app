/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inject, Injectable } from '@angular/core';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { DepositReceiptContext, depositTransactionId, hasDepositCurrency } from './deposit-receipt.model';

export interface PendingDeposit {
  /** A damaged record remains blocked rather than silently permitting another financial POST. */
  context: DepositReceiptContext | null;
}

/** Same tab-session persistence pattern as WithdrawalService, scoped to server, tenant and operator. */
@Injectable({ providedIn: 'root' })
export class DepositSubmissionStateService {
  private readonly auth = inject(AuthenticationService);
  private readonly settings = inject(SettingsService);
  private readonly records = new Map<string, PendingDeposit | null>();

  private get storageKey(): string {
    return (
      'mifosSavingsDeposit:' +
      JSON.stringify([
        this.settings.baseServerUrl,
        this.settings.tenantIdentifier,
        this.auth.getCredentials()?.userId
      ])
    );
  }

  get pending(): PendingDeposit | null {
    const key = this.storageKey;
    if (this.records.has(key)) return this.records.get(key)!;
    let pending: PendingDeposit | null = null;
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        const context = parsed?.context as DepositReceiptContext | undefined;
        pending = { context: parsed?.version === 1 && this.validContext(context) ? context : null };
      }
    } catch {
      pending = { context: null };
    }
    this.records.set(key, pending);
    return pending;
  }

  /** Persist BEFORE dispatch. No replayable check/bank fields, credentials, account history or balances. */
  begin(context: DepositReceiptContext): boolean {
    if (this.pending || !this.validContext(context) || !hasDepositCurrency(context.account)) return false;
    const safe: DepositReceiptContext = {
      accountId: context.accountId,
      account: {
        id: context.accountId,
        accountNo: context.account.accountNo || context.account.accountNumber,
        productName: context.account.productName || context.account.savingsProductName,
        currency: {
          code: context.account.currency?.code || context.account.currencyCode,
          decimalPlaces: context.account.currency?.decimalPlaces
        }
      },
      customer: {
        id: context.customer.id,
        displayName: context.customer.displayName || context.customer.fullname || context.customer.name,
        accountNo: context.customer.accountNo
      },
      amount: context.amount,
      depositType: context.depositType,
      paymentMethod: context.paymentMethod,
      receiptReference: context.receiptReference,
      date: context.date ? [...context.date] : null,
      note: context.note
    };
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify({ version: 1, context: safe }));
      this.records.set(this.storageKey, { context: safe });
      return true;
    } catch {
      return false;
    }
  }

  /** Release only after a definite POST result, verified receipt, or durably recorded checker decision. */
  resolve(reference: string): boolean {
    if (this.pending?.context?.receiptReference !== reference) return false;
    try {
      sessionStorage.removeItem(this.storageKey);
      this.records.set(this.storageKey, null);
      return true;
    } catch {
      // Keep the unresolved record if persistence is unavailable. A later verification can clear it.
      return false;
    }
  }

  private validContext(value: DepositReceiptContext | undefined): value is DepositReceiptContext {
    return (
      !!value &&
      !!depositTransactionId(value.accountId) &&
      !!depositTransactionId(value.customer?.id) &&
      !!value.account &&
      typeof value.amount === 'number' &&
      Number.isFinite(value.amount) &&
      value.amount > 0 &&
      typeof value.receiptReference === 'string' &&
      value.receiptReference.length > 0 &&
      value.receiptReference.length <= 50 &&
      (value.depositType === 'CASH' || value.depositType === 'CHECK') &&
      typeof value.paymentMethod === 'string' &&
      typeof value.note === 'string' &&
      (value.date === null ||
        (Array.isArray(value.date) && value.date.length === 3 && value.date.every(Number.isInteger)))
    );
  }
}
