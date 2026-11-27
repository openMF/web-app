/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { InjectionToken } from '@angular/core';
import { _ as extract } from '@ngx-translate/core';

import { environment } from 'environments/environment';
import { canReadTransfers } from '../account-transfers/account-transfer.guard';
import { canReadCashTransfers } from '../cash-transfers-between-tellers/cash-transfer.guard';
import { canReadVault, canReadVaultHistory } from '../vault-cash-deposit/vault-cash-deposit.guard';
import { canReadWithdrawals } from '../withdrawals/withdrawal.guard';
import { hasFxPermission } from '../../foreign-currency/foreign-currency.guard';

/** Display groups of the Base Teller workspace, in the order they are rendered. */
export type BaseTellerCategory = 'customer' | 'cash-drawer' | 'vault-banks' | 'consultations' | 'closings';

export const BASE_TELLER_CATEGORIES: readonly {
  id: BaseTellerCategory;
  titleKey: string;
  descriptionKey: string;
}[] = [
  {
    id: 'customer',
    titleKey: extract('baseTellerWorkspace.categories.customer.title'),
    descriptionKey: extract('baseTellerWorkspace.categories.customer.description')
  },
  {
    id: 'cash-drawer',
    titleKey: extract('baseTellerWorkspace.categories.cashDrawer.title'),
    descriptionKey: extract('baseTellerWorkspace.categories.cashDrawer.description')
  },
  {
    id: 'vault-banks',
    titleKey: extract('baseTellerWorkspace.categories.vaultBanks.title'),
    descriptionKey: extract('baseTellerWorkspace.categories.vaultBanks.description')
  },
  {
    id: 'consultations',
    titleKey: extract('baseTellerWorkspace.categories.consultations.title'),
    descriptionKey: extract('baseTellerWorkspace.categories.consultations.description')
  },
  {
    id: 'closings',
    titleKey: extract('baseTellerWorkspace.categories.closings.title'),
    descriptionKey: extract('baseTellerWorkspace.categories.closings.description')
  }
];

/**
 * One Base Teller operation. This is the single navigation registry: routes and permissions are the ones the screens
 * already used; the extra fields add grouping, search and session-prerequisite metadata.
 */
export interface BaseTellerWorkflow {
  /** Stable identifier used by shortcuts, search and tests. */
  id: string;
  /** Existing translation key of the operation name. */
  label: string;
  descriptionKey: string;
  /** Translation key holding a comma-separated list of search synonyms for the active language. */
  termsKey: string;
  materialIcon: string;
  /** Existing permission string (kept for documentation and the default RBAC check). */
  permission: string;
  route: readonly string[];
  category: BaseTellerCategory;
  /**
   * Overrides the default RBAC check for operations whose route guard enforces more than one permission or ignores
   * the legacy RBAC flag. Mirrors the guard of the destination route.
   */
  authorize?: (permissions: readonly string[]) => boolean;
  productionOnly?: boolean;
  /** True only when the backend rejects the operation unless the cash register is open (`closing.not.opened`). */
  requiresOpenSession?: boolean;
  /** True for consequential reconciliation workflows that must be confirmed before navigation. */
  requiresConfirmation?: boolean;
  /** Red icon emphasis for cash leaving the bank. */
  emphasis?: 'danger';
}

function tellerRoute(...segments: string[]): readonly string[] {
  return [
    '/organization',
    'base-teller',
    ...segments
  ];
}

/**
 * Every Base Teller operation (25 distinct routes), in display order. Routes and permissions are unchanged from the
 * previous landing page; vault deposit, vault history and withdrawals used to be computed in component getters.
 */
