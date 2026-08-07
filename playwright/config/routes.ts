/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Layer 2 — Route registry (Angular).
 *
 * Angular uses hash-based routing (/#/login, /#/clients).
 * React uses history-based routing (/login, /clients).
 *
 * Specs never hard-code routes — they consume this registry through
 * page object navigate() calls. Interface signature mirrors the React
 * `AppRoutes` interface so a portability swap is config-only.
 */

export interface AppRoutes {
  login: string;
  home: string;
  clients: string;
  clientCreate: string;
  clientView: (id: number) => string;
  clientEdit: (id: number) => string;
  clientPersonalData: (id: number) => string;
  clientAction: (id: number, action: string) => string;
  clientCharges: (id: number) => string;
  clientChargesOverview: (id: number) => string;
  /** Single client-charge detail view. */
  clientChargeView: (id: number, chargeId: number) => string;
  /** Pay form for a single client charge. */
  clientChargePay: (id: number, chargeId: number) => string;

  // ── KYC tabs (nested under a client) ────────────────────────
  /** Family members list tab. */
  clientFamilyMembers: (id: number) => string;
  /** Add-family-member form (a route, not a dialog). */
  clientFamilyMemberAdd: (id: number) => string;
  /** Edit-family-member form. */
  clientFamilyMemberEdit: (id: number, memberId: number) => string;
  /** Identifiers tab — add/delete are dialog-driven. */
  clientIdentities: (id: number) => string;
  /** Documents tab — upload/delete are dialog-driven. */
  clientDocuments: (id: number) => string;
  /** Notes tab — inline add form, dialog edit, confirm delete. */
  clientNotes: (id: number) => string;
  /** Address tab — form is built from /fieldconfiguration/ADDRESS. */
  clientAddress: (id: number) => string;

  // ── Savings accounts (nested under a client) ──────────────────────
  /** Create-savings-account stepper for a client. */
  savingsAccountCreate: (clientId: number) => string;
  /** Savings account general view. */
  savingsAccountView: (clientId: number, savingsId: number) => string;
  /** Savings account transactions tab. */
  savingsAccountTransactions: (clientId: number, savingsId: number) => string;
  /**
   * Savings account action form (Approve, Activate, Reject,
   * Undo Approval, Deposit, Withdrawal, ...).
   */
  savingsAccountAction: (clientId: number, savingsId: number, action: string) => string;

  // ── Loan accounts (nested under a client) ─────────────────────────
  /** Create-loan-account stepper for a client. */
  loanAccountCreate: (clientId: number) => string;
  /** Loan account general view. */
  loanAccountView: (clientId: number, loanId: number) => string;
  /**
   * Loan account action form (Approve, Disburse, Reject,
   * Undo Approval, Undo Disbursal, ...).
   */
  loanAccountAction: (clientId: number, loanId: number, action: string) => string;

  groups: string;
  groupCreate: string;
  groupView: (id: number) => string;
  /** Edit-group form. */
  groupEdit: (id: number) => string;
  /**
   * Group action form (Activate, Manage Members, Close, Assign Staff,
   * Transfer Clients, ...). All of them mount the same
   * `GroupActionsComponent`, which switches on the `:action` param.
   */
  groupAction: (id: number, action: string) => string;
  users: string;
  userCreate: string;
  userView: (id: number) => string;
}

export const ROUTES: AppRoutes = {
  login: '/#/login',
  home: '/#/home',
  clients: '/#/clients',
  clientCreate: '/#/clients/create',
  clientView: (id) => `/#/clients/${id}/general`,
  clientEdit: (id) => `/#/clients/${id}/edit`,
  clientPersonalData: (id) => `/#/clients/${id}/personal-data`,
  clientAction: (id, action) => `/#/clients/${id}/actions/${encodeURIComponent(action)}`,
  clientCharges: (id) => `/#/clients/${id}/charges`,
  clientChargesOverview: (id) => `/#/clients/${id}/charges/overview`,
  clientChargeView: (id, chargeId) => `/#/clients/${id}/charges/${chargeId}`,
  clientChargePay: (id, chargeId) => `/#/clients/${id}/charges/${chargeId}/pay`,

  // The KYC tabs are children of the client view, so they share its
  // resolver and the client id stays in the path. Family members is
  // the only one whose add/edit are full routes rather than dialogs.
  clientFamilyMembers: (id) => `/#/clients/${id}/family-members`,
  clientFamilyMemberAdd: (id) => `/#/clients/${id}/family-members/add`,
  clientFamilyMemberEdit: (id, memberId) => `/#/clients/${id}/family-members/${memberId}/edit`,
  clientIdentities: (id) => `/#/clients/${id}/identities`,
  clientDocuments: (id) => `/#/clients/${id}/documents`,
  clientNotes: (id) => `/#/clients/${id}/notes`,
  clientAddress: (id) => `/#/clients/${id}/address`,

  // Savings and loan accounts are lazy-loaded child modules mounted
  // under the client route, so their URLs always carry the owning
  // client id. Action names are interpolated into the path (Angular
  // reads them as the `:name` / `:action` param) and are therefore
  // encoded — "Undo Approval" and "Withdrawn by Client" both contain
  // spaces.
  savingsAccountCreate: (clientId) => `/#/clients/${clientId}/savings-accounts/create`,
  savingsAccountView: (clientId, savingsId) => `/#/clients/${clientId}/savings-accounts/${savingsId}/general`,
  savingsAccountTransactions: (clientId, savingsId) =>
    `/#/clients/${clientId}/savings-accounts/${savingsId}/transactions`,
  savingsAccountAction: (clientId, savingsId, action) =>
    `/#/clients/${clientId}/savings-accounts/${savingsId}/actions/${encodeURIComponent(action)}`,

  loanAccountCreate: (clientId) => `/#/clients/${clientId}/loans-accounts/create`,
  loanAccountView: (clientId, loanId) => `/#/clients/${clientId}/loans-accounts/${loanId}/general`,
  loanAccountAction: (clientId, loanId, action) =>
    `/#/clients/${clientId}/loans-accounts/${loanId}/actions/${encodeURIComponent(action)}`,

  groups: '/#/groups',
  groupCreate: '/#/groups/create',
  groupView: (id) => `/#/groups/${id}/general`,
  groupEdit: (id) => `/#/groups/${id}/edit`,
  // Encoded because every multi-word action name contains a space —
  // "Manage Members", "Assign Staff", "Transfer Clients". Angular
  // reads the decoded value back as the `:action` param and
  // `GroupActionsComponent` matches it against a literal string map,
  // so the encoding has to round-trip exactly.
  groupAction: (id, action) => `/#/groups/${id}/actions/${encodeURIComponent(action)}`,
  users: '/#/appusers',
  userCreate: '/#/appusers/create',
  userView: (id) => `/#/appusers/${id}`
};
