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

interface SlabRange {
  from: number;
  to: number | null;
}

export type DepositProductType = 'fixeddeposit' | 'recurringdeposit';

function isBlank(value: any): boolean {
  return value === '' || value === null || value === undefined;
}

function toNumber(value: any): number | null {
  if (isBlank(value)) {
    return null;
  }
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? null : numericValue;
}

function hasValue(value: any): boolean {
  return !isBlank(value);
}

function getRange(slab: any, fromField: string, toField: string): SlabRange | null {
  const from = toNumber(slab[fromField]);
  if (from === null) {
    return null;
  }
  return {
    from,
    to: toNumber(slab[toField])
  };
}

function getContinuousRangeError(ranges: SlabRange[]): SlabRangeError | null {
  const sortedRanges = [...ranges].sort((first, second) => first.from - second.from);
  for (let index = 0; index < sortedRanges.length; index++) {
    const range = sortedRanges[index];
    if (range.to !== null && range.to < range.from) {
      return { type: 'invalidRange' };
    }
    if (range.to === null && index !== sortedRanges.length - 1) {
      return { type: 'openEndedRange' };
    }

    const nextRange = sortedRanges[index + 1];
    if (!nextRange || range.to === null) {
      continue;
    }
    if (nextRange.from <= range.to) {
      return { type: 'overlap' };
    }
    if (nextRange.from > range.to + 1) {
      return { type: 'gap' };
    }
  }

  return null;
}

function getSlabsRangeError(slabs: any[], isPrimaryGroupingByAmount: boolean): SlabRangeError | null {
  const periodTypes = new Set(slabs.filter((slab) => hasValue(slab.periodType)).map((slab) => Number(slab.periodType)));
  if (periodTypes.size > 1) {
    return { type: 'periodTypeMismatch' };
  }

  if (isPrimaryGroupingByAmount && slabs.some((slab) => !hasValue(slab.amountRangeFrom))) {
    return { type: 'missingAmountRangeFrom' };
  }

  const fromField = isPrimaryGroupingByAmount ? 'amountRangeFrom' : 'fromPeriod';
  const toField = isPrimaryGroupingByAmount ? 'amountRangeTo' : 'toPeriod';
  const ranges = slabs.map((slab) => getRange(slab, fromField, toField)).filter((range): range is SlabRange => !!range);

  return getContinuousRangeError(ranges);
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
      return `validation.msg.${depositProductType}.chart.slabs.range.has.gap`;
    case 'overlap':
      return `validation.msg.${depositProductType}.chart.slabs.range.overlapping`;
    case 'invalidRange':
      return `validation.msg.${depositProductType}.chart.slabs.range.start.incorrect`;
    case 'openEndedRange':
      return `validation.msg.${depositProductType}.chart.slabs.range.end.incorrect`;
    case 'missingAmountRangeFrom':
      return `validation.msg.${depositProductType}.chart.slabs.amount.range.incomplete`;
    case 'periodTypeMismatch':
      return 'validation.msg.interestchart.period.type.is.not.same';
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