export const BASE_TELLER_WORKFLOWS: readonly BaseTellerWorkflow[] = [
  {
    id: 'savingsDeposit',
    label: 'labels.heading.Savings Account Deposit',
    descriptionKey: extract('baseTellerWorkspace.operations.savingsDeposit.description'),
    termsKey: extract('baseTellerWorkspace.operations.savingsDeposit.terms'),
    materialIcon: 'download',
    permission: 'DEPOSIT_SAVINGSACCOUNT',
    route: tellerRoute('savings-account-deposits'),
    category: 'customer'
  },
  {
    id: 'withdrawal',
    label: 'withdrawal.title',
    descriptionKey: extract('baseTellerWorkspace.operations.withdrawal.description'),
    termsKey: extract('baseTellerWorkspace.operations.withdrawal.terms'),
    materialIcon: 'upload',
    permission: 'READ_BASE_TELLER_WITHDRAWAL',
    route: tellerRoute('withdrawals'),
    category: 'customer',
    authorize: canReadWithdrawals,
    emphasis: 'danger'
  },
  {
    id: 'loanPayment',
    label: 'creditPayment.heading.title',
    descriptionKey: extract('baseTellerWorkspace.operations.loanPayment.description'),
    termsKey: extract('baseTellerWorkspace.operations.loanPayment.terms'),
    materialIcon: 'payments',
    permission: 'READ_BASE_TELLER_CREDIT_PAYMENT',
    route: tellerRoute('credit-payments'),
    category: 'customer'
  },
  {
    id: 'servicePayment',
    label: 'labels.heading.Bill and Service Payment',
    descriptionKey: extract('baseTellerWorkspace.operations.servicePayment.description'),
    termsKey: extract('baseTellerWorkspace.operations.servicePayment.terms'),
    materialIcon: 'receipt',
    permission: 'READ_BASE_TELLER_SERVICE_PAYMENT',
    route: tellerRoute('service-payments'),
    category: 'customer',
    productionOnly: true
  },
  {
    id: 'savingsOpening',
    label: 'labels.heading.Savings Account Opening',
    descriptionKey: extract('baseTellerWorkspace.operations.savingsOpening.description'),
    termsKey: extract('baseTellerWorkspace.operations.savingsOpening.terms'),
    materialIcon: 'savings',
    permission: 'READ_TELLER',
    route: tellerRoute('savings-account-openings'),
    category: 'customer'
  },
  {
    id: 'accountTransfers',
    label: 'accountTransfer.title',
    descriptionKey: extract('baseTellerWorkspace.operations.accountTransfers.description'),
    termsKey: extract('baseTellerWorkspace.operations.accountTransfers.terms'),
    materialIcon: 'swap_horiz',
    permission: 'READ_ACCOUNTTRANSFER',
    route: tellerRoute('account-transfers'),
    category: 'customer',
    authorize: canReadTransfers
  },
  {
    id: 'returnedCheck',
    label: 'labels.heading.Returned Check Payment',
    descriptionKey: extract('baseTellerWorkspace.operations.returnedCheck.description'),
    termsKey: extract('baseTellerWorkspace.operations.returnedCheck.terms'),
    materialIcon: 'credit_card',
    permission: 'READ_BASE_TELLER_RETURNED_CHECK_PAYMENT',
    route: tellerRoute('returned-check-payments'),
    category: 'customer'
  },
  {
    id: 'foreignCurrency',
    label: 'fx.title',
    descriptionKey: extract('baseTellerWorkspace.operations.foreignCurrency.description'),
    termsKey: extract('baseTellerWorkspace.operations.foreignCurrency.terms'),
    materialIcon: 'currency_exchange',
    permission: 'READ_BASE_TELLER_FX',
    route: tellerRoute('foreign-currency'),
    category: 'customer',
    authorize: (permissions) => hasFxPermission(permissions, 'READ_BASE_TELLER_FX')
  },
  {
    id: 'cashExchange',
    label: 'cashExchange.title',
    descriptionKey: extract('baseTellerWorkspace.operations.cashExchange.description'),
    termsKey: extract('baseTellerWorkspace.operations.cashExchange.terms'),
    materialIcon: 'autorenew',
    permission: 'READ_BASE_TELLER_CASH_EXCHANGE',
    route: tellerRoute('cash-exchange'),
    category: 'customer'
  },
  {
    id: 'cashAllocation',
    label: 'cashAllocation.title',
    descriptionKey: extract('baseTellerWorkspace.operations.cashAllocation.description'),
    termsKey: extract('baseTellerWorkspace.operations.cashAllocation.terms'),
    materialIcon: 'add_card',
    permission: 'READ_BASE_TELLER_CASH_ALLOCATION',
    route: tellerRoute('cash-allocations'),
    category: 'cash-drawer'
  },
  {
    id: 'cashPickup',
    label: 'cashPickup.title',
    descriptionKey: extract('baseTellerWorkspace.operations.cashPickup.description'),
    termsKey: extract('baseTellerWorkspace.operations.cashPickup.terms'),
    materialIcon: 'move_up',
    permission: 'READ_BASE_TELLER_CASH_DRAWER_PICKUP',
    route: tellerRoute('cash-drawer-pickup'),
    category: 'cash-drawer'
  },
  {
    id: 'cashOnHand',
    label: 'web1232.views.holdings',
    descriptionKey: extract('baseTellerWorkspace.operations.cashOnHand.description'),
    termsKey: extract('baseTellerWorkspace.operations.cashOnHand.terms'),
    materialIcon: 'account_balance_wallet',
    permission: 'READ_CASH_HOLDINGS',
    route: tellerRoute('cash-on-hand'),
    category: 'cash-drawer'
  },
  {
    id: 'cashTransfers',
    label: 'cashTellerTransfer.title',
    descriptionKey: extract('baseTellerWorkspace.operations.cashTransfers.description'),
    termsKey: extract('baseTellerWorkspace.operations.cashTransfers.terms'),
    materialIcon: 'sync_alt',
    permission: 'READ_BASE_TELLER_CASH_TRANSFER',
    route: tellerRoute('cash-transfers-between-tellers'),
    category: 'cash-drawer',
    authorize: canReadCashTransfers
  },
  {
    id: 'cashInventory',
    label: 'cashInventory.title',
    descriptionKey: extract('baseTellerWorkspace.operations.cashInventory.description'),
    termsKey: extract('baseTellerWorkspace.operations.cashInventory.terms'),
    materialIcon: 'bar_chart',
    permission: 'READ_BASE_TELLER_CASH_INVENTORY',
    route: tellerRoute('cash-inventory'),
    category: 'cash-drawer'
  },
  {
    id: 'globalCashCount',
    label: 'web1232.views.global',
    descriptionKey: extract('baseTellerWorkspace.operations.globalCashCount.description'),
    termsKey: extract('baseTellerWorkspace.operations.globalCashCount.terms'),
    materialIcon: 'fact_check',
    permission: 'READ_GLOBAL_SETTLEMENT',
    route: tellerRoute('global-cash-count'),
    category: 'cash-drawer'
  },
  {
    id: 'vaultDeposit',
    label: 'vaultDeposit.title',
    descriptionKey: extract('baseTellerWorkspace.operations.vaultDeposit.description'),
    termsKey: extract('baseTellerWorkspace.operations.vaultDeposit.terms'),
    materialIcon: 'savings',
    permission: 'READ_BASE_TELLER_CASH_INVENTORY',
    route: tellerRoute('vault-cash-deposit'),
    category: 'vault-banks',
    authorize: canReadVault
  },
  {
    id: 'vaultHistory',
    label: 'vaultDeposit.history.title',
    descriptionKey: extract('baseTellerWorkspace.operations.vaultHistory.description'),
    termsKey: extract('baseTellerWorkspace.operations.vaultHistory.terms'),
    materialIcon: 'history',
    permission: 'READ_BASE_TELLER_TRANSACTION_HISTORY',
    route: tellerRoute('vault-cash-deposit', 'history'),
    category: 'vault-banks',
    authorize: canReadVaultHistory
  },
  {
    id: 'bankDeposit',
    label: 'web1232.views.bank-deposit',
    descriptionKey: extract('baseTellerWorkspace.operations.bankDeposit.description'),
    termsKey: extract('baseTellerWorkspace.operations.bankDeposit.terms'),
    materialIcon: 'account_balance',
    permission: 'CREATE_CASH_DEPOSIT',
    route: tellerRoute('bank-deposit'),
    category: 'vault-banks'
  },
  {
    id: 'depositInTransit',
    label: 'web1232.views.deposit-in-transit',
    descriptionKey: extract('baseTellerWorkspace.operations.depositInTransit.description'),
    termsKey: extract('baseTellerWorkspace.operations.depositInTransit.terms'),
    materialIcon: 'local_shipping',
    permission: 'CREATE_CASH_DEPOSIT',
    route: tellerRoute('deposit-in-transit'),
    category: 'vault-banks'
  },
  {
    /**
     * `cash-operation-history` lists deposit-in-transit and bank-deposit operations (CashManagementComponent, view
     * "history"). It is a different screen from `transaction-history`, so it keeps its own, accurately named entry
     * instead of being merged with it. See WORKSPACE-AUDIT.md.
     */
    id: 'cashOperationHistory',
    label: extract('baseTellerWorkspace.operations.cashOperationHistory.title'),
    descriptionKey: extract('baseTellerWorkspace.operations.cashOperationHistory.description'),
    termsKey: extract('baseTellerWorkspace.operations.cashOperationHistory.terms'),
    materialIcon: 'history',
    permission: 'READ_CASH_OPERATION_HISTORY',
    route: tellerRoute('cash-operation-history'),
    category: 'vault-banks'
  },
  {
    id: 'transactionHistory',
    label: 'transactionHistory.title',
    descriptionKey: extract('baseTellerWorkspace.operations.transactionHistory.description'),
    termsKey: extract('baseTellerWorkspace.operations.transactionHistory.terms'),
    materialIcon: 'receipt_long',
    permission: 'READ_BASE_TELLER_TRANSACTION_HISTORY',
    route: tellerRoute('transaction-history'),
    category: 'consultations'
  },
  {
    id: 'transactionReversal',
    label: 'transactionReversal.title',
    descriptionKey: extract('baseTellerWorkspace.operations.transactionReversal.description'),
    termsKey: extract('baseTellerWorkspace.operations.transactionReversal.terms'),
    materialIcon: 'undo',
    permission: 'READ_BASE_TELLER_TRANSACTION_REVERSAL',
    route: tellerRoute('transaction-reversal'),
    category: 'consultations'
  },
  {
    id: 'catalogUpdates',
    label: 'labels.heading.Catalog Updates',
    descriptionKey: extract('baseTellerWorkspace.operations.catalogUpdates.description'),
    termsKey: extract('baseTellerWorkspace.operations.catalogUpdates.terms'),
    materialIcon: 'sync',
    permission: 'READ_BASE_TELLER_CATALOG_UPDATE',
    route: tellerRoute('catalog-updates'),
    category: 'consultations'
  },
  {
    id: 'cashRegisterClosing',
    label: 'web1232.views.closing',
    descriptionKey: extract('baseTellerWorkspace.operations.cashRegisterClosing.description'),
    termsKey: extract('baseTellerWorkspace.operations.cashRegisterClosing.terms'),
    materialIcon: 'lock',
    permission: 'READ_CASHIER_CLOSING',
    route: tellerRoute('cash-register-closing'),
    category: 'closings',
    requiresOpenSession: true,
    requiresConfirmation: true
  },
  {
    id: 'endOfDayClosing',
    label: 'eod.title',
    descriptionKey: extract('baseTellerWorkspace.operations.endOfDayClosing.description'),
    termsKey: extract('baseTellerWorkspace.operations.endOfDayClosing.terms'),
    materialIcon: 'bedtime',
    permission: 'READ_BASE_TELLER_END_OF_DAY_CLOSING',
    route: tellerRoute('end-of-day-cash-closing'),
    category: 'closings',
    requiresConfirmation: true
  }
];

