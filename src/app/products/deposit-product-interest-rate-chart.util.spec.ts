/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormArray, FormControl, FormGroup } from '@angular/forms';

import {
  depositProductChartSlabsValidator,
  normalizeDepositProductInterestRateCharts
} from './deposit-product-interest-rate-chart.util';

function createChartSlabsControl(chartSlabs: any[], isPrimaryGroupingByAmount = false): FormArray {
  const formArray = new FormArray(
    chartSlabs.map(
      (chartSlab) =>
        new FormGroup(
          Object.keys(chartSlab).reduce(
            (controls, key) => ({
              ...controls,
              [key]: new FormControl(chartSlab[key])
            }),
            {}
          )
        )
    )
  );
  formArray.setValidators(depositProductChartSlabsValidator(() => isPrimaryGroupingByAmount));
  formArray.updateValueAndValidity();
  return formArray;
}

describe('Deposit product interest rate chart utils', () => {
  it('rejects adjacent inclusive period ranges', () => {
    const chartSlabs = createChartSlabsControl([
      {
        periodType: 2,
        fromPeriod: 1,
        toPeriod: 6,
        annualInterestRate: 5,
        description: '1 to 6 months'
      },
      {
        periodType: 2,
        fromPeriod: 6,
        toPeriod: 12,
        annualInterestRate: 6,
        description: '6 to 12 months'
      }
    ]);

    expect(chartSlabs.errors).toEqual({ slabRange: { type: 'overlap' } });
  });

  it('accepts continuous non-overlapping period ranges', () => {
    const chartSlabs = createChartSlabsControl([
      {
        periodType: 2,
        fromPeriod: 1,
        toPeriod: 6,
        annualInterestRate: 5,
        description: '1 to 6 months'
      },
      {
        periodType: 2,
        fromPeriod: 7,
        toPeriod: 12,
        annualInterestRate: 6,
        description: '7 to 12 months'
      }
    ]);

    expect(chartSlabs.errors).toBeNull();
  });

  it('rejects period ranges with a gap', () => {
    const chartSlabs = createChartSlabsControl([
      {
        periodType: 2,
        fromPeriod: 1,
        toPeriod: 6,
        annualInterestRate: 5,
        description: '1 to 6 months'
      },
      {
        periodType: 2,
        fromPeriod: 8,
        toPeriod: 12,
        annualInterestRate: 6,
        description: '8 to 12 months'
      }
    ]);

    expect(chartSlabs.errors).toEqual({ slabRange: { type: 'gap' } });
  });

  it('rejects a single slab with an inverted range before submit', () => {
    const chartSlabs = createChartSlabsControl([
      {
        periodType: 2,
        fromPeriod: 10,
        toPeriod: 5,
        annualInterestRate: 5,
        description: 'Invalid single slab'
      }
    ]);

    expect(chartSlabs.errors).toEqual({ slabRange: { type: 'invalidRange' } });
  });

  it('rejects mixed period types in the same chart', () => {
    const chartSlabs = createChartSlabsControl([
      {
        periodType: 2,
        fromPeriod: 1,
        toPeriod: 6,
        annualInterestRate: 5,
        description: 'Months'
      },
      {
        periodType: 3,
        fromPeriod: 7,
        toPeriod: '',
        annualInterestRate: 6,
        description: 'Years'
      }
    ]);

    expect(chartSlabs.errors).toEqual({ slabRange: { type: 'periodTypeMismatch' } });
  });

  it('rejects adjacent inclusive amount ranges', () => {
    const chartSlabs = createChartSlabsControl(
      [
        {
          periodType: 2,
          fromPeriod: 1,
          toPeriod: '',
          amountRangeFrom: 0,
          amountRangeTo: 10000,
          annualInterestRate: 5,
          description: '0 to 10000'
        },
        {
          periodType: 2,
          fromPeriod: 1,
          toPeriod: '',
          amountRangeFrom: 10000,
          amountRangeTo: 20000,
          annualInterestRate: 6,
          description: '10000 to 20000'
        }
      ],
      true
    );

    expect(chartSlabs.errors).toEqual({ slabRange: { type: 'overlap' } });
  });

  it('accepts continuous non-overlapping amount ranges', () => {
    const chartSlabs = createChartSlabsControl(
      [
        {
          periodType: 2,
          fromPeriod: 1,
          toPeriod: '',
          amountRangeFrom: 0,
          amountRangeTo: 9999,
          annualInterestRate: 5,
          description: '0 to 9999'
        },
        {
          periodType: 2,
          fromPeriod: 1,
          toPeriod: '',
          amountRangeFrom: 10000,
          amountRangeTo: 20000,
          annualInterestRate: 6,
          description: '10000 to 20000'
        }
      ],
      true
    );

    expect(chartSlabs.errors).toBeNull();
  });

  it('normalizes optional blank slab bounds while preserving numeric zero', () => {
    const payload = normalizeDepositProductInterestRateCharts({
      charts: [
        {
          chartSlabs: [
            {
              periodType: 2,
              fromPeriod: 1,
              toPeriod: '',
              amountRangeFrom: 0,
              amountRangeTo: '',
              annualInterestRate: 5,
              description: 'Open ended amount range'
            }
          ]
        }
      ]
    });

    expect(payload.charts[0].chartSlabs[0]).toEqual({
      periodType: 2,
      fromPeriod: 1,
      amountRangeFrom: 0,
      annualInterestRate: 5,
      description: 'Open ended amount range'
    });
  });

  it('removes blank optional slab bounds during normalization', () => {
    const payload = normalizeDepositProductInterestRateCharts({
      charts: [
        {
          chartSlabs: [
            {
              periodType: 2,
              fromPeriod: 7,
              toPeriod: '',
              amountRangeFrom: '',
              amountRangeTo: '',
              annualInterestRate: 6,
              description: 'Open ended bounds'
            }
          ]
        }
      ]
    });

    expect(payload.charts[0].chartSlabs[0]).toEqual({
      periodType: 2,
      fromPeriod: 7,
      annualInterestRate: 6,
      description: 'Open ended bounds'
    });
  });
});
