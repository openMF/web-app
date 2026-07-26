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
  it('accepts a successful Fixed Deposit creation payload with continuous slabs', () => {
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
        toPeriod: '',
        annualInterestRate: 6,
        description: '7 plus months'
      }
    ]);

    expect(chartSlabs.errors).toBeNull();
  });

  it('accepts a successful Recurring Deposit creation payload with continuous slabs', () => {
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
        toPeriod: '',
        annualInterestRate: 6,
        description: '7 plus months'
      }
    ]);

    expect(chartSlabs.errors).toBeNull();
  });

  it('rejects the reproduced backend gap failure before submit', () => {
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
        toPeriod: '',
        annualInterestRate: 6,
        description: '8 plus months'
      }
    ]);

    expect(chartSlabs.errors).toEqual({ slabRange: { type: 'gap' } });
  });

  it('rejects overlapping period slabs before submit', () => {
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
        toPeriod: '',
        annualInterestRate: 6,
        description: '6 plus months'
      }
    ]);

    expect(chartSlabs.errors).toEqual({ slabRange: { type: 'overlap' } });
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

  it('validates primary amount grouping without removing valid zero values', () => {
    const chartSlabs = createChartSlabsControl(
      [
        {
          periodType: 2,
          fromPeriod: 1,
          toPeriod: '',
          amountRangeFrom: 0,
          amountRangeTo: 5000,
          annualInterestRate: 5,
          description: '0 to 5000'
        },
        {
          periodType: 2,
          fromPeriod: 1,
          toPeriod: '',
          amountRangeFrom: 5001,
          amountRangeTo: '',
          annualInterestRate: 6,
          description: '5001 plus'
        }
      ],
      true
    );

    expect(chartSlabs.errors).toBeNull();
  });

  it('normalizes optional blank slab bounds while preserving zeroes', () => {
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
});
