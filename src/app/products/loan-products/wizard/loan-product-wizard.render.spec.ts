/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing';

import { LoanProductWizardComponent } from './loan-product-wizard.component';
import { LoanProducts } from '../loan-products';
import { LoanProductService } from '../services/loan-product.service';
import { ProductsService } from '../../products.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * The only spec in this folder that actually renders the wizard's template.
 *
 * Every other spec constructs the component with `new LoanProductWizardComponent()`, which cannot see
 * anything the Angular compiler decides about the template — and content projection is decided there.
 * `mat-form-field` collects its messages with `<ng-content select="mat-error">`, and the compiler can
 * only infer that selector for a control-flow block whose single root node is the element itself. Put
 * a `<mat-error>` inside a nested `@if` and it silently lands in the field's default slot instead:
 * it renders inside the box rather than in the subscript below it, and it appears immediately on a
 * pristine form because Material's touched/dirty gating never gets applied to it.
 */
describe('LoanProductWizardComponent (rendered)', () => {
  let fixture: ComponentFixture<LoanProductWizardComponent>;
  let component: LoanProductWizardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoanProductWizardComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
        // The wizard chrome renders <fa-icon>s; the testing module stubs them out.
        FontAwesomeTestingModule
      ],
      providers: [
        DatePipe,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ProductsService, useValue: { createLoanProduct: jest.fn() } },
        {
          provide: LoanProductService,
          useValue: { loanProductPath: '/loanproducts', productType: { value: 'loan' }, isLoanProduct: true }
        },
        { provide: SettingsService, useValue: { dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } },
        {
          provide: LoanProducts,
          useValue: {
            buildPayload: (payload: Record<string, unknown>) => payload,
            ADVANCED_PAYMENT_ALLOCATION_STRATEGY: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanProductWizardComponent);
    component = fixture.componentInstance;
    component.profileMode = 'personal';
    component.loanProductsTemplate = {
      currencyOptions: [{ code: 'KES', name: 'Kenyan Shilling' }],
      transactionProcessingStrategyOptions: [
        { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
      ],
      // The reused Classic steps read the template eagerly on init, so the shapes they touch have to
      // be present even though this spec only looks at the Details and Terms field grids.
      accountingMappingOptions: {
        assetAccountOptions: [],
        incomeAccountOptions: [],
        expenseAccountOptions: [],
        liabilityAccountOptions: []
      },
      accountingRuleOptions: [],
      chargeOptions: [],
      penaltyOptions: [],
      paymentTypeOptions: []
    };
    // `detectChanges(false)` skips the dev-mode check-no-changes pass. The wizard's accounting summary
    // getter returns a fresh object on every call, so that pass reports NG0100 for it — a pre-existing
    // issue in a part of the component this spec does not exercise, and not something to paper over by
    // changing the summary here.
    detect();
  });

  function detect(): void {
    fixture.detectChanges(false);
  }

  function nameField(): HTMLElement {
    // The Details step renders from the field config, so the product name is the first form field.
    return fixture.nativeElement.querySelector('.field-grid mat-form-field') as HTMLElement;
  }

  it('shows no validation message on a pristine form', () => {
    // `name` is required and empty from the first render. Material keeps that message hidden until the
    // control is touched, dirty or the form is submitted — a wizard that greets the user with two red
    // errors before they have typed anything is the symptom of a projection miss, not of validation.
    expect(component.form.get('name')!.hasError('required')).toBe(true);
    expect(nameField().querySelectorAll('mat-error').length).toBe(0);
  });

  it('shows the required message below the field once the control is touched', () => {
    const control = component.form.get('name')!;
    control.markAsTouched();
    detect();

    const error = nameField().querySelector('mat-error');
    expect(error).not.toBeNull();

    // Projected into the subscript wrapper — the strip under the box — rather than into the field's
    // default slot alongside the input, which is where a nested `@if` would have put it.
    expect(error!.closest('.mat-mdc-form-field-subscript-wrapper')).not.toBeNull();
    expect(error!.closest('.mat-mdc-form-field-flex')).toBeNull();
  });

  /**
   * `[formControlName]` is a property binding, so it leaves no attribute in the DOM to select on.
   * The label is the stable handle — with no translations loaded the `translate` pipe echoes the key.
   */
  function fieldByLabel(labelKey: string): HTMLElement {
    return Array.from(
      fixture.nativeElement.querySelectorAll('.field-grid mat-form-field') as NodeListOf<HTMLElement>
    ).find((field) => field.querySelector('mat-label')?.textContent?.trim() === labelKey)!;
  }

  it('renders the floor message for a value below the field minimum', () => {
    const control = component.form.get('principal')!;
    control.setValue(-50000);
    control.markAsTouched();
    detect();

    const error = fieldByLabel('labels.inputs.Principal Amount').querySelector('mat-error')!;
    expect(error.textContent).toContain('Minimum Value must be');
    expect(error.closest('.mat-mdc-form-field-subscript-wrapper')).not.toBeNull();
  });

  /**
   * With nothing loaded the `translate` pipe echoes the key, which is enough for the cases that only
   * need to prove a message rendered. The `errors.validation.*` messages carry the actual wording and
   * an interpolated value, so those assertions need the resolved string — the key alone would prove
   * neither. Values here mirror en-US.json.
   */
  function loadValidationCopy(): void {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(
      'en',
      {
        errors: {
          'validation.maxLength': 'Maximum length is {{requiredLength}} characters',
          'validation.wholeNumber': 'Must be a whole number',
          'validation.maxDecimals': 'Up to {{decimals}} decimal places allowed'
        }
      },
      true
    );
    translate.use('en');
  }

  it('describes a maxlength failure as a character limit, not a numeric maximum', () => {
    loadValidationCopy();

    const control = component.form.get('name')!;
    control.setValue('n'.repeat(101));
    control.markAsTouched();
    detect();

    const error = nameField().querySelector('mat-error')!;
    expect(error.textContent).toContain('Maximum length is 100 characters');
    expect(error.closest('.mat-mdc-form-field-subscript-wrapper')).not.toBeNull();
  });

  it('renders the whole-number message for a fractional repayment count', () => {
    loadValidationCopy();

    const control = component.form.get('numberOfRepayments')!;
    control.setValue(2.5);
    control.markAsTouched();
    detect();

    const error = fieldByLabel('labels.inputs.Number of Repayments').querySelector('mat-error')!;
    expect(error.textContent).toContain('Must be a whole number');
  });

  it('states the decimal-place limit without claiming the value must be positive', () => {
    // `interestRatePerPeriod` is `min: 0, decimals: 6`, so zero is a legitimate rate. The format
    // message must not contradict that; the floor has its own message.
    loadValidationCopy();

    const control = component.form.get('interestRatePerPeriod')!;
    control.setValue(1.0000001);
    control.markAsTouched();
    detect();

    const error = fieldByLabel('labels.inputs.Annual interest rate').querySelector('mat-error')!;
    expect(error.textContent).toContain('Up to 6 decimal places allowed');
    expect(error.textContent!.toLowerCase()).not.toContain('positive');
  });

  it('accepts zero as an interest rate, with no message at all', () => {
    loadValidationCopy();

    const control = component.form.get('interestRatePerPeriod')!;
    control.setValue(0);
    control.markAsTouched();
    detect();

    expect(control.errors).toBeNull();
    expect(fieldByLabel('labels.inputs.Annual interest rate').querySelectorAll('mat-error').length).toBe(0);
  });
});
