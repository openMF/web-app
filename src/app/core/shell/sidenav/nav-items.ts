/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { MenuCard } from 'app/home/card-menu/card-menu.component';
import { remittanceConfig } from 'app/remittances/remittance.config';

/** A page in the sidebar: a link, shown only with the permission. */
export type NavPage = Pick<MenuCard, 'label' | 'path' | 'permission'> & {
  /** Highlight only on this exact path, for a page whose path starts its siblings' paths. */
  exact?: boolean;
};

/** A sidebar module: a single link, or a group of pages that opens in place. */
export interface NavModule {
  /** Translation key. */
  label: string;
  /** Material Symbols icon name. */
  icon: string;
  /** Set for a single-link module. */
  path?: any[];
  /** Set for a group of pages. */
  children?: NavPage[];
  /** Permission(s) to show the module. A group defaults to any of its pages' permissions. */
  permission?: string | string[];
  /** Shown only when the compliance access answer offers the menu (fineract-dbug ADR 0036). */
  compliance?: boolean;
}

/** A titled block of modules. */
export interface NavSection {
  /** Translation key. */
  heading: string;
  items: NavModule[];
}

/** Pages of the Member Management landing page and sidebar group. */
export const memberManagementCards: MenuCard[] = [
  { label: 'labels.menus.Clients', icon: 'users', path: ['/members'], permission: 'READ_CLIENT' },
  { label: 'labels.menus.Groups', icon: 'sitemap', path: ['/groups'], permission: 'READ_GROUP' },
  { label: 'labels.menus.Centers', icon: 'building', path: ['/centers'], permission: 'READ_CENTER' },
  {
    label: 'membership.Membership Applications',
    icon: 'user-check',
    path: [
      '/members',
      'applications'
    ],
    permission: 'READ_MEMBERSHIP'
  }
];

/** Pages of the Reports landing page and sidebar group. */
export const reportsCards: (MenuCard & NavPage)[] = [
  { label: 'labels.menus.Clients', icon: 'users', path: [
      '/reports',
      'Client'
    ], permission: 'READ_REPORT' },
  { label: 'labels.menus.Loans', icon: 'hand-holding-usd', path: [
      '/reports',
      'Loan'
    ], permission: 'READ_REPORT' },
  { label: 'labels.menus.Savings', icon: 'money-bill-wave', path: [
      '/reports',
      'Savings'
    ], permission: 'READ_REPORT' },
  { label: 'labels.menus.Funds', icon: 'money-bill', path: [
      '/reports',
      'Fund'
    ], permission: 'READ_REPORT' },
  {
    label: 'labels.menus.Accounting',
    icon: 'money-bill-alt',
    path: [
      '/reports',
      'Accounting'
    ],
    permission: 'READ_REPORT'
  },
  { label: 'labels.menus.Loan Aging', icon: 'clock', path: ['/loan-aging'], permission: 'READ_LOAN' }
];

/** Pages of the Admin landing page and sidebar group. */
export const adminCards: MenuCard[] = [
  { label: 'labels.menus.Users', icon: 'users', path: ['/appusers'], permission: 'READ_USER' },
  { label: 'labels.menus.Organization', icon: 'building', path: ['/organization'], permission: 'READ_OFFICE' },
  { label: 'labels.menus.System', icon: 'cogs', path: ['/system'], permission: 'READ_CONFIGURATION' },
  { label: 'labels.menus.Products', icon: 'tags', path: ['/products'], permission: 'READ_PRODUCT' },
  { label: 'labels.menus.Templates', icon: 'file-alt', path: ['/templates'], permission: 'READ_TEMPLATE' }
];

