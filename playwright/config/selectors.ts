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
 * frameworks is a configuration swap, not a code rewrite.
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
// Client — create form (mat-stepper)
// ---------------------------------------------------------------------------

/**
 * Selector contract for the Mifos X create-client mat-stepper flow.
 *
 * Field naming is framework-agnostic so the React port (shadcn / RHF
 * wizard) can fill the same logical fields without spec rewrites:
 *
 *   - `stepperRoot` / `step*Label` resolve via role + accessible name
 *     in both frameworks (mat-step-header role="tab" / shadcn tablist).
 *   - `nextButton` / `previousButton` resolve through accessible name
 *     ("Next" / "Previous") rather than directive selectors.
 *   - Form field selectors target attributes that exist in both
 *     frameworks (`formcontrolname` in Angular, `name` in React).
 *   - Family / address dialog selectors are exposed so the page object
 *     does not need to know whether the dialog is a `MatDialog`
 *     overlay or a React portal.
 *
 * The legacy fields (`officeDropdown`, `firstnameInput`, `lastnameInput`,
 * `submitButton`, `validationError`) are preserved unchanged so any
 * pre-existing consumer continues to compile while the stepper-aware
 * locators land.
 */
export interface CreateClientSelectors {
  // ── Stepper shell ──────────────────────────────────────────────────
  stepperRoot: string;
  stepHeaderRole: 'tab' | 'button';
  stepLabelGeneral: string;
  stepLabelFamilyMembers: string;
  stepLabelAddress: string;
  stepLabelPreview: string;
  nextButton: string;
  previousButton: string;

  // ── General step (legacy + extended fields) ────────────────────────
  officeDropdown: string;
  legalFormDropdown: string;
  firstnameInput: string;
  middlenameInput: string;
  lastnameInput: string;
  fullnameInput: string;
  externalIdInput: string;
  mobileInput: string;
  emailInput: string;
  dateOfBirthInput: string;
  clientTypeDropdown: string;
  clientClassificationDropdown: string;
  submittedOnDateInput: string;
  activeCheckbox: string;
  activationDateInput: string;
  submitButton: string;
  validationError: string;

  // ── Family-member dialog ───────────────────────────────────────────
  addFamilyMemberButton: string;
  familyMemberDialog: string;
  familyMemberFirstnameInput: string;
  familyMemberMiddlenameInput: string;
  familyMemberLastnameInput: string;
  familyMemberRelationshipDropdown: string;
  familyMemberGenderDropdown: string;
  familyMemberDobInput: string;
  familyMemberConfirmButton: string;

  // ── Address dialog (FormDialogComponent) ───────────────────────────
  addAddressButton: string;
  addressDialog: string;
  addressTypeDropdown: string;
  addressStreetInput: string;
  addressLine1Input: string;
  addressCityInput: string;
  addressPostalCodeInput: string;
  addressCountryDropdown: string;
  addressSubmitButton: string;

  // ── Preview step ───────────────────────────────────────────────────
  previewSubmitButton: string;
}

