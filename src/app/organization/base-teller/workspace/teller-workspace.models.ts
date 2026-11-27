/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FineractId } from '../base-teller.service';
import { CashDifferenceType } from '../cash-management/cash-management.models';
import { RegisterState } from './base-teller-workflows';

/**
 * Outcome of loading one independent panel of the workspace. Panels fail independently so a missing permission on
 * history never blanks the cash balance, and "unknown" is always distinguishable from zero.
 */
export type Section<T> =
  { status: 'loading' } | { status: 'ready'; data: T } | { status: 'forbidden' } | { status: 'error' };

export const LOADING: Section<never> = { status: 'loading' };

/** Who is looking at the workspace. Everything shown is scoped to this identity and discarded when it changes. */
export interface WorkspaceIdentity {
  tenant: string;
  userId: number | null;
  officeId: number | null;
  staffId: number | null;
  businessDate: string;
  /** Stable string used to detect tenant, user, office, staff or business-date changes mid-flight. */
  key: string;
}

/** One teller window the authenticated user is a cashier of for the business date. */
export interface TellerAssignment {
  cashierId: FineractId;
  tellerId: FineractId;
  tellerName: string;
  cashierName: string;
  officeName: string | null;
}

export type AssignmentResolution =
  | { kind: 'resolved'; assignments: TellerAssignment[] }
  | { kind: 'none'; reason: 'no-staff' | 'no-assignment' }
  | { kind: 'error'; reason: 'forbidden' | 'unavailable' };

/** Register lifecycle of one currency, from the backend closing context (`registerStatus`). */
export interface CurrencyRegister {
  currencyCode: string;
  state: RegisterState;
  closingId: FineractId | null;
}

/** Result of a completed cash-register closing, from the backend closing receipt. */
export interface ClosingOutcome {
  currencyCode: string;
  difference: string | number | null;
  differenceType: CashDifferenceType | null;
  authorizedOn: string | null;
}

export interface RegisterSnapshot {
  registers: CurrencyRegister[];
  outcomes: ClosingOutcome[];
}
