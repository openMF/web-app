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

// ---------------------------------------------------------------------------
// Activate client action form
// ---------------------------------------------------------------------------

export interface ActivateClientSelectors {
  activationDateInput: string;
  confirmButton: string;
  cancelButton: string;
}

export const ACTIVATE_CLIENT_SELECTORS: ActivateClientSelectors = {
  activationDateInput: 'input[formcontrolname="activationDate"]',
  confirmButton: 'Confirm',
  cancelButton: 'Cancel'
};

// ---------------------------------------------------------------------------
// Reject client action form
// ---------------------------------------------------------------------------

export interface RejectClientSelectors {
  rejectionDateInput: string;
  rejectionReasonSelect: string;
  confirmButton: string;
  cancelButton: string;
}

export const REJECT_CLIENT_SELECTORS: RejectClientSelectors = {
  rejectionDateInput: 'input[formcontrolname="rejectionDate"]',
  rejectionReasonSelect: 'mat-select[formcontrolname="rejectionReasonId"]',
  confirmButton: 'Confirm',
  cancelButton: 'Cancel'
};

// ---------------------------------------------------------------------------
// Withdraw client action form
// ---------------------------------------------------------------------------

export interface WithdrawClientSelectors {
  withdrawalDateInput: string;
  withdrawalReasonSelect: string;
  confirmButton: string;
  cancelButton: string;
}

export const WITHDRAW_CLIENT_SELECTORS: WithdrawClientSelectors = {
  withdrawalDateInput: 'input[formcontrolname="withdrawalDate"]',
  withdrawalReasonSelect: 'mat-select[formcontrolname="withdrawalReasonId"]',
  confirmButton: 'Confirm',
  cancelButton: 'Cancel'
};

// ---------------------------------------------------------------------------
// Reactivate client action form
// ---------------------------------------------------------------------------

export interface ReactivateClientSelectors {
  reactivationDateInput: string;
  confirmButton: string;
  cancelButton: string;
}

export const REACTIVATE_CLIENT_SELECTORS: ReactivateClientSelectors = {
  reactivationDateInput: 'input[formcontrolname="reactivationDate"]',
  confirmButton: 'Confirm',
  cancelButton: 'Cancel'
};

// ---------------------------------------------------------------------------
// Transfer client action form
// ---------------------------------------------------------------------------

export interface TransferClientSelectors {
  destinationOfficeSelect: string;
  transferDateInput: string;
  noteInput: string;
  confirmButton: string;
  cancelButton: string;
}

export const TRANSFER_CLIENT_SELECTORS: TransferClientSelectors = {
  destinationOfficeSelect: 'mat-select[formcontrolname="destinationOfficeId"]',
  transferDateInput: 'input[formcontrolname="transferDate"]',
  noteInput: 'textarea[formcontrolname="note"]',
  confirmButton: 'Confirm',
  cancelButton: 'Cancel'
};

// ---------------------------------------------------------------------------
// Savings account — create stepper
// ---------------------------------------------------------------------------

/**
 * Selector contract for the create-savings-account mat-stepper
 * (`/#/clients/:id/savings-accounts/create`).
 *
 * Two structural quirks the page object has to respect, both of which
 * are genuine app behaviour rather than test flakiness:
 *
 *  - Every field on the DETAILS step except the product dropdown is
 *    wrapped in `@if (savingsProductSelected)`. Submitted-on does not
 *    exist in the DOM until a product is chosen.
 *  - The PREVIEW step is wrapped in `@if (savingsAccountFormValid)`,
 *    so its header cannot be clicked to skip ahead — the flow must
 *    walk DETAILS → TERMS → CHARGES via Next before Preview appears.
 *
 * The React port keeps the same conditional rendering, so the contract
 * carries over unchanged; only the selector strings differ.
 */
export interface CreateSavingsAccountSelectors {
  stepperRoot: string;
  stepHeaderRole: 'tab' | 'button';
  stepLabelDetails: string;
  stepLabelTerms: string;
  stepLabelCharges: string;
  stepLabelPreview: string;
  nextButton: string;
  /**
   * Next button scoped to the currently selected step.
   *
   * A vertical mat-stepper keeps EVERY step's content in the DOM and
   * animates between them, so a bare `button[matsteppernext]` matches
   * one button per step. Filtering on visibility is not enough either:
   * mid-transition both the outgoing and incoming steps briefly report
   * visible, and a click dispatched then lands on a collapsing panel.
   * Scoping to `aria-selected="true"` picks exactly one button and
   * makes the click deterministic.
   */
  activeStepNextButton: string;
  previousButton: string;

