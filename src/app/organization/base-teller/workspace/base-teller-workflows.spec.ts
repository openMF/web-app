/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';

import { environment } from 'environments/environment';
import {
  BASE_TELLER_CATEGORIES,
  BASE_TELLER_WORKFLOWS,
  DEFAULT_FREQUENT_OPERATIONS,
  authorizedWorkflows,
  hasRbacPermission,
  isWorkflowAuthorized,
  resolveFrequentOperations,
  workflowAvailability,
  workflowById,
  workflowsInCategory
} from './base-teller-workflows';

/**
 * The 25 routes the Base Teller landing page exposed before WEB-1484 (22 registry entries plus vault deposit,
 * vault history and withdrawals, which used to be computed in getters), with the permission each one used.
 */
const PREVIOUS_INVENTORY: ReadonlyArray<readonly [
    id: string,
    route: string,
    permission: string
  ]> = [
  [
    'foreignCurrency',
    'foreign-currency',
    'READ_BASE_TELLER_FX'
  ],
  [
    'cashTransfers',
    'cash-transfers-between-tellers',
    'READ_BASE_TELLER_CASH_TRANSFER'
  ],
  [
    'accountTransfers',
    'account-transfers',
    'READ_ACCOUNTTRANSFER'
  ],
  [
    'cashPickup',
    'cash-drawer-pickup',
    'READ_BASE_TELLER_CASH_DRAWER_PICKUP'
  ],
  [
    'endOfDayClosing',
    'end-of-day-cash-closing',
    'READ_BASE_TELLER_END_OF_DAY_CLOSING'
  ],
  [
    'cashExchange',
    'cash-exchange',
    'READ_BASE_TELLER_CASH_EXCHANGE'
  ],
  [
    'catalogUpdates',
    'catalog-updates',
    'READ_BASE_TELLER_CATALOG_UPDATE'
  ],
  [
    'cashAllocation',
    'cash-allocations',
    'READ_BASE_TELLER_CASH_ALLOCATION'
  ],
  [
    'cashInventory',
    'cash-inventory',
    'READ_BASE_TELLER_CASH_INVENTORY'
  ],
  [
    'savingsOpening',
    'savings-account-openings',
    'READ_TELLER'
  ],
  [
    'savingsDeposit',
    'savings-account-deposits',
    'DEPOSIT_SAVINGSACCOUNT'
  ],
  [
    'returnedCheck',
    'returned-check-payments',
    'READ_BASE_TELLER_RETURNED_CHECK_PAYMENT'
  ],
  [
    'loanPayment',
    'credit-payments',
    'READ_BASE_TELLER_CREDIT_PAYMENT'
  ],
  [
    'cashRegisterClosing',
    'cash-register-closing',
    'READ_CASHIER_CLOSING'
  ],
  [
    'globalCashCount',
    'global-cash-count',
    'READ_GLOBAL_SETTLEMENT'
  ],
  [
    'depositInTransit',
    'deposit-in-transit',
    'CREATE_CASH_DEPOSIT'
  ],
  [
    'bankDeposit',
    'bank-deposit',
    'CREATE_CASH_DEPOSIT'
  ],
  [
    'cashOperationHistory',
    'cash-operation-history',
    'READ_CASH_OPERATION_HISTORY'
  ],
  [
    'cashOnHand',
    'cash-on-hand',
    'READ_CASH_HOLDINGS'
  ],
  [
    'transactionHistory',
    'transaction-history',
    'READ_BASE_TELLER_TRANSACTION_HISTORY'
  ],
  [
    'transactionReversal',
    'transaction-reversal',
    'READ_BASE_TELLER_TRANSACTION_REVERSAL'
  ],
  [
    'servicePayment',
    'service-payments',
    'READ_BASE_TELLER_SERVICE_PAYMENT'
  ],
  [
    'vaultDeposit',
    'vault-cash-deposit',
    'READ_BASE_TELLER_CASH_INVENTORY'
  ],
  [
    'vaultHistory',
    'vault-cash-deposit/history',
    'READ_BASE_TELLER_TRANSACTION_HISTORY'
  ],
  [
    'withdrawal',
    'withdrawals',
    'READ_BASE_TELLER_WITHDRAWAL'
  ]
];

const routeOf = (id: string): string => (workflowById(id)?.route ?? []).join('/');