export function workflowById(id: string): BaseTellerWorkflow | undefined {
  return BASE_TELLER_WORKFLOWS.find((workflow) => workflow.id === id);
}

/**
 * Same decision the `*mifosxHasPermission` directive makes: everything is visible when the legacy RBAC flag is off,
 * `ALL_FUNCTIONS` allows everything, `ALL_FUNCTIONS_READ` allows `READ_*` permissions.
 */
export function hasRbacPermission(permissions: readonly string[], permission: string): boolean {
  if (!environment.productionModeEnableRBAC) {
    return true;
  }
  if (permissions.includes('ALL_FUNCTIONS')) {
    return true;
  }
  const required = permission.trim();
  if (required === '') {
    return false;
  }
  return (required.startsWith('READ_') && permissions.includes('ALL_FUNCTIONS_READ')) || permissions.includes(required);
}

/** True when the user may see and open the operation. Unauthorised operations are hidden, never shown disabled. */
export function isWorkflowAuthorized(workflow: BaseTellerWorkflow, permissions: readonly string[]): boolean {
  if (workflow.productionOnly && !environment.productionMode) {
    return false;
  }
  return workflow.authorize ? workflow.authorize(permissions) : hasRbacPermission(permissions, workflow.permission);
}

export function authorizedWorkflows(permissions: readonly string[]): readonly BaseTellerWorkflow[] {
  return BASE_TELLER_WORKFLOWS.filter((workflow) => isWorkflowAuthorized(workflow, permissions));
}