  productDropdown: string;
  submittedOnDateInput: string;
  fieldOfficerDropdown: string;
  externalIdInput: string;

  nominalAnnualInterestRateInput: string;
  minRequiredOpeningBalanceInput: string;

  submitButton: string;
  cancelButton: string;
  validationError: string;
}

export const CREATE_SAVINGS_ACCOUNT_SELECTORS: CreateSavingsAccountSelectors = {
  stepperRoot: 'mat-stepper',
  stepHeaderRole: 'tab',
  stepLabelDetails: 'DETAILS',
  stepLabelTerms: 'TERMS',
  stepLabelCharges: 'CHARGES',
  stepLabelPreview: 'PREVIEW',
  nextButton: 'button[matsteppernext]',
  activeStepNextButton: '.mat-step:has(mat-step-header[aria-selected="true"]) button[matsteppernext]',
  previousButton: 'button[matstepperprevious]',

  productDropdown: 'mat-select[formcontrolname="productId"]',
  submittedOnDateInput: 'input[formcontrolname="submittedOnDate"]',
  fieldOfficerDropdown: 'mat-select[formcontrolname="fieldOfficerId"]',
  externalIdInput: 'input[formcontrolname="externalId"]',

  nominalAnnualInterestRateInput: 'input[formcontrolname="nominalAnnualInterestRate"]',
  minRequiredOpeningBalanceInput: 'input[formcontrolname="minRequiredOpeningBalance"]',

  submitButton: 'Submit',
  cancelButton: 'Cancel',
  validationError: 'mat-error'
};

// ---------------------------------------------------------------------------
// Savings account — general view
// ---------------------------------------------------------------------------

/**
 * Selector contract for the savings account general view.
 *
 * The action menu is driven by `SavingsButtonsConfiguration`, which
 * splits entries between the top-level menu and a nested "More"
 * submenu depending on status. Notably `Reject` and `Withdrawn by
 * Client` live under "More" for a pending account, whereas `Approve`
 * is a top-level entry — the page object hides that split behind a
 * single `chooseAction()` call.
 */
export interface SavingsAccountViewSelectors {
  actionsButton: string;
  moreSubmenuTrigger: string;
  statusBadge: string;
  accountBalanceRow: string;
  successSnackbar: string;
  overlayBackdrop: string;
  tabRole: 'tab';
}

export const SAVINGS_ACCOUNT_VIEW_SELECTORS: SavingsAccountViewSelectors = {
  // Rendered with `[attr.aria-label]="'labels.text.Savings Account Actions' | translate"`.
  actionsButton: 'button[aria-label="Savings Account Actions"]',
  moreSubmenuTrigger: 'More',
  statusBadge: '.status-dot',
  accountBalanceRow: 'table.account-overview',
  successSnackbar: '.mat-mdc-snack-bar-container',
  overlayBackdrop: '.cdk-overlay-backdrop',
  tabRole: 'tab'
};

// ---------------------------------------------------------------------------
// Savings account — lifecycle action forms
// ---------------------------------------------------------------------------

/**
 * Selector contract for the savings account lifecycle action forms
 * (`/#/clients/:cid/savings-accounts/:sid/actions/:name`).
 *
 * All four forms share one shell — an optional date input plus an
 * optional note textarea and a Confirm button — so a single contract
 * and a single page object cover Approve, Activate, Reject and Undo
 * Approval. Undo Approval has no date field at all, which is why
 * every date selector is addressed individually rather than through a
 * shared `dateInput` key.
 */
export interface SavingsAccountActionSelectors {
  approvedOnDateInput: string;
  activatedOnDateInput: string;
  rejectedOnDateInput: string;
  noteInput: string;
  confirmButton: string;
  cancelButton: string;
}

export const SAVINGS_ACCOUNT_ACTION_SELECTORS: SavingsAccountActionSelectors = {
  approvedOnDateInput: 'input[formcontrolname="approvedOnDate"]',
  activatedOnDateInput: 'input[formcontrolname="activatedOnDate"]',
  rejectedOnDateInput: 'input[formcontrolname="rejectedOnDate"]',
  noteInput: 'textarea[formcontrolname="note"]',
  confirmButton: 'Confirm',
  cancelButton: 'Cancel'
};

// ---------------------------------------------------------------------------
// Savings account — deposit / withdrawal transaction form
// ---------------------------------------------------------------------------