describe('Base Teller operation registry', () => {
  const originalRbac = environment.productionModeEnableRBAC;
  const originalProduction = environment.productionMode;

  beforeEach(() => {
    environment.productionModeEnableRBAC = true;
    environment.productionMode = true;
  });

  afterEach(() => {
    environment.productionModeEnableRBAC = originalRbac;
    environment.productionMode = originalProduction;
  });

  describe('inventory', () => {
    it('contains exactly the 25 operations of the previous landing page', () => {
      expect(BASE_TELLER_WORKFLOWS).toHaveLength(25);
      expect(BASE_TELLER_WORKFLOWS.map((workflow) => workflow.id).sort()).toEqual(
        PREVIOUS_INVENTORY.map(([id]) => id).sort()
      );
    });

    it.each(PREVIOUS_INVENTORY)(
      'keeps %s at /organization/base-teller/%s with permission %s',
      (id, route, permission) => {
        const workflow = workflowById(id);
        expect(workflow?.route).toEqual([
          '/organization',
          'base-teller',
          ...route.split('/')
        ]);
        expect(workflow?.permission).toBe(permission);
      }
    );

    it('has unique ids and unique routes, so nothing is merged or lost', () => {
      expect(new Set(BASE_TELLER_WORKFLOWS.map((workflow) => workflow.id)).size).toBe(25);
      expect(new Set(BASE_TELLER_WORKFLOWS.map((workflow) => workflow.route.join('/'))).size).toBe(25);
    });

    it('points every operation at a route that is registered in the organization routing module', () => {
      const routing = readFileSync(join(__dirname, '../../organization-routing.module.ts'), 'utf8');
      for (const workflow of BASE_TELLER_WORKFLOWS) {
        const path = workflow.route.slice(1).join('/');
        expect(routing).toContain(`path: '${path}'`);
      }
    });

    it('gives every operation a description, a synonym list, an icon and a category', () => {
      const categories = BASE_TELLER_CATEGORIES.map((category) => category.id);
      for (const workflow of BASE_TELLER_WORKFLOWS) {
        expect(workflow.descriptionKey).toMatch(/^baseTellerWorkspace\.operations\.\w+\.description$/);
        expect(workflow.termsKey).toMatch(/^baseTellerWorkspace\.operations\.\w+\.terms$/);
        expect(workflow.materialIcon).not.toBe('');
        expect(categories).toContain(workflow.category);
      }
    });
  });

  describe('duplicate transaction-history entries', () => {
    it('keeps cash-operation-history and transaction-history as two distinct screens with distinct names', () => {
      const cashOperations = workflowById('cashOperationHistory');
      const transactions = workflowById('transactionHistory');

      expect(cashOperations?.route).not.toEqual(transactions?.route);
      expect(cashOperations?.label).not.toBe(transactions?.label);
      expect(cashOperations?.label).toBe('baseTellerWorkspace.operations.cashOperationHistory.title');
    });

    it('routes the cash-operation history to the cash-management history view, not to transaction history', () => {
      const routing = readFileSync(join(__dirname, '../../organization-routing.module.ts'), 'utf8');
      const block = routing.slice(routing.indexOf("path: 'base-teller/cash-operation-history'"));
      expect(block.slice(0, 400)).toContain('CashManagementComponent');
      expect(block.slice(0, 400)).toContain("view: 'history'");
    });
  });

  describe('grouping', () => {
    const idsIn = (category: Parameters<typeof workflowsInCategory>[1]) =>
      workflowsInCategory(BASE_TELLER_WORKFLOWS, category).map((workflow) => workflow.id);

    it('orders the customer group with the frequent four first', () => {
      expect(idsIn('customer')).toEqual([
        'savingsDeposit',
        'withdrawal',
        'loanPayment',
        'servicePayment',
        'savingsOpening',
        'accountTransfers',
        'returnedCheck',
        'foreignCurrency',
        'cashExchange'
      ]);
    });

    it('matches the cash drawer, vault, consultation and closing groups requested by the Jira', () => {
      expect(idsIn('cash-drawer')).toEqual([
        'cashAllocation',
        'cashPickup',
        'cashOnHand',
        'cashTransfers',
        'cashInventory',
        'globalCashCount'
      ]);
      expect(idsIn('vault-banks')).toEqual([
        'vaultDeposit',
        'vaultHistory',
        'bankDeposit',
        'depositInTransit',
        'cashOperationHistory'
      ]);
      expect(idsIn('consultations')).toEqual([
        'transactionHistory',
        'transactionReversal',
        'catalogUpdates'
      ]);
      expect(idsIn('closings')).toEqual([
        'cashRegisterClosing',
        'endOfDayClosing'
      ]);
    });

    it('places each operation in exactly one group', () => {
      const all = BASE_TELLER_CATEGORIES.flatMap((category) => idsIn(category.id));
      expect(all.sort()).toEqual(BASE_TELLER_WORKFLOWS.map((workflow) => workflow.id).sort());
    });

    it('marks only the closing workflows as needing confirmation, and only cash register closing as needing an open register', () => {
      expect(
        BASE_TELLER_WORKFLOWS.filter((workflow) => workflow.requiresConfirmation).map((workflow) => workflow.id)
      ).toEqual([
        'cashRegisterClosing',
        'endOfDayClosing'
      ]);
      expect(
        BASE_TELLER_WORKFLOWS.filter((workflow) => workflow.requiresOpenSession).map((workflow) => workflow.id)
      ).toEqual(['cashRegisterClosing']);
    });

    it('gives withdrawal the red emphasis and no other operation', () => {
      expect(BASE_TELLER_WORKFLOWS.filter((workflow) => workflow.emphasis === 'danger').map((w) => w.id)).toEqual([
        'withdrawal'
      ]);
    });
  });

  describe('permission-based visibility', () => {
    const visible = (permissions: string[]) => authorizedWorkflows(permissions).map((workflow) => workflow.id);

    it('hides everything without permissions', () => {
      expect(visible([])).toEqual([]);
    });

    it('shows everything to ALL_FUNCTIONS in production', () => {
      expect(visible(['ALL_FUNCTIONS'])).toHaveLength(25);
    });

    it('lets ALL_FUNCTIONS_READ open read screens but not the FX screen or create-only deposits', () => {
      const ids = visible(['ALL_FUNCTIONS_READ']);
      expect(ids).toContain('transactionHistory');
      expect(ids).toContain('cashOnHand');
      expect(ids).not.toContain('foreignCurrency');
      expect(ids).not.toContain('bankDeposit');
      expect(ids).not.toContain('savingsDeposit');
    });

    it('requires the exact permission of each operation', () => {
      expect(visible(['READ_BASE_TELLER_CASH_EXCHANGE'])).toEqual(['cashExchange']);
      expect(visible(['CREATE_CASH_DEPOSIT']).sort()).toEqual([
        'bankDeposit',
        'depositInTransit'
      ]);
    });

    it('needs all three read permissions for withdrawals, matching its route guard', () => {
      expect(visible(['READ_BASE_TELLER_WITHDRAWAL'])).toEqual([]);
      expect(
        visible([
          'READ_BASE_TELLER_WITHDRAWAL',
          'READ_CLIENT',
          'READ_SAVINGSACCOUNT'
        ])
      ).toEqual(['withdrawal']);
    });

    it('needs both inventory and history permissions for vault history, matching its route guard', () => {
      expect(visible(['READ_BASE_TELLER_CASH_INVENTORY']).sort()).toEqual([
        'cashInventory',
        'vaultDeposit'
      ]);
      expect(
        visible([
          'READ_BASE_TELLER_CASH_INVENTORY',
          'READ_BASE_TELLER_TRANSACTION_HISTORY'
        ])
      ).toEqual(
        expect.arrayContaining([
          'vaultDeposit',
          'vaultHistory',
          'transactionHistory'
        ])
      );
      expect(visible(['READ_BASE_TELLER_TRANSACTION_HISTORY'])).toEqual(['transactionHistory']);
    });

    it('enforces transfers, cash transfers and FX even when the legacy RBAC flag is off, like their guards', () => {
      environment.productionModeEnableRBAC = false;
      const ids = visible([]);
      expect(ids).not.toContain('accountTransfers');
      expect(ids).not.toContain('cashTransfers');
      expect(ids).not.toContain('foreignCurrency');
      expect(ids).not.toContain('withdrawal');
      expect(ids).not.toContain('vaultDeposit');
      // Everything else follows the legacy "RBAC off shows all" behaviour.
      expect(ids).toContain('savingsOpening');
    });

    it('follows the same rules as the mifosxHasPermission directive', () => {
      expect(hasRbacPermission([], 'READ_X')).toBe(false);
      expect(hasRbacPermission(['ALL_FUNCTIONS'], 'DELETE_X')).toBe(true);
      expect(hasRbacPermission(['ALL_FUNCTIONS_READ'], 'READ_X')).toBe(true);
      expect(hasRbacPermission(['ALL_FUNCTIONS_READ'], 'CREATE_X')).toBe(false);
      expect(hasRbacPermission(['A'], '  ')).toBe(false);
      environment.productionModeEnableRBAC = false;
      expect(hasRbacPermission([], 'READ_X')).toBe(true);
    });
  });

  describe('feature availability', () => {
    it('hides Bill and Service Payment outside production mode', () => {
      environment.productionMode = false;
      const service = workflowById('servicePayment');
      expect(isWorkflowAuthorized(service!, ['ALL_FUNCTIONS'])).toBe(false);
      expect(authorizedWorkflows(['ALL_FUNCTIONS'])).toHaveLength(24);
    });

    it('shows Bill and Service Payment in production mode', () => {
      environment.productionMode = true;
      expect(isWorkflowAuthorized(workflowById('servicePayment')!, ['ALL_FUNCTIONS'])).toBe(true);
    });
  });

  describe('session prerequisites', () => {
    it('only disables operations that the backend gates on an open register', () => {
      const closing = workflowById('cashRegisterClosing')!;
      expect(workflowAvailability(closing, 'open')).toEqual({ enabled: true });
      expect(workflowAvailability(closing, 'not-opened')).toEqual({
        enabled: false,
        reasonKey: 'baseTellerWorkspace.availability.openRegister'
      });
      expect(workflowAvailability(closing, 'completed')).toEqual({
        enabled: false,
        reasonKey: 'baseTellerWorkspace.availability.registerClosed'
      });
    });

    it('does not block anything when the register state is unknown, leaving validation to the backend', () => {
      expect(workflowAvailability(workflowById('cashRegisterClosing')!, 'unknown')).toEqual({ enabled: true });
    });

    it('never disables other operations because the register is closed', () => {
      for (const id of [
        'savingsDeposit',
        'withdrawal',
        'endOfDayClosing',
        'cashAllocation',
        'vaultDeposit'
      ]) {
        expect(workflowAvailability(workflowById(id)!, 'not-opened')).toEqual({ enabled: true });
        expect(workflowAvailability(workflowById(id)!, 'completed')).toEqual({ enabled: true });
      }
    });
  });

  describe('frequent operations', () => {
    it('defaults to F2 deposit, F3 withdrawal, F4 loan payment, F5 bill payment', () => {
      expect(resolveFrequentOperations(undefined)).toEqual([
        { shortcut: 'F2', operationId: 'savingsDeposit' },
        { shortcut: 'F3', operationId: 'withdrawal' },
        { shortcut: 'F4', operationId: 'loanPayment' },
        { shortcut: 'F5', operationId: 'servicePayment' }
      ]);
      expect(routeOf('savingsDeposit')).toBe('/organization/base-teller/savings-account-deposits');
      expect(routeOf('withdrawal')).toBe('/organization/base-teller/withdrawals');
      expect(routeOf('loanPayment')).toBe('/organization/base-teller/credit-payments');
      expect(routeOf('servicePayment')).toBe('/organization/base-teller/service-payments');
    });

    it('accepts a valid reassignment and orders it by shortcut', () => {
      const custom = [
        { shortcut: 'F5' as const, operationId: 'cashExchange' },
        { shortcut: 'F2' as const, operationId: 'savingsDeposit' },
        { shortcut: 'F4' as const, operationId: 'accountTransfers' },
        { shortcut: 'F3' as const, operationId: 'withdrawal' }
      ];
      expect(resolveFrequentOperations(custom).map((slot) => slot.operationId)).toEqual([
        'savingsDeposit',
        'withdrawal',
        'accountTransfers',
        'cashExchange'
      ]);
    });

    it.each([
      [
        'a missing slot',
        DEFAULT_FREQUENT_OPERATIONS.slice(0, 3)
      ],
      [
        'a duplicate shortcut',
        [
          { shortcut: 'F2', operationId: 'savingsDeposit' },
          { shortcut: 'F2', operationId: 'withdrawal' },
          { shortcut: 'F4', operationId: 'loanPayment' },
          { shortcut: 'F5', operationId: 'servicePayment' }
        ]
      ],
      [
        'a duplicate operation',
        [
          { shortcut: 'F2', operationId: 'savingsDeposit' },
          { shortcut: 'F3', operationId: 'savingsDeposit' },
          { shortcut: 'F4', operationId: 'loanPayment' },
          { shortcut: 'F5', operationId: 'servicePayment' }
        ]
      ],
      [
        'an unknown operation',
        [
          { shortcut: 'F2', operationId: 'nope' },
          { shortcut: 'F3', operationId: 'withdrawal' },
          { shortcut: 'F4', operationId: 'loanPayment' },
          { shortcut: 'F5', operationId: 'servicePayment' }
        ]
      ],
      [
        'a closing workflow, which must never be a one-key shortcut',
        [
          { shortcut: 'F2', operationId: 'cashRegisterClosing' },
          { shortcut: 'F3', operationId: 'withdrawal' },
          { shortcut: 'F4', operationId: 'loanPayment' },
          { shortcut: 'F5', operationId: 'servicePayment' }
        ]
      ]
    ])('falls back to the defaults for %s', (_label, config) => {
      expect(resolveFrequentOperations(config as never)).toBe(DEFAULT_FREQUENT_OPERATIONS);
    });
  });
});