/** Pages of the Accounting landing page, in its order. */
const accountingPages: NavPage[] = [
  {
    label: 'labels.heading.Frequent Postings',
    path: ['/accounting/journal-entries/frequent-postings'],
    permission: 'CREATE_JOURNALENTRY'
  },
  {
    label: 'labels.heading.Create Journal Entries',
    path: ['/accounting/journal-entries/create'],
    permission: 'CREATE_JOURNALENTRY'
  },
  {
    label: 'labels.heading.Search Journal Entries',
    path: ['/accounting/journal-entries'],
    permission: 'READ_JOURNALENTRY',
    exact: true
  },
  {
    label: 'labels.heading.Accounts Linked to Financial Activities',
    path: ['/accounting/financial-activity-mappings'],
    permission: 'READ_FINANCIALACTIVITYACCOUNT'
  },
  {
    label: 'labels.heading.Migrate Opening Balances (Office-wise)',
    path: ['/accounting/migrate-opening-balances'],
    permission: 'READ_JOURNALENTRY'
  },
  { label: 'labels.heading.Chart of Accounts', path: ['/accounting/chart-of-accounts'], permission: 'READ_GLACCOUNT' },
  { label: 'labels.heading.Closing Entries', path: ['/accounting/closing-entries'], permission: 'READ_GLCLOSURE' },
  {
    label: 'labels.heading.Accounting Rules',
    path: ['/accounting/accounting-rules'],
    permission: 'READ_ACCOUNTINGRULE'
  },
  {
    label: 'labels.heading.Accruals',
    path: ['/accounting/periodic-accruals'],
    permission: 'EXECUTE_PERIODICACCRUALACCOUNTING'
  },
  {
    label: 'labels.heading.Provisioning Entries',
    path: ['/accounting/provisioning-entries'],
    permission: 'VIEW_PROVISIONING_ENTRIES'
  }
];

/**
 * Every menu of the sidebar, most used first: members and the day's counter work at the top,
 * month-end finance next, setup last.
 */
export const navSections: NavSection[] = [
  {
    heading: 'labels.menus.Members',
    items: [
      { label: 'labels.menus.Member Management', icon: 'groups', children: memberManagementCards },
      { label: 'labels.menus.Navigation', icon: 'explore', path: ['/navigation'], permission: 'READ_CLIENT' }
    ]
  },
  {
    heading: 'labels.menus.Operations',
    items: [
      {
        label: 'labels.menus.Quick Deposit',
        icon: 'savings',
        path: ['/quick-deposit'],
        permission: 'DEPOSIT_SAVINGSACCOUNT'
      },
      {
        label: 'labels.menus.Quick Withdraw',
        icon: 'payments',
        path: ['/quick-withdraw'],
        permission: 'WITHDRAWAL_SAVINGSACCOUNT'
      },
      {
        label: 'labels.menus.Collections',
        icon: 'receipt_long',
        children: [
          {
            label: 'labels.menus.Collection Sheet',
            path: ['/collections/collection-sheet'],
            permission: 'READ_COLLECTIONSHEET'
          },
          {
            label: 'labels.menus.Individual Collection Sheet',
            path: ['/collections/individual-collection-sheet'],
            permission: 'READ_COLLECTIONSHEET'
          }
        ]
      },
      {
        label: 'labels.menus.Checker Inbox and Tasks',
        icon: 'fact_check',
        path: ['/checker-inbox-and-tasks/checker-inbox'],
        permission: [
          'ALL_FUNCTIONS_READ',
          'READ_MAKERCHECKER',
          'APPROVE_LOAN',
          'APPROVE_LOAN_CHECKER'
        ]
      },
      {
        label: 'labels.menus.Loan Calculator',
        icon: 'calculate',
        path: ['/loan-calculator'],
        permission: 'READ_LOAN'
      },
      ...(remittanceConfig.isRemittanceEnabled
        ? [{ label: 'labels.menus.Remittances', icon: 'currency_exchange', path: ['/remittances/process'] }]
        : [])
    ]
  },
  {
    heading: 'labels.menus.Finance',
    items: [
      { label: 'labels.menus.Accounting', icon: 'account_balance', children: accountingPages },
      { label: 'labels.menus.Reports', icon: 'bar_chart', children: reportsCards },
      { label: 'compliance.Compliance', icon: 'shield_person', path: ['/compliance'], compliance: true },
      {
        label: 'governanceRegister.GovernanceRegister',
        icon: 'gavel',
        path: ['/governance-register'],
        permission: 'READ_GOVERNANCE'
      },
      {
        label: 'managementReports.ManagementReports',
        icon: 'summarize',
        path: ['/management-reports'],
        permission: 'READ_MANAGEMENTREPORT'
      }
    ]
  },
  {
    heading: 'labels.menus.Administration',
    items: [{ label: 'labels.menus.Admin', icon: 'admin_panel_settings', children: adminCards }]
  }
];

/** Permission(s) that show a module: its own, else any of its pages'. Undefined means everyone. */
export function modulePermission(item: NavModule): string | string[] | undefined {
  return item.permission ?? item.children?.flatMap((page) => page.permission);
}
