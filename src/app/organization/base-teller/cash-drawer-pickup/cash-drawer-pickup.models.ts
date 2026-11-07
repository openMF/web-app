/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { InventoryLine, ExchangeLine } from '../cash-exchange/cash-exchange.models';

export interface PickupCashier {
  cashierId: number;
  staffId: number;
  cashierName: string;
  tellerId: number;
  tellerName: string;
  officeId: number;
  officeName: string;
  closed: boolean;
}
export interface PickupContext {
  businessDate: string;
  sourceCashiers: PickupCashier[];
  destinations: PickupCashier[];
  currencies: { currencyCode: string; decimalPlaces: number; denominations: ExchangeLine[] }[];
  sourceInventory: { cashierId: number; currencyCode: string; denominations: InventoryLine[] }[];
  permissions: string[];
}
export interface PickupCheck {
  source: string;
  id: number;
  date: string;
  bank: string;
  reference: string;
  client: string;
  currencyCode: string;
  amount: number | string;
  status: string;
}
export interface PickupRequest {
  cashierId: number;
  destinationCashierId: number;
  idempotencyKey: string;
  currencies: {
    currencyCode: string;
    cashDenominations: { denominationId: string; quantity: number }[];
    checks: { source: string; id: number }[];
  }[];
}
export interface PickupRecord {
  id?: number;
  reference?: string;
  status: string;
  businessDate: string;
  officeId: number;
  officeName: string;
  sourceCashierId: number;
  sourceName: string;
  destinationCashierId: number;
  destinationName: string;
  authorizedByUserId?: number;
  authorizedByUsername?: string;
  authorizedAt?: string;
  completedAt?: string;
  currencies: {
    currencyCode: string;
    cash: number | string;
    checks: number | string;
    vouchers: number | string;
    totalToCollect: number | string;
    cashDenominations: ExchangeLine[];
    selectedChecks: PickupCheck[];
  }[];
}