/**
 * Selector contract for the savings deposit/withdrawal form.
 *
 * This form is itself a three-step linear mat-stepper — details,
 * confirmation, completion — so submitting a deposit takes a Next
 * click followed by a Submit click. Skipping the confirmation step is
 * not possible; the stepper is `linear`.
 *
 * The amount field is rendered by the shared `mifosx-input-amount`
 * component, which binds via `[formControl]` rather than
 * `formControlName`. There is no `formcontrolname` attribute to target,
 * hence the component-scoped selector.
 */
export interface SavingsTransactionSelectors {
  transactionDateInput: string;
  transactionAmountInput: string;
  paymentTypeDropdown: string;
  noteInput: string;
  nextButton: string;
  submitButton: string;
  /**
   * Button on the third "Transaction Complete" step.
   *
   * The form does NOT navigate away on submit — it advances to a
   * receipt panel and waits for the user. Clicking Done is what routes
   * back to the transactions tab.
   */
  doneButton: string;
  /** Heading rendered on the completion step once the post succeeds. */
  successHeading: string;
  cancelButton: string;
}

export const SAVINGS_TRANSACTION_SELECTORS: SavingsTransactionSelectors = {
  transactionDateInput: 'input[formcontrolname="transactionDate"]',
  transactionAmountInput: 'mifosx-input-amount input',
  paymentTypeDropdown: 'mat-select[formcontrolname="paymentTypeId"]',
  noteInput: 'textarea[formcontrolname="note"]',
  nextButton: 'Next',
  submitButton: 'Submit',
  doneButton: 'Done',
  successHeading: 'Transaction Successful',
  cancelButton: 'Cancel'
};

// ---------------------------------------------------------------------------
// Loan account — create stepper
// ---------------------------------------------------------------------------

/**
 * Selector contract for the create-loan-account mat-stepper
 * (`/#/clients/:id/loans-accounts/create`).
 *
 * Harder than its savings counterpart in three specific ways:
 *
 *  - The product dropdown embeds an `ngx-mat-select-search` box, and
 *    its `mat-option` values are the product SHORT NAME while the
 *    visible label is the product name prefixed by product type. A
 *    plain option click can therefore miss; the page object types into
 *    the search box first.
 *  - TERMS, CHARGES, REPAYMENT SCHEDULE and PREVIEW are all wrapped in
 *    `@if (productId)` / `@if (loansAccountFormValid)`, so none of them
 *    exist in the DOM until a product is selected and the form is
 *    valid.
 *  - REPAYMENT SCHEDULE is populated from a server round-trip
 *    (`/loans/template` → calculate schedule). Clicking through before
 *    it resolves lands on an empty table, so the page object waits on
 *    a populated schedule row rather than on the step header.
 *
 * The principal field uses the shared `mifosx-input-amount` component,
 * so — like the savings transaction amount — it has no
 * `formcontrolname` attribute.
 */
export interface CreateLoanAccountSelectors {
  stepperRoot: string;
  stepHeaderRole: 'tab' | 'button';
  stepLabelDetails: string;
  stepLabelTerms: string;
  stepLabelCharges: string;
  stepLabelSchedule: string;
  stepLabelPreview: string;
  nextButton: string;
  /** See `CreateSavingsAccountSelectors.activeStepNextButton`. */
  activeStepNextButton: string;
  previousButton: string;

  productDropdown: string;
  productSearchInput: string;
  submittedOnDateInput: string;
  expectedDisbursementDateInput: string;
  externalIdInput: string;
  loanOfficerDropdown: string;
  loanPurposeDropdown: string;

  principalInput: string;
  loanTermFrequencyInput: string;
  numberOfRepaymentsInput: string;
  repaymentEveryInput: string;
  interestRatePerPeriodInput: string;

  scheduleTable: string;
  scheduleRow: string;
  /** Accessible name of the button that requests the schedule. */
  generateScheduleButton: string;

  submitButton: string;
  cancelButton: string;
  validationError: string;
}

