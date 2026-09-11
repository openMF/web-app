/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Global search index for the Home screen.
 *
 * Every entry needs a label and an absolute path to a page that renders, since a
 * stale path here drops the user on the 404 screen with no other warning.
 * `activities.spec.ts` enforces the shape only — labelled, absolute, no route
 * parameter, no repeated label. That a path reaches a component is not checked
 * there; verify a new path against the route configs, and beware a parent route
 * with children but no component of its own, which renders a blank page.
 */
const activities: any[] = [
  { activity: 'client', path: '/clients' },
  { activity: 'groups', path: '/groups' },
  { activity: 'centers', path: '/centers' },
  { activity: 'accounting', path: '/accounting' },
  { activity: 'users', path: '/appusers' },
  { activity: 'organization', path: '/organization' },
  { activity: 'system', path: '/system' },
  { activity: 'templates', path: '/templates' },
  { activity: 'create group', path: '/groups/create' },
  { activity: 'create center', path: '/centers/create' },
  { activity: 'configuration', path: '/system/configurations' },
  { activity: 'create loan product', path: '/products/loan-products/create' },
  { activity: 'create saving product', path: '/products/saving-products/create' },
  { activity: 'roles', path: '/system/roles-and-permissions' },
  { activity: 'add role', path: '/system/roles-and-permissions/add' },
  { activity: 'configure maker checker tasks', path: '/system/configure-mc-tasks' },
  { activity: 'loan products', path: '/products/loan-products' },
  { activity: 'charges', path: '/products/charges' },
  { activity: 'saving products', path: '/products/saving-products' },
  { activity: 'offices', path: '/organization/offices' },
  { activity: 'create office', path: '/organization/offices/create' },
  { activity: 'currency configurations', path: '/organization/currencies' },
  { activity: 'user settings', path: '/settings' },
  { activity: 'employees', path: '/organization/employees' },
  { activity: 'create employee', path: '/organization/employees/create' },
  { activity: 'manage funds', path: '/organization/manage-funds' },
  { activity: 'chart of accounts', path: '/accounting/chart-of-accounts' },
  { activity: 'frequent postings', path: '/accounting/journal-entries/frequent-postings' },
  { activity: 'journal entry', path: '/accounting/journal-entries' },
  { activity: 'search transaction', path: '/accounting/journal-entries' },
  { activity: 'account closure', path: '/accounting/closing-entries' },
  { activity: 'accounting rules', path: '/accounting/accounting-rules' },
  { activity: 'add accounting rule', path: '/accounting/accounting-rules/create' },
  { activity: 'data tables', path: '/system/data-tables' },
  { activity: 'create data table', path: '/system/data-tables/create' },
  { activity: 'add code', path: '/system/codes/create' },
  { activity: 'jobs', path: '/system/manage-jobs' },
  { activity: 'codes', path: '/system/codes' },
  { activity: 'reports', path: '/reports' },
  { activity: 'create report', path: '/system/reports/create' },
  { activity: 'holidays', path: '/organization/holidays' },
  { activity: 'create holiday', path: '/organization/holidays/create' },
  { activity: 'create charge', path: '/products/charges/create' },
  { activity: 'enter collection sheet', path: '/collections/collection-sheet' },
  { activity: 'product mix', path: '/products/products-mix' },
  { activity: 'add product mix', path: '/products/products-mix/create' },
  { activity: 'bulk loan reassignment', path: '/organization/bulkloan' },
  { activity: 'audit', path: '/system/audit-trails' },
  { activity: 'create accounting closure', path: '/accounting/closing-entries/create' },
  { activity: 'navigation', path: '/navigation' },
  { activity: 'remittances', path: '/remittances/process' },
  { activity: 'loans', path: '/loans' },
  { activity: 'collections', path: '/collections/collection-sheet' },
  { activity: 'notifications', path: '/notifications' },
  { activity: 'profile', path: '/profile' },
  { activity: 'settings', path: '/settings' },
  { activity: 'checker inbox and tasks', path: '/checker-inbox-and-tasks' }
];

export { activities };
