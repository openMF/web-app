/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect } from '@jest/globals';
import { LoanFormSectionComponent } from './loan-form-section.component';
import { LoanFormSection } from '../loan-form.model';

const section: LoanFormSection = {
  key: 'business',
  title: 'Business',
  description: 'About the business the loan is for',
  fields: [
    { key: 'name', label: 'Business name', type: 'text', required: true, placeholder: 'As registered' },
    { key: 'about', label: 'About', type: 'textarea' },
    { key: 'amount', label: 'Own investment', type: 'currency', currency: 'NPR' },
    { key: 'share', label: 'Own share', type: 'percentage' },
    {
      key: 'kind',
      label: 'Kind',
      type: 'radio',
      options: [
        { value: 'SHOP', label: 'Shop' },
        { value: 'FARM', label: 'Farm' }
      ]
    },
    {
      key: 'crop',
      label: 'Crop',
      type: 'select',
      options: [{ value: 1, label: 'Rice' }],
      visibleWhen: { field: 'kind', equals: 'FARM' }
    },
    { key: 'insured', label: 'Insured', type: 'checkbox' }
  ]
};

function render() {
  TestBed.configureTestingModule({
    imports: [
      LoanFormSectionComponent,
      TranslateModule.forRoot()
    ],
    providers: [provideNoopAnimations()]
  });
  const fixture = TestBed.createComponent(LoanFormSectionComponent);
  fixture.componentInstance.section = section;
  fixture.detectChanges();
  const element: HTMLElement = fixture.nativeElement;
  const shown = () => Array.from(element.querySelectorAll('[data-field]')).map((e) => e.getAttribute('data-field'));
  return { fixture, component: fixture.componentInstance, element, shown };
}

describe('LoanFormSectionComponent', () => {
  it('draws each field with the control its type needs', () => {
    const { element, shown } = render();
    expect(shown()).toEqual([
      'name',
      'about',
      'amount',
      'share',
      'kind',
      'insured'
    ]);
    expect(element.querySelector('[data-field="name"] input')!.getAttribute('placeholder')).toBe('As registered');
    expect(element.querySelector('[data-field="about"] textarea')).not.toBeNull();
    expect(element.querySelector('[data-field="amount"] input')!.getAttribute('type')).toBe('number');
    expect(element.querySelector('[data-field="amount"]')!.textContent).toContain('NPR');
    expect(element.querySelector('[data-field="share"]')!.textContent).toContain('%');
    expect(element.querySelectorAll('[data-field="kind"] mat-radio-button').length).toBe(2);
    expect(element.querySelector('[data-field="insured"] mat-checkbox')).not.toBeNull();
    expect(element.textContent).toContain('About the business the loan is for');
  });

  it('shows a conditional field once its condition holds, and hides it again', () => {
    const { fixture, component, shown } = render();
    component.form.controls['kind'].setValue('FARM');
    fixture.detectChanges();
    expect(shown()).toContain('crop');

    component.form.controls['kind'].setValue('SHOP');
    fixture.detectChanges();
    expect(shown()).not.toContain('crop');
  });

  it('says a required field is missing once it has been touched', () => {
    const { fixture, component, element } = render();
    expect(element.querySelector('[data-field="name"] mat-error')).toBeNull();
    expect(component.form.valid).toBe(false);

    component.form.markAllAsTouched();
    fixture.detectChanges();
    expect(element.querySelector('[data-field="name"] mat-error')!.textContent).toContain('loanForm.required');

    component.form.controls['name'].setValue('Tea shop');
    fixture.detectChanges();
    expect(element.querySelector('[data-field="name"] mat-error')).toBeNull();
    expect(component.form.valid).toBe(true);
  });
});
