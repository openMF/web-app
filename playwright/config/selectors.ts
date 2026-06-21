/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Layer 2 — Typed selector contracts (Angular).
 *
 * This is the ONLY file that differs between Angular and React.
 * All page objects consume these typed maps. Specs never reference
 * selectors directly — they call page object methods only.
 *
 * React counterpart lives in
 * `mifos-x-web-app-react/playwright/config/selectors.ts`
 * and uses data-testid / name selectors instead of formcontrolname /
 * Angular Material class names.
 *
 * Interface signatures here MUST match the React file so a port across
 * frameworks is a configuration swap, not a code rewrite (proposal §8).
 */

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export interface LoginSelectors {
  usernameInput: string;
  passwordInput: string;
  loginButton: string;
  errorMessage: string;
  progressBar: string;
  loginForm: string;
}

export const LOGIN_SELECTORS: LoginSelectors = {
  usernameInput: 'input[formcontrolname="username"]',
  passwordInput: 'input[formcontrolname="password"]',
  loginButton: 'button:has-text("Login")',
  errorMessage: 'mat-error',
  progressBar: 'mat-progress-bar',
  loginForm: '#login-form'
};

// ---------------------------------------------------------------------------
// Dashboard / shell
// ---------------------------------------------------------------------------

export interface DashboardSelectors {
  toolbar: string;
}

export const DASHBOARD_SELECTORS: DashboardSelectors = {
  toolbar: 'mat-toolbar'
};

// ---------------------------------------------------------------------------
// Client — create form
// ---------------------------------------------------------------------------

export interface CreateClientSelectors {
  officeDropdown: string;
  firstnameInput: string;
  lastnameInput: string;
  submitButton: string;
  validationError: string;
}

export const CREATE_CLIENT_SELECTORS: CreateClientSelectors = {
  officeDropdown: 'mat-select[formcontrolname="officeId"]',
  firstnameInput: 'input[formcontrolname="firstname"]',
  lastnameInput: 'input[formcontrolname="lastname"]',
  submitButton: 'button[type="submit"]',
  validationError: 'mat-error'
};

// ---------------------------------------------------------------------------
// Client — view / actions
// ---------------------------------------------------------------------------

export interface ClientViewSelectors {
  actionsButton: string;
  actionsSubmenuTrigger: string;
  successSnackbar: string;
  personalDataTab: string;
  closedDateRow: string;
  closedDateValue: string;
  overlayBackdrop: string;
}

export const CLIENT_VIEW_SELECTORS: ClientViewSelectors = {
  actionsButton: 'button[aria-label="Client actions"], button:has-text("Client actions")',
  actionsSubmenuTrigger: 'Actions',
  successSnackbar: '.mat-mdc-snack-bar-container',
  personalDataTab: 'Personal Data',
  closedDateRow: '.data-item',
  closedDateValue: '.value',
  overlayBackdrop: '.cdk-overlay-backdrop'
};

// ---------------------------------------------------------------------------
// Close client action form
// ---------------------------------------------------------------------------

export interface CloseClientSelectors {
  closureDateInput: string;
  closureReasonSelect: string;
  confirmButton: string;
  cancelButton: string;
}

export const CLOSE_CLIENT_SELECTORS: CloseClientSelectors = {
  closureDateInput: 'input[formcontrolname="closureDate"]',
  closureReasonSelect: 'mat-select[formcontrolname="closureReasonId"]',
  confirmButton: 'Confirm',
  cancelButton: 'Cancel'
};
