/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { compareDecimal, isDecimal } from './investment-json';
import { InvestmentPolicy, NativeProduct, PolicyTemplate, RateMatrix, RateTemplate } from './investment-product.models';
const integer = (value: number, minimum = 1) => Number.isSafeInteger(value) && value >= minimum && value <= 2147483647;
const nativeDays = (value: number | null, unit: number | null): number | null =>
  value == null ? null : unit === 0 ? value : unit === 1 ? value * 7 : NaN;
export function policyIssues(policy: InvestmentPolicy, native: NativeProduct, template: PolicyTemplate): string[] {
  const errors = new Set<string>();
  const { minimumTermDays: min, maximumTermDays: max, termMultipleDays: step } = policy;
  if (!template.investmentTypes.includes(policy.investmentType)) errors.add('Investment.typeRequired');
  if (![
      min,
      max,
      step
    ].every((value) =>
      integer(value)
    ) || max < min || (max - min) % step !== 0 || (policy.investmentType === 'PROMISSORY_NOTE' && (min < template.promissoryNoteMinimumTermDays || max > template.promissoryNoteMaximumTermDays)) || (policy.investmentType === 'CEDE' && (min % template.cedeTermMultipleDays !== 0 || step % template.cedeTermMultipleDays !== 0))) errors.add('Investment.termRules');
  const terms = native.terms;
  const nativeMin = nativeDays(terms.minimum, terms.minimumUnit);
  const nativeMax = nativeDays(terms.maximum, terms.maximumUnit);
  const nativeStep = nativeDays(terms.multiple, terms.multipleUnit);
  if ([
      nativeMin,
      nativeMax,
      nativeStep
    ].some((value) =>
      Number.isNaN(value)
    ) || (nativeMin != null && min < nativeMin) || (nativeMax != null && max > nativeMax) || (nativeStep != null && (nativeMin == null || (min - nativeMin) % nativeStep !== 0 || (max - nativeMin) % nativeStep !== 0 || (max > min && step % nativeStep !== 0)))) errors.add('Investment.nativeTerms');
  const lower = policy.minimumInvestmentAmount ?? native.minimumDepositAmount;
  const upper = policy.maximumInvestmentAmount ?? native.maximumDepositAmount;
  for (const amount of [
    policy.minimumInvestmentAmount,
    policy.maximumInvestmentAmount
  ]) {
    if (
      amount != null &&
      (!isDecimal(amount, native.currencyDigits) ||
        (native.currencyDigits === 0 &&
          native.currencyMultiple > 0 &&
          isDecimal(amount, 0) &&
          BigInt(amount.split('.')[0]) % BigInt(native.currencyMultiple) !== 0n))
    )
      errors.add('Investment.amountRules');
  }
  if (
    policy.minimumInvestmentAmount != null &&
    isDecimal(policy.minimumInvestmentAmount, 6) &&
    compareDecimal(policy.minimumInvestmentAmount, '0') <= 0
  )
    errors.add('Investment.amountRules');
  if ([
      lower,
      upper,
      native.minimumDepositAmount,
      native.maximumDepositAmount
    ].every((value) => value == null || isDecimal(value, 6))) {
    if (
      (lower != null && upper != null && compareDecimal(lower, upper) > 0) ||
      (lower != null &&
        native.minimumDepositAmount != null &&
        compareDecimal(lower, native.minimumDepositAmount) < 0) ||
      (upper != null && native.maximumDepositAmount != null && compareDecimal(upper, native.maximumDepositAmount) > 0)
    )
      errors.add('Investment.amountRules');
  }
  if (policy.automaticReinvestmentEnabled) {
    if (
      (policy.maximumReinvestments != null && !integer(policy.maximumReinvestments, 0)) ||
      policy.renewalRatePolicy !== 'RATE_EFFECTIVE_AT_RENEWAL'
    )
      errors.add('Investment.renewalRules');
    if (
      (!integer(policy.maximumReinvestments, 0) && !policy.maximumReinvestmentsByTerm.length) ||
      policy.maximumReinvestmentsByTerm.length > 100
    )
      errors.add('Investment.renewalRules');
    const termsSeen = new Set<number>();
    for (const limit of policy.maximumReinvestmentsByTerm) {
      if (
        !integer(limit.termDays) ||
        !integer(limit.maximumReinvestments, 0) ||
        limit.termDays < min ||
        limit.termDays > max ||
        (limit.termDays - min) % step !== 0 ||
        termsSeen.has(limit.termDays) ||
        (policy.maximumReinvestments != null && limit.maximumReinvestments > policy.maximumReinvestments)
      )
        errors.add('Investment.renewalRules');
      termsSeen.add(limit.termDays);
    }
  }
  if (
    (policy.capitalizationEnabled && (!policy.capitalizationEligible || !policy.automaticReinvestmentEnabled)) ||
    policy.capitalizationEnabled !== (policy.interestPayoutMode === 'CAPITALIZE_ON_RENEWAL')
  )
    errors.add('Investment.capitalizationRules');
  if (policy.interestPayoutMode === 'MONTHLY' && native.interestPostingPeriod !== 4)
    errors.add('Investment.monthlyRules');
  if (
    policy.penaltyMode === 'VERSIONED_REFERENCE' &&
    (!/^[A-Za-z0-9_.-]{1,100}$/.test(policy.cancellationPolicyReference?.policyCode ?? '') ||
      !integer(policy.cancellationPolicyReference?.revision))
  )
    errors.add('Investment.referenceRules');
  return [...errors];
}
export function matrixIssues(
  matrix: RateMatrix,
  template: RateTemplate,
  policy: InvestmentPolicy,
  native: NativeProduct
): string[] {
  const errors = new Set<string>();
  const amounts = matrix.amountBands;
  const terms = matrix.termBands;
  if (
    !amounts.length ||
    !terms.length ||
    amounts.length > template.maximumAmountBands ||
    terms.length > template.maximumTermBands ||
    amounts.length * terms.length > template.maximumCells ||
    matrix.cells.length !== amounts.length * terms.length
  )
    errors.add('Investment.matrixSize');
  let nextAmount = policy.minimumInvestmentAmount ?? native.minimumDepositAmount ?? '0';
  const maximum = policy.maximumInvestmentAmount ?? native.maximumDepositAmount;
  amounts.forEach((band, index) => {
    const last = index === amounts.length - 1;
    if (
      !isDecimal(band.lower, template.currencyDigits) ||
      (band.upper != null && !isDecimal(band.upper, template.currencyDigits))
    ) {
      errors.add('Investment.amountRules');
      return;
    }
    if (
      nextAmount == null ||
      compareDecimal(band.lower, nextAmount) !== 0 ||
      (band.upper != null &&
        (compareDecimal(band.upper, band.lower) < 0 ||
          (!band.upperInclusive && compareDecimal(band.upper, band.lower) === 0))) ||
      band.upperInclusive !== (last && maximum != null) ||
      (last &&
        (maximum == null ? band.upper != null : band.upper == null || compareDecimal(band.upper, maximum) !== 0)) ||
      (!last && band.upper == null)
    )
      errors.add('Investment.amountCoverage');
    nextAmount = band.upper;
  });
  let nextTerm = policy.minimumTermDays;
  terms.forEach((band) => {
    if (
      !integer(band.minimumDays) ||
      !integer(band.maximumDays) ||
      band.minimumDays !== nextTerm ||
      band.maximumDays < band.minimumDays ||
      band.maximumDays > policy.maximumTermDays ||
      (band.minimumDays - policy.minimumTermDays) % policy.termMultipleDays !== 0 ||
      (band.maximumDays - policy.minimumTermDays) % policy.termMultipleDays !== 0
    )
      errors.add('Investment.termCoverage');
    nextTerm = band.maximumDays + policy.termMultipleDays;
  });
  if (terms.at(-1)?.maximumDays !== policy.maximumTermDays) errors.add('Investment.termCoverage');
  const cells = new Set<string>();
  for (const cell of matrix.cells) {
    const key = cell.amountBand + ':' + cell.termBand;
    if (
      !integer(cell.amountBand, 0) ||
      !integer(cell.termBand, 0) ||
      cell.amountBand >= amounts.length ||
      cell.termBand >= terms.length ||
      cells.has(key) ||
      !isDecimal(cell.annualRatePercent, template.rateDecimalPlaces)
    )
      errors.add('Investment.cellRules');
    cells.add(key);
  }
  return [...errors];
}