export const CREATE_LOAN_ACCOUNT_SELECTORS: CreateLoanAccountSelectors = {
  stepperRoot: 'mat-stepper',
  stepHeaderRole: 'tab',
  stepLabelDetails: 'DETAILS',
  stepLabelTerms: 'TERMS',
  stepLabelCharges: 'CHARGES',
  stepLabelSchedule: 'REPAYMENT SCHEDULE',
  stepLabelPreview: 'PREVIEW',
  nextButton: 'button[matsteppernext]',
  activeStepNextButton: '.mat-step:has(mat-step-header[aria-selected="true"]) button[matsteppernext]',
  previousButton: 'button[matstepperprevious]',

  productDropdown: 'mat-select[formcontrolname="productId"]',
  // Rendered by `ngx-mat-select-search` inside the select's overlay.
  productSearchInput: '.mat-mdc-select-panel input.mat-mdc-input-element, ngx-mat-select-search input',
  submittedOnDateInput: 'input[formcontrolname="submittedOnDate"]',
  expectedDisbursementDateInput: 'input[formcontrolname="expectedDisbursementDate"]',
  externalIdInput: 'input[formcontrolname="externalId"]',
  loanOfficerDropdown: 'mat-select[formcontrolname="loanOfficerId"]',
  loanPurposeDropdown: 'mat-select[formcontrolname="loanPurposeId"]',

  principalInput: 'mifosx-input-amount input',
  loanTermFrequencyInput: 'input[formcontrolname="loanTermFrequency"]',
  numberOfRepaymentsInput: 'input[formcontrolname="numberOfRepayments"]',
  repaymentEveryInput: 'input[formcontrolname="repaymentEvery"]',
  interestRatePerPeriodInput: 'input[formcontrolname="interestRatePerPeriod"]',

  scheduleTable: 'mifosx-loans-account-schedule-step table',
  scheduleRow: 'mifosx-loans-account-schedule-step table tbody tr',
  generateScheduleButton: 'Generate Repayment Schedule',

  submitButton: 'Submit',
  cancelButton: 'Cancel',
  validationError: 'mat-error'
};

// ---------------------------------------------------------------------------
// Loan account — general view
// ---------------------------------------------------------------------------

/**
 * Selector contract for the loan account general view.
 *
 * Like the savings view, the action menu splits between top-level
 * buttons and nested "Payments" / "More" submenus depending on status.
 * `Approve` and `Reject` are top-level for a pending loan; `Disburse`,
 * `Undo Approval` and `Undo Disbursal` are top-level for approved and
 * active loans respectively.
 */
export interface LoanAccountViewSelectors {
  actionsButton: string;
  moreSubmenuTrigger: string;
  paymentsSubmenuTrigger: string;
  statusBadge: string;
  successSnackbar: string;
  overlayBackdrop: string;
  tabRole: 'tab';
}

export const LOAN_ACCOUNT_VIEW_SELECTORS: LoanAccountViewSelectors = {
  // Rendered with `[attr.aria-label]="'labels.text.Loan Account Actions' | translate"`.
  actionsButton: 'button[aria-label="Loan Account Actions"]',
  moreSubmenuTrigger: 'More',
  paymentsSubmenuTrigger: 'Payments',
  statusBadge: '.status-dot',
  successSnackbar: '.mat-mdc-snack-bar-container',
  overlayBackdrop: '.cdk-overlay-backdrop',
  tabRole: 'tab'
};

// ---------------------------------------------------------------------------
// Loan account — lifecycle action forms
// ---------------------------------------------------------------------------

/**
 * Selector contract for the loan account lifecycle action forms
 * (`/#/clients/:cid/loans-accounts/:lid/actions/:action`).
 *
 * Note the submit control is labelled **Submit** here, whereas the
 * savings action forms label the equivalent control **Confirm**. That
 * inconsistency is in the app, not in this contract — encoding it here
 * keeps it out of the specs.
 *
 * Undo Approval and Undo Disbursal render no form fields at all, just
 * a confirmation button.
 */
export interface LoanAccountActionSelectors {
  approvedOnDateInput: string;
  expectedDisbursementDateInput: string;
  actualDisbursementDateInput: string;
  rejectedOnDateInput: string;
  amountInput: string;
  noteInput: string;
  submitButton: string;
  cancelButton: string;
}

export const LOAN_ACCOUNT_ACTION_SELECTORS: LoanAccountActionSelectors = {
  approvedOnDateInput: 'input[formcontrolname="approvedOnDate"]',
  expectedDisbursementDateInput: 'input[formcontrolname="expectedDisbursementDate"]',
  actualDisbursementDateInput: 'input[formcontrolname="actualDisbursementDate"]',
  rejectedOnDateInput: 'input[formcontrolname="rejectedOnDate"]',
  amountInput: 'mifosx-input-amount input',
  noteInput: 'textarea[formcontrolname="note"]',
  submitButton: 'Submit',
  cancelButton: 'Cancel'
};

// ─────────────────────────────────────────────────────────────────────
// Client charges
// ─────────────────────────────────────────────────────────────────────

