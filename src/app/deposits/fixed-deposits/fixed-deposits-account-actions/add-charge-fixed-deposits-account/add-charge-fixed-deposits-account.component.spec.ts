/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { AddChargeFixedDepositsAccountComponent } from './add-charge-fixed-deposits-account.component';

interface ChargeTemplate {
  id: number;
  name: string;
  amount: number;
  chargeTimeType: { id: number; value: string };
  chargeCalculationType: { id: number };
  feeInterval: number | null;
}

describe('AddChargeFixedDepositsAccountComponent - feeInterval', () => {
  const chargeOptions = [{ id: 1, name: 'Monthly Fee' }];

  function createChargeTemplate(overrides: Partial<ChargeTemplate> = {}): ChargeTemplate {
    return {
      id: 1,
      name: 'Monthly Fee',
      amount: 10,
      chargeTimeType: { id: 2, value: 'Monthly Fee' },
      chargeCalculationType: { id: 1 },
      feeInterval: null,
      ...overrides
    };
  }

  function createComponent(template: ChargeTemplate | ((chargeId: number) => ChargeTemplate)) {
    const resolveTemplate = typeof template === 'function' ? template : () => template;
    const getChargeTemplate = jest.fn((chargeId: number) => of(resolveTemplate(chargeId)));
    const createSavingsCharge = jest.fn(() => of({}));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ fixedDepositsAccountActionData: { chargeOptions } }),
            parent: { snapshot: { params: { fixedDepositAccountId: '9' } } }
          }
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: SavingsService,
          useValue: { getChargeTemplate, createSavingsCharge }
        },
        {
          provide: SettingsService,
          useValue: { maxFutureDate: new Date(), language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' }
        },
        {
          provide: Dates,
          useValue: {
            formatDate: (date: Date, _format: string) => `${date.getDate()} January ${date.getFullYear()}`
          }
        }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new AddChargeFixedDepositsAccountComponent());
    component.ngOnInit();
    return { component, getChargeTemplate, createSavingsCharge };
  }

  function selectCharge(component: AddChargeFixedDepositsAccountComponent, chargeId: number) {
    component.fixedDepositsChargeForm.patchValue({ chargeId });
  }

  it('adds the feeInterval control when a Monthly Fee charge is selected', () => {
    const { component } = createComponent(createChargeTemplate());

    selectCharge(component, 1);

    expect(component.fixedDepositsChargeForm.contains('feeInterval')).toBe(true);
  });

  it('does not add the feeInterval control for a Withdrawal Fee charge', () => {
    const { component } = createComponent(createChargeTemplate({ chargeTimeType: { id: 1, value: 'Withdrawal Fee' } }));

    selectCharge(component, 1);

    expect(component.fixedDepositsChargeForm.contains('feeInterval')).toBe(false);
  });

  it('does not add the feeInterval control for an Annual Fee charge', () => {
    const { component } = createComponent(createChargeTemplate({ chargeTimeType: { id: 3, value: 'Annual Fee' } }));

    selectCharge(component, 1);

    expect(component.fixedDepositsChargeForm.contains('feeInterval')).toBe(false);
  });

  it('marks the feeInterval control as required', () => {
    const { component } = createComponent(createChargeTemplate());

    selectCharge(component, 1);

    const control = component.fixedDepositsChargeForm.get('feeInterval');
    expect(control.hasError('required')).toBe(true);
  });

  it('includes the feeInterval in the submitted payload when set by the user', () => {
    const { component, createSavingsCharge } = createComponent(createChargeTemplate({ feeInterval: null }));

    selectCharge(component, 1);
    component.fixedDepositsChargeForm.patchValue({ amount: 10, feeInterval: 3 });

    component.submit();

    expect(createSavingsCharge).toHaveBeenCalledWith('9', 'charges', expect.objectContaining({ feeInterval: 3 }));
  });

  it('falls back to the template feeInterval when the user does not set one', () => {
    const { component, createSavingsCharge } = createComponent(createChargeTemplate({ feeInterval: 5 }));

    selectCharge(component, 1);
    component.fixedDepositsChargeForm.patchValue({ amount: 10 });

    component.submit();

    expect(createSavingsCharge).toHaveBeenCalledWith('9', 'charges', expect.objectContaining({ feeInterval: 5 }));
  });

  it('does not submit a stale feeInterval when switching from Monthly Fee to Withdrawal Fee', () => {
    const { component, createSavingsCharge } = createComponent((chargeId: number) =>
      chargeId === 1
        ? createChargeTemplate({ id: 1 })
        : createChargeTemplate({ id: 2, chargeTimeType: { id: 1, value: 'Withdrawal Fee' } })
    );

    selectCharge(component, 1);
    expect(component.fixedDepositsChargeForm.contains('feeInterval')).toBe(true);

    component.fixedDepositsChargeForm.patchValue({ amount: 10, feeInterval: 3 });

    selectCharge(component, 2);
    expect(component.fixedDepositsChargeForm.contains('feeInterval')).toBe(false);

    component.submit();

    const payload = (createSavingsCharge as jest.Mock).mock.calls[0][2];
    expect(payload.feeInterval).not.toBe(3);
  });

  it('replaces the feeInterval when switching from one Monthly Fee charge to another', () => {
    const { component, createSavingsCharge } = createComponent((chargeId: number) =>
      chargeId === 1 ? createChargeTemplate({ id: 1, feeInterval: 3 }) : createChargeTemplate({ id: 2, feeInterval: 5 })
    );

    selectCharge(component, 1);
    expect(component.fixedDepositsChargeForm.contains('feeInterval')).toBe(true);
    expect(component.fixedDepositsChargeForm.get('feeInterval').value).toBe(3);

    selectCharge(component, 2);
    expect(component.fixedDepositsChargeForm.get('feeInterval').value).toBe(5);

    component.submit();

    const payload = (createSavingsCharge as jest.Mock).mock.calls[0][2];
    expect(payload.feeInterval).toBe(5);
    expect(payload.feeInterval).not.toBe(3);
  });
});
