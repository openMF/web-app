/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

/** Third Party Imports */
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';

/** Custom Modules */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

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
  readonly productionMode = environment.productionMode === true;

  get workflows(): readonly BaseTellerWorkflow[] {
    return BASE_TELLER_WORKFLOWS.filter((workflow) => !workflow.productionOnly || this.productionMode);
  }
}