/**
 * Add Charge form (`/clients/:id/actions/Add Charge`).
 *
 * ── The shape of this form is entirely data-driven ──────────────────
 *
 * Only the charge dropdown exists on first render. Everything below it
 * sits behind `@if (chargeDetails)`, which is populated by a
 * `GET /charges/{id}?template=true` fired from the dropdown's
 * `valueChanges`. A page object that fills `amount` straight after
 * navigating will therefore miss — the control is not merely disabled,
 * it is not in the DOM.
 *
 * Which date control appears depends on the selected definition's
 * charge time type, and the component decides by comparing the
 * *English* `chargeTimeType.value` string:
 *
 *  - Specified due date  → `dueDate`
 *  - Annual / Monthly    → `feeOnMonthDay`
 *  - Monthly only        → plus `feeInterval`
 *  - Withdrawal / No-activity fee → no date control at all
 *
 * `chargeCalculationType` and `chargeTimeType` render as selects but
 * are permanently disabled — they are display-only echoes of the
 * definition, so specs assert on them rather than set them.
 */
export interface AddChargeSelectors {
  chargeDropdown: string;
  amountInput: string;
  chargeCalculationTypeDropdown: string;
  chargeTimeTypeDropdown: string;
  /** Rendered only for specified-due-date charges. */
  dueDateInput: string;
  /** Rendered only for annual/monthly charges. */
  feeOnMonthDayInput: string;
  /** Rendered only for monthly charges. */
  feeIntervalInput: string;
  submitButton: string;
  cancelButton: string;
}

export const ADD_CHARGE_SELECTORS: AddChargeSelectors = {
  chargeDropdown: 'mat-select[formcontrolname="chargeId"]',
  amountInput: 'input[formcontrolname="amount"]',
  chargeCalculationTypeDropdown: 'mat-select[formcontrolname="chargeCalculationType"]',
  chargeTimeTypeDropdown: 'mat-select[formcontrolname="chargeTimeType"]',
  dueDateInput: 'input[formcontrolname="dueDate"]',
  feeOnMonthDayInput: 'input[formcontrolname="feeOnMonthDay"]',
  feeIntervalInput: 'input[formcontrolname="feeInterval"]',
  submitButton: 'Submit',
  cancelButton: 'Cancel'
};

/**
 * The "Upcoming Charges" table on the client General tab, plus the
 * charge detail and pay views it links to.
 *
 * The table's per-row buttons carry no accessible text — they are
 * `<i class="fa fa-dollar">` / `fa-flag` inside a bare button — so they
 * are addressed by `matTooltip`, which is the only stable, translated
 * handle the markup offers.
 *
 * Both row buttons call `routeEdit($event)` to stop propagation,
 * because the row itself is a `routerLink` to the charge detail view.
 * Miss the button and you silently navigate instead of acting.
 */
export interface ClientChargesSelectors {
  upcomingChargesTable: string;
  chargeRow: string;
  payRowButton: string;
  waiveRowButton: string;
  chargesOverviewLink: string;
  overviewTable: string;
  overviewRow: string;
  /** Shown in place of the table when the client has no charges. */
  emptyBanner: string;
}

export const CLIENT_CHARGES_SELECTORS: ClientChargesSelectors = {
  upcomingChargesTable: 'mifosx-general-tab table.data-table',
  chargeRow: 'mifosx-general-tab table.data-table tbody tr',
  // Class-only, not `ng-reflect-message` — Angular strips `ng-reflect-*`
  // in production/optimized builds, so the tooltip-based match is not
  // stable. `.row-action.primary` is the rendered class pair, matching
  // the `waiveRowButton` pattern below.
  payRowButton: 'button.row-action.primary',
  waiveRowButton: 'button.row-action:not(.primary)',
  chargesOverviewLink: 'Charges Overview',
  overviewTable: 'mifosx-charges-overview table',
  overviewRow: 'mifosx-charges-overview table tbody tr',
  emptyBanner: '.info-banner'
};

/**
 * Charge detail view (`/clients/:id/charges/:chargeId`) and its pay
 * form (`.../pay`).
 *
 * Delete and Waive fire immediately with no confirmation dialog, which
 * is worth knowing before writing a spec that waits for one.
 */
export interface ChargeViewSelectors {
  payButton: string;
  waiveButton: string;
  deleteButton: string;
  backButton: string;
  /** Pay form fields. */
  payAmountInput: string;
  payDateInput: string;
  paySubmitButton: string;
}

export const CHARGE_VIEW_SELECTORS: ChargeViewSelectors = {
  payButton: 'Pay',
  waiveButton: 'Waive Charge',
  deleteButton: 'Delete',
  backButton: 'Back',
  payAmountInput: 'input[formcontrolname="amount"]',
  payDateInput: 'input[formcontrolname="transactionDate"]',
  paySubmitButton: 'Submit'
};

// ─────────────────────────────────────────────────────────────────────
// Client KYC tabs
// ─────────────────────────────────────────────────────────────────────

