/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { afterEach, describe, expect, it } from '@jest/globals';

import { environment } from 'environments/environment';
import { BASE_TELLER_WORKFLOWS, BaseTellerComponent } from './base-teller.component';

describe('BaseTellerComponent', () => {
  const originalProductionMode = environment.productionMode;

  afterEach(() => {
    environment.productionMode = originalProductionMode;
  });

  it('uses the existing workflow routes and permission checks', () => {
    expect(BASE_TELLER_WORKFLOWS).toMatchObject([
      { materialIcon: 'currency_exchange', permission: 'READ_BASE_TELLER_CASH_EXCHANGE', route: [
          '/organization',
          'base-teller',
          'cash-exchange'
        ] },
      {
        materialIcon: 'sync',
        permission: 'READ_BASE_TELLER_CATALOG_UPDATE',
        route: [
          '/organization',
          'base-teller',
          'catalog-updates'
        ]
      },
      {
        materialIcon: 'point_of_sale',
        permission: 'READ_BASE_TELLER_CASH_ALLOCATION',
        route: [
          '/organization',
          'base-teller',
          'cash-allocations'
        ]
      },
      {
        materialIcon: 'inventory_2',
        permission: 'READ_BASE_TELLER_CASH_INVENTORY',
        route: [
          '/organization',
          'base-teller',
          'cash-inventory'
        ]
      },
      {
        fontAwesomeIcon: 'piggy-bank',
        permission: 'READ_TELLER',
        route: [
          '/organization',
          'base-teller',
          'savings-account-openings'
        ]
      },
      {
        fontAwesomeIcon: 'money-bill-wave',
        permission: 'DEPOSIT_SAVINGSACCOUNT',
        route: [
          '/organization',
          'base-teller',
          'savings-account-deposits'
        ]
      },
      {
        fontAwesomeIcon: 'money-check',
        permission: 'READ_BASE_TELLER_RETURNED_CHECK_PAYMENT',
        route: [
          '/organization',
          'base-teller',
          'returned-check-payments'
        ]
      },
      {
        fontAwesomeIcon: 'money-check-dollar',
        permission: 'READ_BASE_TELLER_CREDIT_PAYMENT',
        route: [
          '/organization',
          'base-teller',
          'credit-payments'
        ]
      },
      {
        materialIcon: 'point_of_sale',
        permission: 'READ_CASHIER_CLOSING',
        route: [
          '/organization',
          'base-teller',
          'cash-register-closing'
        ]
      },
      {
        materialIcon: 'account_balance_wallet',
        permission: 'READ_GLOBAL_SETTLEMENT',
        route: [
          '/organization',
          'base-teller',
          'global-cash-count'
        ]
      },
      {
        materialIcon: 'local_shipping',
        permission: 'CREATE_CASH_DEPOSIT',
        route: [
          '/organization',
          'base-teller',
          'deposit-in-transit'
        ]
      },
      {
        materialIcon: 'account_balance',
        permission: 'CREATE_CASH_DEPOSIT',
        route: [
          '/organization',
          'base-teller',
          'bank-deposit'
        ]
      },
      {
        materialIcon: 'history',
        permission: 'READ_CASH_OPERATION_HISTORY',
        route: [
          '/organization',
          'base-teller',
          'cash-operation-history'
        ]
      },
      {
        materialIcon: 'payments',
        permission: 'READ_CASH_HOLDINGS',
        route: [
          '/organization',
          'base-teller',
          'cash-on-hand'
        ]
      },
      {
        materialIcon: 'receipt_long',
        permission: 'READ_BASE_TELLER_TRANSACTION_HISTORY',
        route: [
          '/organization',
          'base-teller',
          'transaction-history'
        ]
      },
      {
        fontAwesomeIcon: 'money-check-dollar',
        permission: 'READ_BASE_TELLER_SERVICE_PAYMENT',
        route: [
          '/organization',
          'base-teller',
          'service-payments'
        ]
      }
    ]);
  });

  it('hides Bill and Service Payment when production mode is disabled', () => {
    environment.productionMode = false;
    const component = new BaseTellerComponent();

    expect(component.workflows).toHaveLength(15);
  });

  it('shows Bill and Service Payment when production mode is enabled', () => {
    environment.productionMode = true;
    const component = new BaseTellerComponent();

    expect(component.workflows).toHaveLength(16);
  });
});
