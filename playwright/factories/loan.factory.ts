/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Factory for a Fineract loan owned by the current Playwright test.
 *
 * Three state variants are exported, each building on the previous
 * one so a spec only pays for the transitions it actually needs:
 *
 *  - {@link createTestLoan} — "Submitted and pending approval".
 *  - {@link createApprovedLoan} — approved, not yet disbursed.
 *  - {@link createActiveLoan} — approved AND disbursed (Active).
 *
 * Every variant requires an ACTIVE client — Fineract rejects a loan
 * application against a pending client — so callers are expected to
 * have already produced one via `createActiveTestClient` (see
 * `playwright/factories/client.factory.ts`). The client's activation
 * date bounds this factory's default dates through
 * `DEFAULT_ACCOUNT_OPENING_DATE`; passing an earlier `submittedOnDate`
 * risks a validation error that names neither field.
 *
 * Cleanup caveat: Fineract only hard-deletes a loan while it is still
 * "Submitted and pending approval". The deleter registered by
 * {@link createApprovedLoan} and {@link createActiveLoan} will
 * therefore FAIL, and the `CleanupGuard` records that without
 * throwing — same accepted trade-off as `createActiveTestClient`.
 *
 * Portability note: this module imports only from the in-tree
 * `ApiSetupManager` and `CleanupGuard` types. The React port can adopt
 * it verbatim once it has its own `FineractApiClient` (or a
 * structural equivalent).
 */

import type { ApiSetupManager } from '../utils/api-setup-manager';
import type { CleanupGuard } from '../utils/cleanup-guard';
import type { TestLoan } from '../types/test-data.types';
import { DEFAULT_ACCOUNT_OPENING_DATE } from './client.factory';
import { resolveProductId } from './_shared';

/**
 * Name of the shared minimal loan product seeded by
 * `ApiSetupManager#ensureMinimalLoanProduct`.
 *
 * Exported so UI specs can pick the same product from the create-account
 * dropdown that the API factories attach by id. Hard-coding the string in
 * both places is how the two drift apart after a product rename.
 */
export const E2E_LOAN_PRODUCT_NAME = 'E2E Loan Product';

/** Caller-supplied tweaks accepted by every loan factory in this module. */
export interface CreateTestLoanOverrides {
  /** Fineract loan product id. Defaults to the shared minimal E2E product. */
  loanProductId?: number;
  /**
   * Submitted-on date. Defaults to {@link DEFAULT_ACCOUNT_OPENING_DATE}
   * so a loan submitted with no overrides is always dated after the
   * client's default activation date.
   */
  submittedOnDate?: string;
  /**
   * Approval date. Defaults to `submittedOnDate`.
   *
   * Mirrors `CreateTestSavingsAccountOverrides` so a spec that
   * arranges one loan and one savings account can pass the same date
   * literals to both factories.
   */
  approvedOnDate?: string;
  /** Expected/actual disbursement date. Defaults to `submittedOnDate`. */
  disbursementDate?: string;
}

/**
 * Resolve (and cache) the shared minimal loan product id.
 *
 * A thin wrapper so every loan factory in this module shares the same
 * `ApiSetupManager`-deduped product lookup instead of each calling
 * `ensureMinimalLoanProduct` directly and depending on its own dedupe
 * behaviour matching the others by coincidence.
 */
async function resolveLoanProductId(setup: ApiSetupManager, overrides: CreateTestLoanOverrides): Promise<number> {
  if (overrides.loanProductId !== undefined) {
    return overrides.loanProductId;
  }
  return resolveProductId(await setup.ensureMinimalLoanProduct(), 'loan.factory');
}

/**
 * Re-read a loan after a state transition and project it.
 *
 * Fineract's command responses (`approve`, `disburse`, ...) return only
 * a thin `{ officeId, clientId, loanId, resourceId, changes }`
 * envelope — no `status`, no `timeline`, no `principal`. Projecting
 * straight off that envelope produced a `TestLoan` whose `principal`
 * silently fell back to `0`, which then got passed as the disbursement
 * amount. Re-fetching costs one GET and keeps the returned projection
 * true to server state.
 */
async function refetchLoan(
  setup: ApiSetupManager,
  loanId: number,
  clientId: number,
  loanProductId: number
): Promise<TestLoan> {
  const loan = await setup.api.getLoan(loanId);
  return {
    resourceId: loanId,
    displayName: `Loan #${loanId}`,
    clientId,
    loanProductId,
    principal: loan.principal ?? loan.summary?.principalDisbursed ?? 0,
    status: loan.status,
    timeline: loan.timeline
  };
}

/**
 * Create a loan in "Submitted and pending approval" state and queue
 * its deletion on the supplied {@link CleanupGuard}.
 *
 * Every numeric term field (principal, repayment schedule, interest
 * rate, …) is derived from the loan product's template rather than
 * hard-coded here — mirrors `createActiveLoanForClient` on
 * `FineractApiClient`, which this factory delegates the create call to.
 *
 * @param setup    The per-test {@link ApiSetupManager}.
 * @param guard    The per-test {@link CleanupGuard}.
 * @param clientId - resourceId of an ACTIVE client (see module docstring).
 * @param overrides See {@link CreateTestLoanOverrides}.
 */