/**
 * Family members tab and its add/edit forms.
 *
 * Unlike every other KYC tab, add and edit here are **routes**
 * (`/family-members/add`, `/family-members/:id/edit`) rather than
 * dialogs. The list itself is a `mat-accordion`: the Edit and Delete
 * buttons live inside each panel's body and are not in the DOM until
 * that panel is expanded.
 *
 * The relationship / gender / profession / marital status dropdowns are
 * filled from the family-member template endpoint, so a tenant with no
 * configured code values renders them empty — relationship and gender
 * are `required`, which makes that a hard blocker rather than a
 * cosmetic gap.
 */
export interface FamilyMembersSelectors {
  addButton: string;
  panel: string;
  panelHeader: string;
  panelTitle: string;
  editButton: string;
  deleteButton: string;
  /** Add/edit form fields. */
  firstNameInput: string;
  middleNameInput: string;
  lastNameInput: string;
  qualificationInput: string;
  ageInput: string;
  isDependentCheckbox: string;
  relationshipDropdown: string;
  genderDropdown: string;
  professionDropdown: string;
  maritalStatusDropdown: string;
  dateOfBirthInput: string;
  submitButton: string;
  cancelButton: string;
}

export const FAMILY_MEMBERS_SELECTORS: FamilyMembersSelectors = {
  addButton: 'Add',
  panel: 'mat-expansion-panel.family-member',
  panelHeader: 'mat-expansion-panel-header',
  panelTitle: 'mat-panel-title',
  editButton: 'Edit',
  deleteButton: 'Delete',
  firstNameInput: 'input[formcontrolname="firstName"]',
  middleNameInput: 'input[formcontrolname="middleName"]',
  lastNameInput: 'input[formcontrolname="lastName"]',
  qualificationInput: 'input[formcontrolname="qualification"]',
  ageInput: 'input[formcontrolname="age"]',
  isDependentCheckbox: 'mat-checkbox[formcontrolname="isDependent"]',
  relationshipDropdown: 'mat-select[formcontrolname="relationshipId"]',
  genderDropdown: 'mat-select[formcontrolname="genderId"]',
  professionDropdown: 'mat-select[formcontrolname="professionId"]',
  maritalStatusDropdown: 'mat-select[formcontrolname="maritalStatusId"]',
  dateOfBirthInput: 'input[formcontrolname="dateOfBirth"]',
  submitButton: 'Submit',
  cancelButton: 'Cancel'
};

/**
 * Identifiers tab. Add is dialog-driven via the *shared*
 * `UploadDocumentDialogComponent`, which serves double duty for
 * documents — hence `documentIdentifier` toggling four extra controls
 * into the same form.
 *
 * `fileName` is marked `required` on that shared form even in
 * identifier mode, where no file is actually needed: the component only
 * uploads when `response.file` is set. So a spec must fill `fileName`
 * to enable the submit button, but need not attach anything.
 *
 * Delete goes through the generic confirm dialog whose affirmative
 * button is labelled **Confirm**, not "Delete".
 */
export interface ClientIdentifiersSelectors {
  addButton: string;
  table: string;
  row: string;
  deleteRowButton: string;
  /** Dialog fields. */
  documentTypeDropdown: string;
  statusDropdown: string;
  documentKeyInput: string;
  descriptionInput: string;
  fileNameInput: string;
  dialogSubmitButton: string;
  confirmDeleteButton: string;
}

export const CLIENT_IDENTIFIERS_SELECTORS: ClientIdentifiersSelectors = {
  addButton: 'Add',
  table: 'mifosx-identities-tab table',
  row: 'mifosx-identities-tab table tbody tr',
  deleteRowButton: 'button.identity-action-button',
  documentTypeDropdown: 'mat-select[formcontrolname="documentTypeId"]',
  statusDropdown: 'mat-select[formcontrolname="status"]',
  documentKeyInput: 'input[formcontrolname="documentKey"]',
  descriptionInput: 'input[formcontrolname="description"]',
  fileNameInput: 'input[formcontrolname="fileName"]',
  dialogSubmitButton: 'Add',
  confirmDeleteButton: 'Confirm'
};