/** Authorised operations of one category, in display order. */
export function workflowsInCategory(
  workflows: readonly BaseTellerWorkflow[],
  category: BaseTellerCategory
): readonly BaseTellerWorkflow[] {
  return workflows.filter((workflow) => workflow.category === category);
}

export type FrequentShortcut = 'F2' | 'F3' | 'F4' | 'F5';

export interface FrequentOperationSlot {
  shortcut: FrequentShortcut;
  operationId: string;
}

export const FREQUENT_SHORTCUTS: readonly FrequentShortcut[] = [
  'F2',
  'F3',
  'F4',
  'F5'
];

/** Jira WEB-1484 defaults. */
export const DEFAULT_FREQUENT_OPERATIONS: readonly FrequentOperationSlot[] = [
  { shortcut: 'F2', operationId: 'savingsDeposit' },
  { shortcut: 'F3', operationId: 'withdrawal' },
  { shortcut: 'F4', operationId: 'loanPayment' },
  { shortcut: 'F5', operationId: 'servicePayment' }
];

/**
 * Frequent-operation configuration.
 *
 * No institution-level preference store exists (Fineract and the plugin expose none, and this ticket must not invent
 * an endpoint), so the default is a code constant. Provide this token to change it for a deployment; invalid values
 * fall back to the defaults, see {@link resolveFrequentOperations}.
 */
