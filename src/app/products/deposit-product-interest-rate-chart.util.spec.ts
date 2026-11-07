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
  getDepositProductChartSlabsErrorKey,
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

// The recording omits upper period bounds on PAGARE and PAGARE6; neither is a one-day cap.
function recordedSlabs() {
  return [
    { amountRangeFrom: 1, amountRangeTo: 999, fromPeriod: 1, annualInterestRate: 8, description: 'PAGARE' },
    ...[
      [
        1,
        29,
        8
      ],
      [
        30,
        59,
        8.25
      ],
      [
        60,
        89,
        8.75
      ],
      [
        90,
        179,
        9.25
      ],
      [
        180,
        359,
        10
      ],
      [
        360,
        undefined,
        11.25
      ]
    ].map(
      ([
          fromPeriod,
          toPeriod,
          annualInterestRate
        ], index) => ({
        amountRangeFrom: 1000,
        amountRangeTo: 9999,
        fromPeriod,
        toPeriod,
        annualInterestRate,
        description: `PAGARE${index + 1}`
      })
    )
  ].map((slab, index) => ({ ...slab, id: index + 2, periodType: 0 }));
}

describe('WEB-1365 grouped slab regression', () => {
  const slab = (
    fromPeriod = 1,
    toPeriod: number | null = 29,
    amountRangeFrom = 1000,
    amountRangeTo: number | null = 9999
  ) => ({ periodType: 0, fromPeriod, toPeriod, amountRangeFrom, amountRangeTo });

  it('accepts the seven persisted rows from the recording without mutating their response', () => {
    const response = recordedSlabs();
    const original = JSON.stringify(response);
    const chartSlabs = createChartSlabsControl(response, true);
    expect(chartSlabs.errors).toBeNull();
    expect(chartSlabs.value).toEqual(
      response.map((row) => ({ ...row, ...('toPeriod' in row ? { toPeriod: row.toPeriod ?? null } : {}) }))
    );
    expect(JSON.stringify(response)).toBe(original);
  });

  it('accepts repeated amounts with six sequential periods, including the open last period', () => {
    expect(createChartSlabsControl(recordedSlabs().slice(1), true).errors).toBeNull();
  });

  it.each([
    true,
    false
  ])('accepts disjoint amounts sharing one period (group by amount: %s)', (byAmount) => {
    expect(
      createChartSlabsControl(
        [
          slab(1, 29, 1, 999),
          slab(1, 29)
        ],
        byAmount
      ).errors
    ).toBeNull();
  });

  it.each([
    true,
    false
  ])('rejects truly intersecting amount and period ranges (group by amount: %s)', (byAmount) => {
    expect(
      createChartSlabsControl(
        [
          slab(1, 60),
          slab(30, 90, 5000, 15000)
        ],
        byAmount
      ).errors
    ).toEqual({ slabRange: { type: 'overlap' } });
  });

  it.each([
    [
      1,
      40,
      30,
      59
    ],
    [
      1,
      29,
      29,
      59
    ],
    [
      1,
      59,
      59,
      89
    ]
  ])('rejects intersecting periods %s–%s and %s–%s in the same amount group', (a, b, c, d) => {
    expect(
      createChartSlabsControl(
        [
          slab(a, b),
          slab(c, d)
        ],
        true
      ).errors
    ).toEqual({ slabRange: { type: 'overlap' } });
  });

  it('accepts inclusive adjacent periods and rejects duplicate rows regardless of persisted IDs', () => {
    expect(
      createChartSlabsControl(
        [
          slab(1, 29),
          slab(30, 59)
        ],
        true
      ).errors
    ).toBeNull();
    expect(
      createChartSlabsControl(
        [
          { ...slab(), id: 4 },
          { ...slab(), id: 5 }
        ],
        true
      ).errors
    ).toEqual({ slabRange: { type: 'overlap' } });
  });

  it.each([
    null,
    undefined,
    ''
  ])('treats blank upper period %s as unbounded', (toPeriod) => {
    expect(
      createChartSlabsControl(
        [
          { ...slab(), toPeriod },
          slab(30, 59)
        ],
        true
      ).errors
    ).toEqual({ slabRange: { type: 'overlap' } });
    expect(
      createChartSlabsControl(
        [
          slab(),
          { ...slab(30), toPeriod }
        ],
        true
      ).errors
    ).toBeNull();
  });

  it.each([
    null,
    undefined,
    ''
  ])('treats blank upper amount %s as unbounded', (amountRangeTo) => {
    expect(
      createChartSlabsControl(
        [
          slab(1, 29, 1, 999),
          { ...slab(), amountRangeTo }
        ],
        false
      ).errors
    ).toBeNull();
    expect(
      createChartSlabsControl(
        [
          { ...slab(1, 29, 1), amountRangeTo },
          slab()
        ],
        false
      ).errors
    ).toEqual({ slabRange: { type: 'overlap' } });
  });

  it('treats omitted secondary amounts as unrestricted', () => {
    const periodOnly = { periodType: 0, fromPeriod: 1, toPeriod: 29 };
    expect(createChartSlabsControl([periodOnly]).errors).toBeNull();
    expect(
      createChartSlabsControl(
        [
          periodOnly,
          slab()
        ],
        false
      ).errors
    ).toEqual({ slabRange: { type: 'overlap' } });
  });

  it('keeps backend restrictions on partially overlapping primary groups with disjoint secondary ranges', () => {
    expect(
      createChartSlabsControl(
        [
          slab(1, 29),
          slab(30, 59, 5000, 15000)
        ],
        true
      ).errors
    ).toEqual({ slabRange: { type: 'overlap' } });
    expect(
      createChartSlabsControl(
        [
          slab(1, 40, 1, 999),
          slab(30, 59)
        ],
        false
      ).errors
    ).toEqual({ slabRange: { type: 'overlap' } });
  });

  it.each([
    true,
    false
  ])('rejects reversed bounds in either dimension (group by amount: %s)', (byAmount) => {
    expect(createChartSlabsControl([slab(29, 1)], byAmount).errors).toEqual({ slabRange: { type: 'invalidRange' } });
    expect(createChartSlabsControl([slab(1, 29, 9999, 1000)], byAmount).errors).toEqual({
      slabRange: { type: 'invalidRange' }
    });
  });

  it('normalizes numeric strings for grouping without changing form values', () => {
    const first = {
      periodType: '0',
      fromPeriod: '1',
      toPeriod: '29',
      amountRangeFrom: '1000.00',
      amountRangeTo: '9999.00'
    };
    expect(
      createChartSlabsControl(
        [
          first,
          slab(30, 59)
        ],
        true
      ).errors
    ).toBeNull();
    expect(first.amountRangeFrom).toBe('1000.00');
  });

  it('compares decimal amount endpoints exactly and preserves Fineract’s +1 continuity rule', () => {
    const first = { ...slab(), amountRangeFrom: '0.1', amountRangeTo: '0.2' };
    expect(
      createChartSlabsControl(
        [
          first,
          { ...slab(), amountRangeFrom: '1.2', amountRangeTo: '2.2' }
        ],
        false
      ).errors
    ).toBeNull();
    expect(
      createChartSlabsControl(
        [
          first,
          { ...slab(), amountRangeFrom: '0.20', amountRangeTo: '2' }
        ],
        false
      ).errors
    ).toEqual({ slabRange: { type: 'overlap' } });
    expect(
      createChartSlabsControl(
        [
          first,
          { ...slab(), amountRangeFrom: '0.21', amountRangeTo: '2' }
        ],
        false
      ).errors
    ).toEqual({ slabRange: { type: 'gap' } });
  });

  it('supports leading decimal points, scientific notation and exact decimal strings beyond Number precision', () => {
    expect(
      createChartSlabsControl(
        [
          { ...slab(), amountRangeFrom: '.1', amountRangeTo: '2e-1' },
          { ...slab(), amountRangeFrom: '1.2', amountRangeTo: '2.2' }
        ],
        false
      ).errors
    ).toBeNull();
    expect(
      createChartSlabsControl(
        [
          { ...slab(), amountRangeFrom: '1000000000000000000.1', amountRangeTo: '1000000000000000000.2' },
          { ...slab(), amountRangeFrom: '1000000000000000001.2', amountRangeTo: '1000000000000000002.2' }
        ],
        false
      ).errors
    ).toBeNull();
  });

  it('accepts empty and single arrays without pairwise conflicts', () => {
    expect(createChartSlabsControl([], true).errors).toBeNull();
    expect(createChartSlabsControl([slab()], true).errors).toBeNull();
  });

  it('clears errors on correction and deletion using reactive forms', () => {
    const control = createChartSlabsControl(
      [
        slab(1, 40),
        slab(30, 59)
      ],
      true
    );
    expect(control.hasError('slabRange')).toBe(true);
    control.at(0).patchValue({ toPeriod: 29 });
    expect(control.errors).toBeNull();
    control.at(0).patchValue({ toPeriod: 40 });
    expect(control.hasError('slabRange')).toBe(true);
    control.removeAt(1);
    expect(control.errors).toBeNull();
  });

  it('validates secondary ranges for period-first charts', () => {
    expect(
      createChartSlabsControl([
        slab(1, 29, 1, 999),
        slab(1, 29, 1000, null),
        slab(30, null, 1, null)
      ]).errors
    ).toBeNull();
    expect(
      createChartSlabsControl([
        slab(1, 29, 1, 1000),
        slab(1, 29, 1000, null)
      ]).errors
    ).toEqual({ slabRange: { type: 'overlap' } });
  });

  it('preserves IDs, incentives, rates and unrelated configuration during request normalization', () => {
    const source = {
      currencyCode: 'MXN',
      charts: [
        {
          id: 3,
          chartSlabs: [
            { ...recordedSlabs()[0], incentives: [{ id: 10, amount: 0.25 }], toPeriod: null as number | null }
          ]
        }
      ]
    };
    const original = JSON.stringify(source);
    const result = normalizeDepositProductInterestRateCharts(source);
    expect(result.charts[0].chartSlabs[0]).toEqual(
      expect.objectContaining({ id: 2, annualInterestRate: 8, incentives: [{ id: 10, amount: 0.25 }] })
    );
    expect(result.charts[0].chartSlabs[0]).not.toHaveProperty('toPeriod');
    expect(result.currencyCode).toBe('MXN');
    expect(JSON.stringify(source)).toBe(original);
  });

  it.each([
    'fixeddeposit',
    'recurringdeposit'
  ] as const)('uses the errors translation namespace for %s', (productType) => {
    expect(getDepositProductChartSlabsErrorKey({ slabRange: { type: 'overlap' } }, productType)).toBe(
      `errors.validation.msg.${productType}.chart.slabs.range.overlapping`
    );
    expect(getDepositProductChartSlabsErrorKey(null, productType)).toBeNull();
  });
});