/**
 * Notes tab, rendered by the shared `mifosx-entity-notes-tab`.
 *
 * Add is an inline form at the top of the tab, not a dialog — its
 * submit button is labelled "Add" and is disabled until the textarea
 * is non-empty.
 *
 * Edit opens a generic `FormDialogComponent` whose affirmative button
 * is labelled **Confirm**, and which stays disabled while the form is
 * `pristine` — so a spec must actually change the text, not just
 * retype the same value. Delete goes through the generic delete
 * dialog, whose affirmative button is also "Confirm".
 *
 * Note `editDialogInput` is an accessible *name*, not a CSS selector.
 * The generic dialog builds its controls through `mifosx-formfield`,
 * which binds `[formControlName]` as a property — so unlike every
 * hand-written form in this app it emits no `formcontrolname`
 * attribute to match on. The `mat-label` is the only stable handle.
 */
export interface ClientNotesSelectors {
  noteInput: string;
  addButton: string;
  noteItem: string;
  noteContent: string;
  editButton: string;
  deleteButton: string;
  /** Accessible name of the text input inside the edit dialog. */
  editDialogInput: string;
  confirmButton: string;
}

export const CLIENT_NOTES_SELECTORS: ClientNotesSelectors = {
  noteInput: 'textarea[formcontrolname="note"]',
  addButton: 'Add',
  noteItem: '.note-card',
  noteContent: '.note-content',
  editButton: 'Edit',
  deleteButton: 'Delete',
  editDialogInput: 'Note',
  confirmButton: 'Confirm'
};

// ---------------------------------------------------------------------------
// Group — create form
// ---------------------------------------------------------------------------

/**
 * Create-group form (`/#/groups/create`).
 *
 * Unlike the client create flow this is a **plain form, not a stepper** —
 * every control is on screen at once and Submit is simply
 * `[disabled]="!groupForm.valid"`.
 *
 * ── Two controls that are not always in the DOM ─────────────────────
 *
 * `activationDate` is added to the form group *and* rendered only while
 * the `active` checkbox is checked (`@if (groupForm.controls.active.value)`).
 * Querying it before checking the box yields zero elements, not a
 * hidden one.
 *
 * `staffId` is populated from an office-scoped lookup and is
 * `disable()`d outright when the selected office has no staff — so a
 * disabled staff dropdown is normal, not a defect.
 *
 * ── The client autocomplete ─────────────────────────────────────────
 *
 * The search input is bound with `[formControl]="clientChoice"`, a
 * property binding, so **no `formcontrolname` attribute reaches the
 * DOM**. It is matched instead on `role="combobox"`, which
 * `MatAutocompleteTrigger` sets as a host binding; scoping to
 * `mifosx-create-group` keeps it unambiguous.
 *
 * The search only fires once at least 2 characters are typed, and it
 * passes `officeId` from the form plus `orphansOnly=true` — so an
 * office must be selected first, and clients already in a group never
 * appear.
 *
 * ── Icon-only buttons ───────────────────────────────────────────────
 *
 * `addClientButton` and `removeClientButton` contain nothing but a
 * `<fa-icon>`: no text, no `aria-label`, no `matTooltip`. They have no
 * accessible name at all, so structural CSS is the only option here.
 * These two entries are the most brittle in this file; giving the app
 * buttons real `aria-label`s would let both become role+name lookups.
 */
export interface CreateGroupSelectors {
  nameInput: string;
  officeDropdown: string;
  staffDropdown: string;
  submittedOnDateInput: string;
  activeCheckbox: string;
  /** Only present in the DOM while `active` is checked. */
  activationDateInput: string;
  externalIdInput: string;
  /** Client autocomplete search box — matched on `role`, not name. */
  clientSearchInput: string;
  /** Structural: icon-only button, no accessible name. */
  addClientButton: string;
  selectedClientItem: string;
  /** Structural: icon-only button, no accessible name. */
  removeClientButton: string;
  submitButton: string;
  cancelButton: string;
}

export const CREATE_GROUP_SELECTORS: CreateGroupSelectors = {
  nameInput: 'input[formcontrolname="name"]',
  officeDropdown: 'mat-select[formcontrolname="officeId"]',
  staffDropdown: 'mat-select[formcontrolname="staffId"]',
  submittedOnDateInput: 'input[formcontrolname="submittedOnDate"]',
  activeCheckbox: 'mat-checkbox[formcontrolname="active"]',
  activationDateInput: 'input[formcontrolname="activationDate"]',
  externalIdInput: 'input[formcontrolname="externalId"]',
  clientSearchInput: 'mifosx-create-group input[role="combobox"]',
  addClientButton: 'mifosx-create-group .mat-table .mat-header-row button',
  selectedClientItem: 'mifosx-create-group mat-nav-list div[mat-list-item]',
  removeClientButton: 'mifosx-create-group mat-nav-list div[mat-list-item] button',
  submitButton: 'Submit',
  cancelButton: 'Cancel'
};