export const BASE_TELLER_FREQUENT_OPERATIONS = new InjectionToken<readonly FrequentOperationSlot[]>(
  'BASE_TELLER_FREQUENT_OPERATIONS',
  { providedIn: 'root', factory: () => DEFAULT_FREQUENT_OPERATIONS }
);

/**
 * Validates a frequent-operation configuration. It must assign each of F2-F5 exactly once to a known, non-closing
 * operation; anything else is rejected as a whole in favour of the defaults.
 */
export function resolveFrequentOperations(
  config: readonly FrequentOperationSlot[] | null | undefined
): readonly FrequentOperationSlot[] {
  if (!config || config.length !== FREQUENT_SHORTCUTS.length) {
    return DEFAULT_FREQUENT_OPERATIONS;
  }
  const shortcuts = new Set(config.map((slot) => slot.shortcut));
  const operations = new Set(config.map((slot) => slot.operationId));
  const valid =
    shortcuts.size === FREQUENT_SHORTCUTS.length &&
    FREQUENT_SHORTCUTS.every((shortcut) => shortcuts.has(shortcut)) &&
    operations.size === config.length &&
    config.every((slot) => {
      const workflow = workflowById(slot.operationId);
      return !!workflow && !workflow.requiresConfirmation;
    });
  return valid
    ? [...config].sort((a, b) => FREQUENT_SHORTCUTS.indexOf(a.shortcut) - FREQUENT_SHORTCUTS.indexOf(b.shortcut))
    : DEFAULT_FREQUENT_OPERATIONS;
}

export type RegisterState = 'open' | 'not-opened' | 'completed' | 'unknown';

export type WorkflowAvailability = { enabled: true } | { enabled: false; reasonKey: string };

/**
 * Temporary availability, separate from authorisation: an authorised operation may still be disabled until the cash
 * register is open. Only operations the backend really gates on an open register set `requiresOpenSession`; when the
 * register state is unknown the operation stays enabled and the destination screen/backend validates.
 */
export function workflowAvailability(workflow: BaseTellerWorkflow, register: RegisterState): WorkflowAvailability {
  if (!workflow.requiresOpenSession) {
    return { enabled: true };
  }
  if (register === 'not-opened') {
    return { enabled: false, reasonKey: extract('baseTellerWorkspace.availability.openRegister') };
  }
  if (register === 'completed') {
    return { enabled: false, reasonKey: extract('baseTellerWorkspace.availability.registerClosed') };
  }
  return { enabled: true };
}