export const CREATE_CLIENT_SELECTORS: CreateClientSelectors = {
  // Stepper shell — mat-step-header carries role="tab"; matStepperNext
  // / matStepperPrevious render plain buttons with translated labels.
  stepperRoot: 'mat-stepper',
  stepHeaderRole: 'tab',
  stepLabelGeneral: 'General',
  stepLabelFamilyMembers: 'Family Members',
  stepLabelAddress: 'Address',
  stepLabelPreview: 'Preview',
  nextButton: 'button[matsteppernext]',
  previousButton: 'button[matstepperprevious]',

  // General step — formcontrolname is the Angular contract;
  // page object also exposes role-based fallbacks for accessibility.
  officeDropdown: 'mat-select[formcontrolname="officeId"]',
  legalFormDropdown: 'mat-select[formcontrolname="legalFormId"]',
  firstnameInput: 'input[formcontrolname="firstname"]',
  middlenameInput: 'input[formcontrolname="middlename"]',
  lastnameInput: 'input[formcontrolname="lastname"]',
  fullnameInput: 'input[formcontrolname="fullname"]',
  externalIdInput: 'input[formcontrolname="externalId"]',
  mobileInput: 'input[formcontrolname="mobileNo"]',
  emailInput: 'input[formcontrolname="emailAddress"]',
  dateOfBirthInput: 'input[formcontrolname="dateOfBirth"]',
  clientTypeDropdown: 'mat-select[formcontrolname="clientTypeId"]',
  clientClassificationDropdown: 'mat-select[formcontrolname="clientClassificationId"]',
  submittedOnDateInput: 'input[formcontrolname="submittedOnDate"]',
  activeCheckbox: 'mat-checkbox[formcontrolname="active"]',
  activationDateInput: 'input[formcontrolname="activationDate"]',
  submitButton: 'button[type="submit"]',
  validationError: 'mat-error',

  // Family-member dialog — rendered by ClientFamilyMemberDialogComponent.
  addFamilyMemberButton: 'Add',
  familyMemberDialog: 'mat-dialog-container:has-text("Family Member")',
  familyMemberFirstnameInput: 'input[formcontrolname="firstName"]',
  familyMemberMiddlenameInput: 'input[formcontrolname="middleName"]',
  familyMemberLastnameInput: 'input[formcontrolname="lastName"]',
  familyMemberRelationshipDropdown: 'mat-select[formcontrolname="relationshipId"]',
  familyMemberGenderDropdown: 'mat-select[formcontrolname="genderId"]',
  familyMemberDobInput: 'input[formcontrolname="dateOfBirth"]',
  familyMemberConfirmButton: 'Confirm',

  // Address dialog — rendered by FormDialogComponent with dynamic fields.
  addAddressButton: 'Add',
  addressDialog: 'mat-dialog-container:has-text("Address")',
  addressTypeDropdown: 'mat-select[formcontrolname="addressTypeId"]',
  addressStreetInput: 'input[formcontrolname="street"]',
  addressLine1Input: 'input[formcontrolname="addressLine1"]',
  addressCityInput: 'input[formcontrolname="city"]',
  addressPostalCodeInput: 'input[formcontrolname="postalCode"]',
  addressCountryDropdown: 'mat-select[formcontrolname="countryId"]',
  addressSubmitButton: 'Add',

  // Preview step — final submit emits via (click)="submitEvent.emit()".
  previewSubmitButton: 'Submit'
};

// ---------------------------------------------------------------------------
// Clients — list / search
// ---------------------------------------------------------------------------

/**
 * Selector contract for the Mifos X clients list page (`/#/clients`).
 *
 * The list renders a custom toolbar (search box + Create Client CTA)
 * and a div-based table where each `.list-row` carries a routerLink
 * to `/clients/:id/general`. The React port will replace the divs
 * with a shadcn `<DataTable>` but the logical contract — search box,
 * primary CTA, row click — is unchanged.
 */
export interface ClientsListSelectors {
  searchInput: string;
  searchClearButton: string;
  showClosedToggle: string;
  createClientButton: string;
  importClientButton: string;
  loadingBar: string;
  list: string;
  row: string;
  rowName: string;
  rowStatus: string;
  emptyState: string;
  countBadge: string;
  pageSizeSelect: string;
  nextPageButton: string;
  previousPageButton: string;
}

export const CLIENTS_LIST_SELECTORS: ClientsListSelectors = {
  searchInput: '.clients-container .search input[type="text"]',
  searchClearButton: '.clients-container .search-clear',
  showClosedToggle: '.clients-container .toggle',
  createClientButton: 'Create Client',
  importClientButton: 'Import Client',
  loadingBar: '.clients-container .loading-bar',
  list: '.clients-container .list',
  row: '.clients-container .list-row',
  rowName: '.name',
  rowStatus: '.status-pill',
  emptyState: '.clients-container .empty-state',
  countBadge: '.clients-container .count-badge',
  pageSizeSelect: '.clients-container .page-size select',
  nextPageButton: 'Next page',
  previousPageButton: 'Previous page'
};

// ---------------------------------------------------------------------------
// Client — view / actions
// ---------------------------------------------------------------------------

export interface ClientViewSelectors {
  actionsButton: string;
  actionsSubmenuTrigger: string;
  editMenuItem: string;
  statusBadge: string;
  successSnackbar: string;
  personalDataTab: string;
  tabRole: 'tab';
  closedDateRow: string;
  closedDateValue: string;
  overlayBackdrop: string;
}

export const CLIENT_VIEW_SELECTORS: ClientViewSelectors = {
  actionsButton: 'button[aria-label="Client actions"], button:has-text("Client actions")',
  actionsSubmenuTrigger: 'Actions',
  editMenuItem: 'Edit',
  // Status indicator rendered by `mifosx-account-header`; the dot
  // carries the tooltip and `statusLookup`-derived class. React's
  // counterpart exposes the same logical badge via a data-testid.
  statusBadge: 'mifosx-account-header .status-dot',
  successSnackbar: '.mat-mdc-snack-bar-container',
  personalDataTab: 'Personal Data',
  tabRole: 'tab',
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