// ---------------------------------------------------------------------------
// Group — view / general tab
// ---------------------------------------------------------------------------

/**
 * Group view shell (`/#/groups/:id/general`) and its General tab.
 *
 * ── Status is not rendered as text ──────────────────────────────────
 *
 * The header shows status only as a CSS class derived from a
 * `statusLookup` pipe plus a `matTooltip`, neither of which is a
 * reliable assertion target. The **menu contents** are, though: the
 * "Activate" item is wrapped in
 * `@if (!(groupViewData.status.value === 'Active'))`, so its presence
 * or absence is an exact, text-based Active-vs-Pending signal. That is
 * what `activateMenuItem` is for.
 *
 * ── A swapped-permission bug lives in this menu ─────────────────────
 *
 * "Manage Members" is guarded by `TRANSFERCLIENTS_GROUP` and "Transfer
 * Clients" by `ASSOCIATECLIENTS_GROUP` — the two are the wrong way
 * round. It has no effect while RBAC is disabled (which it is in every
 * deployed environment today), so it is recorded here rather than
 * asserted; the RBAC work is where it can actually be pinned.
 *
 * ── The General tab renders several tables ──────────────────────────
 *
 * Client members, loan accounts, savings, GSIM and GLIM all render
 * `table[mat-table]`. The members table is the first, and the whole
 * block is `@if (groupClientMembers)`-guarded so it is *absent*, not
 * empty, for a group with no members.
 */
export interface GroupViewSelectors {
  /** Accessible name (an `aria-label`) of the actions menu trigger. */
  actionsMenuButton: string;
  /** Menu item — absent once the group is Active. */
  activateMenuItem: string;
  manageMembersMenuItem: string;
  editMenuItem: string;
  groupNameHeading: string;
  /** First `table[mat-table]` on the General tab; absent when memberless. */
  clientMembersTable: string;
  clientMembersRow: string;
}

export const GROUP_VIEW_SELECTORS: GroupViewSelectors = {
  actionsMenuButton: 'Group actions',
  activateMenuItem: 'Activate',
  manageMembersMenuItem: 'Manage Members',
  editMenuItem: 'Edit',
  groupNameHeading: 'mifosx-groups-view mat-card-title h3',
  clientMembersTable: 'mifosx-general-tab table[mat-table]',
  clientMembersRow: 'tbody tr'
};

// ---------------------------------------------------------------------------
// Group — manage members action
// ---------------------------------------------------------------------------

/**
 * Manage-members action screen
 * (`/#/groups/:id/actions/Manage%20Members`).
 *
 * Same autocomplete and icon-only-button traps as the create form —
 * see {@link CreateGroupSelectors} — but two differences matter.
 *
 * ── Writes go straight to the server ────────────────────────────────
 *
 * Here `addClient()` / `removeClient()` POST
 * `?command=associateClients` / `disassociateClients` immediately,
 * whereas the create form only stages members in memory until Submit.
 *
 * ── The member list is stale after a write ──────────────────────────
 *
 * `ManageGroupMembersComponent` is `OnPush` and mutates
 * `clientMembers` with `push`/`splice` inside the **async subscribe of
 * the HTTP response**. Nothing marks the view dirty at that point, so
 * the rendered list can lag behind a write that genuinely succeeded.
 * Page objects therefore reload before asserting, and the reload is
 * deliberately visible rather than hidden.
 *
 * ── Removal is dialog-confirmed ─────────────────────────────────────
 *
 * `removeMemberButton` opens the shared `DeleteDialogComponent`, whose
 * affirmative button is labelled **"Confirm"**, not "Delete". That
 * dialog also reads `response.delete` with no null guard, so
 * dismissing it via ESC or a backdrop click throws — always click one
 * of the two buttons.
 */
export interface ManageGroupMembersSelectors {
  /** Client autocomplete search box — matched on `role`, not name. */
  clientSearchInput: string;
  /** Structural: icon-only button, no accessible name. */
  addClientButton: string;
  memberItem: string;
  /** Structural: icon-only, carries a `matTooltip` but no label. */
  removeMemberButton: string;
  confirmButton: string;
}

export const MANAGE_GROUP_MEMBERS_SELECTORS: ManageGroupMembersSelectors = {
  clientSearchInput: 'mifosx-manage-group-members input[role="combobox"]',
  addClientButton: 'mifosx-manage-group-members .mat-table .mat-header-row button',
  memberItem: 'mifosx-manage-group-members mat-nav-list div[mat-list-item]',
  removeMemberButton: 'mifosx-manage-group-members mat-nav-list div[mat-list-item] button',
  confirmButton: 'Confirm'
};
