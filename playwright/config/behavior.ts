/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Layer 2 — Behavior flags (Angular).
 *
 * Isolates UI differences between Angular and React so specs stay
 * identical and only this file changes per framework.
 *
 * React counterpart lives in
 * `mifos-x-web-app-react/playwright/config/behavior.ts`
 * with inverted values for the routing / snackbar / button flags and a
 * different `authStorageKey`.
 */

export const BEHAVIOR = {
  /**
   * Angular login button is disabled while the reactive form is invalid
   * (empty username/password), not only during the in-flight request.
   */
  loginButtonStartsDisabled: true,

  /**
   * Angular uses hash-based routing — every route is prefixed with `#`.
   */
  usesHashRouting: true,

  /**
   * Angular surfaces authentication errors through a Material snackbar
   * (.mat-mdc-snack-bar-container) rather than inline error text.
   */
  authErrorShowsSnackbar: true,

  /**
   * Angular Material menus render a CDK overlay backdrop that must be
   * dismissed before subsequent clicks register. React shadcn menus do
   * not require an explicit dismiss step.
   */
  overlayDismissNeeded: true,

  /**
   * Angular persists Fineract credentials in sessionStorage under this
   * key. The auth-setup project copies localStorage -> sessionStorage
   * on every test to survive page reloads.
   */
  authStorageKey: 'mifosXCredentials',

  /**
   * Angular date inputs format dates as "01 January 2024".
   */
  dateFormat: 'DD MMMM YYYY'
} as const;
