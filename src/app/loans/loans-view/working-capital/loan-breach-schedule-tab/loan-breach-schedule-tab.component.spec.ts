/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef, DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { BreachSchedule } from 'app/loans/models/working-capital-loan-account.model';
import { LoanBreachScheduleTabComponent } from './loan-breach-schedule-tab.component';

/**
 * The derivation under test only reads the API flags and the amounts, so the component is built
 * outside the template: `toDate` returns a `Date` untouched, which keeps date parsing out of the way.
 */
describe('LoanBreachScheduleTabComponent - breach derivation', () => {
  const BUSINESS_DATE = new Date(2026, 1, 15);

  function period(overrides: Partial<BreachSchedule> = {}): BreachSchedule {
    return {
      id: 1,
      loanId: 1,
      periodNumber: 1,
      fromDate: new Date(2026, 0, 1),
      toDate: new Date(2026, 2, 17),
      numberOfDays: 76,
      minPaymentAmount: 110.7,
      outstandingAmount: 0,
      ...overrides
    };
  }

  /**
   * `breachPastDueAmount` is left out to stand for the balances not having arrived, which is what the
   * component sees until the parent route emits them.
   */
  function build(periods: BreachSchedule[], breachPastDueAmount?: number): LoanBreachScheduleTabComponent {
    const parentData =
      breachPastDueAmount === undefined ? {} : { loanDetailsData: { balance: { breachPastDueAmount } } };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ breachSchedule: periods, loanBreachActions: [] }),
            parent: { snapshot: { params: { loanId: '1' } }, data: of(parentData) }
          }
        },
        { provide: DestroyRef, useValue: { onDestroy: (): (() => void) => (): void => undefined } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: (): void => undefined } },
        { provide: Dates, useValue: { parseDate: (value: any) => value, formatDate: (): string => '' } },
        { provide: SettingsService, useValue: { businessDate: BUSINESS_DATE, language: { code: 'en' } } },
        { provide: LoansService, useValue: { getWorkingCapitalLoanBreachActions: () => of([]) } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: AlertService, useValue: { alert: (): void => undefined } },
        { provide: MatDialog, useValue: { open: (): void => undefined } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new LoanBreachScheduleTabComponent());
    component.ngOnInit();
    return component;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('reports a fully paid period as compliant, with no days in breach and a zero gap', () => {
    const component = build([period({ breach: false, nearBreach: false, outstandingAmount: 0 })]);

    expect(component.breachPeriods[0].status).toBe('compliant');
    expect(component.breachPeriods[0].severity).toBeNull();
    expect(component.breachPeriods[0].gapPercent).toBe(0);
    expect(component.kpis.count).toBe(0);
    expect(component.kpis.totalDays).toBe(0);
    expect(component.kpis.status).toBe('compliant');
  });

  it('flags a covered period that tripped a near breach evaluation, without calling it a breach', () => {
    const component = build([period({ breach: false, nearBreach: true, outstandingAmount: 0 })]);

    expect(component.breachPeriods[0].status).toBe('near-breach');
    expect(component.breachPeriods[0].toneClass).toBe('near-breach');
    expect(component.breachPeriods[0].statusLabelKey).toBe('labels.text.Near Breach');
    expect(component.kpis.count).toBe(0);
    expect(component.kpis.totalDays).toBe(0);
    expect(component.kpis.status).toBe('near-breach');
  });

  it('keeps a breached period in breach, with the severity graded on the missing share', () => {
    const component = build([period({ breach: true, nearBreach: true, outstandingAmount: 110.7 })]);

    expect(component.breachPeriods[0].status).toBe('in-breach');
    expect(component.breachPeriods[0].severity).toBe('severe');
    expect(component.breachPeriods[0].gapPercent).toBe(100);
    expect(component.kpis.count).toBe(1);
    expect(component.kpis.totalDays).toBe(76);
    expect(component.kpis.status).toBe('in-breach');
  });

  it('treats an open period as undecided rather than as a breach', () => {
    const component = build([period({ breach: null, nearBreach: null, outstandingAmount: 50 })]);

    expect(component.breachPeriods[0].status).toBe('open');
    expect(component.breachPeriods[0].severity).toBeNull();
    expect(component.kpis.count).toBe(0);
    expect(component.kpis.totalDays).toBe(0);
    expect(component.kpis.status).toBe('compliant');
  });

  it('grades severity from the share of the minimum payment left uncovered', () => {
    const cases: { outstanding: number; severity: string }[] = [
      { outstanding: 22.14, severity: 'mild' },
      { outstanding: 55.35, severity: 'moderate' },
      { outstanding: 99.63, severity: 'severe' }
    ];
    cases.forEach(({ outstanding, severity }) => {
      const component = build([period({ breach: true, outstandingAmount: outstanding })]);
      expect(component.breachPeriods[0].severity).toBe(severity);
      TestBed.resetTestingModule();
    });
  });

  it('never yields a negative gap, so the percentage is never rendered as "+-"', () => {
    const component = build([
      period({ breach: false, outstandingAmount: 0 }),
      period({ id: 2, periodNumber: 2, breach: true, outstandingAmount: 110.7 })
    ]);

    component.breachPeriods.forEach((p) => {
      expect(p.gapPercent).toBeGreaterThanOrEqual(0);
      expect(p.gapPercent).toBeLessThanOrEqual(100);
      expect(p.gapBarWidth).toBe(p.gapPercent);
    });
  });

  /**
   * The expired period is the one in breach and the business date sits in the open one that follows:
   * the shape every breached loan takes, since a period is only flagged once it has expired and the
   * same evaluation opens the next one. What the badge reports then is decided by the past due amount.
   */
  function breachedThenOpen(): BreachSchedule[] {
    return [
      period({
        breach: true,
        fromDate: new Date(2025, 9, 1),
        toDate: new Date(2025, 11, 31),
        outstandingAmount: 110.7
      }),
      period({ id: 2, periodNumber: 2, breach: null, outstandingAmount: 110.7 })
    ];
  }

  it('reports the loan as in breach while the past due amount is uncovered', () => {
    const component = build(breachedThenOpen(), 110.7);

    expect(component.kpis.status).toBe('in-breach');
    expect(component.kpis.count).toBe(1);
  });

  it('reports a past breach as resolved once the past due amount is covered', () => {
    const component = build(breachedThenOpen(), 0);

    expect(component.kpis.status).toBe('resolved');
    expect(component.kpis.count).toBe(1);
  });

  it('falls back to the breach flags while the loan balances have not arrived', () => {
    const component = build(breachedThenOpen());

    expect(component.kpis.status).toBe('in-breach');
  });

  it('keeps a near breach warning over a compliant schedule when nothing is past due', () => {
    const component = build([period({ breach: false, nearBreach: true, outstandingAmount: 0 })], 0);

    expect(component.kpis.status).toBe('near-breach');
  });

  it('counts a zero minimum payment as no gap instead of dividing by zero', () => {
    const component = build([period({ breach: false, minPaymentAmount: 0, outstandingAmount: 0 })]);

    expect(component.breachPeriods[0].gapPercent).toBe(0);
    expect(component.kpis.avgGapPercent).toBe(0);
  });
});
