/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

import { FixedDepositsService } from '../fixed-deposits.service';
import { CreateFixedDepositAccountComponent } from './create-fixed-deposit-account.component';

describe('CreateFixedDepositAccountComponent', () => {
  let fixedDepositsService: { createFixedDepositAccount: jest.Mock };

  function createComponent(accountChart: any): CreateFixedDepositAccountComponent {
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
            dateFormat: 'dd MMMM yyyy'
          }
        },
        {
          provide: Dates,
          useValue: {
            formatDate: jest.fn((value: any) => value)
          }
        }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new CreateFixedDepositAccountComponent());
    component.fixedDepositsAccountProductTemplate = { accountChart };
    component.fixedDepositsAccountDetailsStep = {
      fixedDepositAccountDetails: {
        productId: 22,
        submittedOnDate: '01 January 2026'
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
        charges: []
      }
    } as any;

    return component;
  }

  function submittedPayload(): any {
    return fixedDepositsService.createFixedDepositAccount.mock.calls[0][0];
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
});
