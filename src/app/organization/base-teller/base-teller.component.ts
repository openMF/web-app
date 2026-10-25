/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

/** Third Party Imports */
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';

/** Custom Modules */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Workflow permissions */
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { canReadCashTransfers } from './cash-transfers-between-tellers/cash-transfer.guard';
import { canReadWithdrawals } from './withdrawals/withdrawal.guard';
import { canReadTransfers } from './account-transfers/account-transfer.guard';

import { hasFxPermission } from '../foreign-currency/foreign-currency.guard';

/** Environment */
import { environment } from 'environments/environment';

export interface BaseTellerWorkflow {
  label: string;
  fontAwesomeIcon?: IconName;
  materialIcon?: string;
  permission: string;
  route: readonly string[];
  productionOnly?: boolean;
}

export const BASE_TELLER_WORKFLOWS: readonly BaseTellerWorkflow[] = [
  { label: 'fx.title', materialIcon: 'currency_exchange', permission: 'READ_BASE_TELLER_FX', route: [
      '/organization',
      'base-teller',
      'foreign-currency'
    ] },
  { label: 'cashTellerTransfer.title', materialIcon: 'payments', permission: 'READ_BASE_TELLER_CASH_TRANSFER', route: [
      '/organization',
      'base-teller',
      'cash-transfers-between-tellers'
    ] },
  { label: 'accountTransfer.title', materialIcon: 'swap_horiz', permission: 'READ_ACCOUNTTRANSFER', route: [
      '/organization',
      'base-teller',
      'account-transfers'
    ] },
  { label: 'cashPickup.title', materialIcon: 'move_down', permission: 'READ_BASE_TELLER_CASH_DRAWER_PICKUP', route: [
      '/organization',
      'base-teller',
      'cash-drawer-pickup'
    ] },
  { label: 'eod.title', materialIcon: 'point_of_sale', permission: 'READ_BASE_TELLER_END_OF_DAY_CLOSING', route: [
      '/organization',
      'base-teller',
      'end-of-day-cash-closing'
    ] },
  {
    label: 'cashExchange.title',
    materialIcon: 'currency_exchange',
    permission: 'READ_BASE_TELLER_CASH_EXCHANGE',
    route: [
      '/organization',
      'base-teller',
      'cash-exchange'
    ]
  },
  {
    label: 'labels.heading.Catalog Updates',
    materialIcon: 'sync',
    permission: 'READ_BASE_TELLER_CATALOG_UPDATE',
    route: [
      '/organization',
      'base-teller',
      'catalog-updates'
    ]
  },
  {
    label: 'cashAllocation.title',
    materialIcon: 'point_of_sale',
    permission: 'READ_BASE_TELLER_CASH_ALLOCATION',
    route: [
      '/organization',
      'base-teller',
      'cash-allocations'
    ]
  },
  {
    label: 'cashInventory.title',
    materialIcon: 'inventory_2',
    permission: 'READ_BASE_TELLER_CASH_INVENTORY',
    route: [
      '/organization',
      'base-teller',
      'cash-inventory'
    ]
  },
  {
    label: 'labels.heading.Savings Account Opening',
    fontAwesomeIcon: 'piggy-bank',
    permission: 'READ_TELLER',
    route: [
      '/organization',
      'base-teller',
      'savings-account-openings'
    ]
  },
  {
    label: 'labels.heading.Savings Account Deposit',
    fontAwesomeIcon: 'money-bill-wave',
    permission: 'DEPOSIT_SAVINGSACCOUNT',
    route: [
      '/organization',
      'base-teller',
      'savings-account-deposits'
    ]
  },
  {
    label: 'labels.heading.Returned Check Payment',
    fontAwesomeIcon: 'money-check',
    permission: 'READ_BASE_TELLER_RETURNED_CHECK_PAYMENT',
    route: [
      '/organization',
      'base-teller',
      'returned-check-payments'
    ]
  },
  {
    label: 'creditPayment.heading.title',
    fontAwesomeIcon: 'money-check-dollar',
    permission: 'READ_BASE_TELLER_CREDIT_PAYMENT',
    route: [
      '/organization',
      'base-teller',
      'credit-payments'
    ]
  },
  {
    label: 'web1232.views.closing',
    materialIcon: 'point_of_sale',
    permission: 'READ_CASHIER_CLOSING',
    route: [
      '/organization',
      'base-teller',
      'cash-register-closing'
    ]
  },
  {
    label: 'web1232.views.global',
    materialIcon: 'account_balance_wallet',
    permission: 'READ_GLOBAL_SETTLEMENT',
    route: [
      '/organization',
      'base-teller',
      'global-cash-count'
    ]
  },
  {
    label: 'web1232.views.deposit-in-transit',
    materialIcon: 'local_shipping',
    permission: 'CREATE_CASH_DEPOSIT',
    route: [
      '/organization',
      'base-teller',
      'deposit-in-transit'
    ]
  },
  {
    label: 'web1232.views.bank-deposit',
    materialIcon: 'account_balance',
    permission: 'CREATE_CASH_DEPOSIT',
    route: [
      '/organization',
      'base-teller',
      'bank-deposit'
    ]
  },
  {
    label: 'web1232.views.history',
    materialIcon: 'history',
    permission: 'READ_CASH_OPERATION_HISTORY',
    route: [
      '/organization',
      'base-teller',
      'cash-operation-history'
    ]
  },
  {
    label: 'web1232.views.holdings',
    materialIcon: 'payments',
    permission: 'READ_CASH_HOLDINGS',
    route: [
      '/organization',
      'base-teller',
      'cash-on-hand'
    ]
  },
  {
    label: 'transactionHistory.title',
    materialIcon: 'receipt_long',
    permission: 'READ_BASE_TELLER_TRANSACTION_HISTORY',
    route: [
      '/organization',
      'base-teller',
      'transaction-history'
    ]
  },
  {
    label: 'transactionReversal.title',
    materialIcon: 'undo',
    permission: 'READ_BASE_TELLER_TRANSACTION_REVERSAL',
    route: [
      '/organization',
      'base-teller',
      'transaction-reversal'
    ]
  },
  {
    label: 'labels.heading.Bill and Service Payment',
    fontAwesomeIcon: 'money-check-dollar',
    permission: 'READ_BASE_TELLER_SERVICE_PAYMENT',
    route: [
      '/organization',
      'base-teller',
      'service-payments'
    ],
    productionOnly: true
  }
];

