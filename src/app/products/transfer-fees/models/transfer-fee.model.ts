/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface TransferFee {
  id?: number;
  transferType: string;
  currencyCode: string;
  transferMode?: string | null;
  feeType: string;
  feeValue: number | string;
  feeCurrency?: string | null;
  thresholdAmount?: number | string | null;
  thresholdFeeValue?: number | string | null;
  description?: string | null;
  isActive?: boolean;
  exchangeRateRequired?: boolean;
  currentBccrRate?: number | string | null;
}

export interface TransferFeePayload {
  transferType: string;
  currencyCode: string;
  transferMode?: string | null;
  feeType: string;
  feeValue: number | string;
  feeCurrency?: string | null;
  thresholdAmount?: number | string | null;
  thresholdFeeValue?: number | string | null;
  description?: string | null;
  isActive: boolean;
  exchangeRateRequired: boolean;
}

export interface TransferFeeOption {
  value: string;
  labelKey: string;
}

export interface CurrencyOption {
  code: string;
  name?: string;
  displayLabel?: string;
}

export const TRANSFER_FEE_TRANSFER_TYPES: TransferFeeOption[] = [
  { value: 'PIN', labelKey: 'labels.inputs.PIN' },
  { value: 'SINPE_MOVIL', labelKey: 'labels.inputs.SINPE Movil' }
];

export const TRANSFER_FEE_TRANSFER_MODES: TransferFeeOption[] = [
  { value: 'INMEDIATA', labelKey: 'labels.inputs.Inmediata' },
  { value: 'T_PLUS_1', labelKey: 'labels.inputs.T+1' }
];

export const TRANSFER_FEE_TYPES: TransferFeeOption[] = [
  { value: 'FIXED', labelKey: 'labels.inputs.Fixed' },
  { value: 'PERCENTAGE', labelKey: 'labels.inputs.Percentage' }
];
