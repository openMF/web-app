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
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';
import { CreateChargeComponent } from './create-charge.component';

describe('CreateChargeComponent - down payment fee', () => {
  const chargesTemplate = {
    chargePaymetModeOptions: [{ id: 0 }],
    incomeOrLiabilityAccountOptions: {
      incomeAccountOptions: [] as unknown[],
      liabilityAccountOptions: [] as unknown[]
    },
    currencyOptions: [] as unknown[],
    loanChargeTimeTypeOptions: [
      { id: 1 },
      { id: 2 },
      { id: 17 }
    ],
    loanChargeCalculationTypeOptions: [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 }
    ]
  };

  /**
   * Builds the component for a loan charge, without rendering the template.
   * @param chargeTimeType Charge time type to select.
   * @returns The initialised component.
   */
  function createComponent(chargeTimeType: number): CreateChargeComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: ActivatedRoute, useValue: { data: of({ chargesTemplate }) } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ProductsService, useValue: { createCharge: jest.fn(() => of({})) } },
        { provide: SettingsService, useValue: { language: { code: 'en' } } },
        { provide: Dates, useValue: {} }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new CreateChargeComponent());
    component.ngOnInit();
    component.chargeForm.patchValue({ chargeAppliesTo: 1 });
    component.chargeForm.patchValue({ chargeTimeType });
    return component;
  }

  it('offers only Flat and % Amount', () => {
    const component = createComponent(17);

    expect(component.filteredChargeCalculationType().map((type: { id: number }) => type.id)).toEqual([
      1,
      2
    ]);
  });

  it('cannot be a penalty', () => {
    const component = createComponent(17);

    expect(component.chargeForm.get('penalty').value).toBe(false);
    expect(component.chargeForm.get('penalty').disabled).toBe(true);
  });

  it('clears an unsupported calculation type when switched to a down payment fee', () => {
    const component = createComponent(2);
    component.chargeForm.patchValue({ chargeCalculationType: 3 });

    component.chargeForm.patchValue({ chargeTimeType: 17 });

    expect(component.chargeForm.get('chargeCalculationType').value).toBeNull();
  });

  it('keeps a supported calculation type when switched to a down payment fee', () => {
    const component = createComponent(2);
    component.chargeForm.patchValue({ chargeCalculationType: 2 });

    component.chargeForm.patchValue({ chargeTimeType: 17 });

    expect(component.chargeForm.get('chargeCalculationType').value).toBe(2);
  });

  it('explains that the percentage is based on the down payment amount', () => {
    const component = createComponent(17);
    component.chargeForm.patchValue({ chargeCalculationType: 2 });

    expect(component.showDownPaymentPercentageHint).toBe(true);
  });

  it('shows no percentage hint for a Flat down payment fee or another charge time type', () => {
    const flatFee = createComponent(17);
    flatFee.chargeForm.patchValue({ chargeCalculationType: 1 });
    const otherFee = createComponent(2);
    otherFee.chargeForm.patchValue({ chargeCalculationType: 2 });

    expect(flatFee.showDownPaymentPercentageHint).toBe(false);
    expect(otherFee.showDownPaymentPercentageHint).toBe(false);
  });

  it('re-enables the penalty flag when another charge time type is chosen', () => {
    const component = createComponent(17);

    component.chargeForm.patchValue({ chargeTimeType: 2 });

    expect(component.chargeForm.get('penalty').enabled).toBe(true);
  });
});
