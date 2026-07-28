/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Portable test-data type surface for Playwright E2E factories.
 *
 * Design goals (per GSoC 2026 proposal WA-2.8):
 *  - Capture the minimum shape every test factory and page object
 *    needs from a freshly-created Fineract entity — `resourceId` to
 *    address it in subsequent API calls, `displayName` to assert it
 *    appears in the UI, and the narrow status/timeline projection
 *    actually inspected by E2E specs.
 *  - Stay deliberately narrower than the full Fineract REST payload.
 *    The platform response carries dozens of fields tests never read;
 *    typing them here would tie this file to a Fineract version and
 *    defeat the portability goal.
 *  - Zero imports. The file is intentionally dependency-free so the
 *    React port (`mifos-x-web-app-react`) can copy it verbatim — same
 *    shapes everywhere means factory output is interchangeable across
 *    the Angular and React Playwright suites.
 *
 * Field-naming convention follows the Fineract create-* response
 * envelope (`resourceId`, `officeId`, ...). The optional `timeline`
 * sub-shapes match the Fineract `ClientTimeline` / `LoanTimeline`
 * projections, with every field optional because not every test path
 * activates / approves / disburses the entity.
 *
 * Note: `getLoanTemplate()` and other domain-specific helpers on
 * `ApiSetupManager` land in PR-3 alongside the factory functions
 * that consume them. The `TestLoan` shape is included here because
 * the naming utility in this PR already needs a place for loan
 * factories in PR-3 to project into without churn.
 */

/** Identifier projection shared by every freshly-created Fineract entity. */
export interface TestEntityIdentity {
  /** Numeric primary key returned by the create-* endpoint. */
  resourceId: number;
  /** Human-readable label shown in the UI. */
  displayName: string;
}

/** Two-field status projection used in UI assertions. */
export interface TestStatus {
  id: number;
  code: string;
  value: string;
}

/** Narrow client-timeline projection — every field optional. */
export interface TestClientTimeline {
  submittedOnDate?: readonly number[];
  activatedOnDate?: readonly number[];
  closedOnDate?: readonly number[];
}

/** Narrow loan-timeline projection — every field optional. */
export interface TestLoanTimeline {
  submittedOnDate?: readonly number[];
  approvedOnDate?: readonly number[];
  disbursedOnDate?: readonly number[];
  closedOnDate?: readonly number[];
}

/** Created Fineract client as seen by E2E specs. */
export interface TestClient extends TestEntityIdentity {
  officeId: number;
  status?: TestStatus;
  timeline?: TestClientTimeline;
}

/** Created Fineract group as seen by E2E specs. */
export interface TestGroup extends TestEntityIdentity {
  officeId: number;
  status?: TestStatus;
  /** Member client `resourceId`s, if the group was created with members. */
  members?: readonly number[];
}

/** Created Fineract user as seen by E2E specs. */
export interface TestUser {
  resourceId: number;
  username: string;
  /** Optional — not every test path exercises an email-bearing user. */
  email?: string;
  /** Role names assigned at creation time. */
  roles?: readonly string[];
  officeId: number;
}

/** Created Fineract loan as seen by E2E specs. */
export interface TestLoan extends TestEntityIdentity {
  clientId: number;
  loanProductId: number;
  /** Principal in the loan's minor currency unit. */
  principal: number;
  status?: TestStatus;
  timeline?: TestLoanTimeline;
}
