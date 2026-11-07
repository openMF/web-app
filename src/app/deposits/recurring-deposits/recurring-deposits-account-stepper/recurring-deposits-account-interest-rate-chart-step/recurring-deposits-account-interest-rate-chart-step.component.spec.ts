/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { RecurringDepositsAccountInterestRateChartStepComponent } from './recurring-deposits-account-interest-rate-chart-step.component';

describe('RecurringDepositsAccountInterestRateChartStepComponent', () => {
  let component: RecurringDepositsAccountInterestRateChartStepComponent;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [UntypedFormBuilder]
    });
    component = TestBed.runInInjectionContext(() => new RecurringDepositsAccountInterestRateChartStepComponent());
  });

  it('should initialize form with isRateChartOverridden false and disabled nominalAnnualInterestRate', () => {
    expect(component.interestRateChartForm.get('isRateChartOverridden')?.value).toBe(false);
    expect(component.interestRateChartForm.get('nominalAnnualInterestRate')?.disabled).toBe(true);
    expect(component.interestRateChartForm.valid).toBe(true);
    expect(component.interestRateChart).toEqual({ isRateChartOverridden: false });
  });

  it('should enable nominalAnnualInterestRate and require a positive amount when toggled on', () => {
    component.interestRateChartForm.get('isRateChartOverridden')?.setValue(true);

    const rateControl = component.interestRateChartForm.get('nominalAnnualInterestRate');
    expect(rateControl?.enabled).toBe(true);
    expect(rateControl?.valid).toBe(false);
    expect(component.interestRateChartForm.valid).toBe(false);

    rateControl?.setValue(0);
    expect(rateControl?.hasError('min')).toBe(true);
    expect(component.interestRateChartForm.valid).toBe(false);

    rateControl?.setValue(6.25);
    expect(component.interestRateChartForm.valid).toBe(true);
    expect(component.interestRateChart).toEqual({
      isRateChartOverridden: true,
      nominalAnnualInterestRate: 6.25
    });
  });

  it('should disable and clear nominalAnnualInterestRate when toggled back to false', () => {
    component.interestRateChartForm.get('isRateChartOverridden')?.setValue(true);
    component.interestRateChartForm.get('nominalAnnualInterestRate')?.setValue(6.25);

    component.interestRateChartForm.get('isRateChartOverridden')?.setValue(false);

    const rateControl = component.interestRateChartForm.get('nominalAnnualInterestRate');
    expect(rateControl?.disabled).toBe(true);
    expect(rateControl?.value).toBeNull();
    expect(component.interestRateChartForm.valid).toBe(true);
    expect(component.interestRateChart).toEqual({ isRateChartOverridden: false });
  });

  it('should pre-populate overridden chart data when editing an existing account', () => {
    component.recurringDepositsAccountTemplate = {
      id: 456,
      isRateChartOverridden: true,
      nominalAnnualInterestRate: 9.0
    };

    component.ngOnInit();

    expect(component.interestRateChartForm.get('isRateChartOverridden')?.value).toBe(true);
    expect(component.interestRateChartForm.get('nominalAnnualInterestRate')?.value).toBe(9.0);
    expect(component.interestRateChartForm.valid).toBe(true);
    expect(component.interestRateChart).toEqual({
      isRateChartOverridden: true,
      nominalAnnualInterestRate: 9.0
    });
  });

  it('should not re-patch form values if user changes override setting and product template changes', () => {
    component.recurringDepositsAccountTemplate = {
      id: 456,
      isRateChartOverridden: true,
      nominalAnnualInterestRate: 9.0
    };

    component.ngOnInit();
    expect(component.interestRateChartForm.get('isRateChartOverridden')?.value).toBe(true);

    component.interestRateChartForm.get('isRateChartOverridden')?.setValue(false);
    component.interestRateChartForm.get('isRateChartOverridden')?.markAsDirty();

    component.recurringDepositsAccountProductTemplate = {
      accountChart: { chartSlabs: [] }
    };
    component.ngOnChanges();

    expect(component.interestRateChartForm.get('isRateChartOverridden')?.value).toBe(false);
    expect(component.interestRateChartForm.get('nominalAnnualInterestRate')?.disabled).toBe(true);
  });

  it('should not patch account values when the override control is already dirty', () => {
    // Arrange
    component.interestRateChartForm.get('isRateChartOverridden')?.markAsDirty();
    component.recurringDepositsAccountTemplate = {
      id: 456,
      isRateChartOverridden: true,
      nominalAnnualInterestRate: 9.0
    };

    // Act
    component.ngOnChanges();

    // Assert
    expect(component.interestRateChartForm.get('isRateChartOverridden')?.value).toBe(false);
    expect(component.interestRateChartForm.get('nominalAnnualInterestRate')?.disabled).toBe(true);
  });
});
