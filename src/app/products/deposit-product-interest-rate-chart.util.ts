/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const OPTIONAL_SLAB_BOUND_FIELDS = [
  'toPeriod',
  'amountRangeFrom',
  'amountRangeTo'
];

type SlabRangeErrorType =
  'gap' | 'overlap' | 'invalidRange' | 'openEndedRange' | 'missingAmountRangeFrom' | 'periodTypeMismatch';

interface SlabRangeError {
  type: SlabRangeErrorType;
}

type NumericBound = number | string | null | undefined;

interface ChartSlabBounds {
  periodType?: NumericBound;
  fromPeriod?: NumericBound;
  toPeriod?: NumericBound;
  amountRangeFrom?: NumericBound;
  amountRangeTo?: NumericBound;
}

interface DecimalBound {
  units: bigint;
  scale: number;
}

interface SlabRange {
  from: DecimalBound;
  to: DecimalBound | null;
}

export type DepositProductType = 'fixeddeposit' | 'recurringdeposit';

function isBlank(value: unknown): boolean {
  return value === '' || value === null || value === undefined;
}

// Compare decimal bounds without rounding currency endpoints or the backend's +1 gap check.
// Number inputs already have JavaScript's precision; string inputs retain their exact value.
function toDecimal(value: NumericBound): DecimalBound | null {
  if (isBlank(value) || !Number.isFinite(Number(value))) {
    return null;
  }
  const match = String(value)
    .trim()
    .match(/^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
  if (!match) {
    return null;
  }
  const fraction = match[3] || '';
  const scale = fraction.length - Number(match[4] || 0);
  const units = BigInt(`${match[1]}${match[2] || '0'}${fraction}`);
  return scale < 0 ? { units: units * 10n ** BigInt(-scale), scale: 0 } : { units, scale };
}

function compare(first: DecimalBound, second: DecimalBound): number {
  const scale = Math.max(first.scale, second.scale);
  const firstUnits = first.units * 10n ** BigInt(scale - first.scale);
  const secondUnits = second.units * 10n ** BigInt(scale - second.scale);
  return firstUnits < secondUnits ? -1 : firstUnits > secondUnits ? 1 : 0;
}

function getRange(
  slab: ChartSlabBounds,
  fromField: keyof ChartSlabBounds,
  toField: keyof ChartSlabBounds
): SlabRange | null {
  const from = toDecimal(slab[fromField]);
  return from === null ? null : { from, to: toDecimal(slab[toField]) };
}

function sameRange(first: SlabRange | null, second: SlabRange | null): boolean {
  if (first === null || second === null) {
    return first === second;
  }
  return (
    compare(first.from, second.from) === 0 &&
    (first.to === null || second.to === null ? first.to === second.to : compare(first.to, second.to) === 0)
  );
}

function getContinuousRangeError(ranges: SlabRange[]): SlabRangeError | null {
  const sortedRanges = [...ranges].sort((first, second) => compare(first.from, second.from));
  for (let index = 0; index < sortedRanges.length - 1; index++) {
    const range = sortedRanges[index];
    const nextRange = sortedRanges[index + 1];
    if (range.to === null || compare(nextRange.from, range.to) <= 0) {
      return { type: 'overlap' };
    }
    // Fineract InterestRateChartSlabFields requires the next lower bound to be upper + 1,
    // including for decimal amounts. Do not replace this with a currency-specific increment.
    const nextStart = { ...range.to, units: range.to.units + 10n ** BigInt(range.to.scale) };
    if (compare(nextRange.from, nextStart) !== 0) {
      return { type: 'gap' };
    }
  }
  return null;
}

function getSlabsRangeError(slabs: ChartSlabBounds[], isPrimaryGroupingByAmount: boolean): SlabRangeError | null {
  const periodTypes = new Set(slabs.filter((slab) => !isBlank(slab.periodType)).map((slab) => Number(slab.periodType)));
  if (periodTypes.size > 1) {
    return { type: 'periodTypeMismatch' };
  }

  if (isPrimaryGroupingByAmount && slabs.some((slab) => isBlank(slab.amountRangeFrom))) {
    return { type: 'missingAmountRangeFrom' };
  }

  const groups: { primary: SlabRange; secondary: (SlabRange | null)[] }[] = [];
  for (const slab of slabs) {
    const amount = getRange(slab, 'amountRangeFrom', 'amountRangeTo');
    const period = getRange(slab, 'fromPeriod', 'toPeriod');
    if ([
        amount,
        period
      ].some((range) => range?.to && compare(range.from, range.to) > 0)) {
      return { type: 'invalidRange' };
    }
    const primary = isPrimaryGroupingByAmount ? amount : period;
    const secondary = isPrimaryGroupingByAmount ? period : amount;
    if (primary === null) {
      continue; // Required lower bounds are also validated by the slab form controls.
    }
    const group = groups.find((candidate) => sameRange(candidate.primary, primary));
    if (group) {
      group.secondary.push(secondary);
    } else {
      groups.push({ primary, secondary: [secondary] });
    }
  }

  // Fineract groups identical primary ranges, then checks the secondary ranges within each
  // group. Partially overlapping primary groups are invalid even with disjoint secondary ranges.
  const primaryError = getContinuousRangeError(groups.map((group) => group.primary));
  if (primaryError) {
    return primaryError;
  }
  for (const group of groups) {
    // An absent secondary lower bound means unrestricted, rather than an upper bound of zero.
    if (group.secondary.length > 1 && group.secondary.some((range) => range === null)) {
      return { type: 'overlap' };
    }
    const secondaryError = getContinuousRangeError(
      group.secondary.filter((range): range is SlabRange => range !== null)
    );
    if (secondaryError) {
      return secondaryError;
    }
  }
  return null;
}

export function depositProductChartSlabsValidator(isPrimaryGroupingByAmount: () => boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const slabs = Array.isArray(control.value) ? control.value : [];
    const error = getSlabsRangeError(slabs, isPrimaryGroupingByAmount());
    return error ? { slabRange: error } : null;
  };
}

export function getDepositProductChartSlabsErrorKey(
  errors: ValidationErrors | null | undefined,
  depositProductType: DepositProductType
): string | null {
  const slabRangeError = errors?.slabRange as SlabRangeError | undefined;
  switch (slabRangeError?.type) {
    case 'gap':
      return `errors.validation.msg.${depositProductType}.chart.slabs.range.has.gap`;
    case 'overlap':
      return `errors.validation.msg.${depositProductType}.chart.slabs.range.overlapping`;
    case 'invalidRange':
      return `errors.validation.msg.${depositProductType}.chart.slabs.range.start.incorrect`;
    case 'openEndedRange':
      return `errors.validation.msg.${depositProductType}.chart.slabs.range.end.incorrect`;
    case 'missingAmountRangeFrom':
      return `errors.validation.msg.${depositProductType}.chart.slabs.amount.range.incomplete`;
    case 'periodTypeMismatch':
      return 'errors.validation.msg.interestchart.period.type.is.not.same';
    default:
      return null;
  }
}

export function normalizeDepositProductInterestRateCharts<T extends { charts?: any[] }>(interestRateChart: T): T {
  return {
    ...interestRateChart,
    charts: interestRateChart.charts?.map((chart) => ({
      ...chart,
      chartSlabs: chart.chartSlabs?.map((slab: any) => {
        const normalizedSlab = { ...slab };
        OPTIONAL_SLAB_BOUND_FIELDS.forEach((field) => {
          if (isBlank(normalizedSlab[field])) {
            delete normalizedSlab[field];
          }
        });
        return normalizedSlab;
      })
    }))
  };
}
