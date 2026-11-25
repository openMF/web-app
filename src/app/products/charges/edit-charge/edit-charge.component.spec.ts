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
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';
import { EditChargeComponent } from './edit-charge.component';

describe('EditChargeComponent - down payment fee', () => {
  /**
   * Builds the component for an existing loan charge, without rendering the template.
   * @param chargeTimeType Charge time type the charge is saved with.
   * @returns The initialised component.
   */
  function createComponent(chargeTimeType: number, chargeCalculationType = 1): EditChargeComponent {
    const chargesTemplate = {
      id: 3,
      name: 'Fee',
      chargeAppliesTo: { id: 1, value: 'Loan' },
      currency: { code: 'USD' },
      amount: 10,
      active: true,
      penalty: false,
      chargeTimeType: { id: chargeTimeType },
      chargeCalculationType: { id: chargeCalculationType },
      chargePaymentMode: { id: 0 },
      loanChargeTimeTypeOptions: [
        { id: 2 },
        { id: 17 }
      ],
      loanChargeCalculationTypeOptions: [
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ]
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: ActivatedRoute, useValue: { data: of({ chargesTemplate }) } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ProductsService, useValue: { updateCharge: jest.fn(() => of({})) } },
        { provide: SettingsService, useValue: { language: { code: 'en' } } }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new EditChargeComponent());
    component.ngOnInit();
    return component;
  }

  it('offers only Flat and % Amount for a down payment fee', () => {
    const component = createComponent(17);

    expect(component.availableChargeCalculationTypes.map((type: { id: number }) => type.id)).toEqual([
      1,
      2
    ]);
  });

  it('keeps every calculation type for other charge time types', () => {
    const component = createComponent(2);

    expect(component.availableChargeCalculationTypes).toHaveLength(3);
  });

  it('locks the penalty flag of a saved down payment fee', () => {
    const component = createComponent(17);

    expect(component.chargeForm.get('penalty').disabled).toBe(true);
  });

  it('locks the penalty flag when the charge is switched to a down payment fee', () => {
    const component = createComponent(2);

    component.chargeForm.patchValue({ chargeTimeType: 17 });

    expect(component.chargeForm.get('penalty').value).toBe(false);
    expect(component.chargeForm.get('penalty').disabled).toBe(true);
  });

  it('clears an unsupported calculation type when switched to a down payment fee', () => {
    const component = createComponent(2, 3);

    component.chargeForm.patchValue({ chargeTimeType: 17 });

    expect(component.chargeForm.get('chargeCalculationType').value).toBeNull();
  });

  it('explains that the percentage of a % Amount down payment fee is based on the down payment amount', () => {
    expect(createComponent(17, 2).showDownPaymentPercentageHint).toBe(true);
    expect(createComponent(17, 1).showDownPaymentPercentageHint).toBe(false);
    expect(createComponent(2, 2).showDownPaymentPercentageHint).toBe(false);
  });

  it('keeps a supported calculation type when switched to a down payment fee', () => {
    const component = createComponent(2, 2);

    component.chargeForm.patchValue({ chargeTimeType: 17 });

    expect(component.chargeForm.get('chargeCalculationType').value).toBe(2);
  });

  describe('amount validation', () => {
    it('rejects zero as an invalid amount', () => {
      const component = createComponent(2);

      component.chargeForm.patchValue({ amount: '0' });

      expect(component.chargeForm.controls.amount.hasError('pattern')).toBe(true);
      expect(component.chargeForm.controls.amount.valid).toBe(false);
    });

    it('rejects a negative amount', () => {
      const component = createComponent(2);

      component.chargeForm.patchValue({ amount: '-5' });

      expect(component.chargeForm.controls.amount.hasError('pattern')).toBe(true);
      expect(component.chargeForm.controls.amount.valid).toBe(false);
    });

    it('rejects a non-numeric amount', () => {
      const component = createComponent(2);

      component.chargeForm.patchValue({ amount: 'abc' });

      expect(component.chargeForm.controls.amount.hasError('pattern')).toBe(true);
      expect(component.chargeForm.controls.amount.valid).toBe(false);
    });

    it('accepts a valid positive decimal amount', () => {
      const component = createComponent(2);

      component.chargeForm.patchValue({ amount: '10.50' });

      expect(component.chargeForm.controls.amount.valid).toBe(true);
      expect(component.chargeForm.controls.amount.hasError('pattern')).toBe(false);
    });

    it('accepts a small positive decimal amount', () => {
      const component = createComponent(2);

      component.chargeForm.patchValue({ amount: '0.01' });

      expect(component.chargeForm.controls.amount.valid).toBe(true);
      expect(component.chargeForm.controls.amount.hasError('pattern')).toBe(false);
    });

    it('still requires a non-empty amount', () => {
      const component = createComponent(2);

      component.chargeForm.patchValue({ amount: '' });

      expect(component.chargeForm.controls.amount.hasError('required')).toBe(true);
      expect(component.chargeForm.controls.amount.valid).toBe(false);
    });

    it('shows the pattern error message when the amount is invalid', () => {
      const component = createComponent(2);

      component.chargeForm.patchValue({ amount: '0' });
      component.chargeForm.controls.amount.markAsTouched();

      expect(component.chargeForm.controls.amount.hasError('pattern')).toBe(true);
    });
  });
});