/**
 * Base Teller workflow navigation component.
 */
@Component({
  selector: 'mifosx-base-teller',
  templateUrl: './base-teller.component.html',
  styleUrls: ['./base-teller.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCard,
    MatCardContent,
    MatIcon,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseTellerComponent {
  private readonly authentication = inject(AuthenticationService);
  readonly productionMode = environment.productionMode === true;

  get outflows(): readonly BaseTellerWorkflow[] {
    return canReadWithdrawals(this.authentication.getCredentials()?.permissions ?? [])
      ? [
          {
            label: 'withdrawal.title',
            materialIcon: 'payments',
            permission: 'READ_BASE_TELLER_WITHDRAWAL',
            route: [
              '/organization',
              'base-teller',
              'withdrawals'
            ]
          }
        ]
      : [];
  }

  get otherOperations(): readonly BaseTellerWorkflow[] {
    const permissions = this.authentication.getCredentials()?.permissions ?? [];
    return BASE_TELLER_WORKFLOWS.filter(
      (w) =>
        (w.permission === 'READ_BASE_TELLER_FX' && hasFxPermission(permissions, 'READ_BASE_TELLER_FX')) ||
        (w.permission === 'READ_ACCOUNTTRANSFER' && canReadTransfers(permissions)) ||
        (w.permission === 'READ_BASE_TELLER_CASH_TRANSFER' && canReadCashTransfers(permissions))
    );
  }

  get workflows(): readonly BaseTellerWorkflow[] {
    return BASE_TELLER_WORKFLOWS.filter(
      (workflow) => (!workflow.productionOnly || this.productionMode) && ![
          'READ_ACCOUNTTRANSFER',
          'READ_BASE_TELLER_FX',
          'READ_BASE_TELLER_CASH_TRANSFER'
        ].includes(workflow.permission)
    );
  }
}
