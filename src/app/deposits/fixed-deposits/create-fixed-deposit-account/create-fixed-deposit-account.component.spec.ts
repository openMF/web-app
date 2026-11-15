/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe, registerLocaleData } from '@angular/common';
import localeEN from '@angular/common/locales/en';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

import { FixedDepositsService } from '../fixed-deposits.service';
import { CreateFixedDepositAccountComponent } from './create-fixed-deposit-account.component';

registerLocaleData(localeEN);

describe('CreateFixedDepositAccountComponent', () => {
  let fixedDepositsService: { createFixedDepositAccount: jest.Mock };

  function createComponent(
    accountChart: any,
    charges: any[] = [],
    dateFormat = 'dd MMMM yyyy'
  ): CreateFixedDepositAccountComponent {
    TestBed.resetTestingModule();
    fixedDepositsService = {
      createFixedDepositAccount: jest.fn(() => of({ resourceId: 77 }))
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ fixedDepositsAccountTemplate: { clientId: 11 } })
          }
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: FixedDepositsService, useValue: fixedDepositsService },
        {
          provide: SettingsService,
          useValue: {
            language: { code: 'en' },
            dateFormat
          }
        },
        Dates,
        DatePipe
      ]
    });

    const component = TestBed.runInInjectionContext(() => new CreateFixedDepositAccountComponent());
    component.fixedDepositsAccountProductTemplate = { accountChart };
    component.fixedDepositsAccountDetailsStep = {
      fixedDepositAccountDetails: {
        productId: 22,
        submittedOnDate: new Date(2026, 0, 1)
      }
    } as any;
    component.fixedDepositAccountTermsStep = {
      fixedDepositAccountTerms: {
        depositAmount: 10000,
        depositPeriod: 12,
        depositPeriodFrequencyId: 2,
        interestCompoundingPeriodType: 1,
        interestPostingPeriodType: 4,
        interestCalculationType: 1,
        interestCalculationDaysInYearType: 365
      }
    } as any;
    component.fixedDepositAccountSettingsStep = {
      fixedDepositAccountSettings: {}
    } as any;
    component.fixedDepositAccountChargesStep = {
      fixedDepositAccountCharges: {
        charges
      }
    } as any;

    return component;
  }

  function submittedPayload(): any {
    return fixedDepositsService.createFixedDepositAccount.mock.calls[0][0];
  }

  function submittedCharge(index = 0): any {
    return submittedPayload().charges[index];
  }

  it('submits the selected account chart id', () => {
    const component = createComponent({
      id: 99,
      chartSlabs: [
        { annualInterestRate: 8 },
        { annualInterestRate: 11.25 }
      ]
    });

    component.submit();

    expect(submittedPayload()).toEqual(expect.objectContaining({ chartId: 99 }));
  });

  it('does not submit display-only chart slabs as charts', () => {
    const component = createComponent({
      id: 99,
      chartSlabs: [
        { annualInterestRate: 8 },
        { annualInterestRate: 11.25 }
      ]
    });

    component.submit();

    expect(submittedPayload()).not.toHaveProperty('charts');
  });

  it('keeps preview chart slabs display-only', () => {
    const chartSlabs = [
      { annualInterestRate: 8 },
      { annualInterestRate: 11.25 }
    ];
    const component = createComponent({ id: 99, chartSlabs });

    expect(component.fixedDepositsAccountProductTemplate.accountChart.chartSlabs).toBe(chartSlabs);

    component.submit();

    expect(submittedPayload()).toEqual(expect.objectContaining({ chartId: 99 }));
    expect(submittedPayload()).not.toHaveProperty('charts');
  });

  it('does not submit misleading chart data when the chart id is missing', () => {
    const component = createComponent({
      chartSlabs: [
        { annualInterestRate: 8 },
        { annualInterestRate: 11.25 }
      ]
    });

    component.submit();

    expect(submittedPayload()).not.toHaveProperty('chartId');
    expect(submittedPayload()).not.toHaveProperty('charts');
  });

  it('sends a fee date picked with dd/MM/yyyy as the chosen day and month', () => {
    const component = createComponent(
      { id: 99, chartSlabs: [] },
      [{ id: 10, amount: 5, feeOnMonthDay: '05/11/2027', feeInterval: 1 }],
      'dd/MM/yyyy'
    );

    component.submit();

    expect(submittedCharge().feeOnMonthDay).toBe('05 November');
    expect(submittedPayload().monthDayFormat).toBe('dd MMMM');
    expect(submittedPayload().dateFormat).toBe('dd/MM/yyyy');
  });

  it('reads the picked fee date with the configured display format', () => {
    const component = createComponent(
      { id: 99, chartSlabs: [] },
      [{ id: 10, amount: 5, feeOnMonthDay: '11/05/2027', feeInterval: 1 }],
      'MM/dd/yyyy'
    );

    component.submit();

    expect(submittedCharge().feeOnMonthDay).toBe('05 November');
  });

  it('drops the year from a manually selected 15 March fee date', () => {
    const component = createComponent({ id: 99, chartSlabs: [] }, [
      { id: 9, amount: 5, feeOnMonthDay: '15 March 2027', feeInterval: 1 }
    ]);

    component.submit();

    expect(submittedCharge().feeOnMonthDay).toBe('15 March');
  });

  it('sends the ISO fee day of a saved account charge as a day and month', () => {
    const component = createComponent({ id: 99, chartSlabs: [] }, [
      { id: 7, amount: 10, feeOnMonthDay: '--03-15', feeInterval: 1 }
    ]);

    component.submit();

    expect(submittedCharge().feeOnMonthDay).toBe('15 March');
  });

  it('sends the [month, day] of a charge template as a day and month', () => {
    const component = createComponent({ id: 99, chartSlabs: [] }, [
      {
        id: 8,
        amount: 5,
        feeOnMonthDay: [
          7,
          22
        ],
        feeInterval: 1
      }
    ]);

    component.submit();

    expect(submittedCharge().feeOnMonthDay).toBe('22 July');
  });

  it('leaves a charge without a fee day unchanged', () => {
    const component = createComponent({ id: 99, chartSlabs: [] }, [
      { id: 11, amount: 5, feeInterval: 1 },
      { id: 12, amount: 5, feeOnMonthDay: '', feeInterval: 1 },
      { id: 13, amount: 5, feeOnMonthDay: null, feeInterval: 1 }
    ]);

    component.submit();

    expect(submittedCharge(0).feeOnMonthDay).toBeUndefined();
    expect(submittedCharge(1).feeOnMonthDay).toBe('');
    expect(submittedCharge(2).feeOnMonthDay).toBeNull();
  });
});