export async function createTestLoan(
  setup: ApiSetupManager,
  guard: CleanupGuard,
  clientId: number,
  overrides: CreateTestLoanOverrides = {}
): Promise<TestLoan> {
  const loanProductId = await resolveLoanProductId(setup, overrides);
  const submittedOnDate = overrides.submittedOnDate ?? DEFAULT_ACCOUNT_OPENING_DATE;
  const template = await setup.api.getLoanTemplate(clientId, loanProductId);
  const principal = template.principal ?? 1000;

  const response = await setup.api.createLoan({
    clientId,
    productId: loanProductId,
    submittedOnDate,
    expectedDisbursementDate: overrides.disbursementDate ?? submittedOnDate,
    principal,
    loanType: 'individual',
    loanTermFrequency: template.termFrequency ?? 1,
    loanTermFrequencyType: template.termPeriodFrequencyType?.id ?? 2,
    numberOfRepayments: template.numberOfRepayments ?? 1,
    repaymentEvery: template.repaymentEvery ?? 1,
    repaymentFrequencyType: template.repaymentFrequencyType?.id ?? 2,
    interestRatePerPeriod: template.interestRatePerPeriod ?? 0,
    interestRateFrequencyType: template.interestRateFrequencyType?.id ?? 2,
    amortizationType: template.amortizationType?.id ?? 1,
    interestType: template.interestType?.id ?? 0,
    interestCalculationPeriodType: template.interestCalculationPeriodType?.id ?? 1,
    transactionProcessingStrategyCode: template.transactionProcessingStrategyCode ?? 'mifos-standard-strategy',
    dateFormat: 'dd MMMM yyyy',
    locale: 'en'
  });

  const loanId: number = response.loanId ?? response.resourceId;
  if (typeof loanId !== 'number') {
    throw new Error(
      `createTestLoan: Fineract create-loan response missing numeric loanId/resourceId, got ${JSON.stringify(response)}`
    );
  }

  guard.register(`loan:${loanId}`, async () => {
    await setup.api.deleteLoan(loanId);
  });

  return {
    resourceId: loanId,
    displayName: `Loan #${loanId}`,
    clientId,
    loanProductId,
    principal
  };
}

/**
 * Create a loan and approve it. Builds on {@link createTestLoan} — the
 * same deleter is reused, so cleanup still targets the one loan id.
 */
export async function createApprovedLoan(
  setup: ApiSetupManager,
  guard: CleanupGuard,
  clientId: number,
  overrides: CreateTestLoanOverrides = {}
): Promise<TestLoan> {
  const submittedOnDate = overrides.submittedOnDate ?? DEFAULT_ACCOUNT_OPENING_DATE;
  const approvedOnDate = overrides.approvedOnDate ?? submittedOnDate;

  // Fineract rejects approval when the expected disbursement date
  // falls before the approval date. `createTestLoan` defaults that
  // date to `submittedOnDate`, so a caller who pushes `approvedOnDate`
  // later — which specs do, to prove the date actually reached the
  // server — would submit a loan that can never be approved. Carrying
  // the disbursement date forward keeps the arrangement valid while
  // still honouring an explicit `disbursementDate` override.
  const disbursementDate = overrides.disbursementDate ?? approvedOnDate;

  const loan = await createTestLoan(setup, guard, clientId, { ...overrides, submittedOnDate, disbursementDate });
  await setup.api.approveLoan(loan.resourceId, approvedOnDate);
  return refetchLoan(setup, loan.resourceId, clientId, loan.loanProductId);
}

/**
 * Create, approve, AND disburse a loan (Active state).
 *
 * Cleanup for this variant is expected to fail — Fineract will not
 * hard-delete a disbursed loan. Registered anyway so a test that
 * later undoes the disbursal still gets torn down.
 */
export async function createActiveLoan(
  setup: ApiSetupManager,
  guard: CleanupGuard,
  clientId: number,
  overrides: CreateTestLoanOverrides = {}
): Promise<TestLoan> {
  const submittedOnDate = overrides.submittedOnDate ?? DEFAULT_ACCOUNT_OPENING_DATE;
  const approvedOnDate = overrides.approvedOnDate ?? submittedOnDate;
  const disbursementDate = overrides.disbursementDate ?? approvedOnDate;
  const loan = await createApprovedLoan(setup, guard, clientId, { ...overrides, submittedOnDate, approvedOnDate });

  // `loan.principal` comes from the re-fetched loan, so it reflects the
  // approved amount rather than a create-response fallback. Disbursing
  // a zero amount is silently accepted by Fineract and leaves the loan
  // in a state no assertion would expect.
  if (!loan.principal) {
    throw new Error(
      `createActiveLoan: refusing to disburse loan ${loan.resourceId} with principal ${loan.principal} — ` +
        `the loan template did not yield a usable principal.`
    );
  }

  await setup.api.disburseLoan(loan.resourceId, disbursementDate, loan.principal);
  return refetchLoan(setup, loan.resourceId, clientId, loan.loanProductId);
}
