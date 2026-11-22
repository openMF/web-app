/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Observable } from 'rxjs';

export type CreditFilterKind = 'dates' | 'amount' | 'location';
export interface CreditCurrencyOption {
  code: string;
  name: string;
  decimalPlaces?: number;
}
export interface CreditStateOption {
  id: number | string;
  displayLabel?: string;
  name?: string;
  value?: string;
}
export interface CreditCurrencyState {
  options: CreditCurrencyOption[];
  loading: boolean;
  failed: boolean;
}
export interface CreditFilterValues {
  submittedFrom?: Date | string | null;
  submittedTo?: Date | string | null;
  minAmount?: string | number | null;
  maxAmount?: string | number | null;
  currencyCode?: string | null;
  stateProvinceId?: number | string | null;
  municipality?: string | null;
}
export type CreditFilterPatch =
  | Pick<Required<CreditFilterValues>, 'submittedFrom' | 'submittedTo'>
  | Pick<Required<CreditFilterValues>, 'minAmount' | 'maxAmount' | 'currencyCode'>
  | Pick<Required<CreditFilterValues>, 'stateProvinceId' | 'municipality'>;
export interface CreditFilterDialogData {
  kind: CreditFilterKind;
  value: CreditFilterValues;
  currencies$: Observable<CreditCurrencyState>;
  retryCurrencies: () => void;
  states: CreditStateOption[];
}
