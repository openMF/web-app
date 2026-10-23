/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface ExchangeTeller {
  id: number;
  tellerId: number;
  code: string;
  name: string;
  officeId: number;
}
export interface ExchangeCurrency {
  code: string;
  name: string;
  decimalPlaces: number;
}
export interface ExchangeContext {
  tellers: ExchangeTeller[];
  currencies: ExchangeCurrency[];
}
export interface InventoryLine {
  denominationId: string;
  type: string;
  value: number | string;
  availableQuantity: number;
}
export interface ExchangeInventory {
  cashierId: number;
  currencyCode: string;
  decimalPlaces: number;
  denominations: InventoryLine[];
}
export interface ExchangeQuantity {
  denominationId: string;
  quantity: number;
}
export interface ExchangeLine extends ExchangeQuantity {
  type: string;
  value: number | string;
  amount: number | string;
}
export interface ExchangeRequest {
  cashierId: number;
  currencyCode: string;
  receivedDenominations: ExchangeQuantity[];
  deliveredDenominations: ExchangeQuantity[];
  idempotencyKey: string;
}
export interface ExchangePreview {
  cashierId: number;
  currencyCode: string;
  receivedAmount: number | string;
  deliveredAmount: number | string;
  balanced: boolean;
  netMonetaryEffect: number | string;
  receivedDenominations: ExchangeLine[];
  deliveredDenominations: ExchangeLine[];
}
export interface ExchangeRecord {
  id: number;
  receiptNumber: string;
  status: string;
  businessDate: string | number[];
  officeId: number;
  tellerId: number;
  cashierId: number;
  tellerName: string;
  currencyCode: string;
  receivedAmount: number | string;
  deliveredAmount: number | string;
  processedBy: number;
  processedByUsername: string;
  processedAt: string;
  receivedDenominations: ExchangeLine[];
  deliveredDenominations: ExchangeLine[];
}

/** Display arithmetic only. Backend preview/create remains authoritative. */
export function toUnits(value: number | string, precision: number): bigint {
  const match = /^(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(String(value));
  if (!match || !Number.isInteger(precision) || precision < 0 || precision > 20) throw new Error('Invalid decimal');
  const fraction = match[2] ?? '';
  const shift = precision + Number(match[3] ?? 0) - fraction.length;
  const digits = BigInt(match[1] + fraction);
  if (Math.abs(shift) > 100) throw new Error('Unsupported decimal');
  if (shift >= 0) return digits * 10n ** BigInt(shift);
  const divisor = 10n ** BigInt(-shift);
  if (digits % divisor !== 0n) throw new Error('Invalid currency precision');
  return digits / divisor;
}
export function fromUnits(value: bigint, precision: number): string {
  const digits = value.toString().padStart(precision + 1, '0');
  return precision ? digits.slice(0, -precision) + '.' + digits.slice(-precision) : digits;
}
