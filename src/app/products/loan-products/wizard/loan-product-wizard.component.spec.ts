/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { buildPayload } from './loan-product.config';
import { LoanProductWizardComponent } from './loan-product-wizard.component';
import { LoanProducts } from '../loan-products';
import { LoanProductService } from '../services/loan-product.service';
import { ProductsService } from '../../products.service';
import { SettingsService } from 'app/settings/settings.service';

describe('LoanProductWizardComponent', () => {
  const loanProductServiceStub = {
    loanProductPath: '/loanproducts',
    productType: { value: 'loan' },
    isLoanProduct: true
  };

  const productsServiceStub = {
    createLoanProduct: jest.fn()
  };

  const routerStub = {
    navigate: jest.fn()
  };

  const translateServiceStub = {
    instant: (key: string) => key
  };

  const settingsServiceStub = {
    dateFormat: 'dd MMMM yyyy'
  };

  function createComponent(): LoanProductWizardComponent {
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        DatePipe,
        { provide: ProductsService, useValue: productsServiceStub },
        { provide: LoanProductService, useValue: loanProductServiceStub },
        { provide: Router, useValue: routerStub },
        { provide: TranslateService, useValue: translateServiceStub },
        { provide: SettingsService, useValue: settingsServiceStub },
        {
          provide: LoanProducts,
          useValue: {
            // Mirrors the real `LoanProducts.buildPayload`, which stamps every payload with the
            // dateFormat/locale pair the backend needs to parse the formatted `startDate`/`closeDate`.
            buildPayload: (payload: Record<string, unknown>) => ({
              ...payload,
              dateFormat: settingsServiceStub.dateFormat,
              locale: 'en'
            })
          }
        }
      ]
    });

    return TestBed.runInInjectionContext(() => new LoanProductWizardComponent());
  }

  it('defaults Personal Loan to the advanced repayment strategy and preserves the template option label', () => {
    const component = createComponent();
    component.profileMode = 'personal';
    component.loanProductsTemplate = {
      currencyOptions: [{ code: 'INR' }],
      transactionProcessingStrategyOptions: [
        {
          code: 'interest-principal-penalties-fees-order-strategy',
          name: 'Interest → Principal → Penalties → Fees'
        },
        {
          code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
          name: 'Advanced Payment Allocation'
        }
      ]
    };

    component.ngOnInit();

    expect(component.form.get('transactionProcessingStrategyCode')?.value).toBe(
      LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
    );

    // The Review summarizes the visible wizard form state (via reviewGroups), not the final payload.
    const strategyRow = component.reviewGroups
      .flatMap((group) => group.rows)
      .find((row) => row.label === 'Repayment strategy');

    expect(strategyRow).toEqual({
      label: 'Repayment strategy',
      display: 'Advanced Payment Allocation'
    });
    expect(
      component.formatValue('transactionProcessingStrategyCode', LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY)
    ).toBe('Advanced Payment Allocation');
  });

  it('submits the selected advanced repayment strategy with the Progressive schedule', () => {
    const component = createComponent();
    component.profileMode = 'personal';
    component.loanProductsTemplate = {
      currencyOptions: [{ code: 'INR' }],
      transactionProcessingStrategyOptions: [
        {
          code: 'interest-principal-penalties-fees-order-strategy',
          name: 'Interest → Principal → Penalties → Fees'
        },
        {
          code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
          name: 'Advanced Payment Allocation'
        }
      ]
    };

    component.ngOnInit();

    const payload = component.buildPayloadForSubmit();

    expect(payload.transactionProcessingStrategyCode).toBe(LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY);
    expect(payload.loanScheduleType).toBe('PROGRESSIVE');
  });

  it('injects a DEFAULT payment allocation when submitting with the advanced strategy', () => {
    const component = createComponent();
    component.profileMode = 'personal';
    component.loanProductsTemplate = {
      currencyOptions: [{ code: 'INR' }],
      transactionProcessingStrategyOptions: [
        {
          code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
          name: 'Advanced Payment Allocation'
        }
      ],
      advancedPaymentAllocationTransactionTypes: [{ id: 1, code: 'DEFAULT', value: 'Default' }],
      advancedPaymentAllocationTypes: [
        { id: 1, code: 'PENALTY', value: 'Penalty' },
        { id: 2, code: 'FEE', value: 'Fee' },
        { id: 3, code: 'INTEREST', value: 'Interest' },
        { id: 4, code: 'PRINCIPAL', value: 'Principal' }
      ],
      advancedPaymentAllocationFutureInstallmentAllocationRules: [
        { id: 1, code: 'NEXT_INSTALLMENT', value: 'Next installment' }
      ]
    };

    component.ngOnInit();

    const payload = component.buildPayloadForSubmit();
    const paymentAllocation = payload.paymentAllocation as Array<Record<string, unknown>>;

    expect(Array.isArray(paymentAllocation)).toBe(true);
    expect(paymentAllocation.length).toBeGreaterThan(0);
    expect(paymentAllocation[0].transactionType).toBe('DEFAULT');
    expect(paymentAllocation[0].futureInstallmentAllocationRule).toBe('NEXT_INSTALLMENT');
    expect(paymentAllocation[0].paymentAllocationOrder).toEqual([
      { order: 1, paymentAllocationRule: 'PENALTY' },
      { order: 2, paymentAllocationRule: 'FEE' },
      { order: 3, paymentAllocationRule: 'INTEREST' },
      { order: 4, paymentAllocationRule: 'PRINCIPAL' }
    ]);
  });

  it('forwards the user-configured payment allocation instead of rebuilding the default', () => {
    const component = createComponent();
    component.profileMode = 'personal';
    component.loanProductsTemplate = {
      currencyOptions: [{ code: 'INR' }],
      transactionProcessingStrategyOptions: [
        { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
      ],
      advancedPaymentAllocationTransactionTypes: [{ id: 1, code: 'DEFAULT', value: 'Default' }],
      advancedPaymentAllocationTypes: [
        { id: 1, code: 'PENALTY', value: 'Penalty' },
        { id: 2, code: 'FEE', value: 'Fee' }
      ],
      advancedPaymentAllocationFutureInstallmentAllocationRules: [
        { id: 1, code: 'NEXT_INSTALLMENT', value: 'Next installment' }
      ]
    };

    component.ngOnInit();

    // Simulate the reused Payment Allocation step emitting the user's edited ordering.
    const edited = [
      {
        transactionType: 'DEFAULT',
        paymentAllocationOrder: [
          { order: 1, paymentAllocationRule: 'FEE' },
          { order: 2, paymentAllocationRule: 'PENALTY' }
        ],
        futureInstallmentAllocationRule: 'NEXT_INSTALLMENT'
      }
    ];
    component.setPaymentAllocation(edited as never);

    const payload = component.buildPayloadForSubmit();

    expect(payload.paymentAllocation).toBe(edited);
    // Credit allocation stays omitted while the user has not added credit transaction types.
    expect(payload.creditAllocation).toBeUndefined();
  });

  it('includes the credit allocation only once the user has configured one', () => {
    const component = createComponent();
    component.profileMode = 'personal';
    component.loanProductsTemplate = {
      currencyOptions: [{ code: 'INR' }],
      transactionProcessingStrategyOptions: [
        { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
      ],
      advancedPaymentAllocationTransactionTypes: [{ id: 1, code: 'DEFAULT', value: 'Default' }],
      advancedPaymentAllocationTypes: [{ id: 1, code: 'PENALTY', value: 'Penalty' }],
      advancedPaymentAllocationFutureInstallmentAllocationRules: [
        { id: 1, code: 'NEXT_INSTALLMENT', value: 'Next installment' }
      ]
    };

    component.ngOnInit();

    const credit = [{ transactionType: 'REPAYMENT', creditAllocationOrder: [] as unknown[] }];
    component.setCreditAllocation(credit as never);

    const payload = component.buildPayloadForSubmit();

    expect(payload.creditAllocation).toBe(credit);
  });

  it('shows the payment allocation step only for the advanced strategy', () => {
    const component = createComponent();
    component.profileMode = 'custom-advanced';
    component.loanProductsTemplate = { currencyOptions: [{ code: 'INR' }] };

    component.ngOnInit();

    const hasPaymentAllocationStep = () => component.visibleSteps.some((step) => step.kind === 'payment-allocation');

    component.form.patchValue({ transactionProcessingStrategyCode: 'mifos-standard-strategy' });
    expect(component.isAdvancedPaymentStrategy).toBe(false);
    expect(hasPaymentAllocationStep()).toBe(false);

    component.form.patchValue({
      transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
    });
    expect(component.isAdvancedPaymentStrategy).toBe(true);
    expect(hasPaymentAllocationStep()).toBe(true);
  });

  it('does not submit a payment allocation for a non-advanced strategy', () => {
    const component = createComponent();
    component.profileMode = 'custom-advanced';
    component.loanProductsTemplate = { currencyOptions: [{ code: 'INR' }] };

    component.ngOnInit();
    component.form.patchValue({ transactionProcessingStrategyCode: 'mifos-standard-strategy' });

    const payload = component.buildPayloadForSubmit();

    expect(payload.paymentAllocation).toBeUndefined();
    expect(payload.creditAllocation).toBeUndefined();
  });

  it('exposes the advanced repayment strategy in the Custom/Advanced dropdown, sourced from the template', () => {
    const component = createComponent();
    component.profileMode = 'custom-advanced';
    component.loanProductsTemplate = {
      currencyOptions: [{ code: 'INR' }],
      transactionProcessingStrategyOptions: [
        { code: 'mifos-standard-strategy', name: 'Mifos standard' },
        { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
      ]
    };

    component.ngOnInit();

    const settingsStep = component.steps.find((step) =>
      step.fields.some((field) => field.key === 'transactionProcessingStrategyCode')
    )!;
    const strategyField = component
      .visibleFields(settingsStep)
      .find((field) => field.key === 'transactionProcessingStrategyCode')!;

    // Sourced from the template (like Classic's settings step), not the field's static fallback list.
    expect(strategyField.options).toEqual([
      { value: 'mifos-standard-strategy', label: 'Mifos standard' },
      { value: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, label: 'Advanced Payment Allocation' }
    ]);
  });

  it('appends the advanced strategy to the Custom/Advanced dropdown even if the template omits it', () => {
    const component = createComponent();
    component.profileMode = 'custom-advanced';
    component.loanProductsTemplate = {
      currencyOptions: [{ code: 'INR' }],
      transactionProcessingStrategyOptions: [{ code: 'mifos-standard-strategy', name: 'Mifos standard' }]
    };

    component.ngOnInit();

    const settingsStep = component.steps.find((step) =>
      step.fields.some((field) => field.key === 'transactionProcessingStrategyCode')
    )!;
    const strategyField = component
      .visibleFields(settingsStep)
      .find((field) => field.key === 'transactionProcessingStrategyCode')!;

    expect(
      strategyField.options?.some((option) => option.value === LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY)
    ).toBe(true);
  });

  it('produces a Classic-equivalent payload for Custom/Advanced once the advanced strategy is selected', () => {
    const component = createComponent();
    component.profileMode = 'custom-advanced';
    component.loanProductsTemplate = {
      currencyOptions: [{ code: 'INR' }],
      transactionProcessingStrategyOptions: [
        { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
      ],
      advancedPaymentAllocationTransactionTypes: [{ id: 1, code: 'DEFAULT', value: 'Default' }],
      advancedPaymentAllocationTypes: [
        { id: 1, code: 'PENALTY', value: 'Penalty' },
        { id: 2, code: 'FEE', value: 'Fee' }
      ],
      advancedPaymentAllocationFutureInstallmentAllocationRules: [
        { id: 1, code: 'NEXT_INSTALLMENT', value: 'Next installment' }
      ],
      supportedInterestRefundTypes: [{ id: 'MERCHANT_ISSUED_REFUND' }]
    };

    component.ngOnInit();
    component.form.patchValue({
      transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
      loanScheduleType: 'Progressive'
    });

    const payload = component.buildPayloadForSubmit();
    const paymentAllocation = payload.paymentAllocation as Array<Record<string, unknown>>;

    // Same DEFAULT allocation the reused AdvancedPaymentStrategy service builds for Personal Loan / Classic.
    expect(paymentAllocation[0].transactionType).toBe('DEFAULT');
    expect(paymentAllocation[0].paymentAllocationOrder).toEqual([
      { order: 1, paymentAllocationRule: 'PENALTY' },
      { order: 2, paymentAllocationRule: 'FEE' }
    ]);
    // Same template-default forwarding Classic/Personal use; no dedicated Interest Refund UI in either wizard.
    expect(payload.supportedInterestRefundTypes).toEqual([{ id: 'MERCHANT_ISSUED_REFUND' }]);
  });

  it('seeds daysInYearType/daysInMonthType from the template id, not the display value (numeric enum)', () => {
    // Regression: the template returns these as EnumOptionData ({ id, code, value }). Reading `.value`
    // seeded the FormControl with the display string ("Actual"/"30 days"); with `daysInMonthType` no
    // longer masked by HIDDEN_DEFAULTS in the custom-advanced merge, that string reached the payload
    // and the backend rejected `daysInYearType = "Actual"`. The form/payload must carry the integer id.
    const component = createComponent();
    component.profileMode = 'custom-advanced';
    component.loanProductsTemplate = {
      currencyOptions: [{ code: 'INR' }],
      transactionProcessingStrategyOptions: [{ code: 'mifos-standard-strategy', name: 'Mifos standard' }],
      daysInYearType: { id: 1, code: 'DaysInYearType.actual', value: 'Actual' },
      daysInMonthType: { id: 30, code: 'DaysInMonthType.days30', value: '30 days' }
    };

    component.ngOnInit();

    expect(component.form.get('daysInYearType')?.value).toBe(1);
    expect(component.form.get('daysInMonthType')?.value).toBe(30);

    const payload = component.buildPayloadForSubmit();
    expect(payload.daysInYearType).toBe(1);
    expect(payload.daysInMonthType).toBe(30);
    // No display strings leak through for either field.
    expect(payload.daysInYearType).not.toBe('Actual');
    expect(payload.daysInMonthType).not.toBe('30 days');
  });

  it('caches the review payload and refreshes it when the form changes', () => {
    const component = createComponent();
    component.profileMode = 'personal';
    component.loanProductsTemplate = {
      currencyOptions: [{ code: 'INR' }],
      transactionProcessingStrategyOptions: [
        {
          code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
          name: 'Advanced Payment Allocation'
        }
      ]
    };

    component.ngOnInit();

    expect(component.reviewPayload).toEqual(
      buildPayload(component.form.getRawValue(), component.profileMode, component.loanProductsTemplate)
    );

    component.form.patchValue({ principal: 75000 });

    expect(component.reviewPayload['principal']).toBe(75000);
    expect(component.reviewPayload).toEqual(
      buildPayload(component.form.getRawValue(), component.profileMode, component.loanProductsTemplate)
    );
  });

  it('formats startDate the same way Classic does before it reaches the payload', () => {
    // `Dates.formatDate` resolves the DatePipe locale from `Dates.language.code`, which the app
    // seeds into localStorage during startup. `localStorage` is globally mocked as jest.fn() stubs
    // (see setup-jest.ts), so `getItem` must be stubbed directly rather than via `setItem`.
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify({ code: 'en' }));

    const component = createComponent();
    component.profileMode = 'personal';
    component.loanProductsTemplate = {
      currencyOptions: [{ code: 'INR' }],
      transactionProcessingStrategyOptions: [
        {
          code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
          name: 'Advanced Payment Allocation'
        }
      ]
    };

    component.ngOnInit();
    component.form.patchValue({ startDate: new Date(2026, 6, 2) });

    // The FormControl still holds a Date object; only the built payload is formatted.
    expect(component.form.value.startDate).toBeInstanceOf(Date);

    const payload = component.buildPayloadForSubmit();

    // Matches Classic's `LoanProductDetailsStepComponent.loanProductDetails` output: formatted via
    // `Dates.formatDate` against `settingsService.dateFormat`, not a raw ISO string.
    expect(payload.startDate).toBe('02 July 2026');
    expect(typeof payload.startDate).toBe('string');

    // Same dateFormat/locale pair Classic's `LoanProducts.buildPayload` attaches.
    expect(payload.dateFormat).toBe('dd MMMM yyyy');

    // The review payload (shown to the user before submit) must match the final POST payload.
    expect(component.reviewPayload.startDate).toBe('02 July 2026');
  });

  describe('reduces required input to profile/strategy-determined fields (Item 3)', () => {
    function customAdvancedComponent(): LoanProductWizardComponent {
      const component = createComponent();
      component.profileMode = 'custom-advanced';
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'INR' }],
        transactionProcessingStrategyOptions: [
          { code: 'mifos-standard-strategy', name: 'Mifos standard' },
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
        ]
      };
      component.ngOnInit();
      return component;
    }

    function stepOwning(component: LoanProductWizardComponent, key: string) {
      return component.steps.find((step) => step.fields.some((field) => field.key === key))!;
    }

    function visibleKeysFor(component: LoanProductWizardComponent, key: string): string[] {
      return component.visibleFields(stepOwning(component, key)).map((field) => field.key);
    }

    it('hides single-option and strategy-determined selects in Custom/Advanced by default', () => {
      const component = customAdvancedComponent();

      // Single-option selects: nothing for the user to choose.
      expect(visibleKeysFor(component, 'repaymentStartDateType')).not.toContain('repaymentStartDateType');
      expect(visibleKeysFor(component, 'loanChargeOffBehaviour')).not.toContain('loanChargeOffBehaviour');

      // Advanced-strategy-only fields, hidden while the default (non-advanced) strategy is selected.
      const settingsKeys = visibleKeysFor(component, 'loanScheduleProcessingType');
      expect(settingsKeys).not.toContain('loanScheduleProcessingType');
      expect(settingsKeys).not.toContain('daysInYearCustomStrategy');

      // Genuine user choices remain visible — we only removed fields with no meaningful choice.
      expect(settingsKeys).toContain('amortizationType');
      expect(settingsKeys).toContain('interestType');
      expect(settingsKeys).toContain('transactionProcessingStrategyCode');
    });

    it('reveals loanScheduleProcessingType only for the advanced strategy (mirrors Classic)', () => {
      const component = customAdvancedComponent();

      component.form.patchValue({ transactionProcessingStrategyCode: 'mifos-standard-strategy' });
      expect(visibleKeysFor(component, 'loanScheduleProcessingType')).not.toContain('loanScheduleProcessingType');

      component.form.patchValue({
        transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
      });
      expect(visibleKeysFor(component, 'loanScheduleProcessingType')).toContain('loanScheduleProcessingType');
    });

    it('reveals daysInYearCustomStrategy only for the advanced strategy AND ACTUAL days-in-year', () => {
      const component = customAdvancedComponent();
      component.form.patchValue({
        transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
        daysInYearType: 360
      });
      expect(visibleKeysFor(component, 'daysInYearCustomStrategy')).not.toContain('daysInYearCustomStrategy');

      component.form.patchValue({ daysInYearType: 1 });
      expect(visibleKeysFor(component, 'daysInYearCustomStrategy')).toContain('daysInYearCustomStrategy');
    });

    it('keeps complete payload parity — hidden fields are still emitted with their defaults', () => {
      const component = customAdvancedComponent();

      // Default (non-advanced) strategy: the same values the wizard emitted before the fields were hidden.
      const before = component.buildPayloadForSubmit();
      expect(before.repaymentStartDateType).toBe(1);
      expect(before.loanScheduleProcessingType).toBe('HORIZONTAL');
      expect(before.chargeOffBehaviour).toBe('REGULAR');
      // The wizard never surfaced a wizard-only field name for these — the create contract keys are intact.
      expect(before.loanChargeOffBehaviour).toBeUndefined();
      expect(before.daysInYearCustomStrategy).toBeUndefined();

      // Toggling only the (still-present) FormControls, not their visibility, must drive the payload.
      component.form.patchValue({
        transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
        loanScheduleType: 'Progressive'
      });
      const advanced = component.buildPayloadForSubmit();
      expect(advanced.loanScheduleProcessingType).toBe('HORIZONTAL');
      expect(advanced.repaymentStartDateType).toBe(1);
    });
  });

  describe('produces a Classic-Edit round-trippable product (Item 2)', () => {
    // Field names the wizard collects under UI-friendly keys. They must be renamed/stripped before the
    // create POST, otherwise the persisted product would differ from a Classic-created one and the
    // shared Classic Edit flow (`EditLoanProductComponent`) would preload/re-save the wrong contract.
    const WIZARD_ONLY_KEYS = [
      'interestFreePeriod',
      'loanChargeOffBehaviour',
      'enableBuydownFees',
      'chargeName',
      'overdueCharge',
      'calculateInterestForExactDays',
      'useGlobalConfigForRepaymentEvent'
    ];

    it('emits a Classic-shaped create payload for Personal (advanced strategy) that Edit can preload', () => {
      const component = createComponent();
      component.profileMode = 'personal';
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'INR' }],
        transactionProcessingStrategyOptions: [
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
        ],
        advancedPaymentAllocationTransactionTypes: [{ id: 1, code: 'DEFAULT', value: 'Default' }],
        advancedPaymentAllocationTypes: [
          { id: 1, code: 'PENALTY', value: 'Penalty' },
          { id: 2, code: 'FEE', value: 'Fee' }
        ],
        advancedPaymentAllocationFutureInstallmentAllocationRules: [
          { id: 1, code: 'NEXT_INSTALLMENT', value: 'Next installment' }
        ]
      };

      component.ngOnInit();
      const payload = component.buildPayloadForSubmit();

      // Classic Edit derives `isAdvancedPaymentStrategy` from this plain string code.
      expect(payload.transactionProcessingStrategyCode).toBe(LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY);
      // Fineract stores + returns these, and Classic Edit reads them back on the advanced path.
      expect(Array.isArray(payload.paymentAllocation)).toBe(true);
      expect((payload.paymentAllocation as unknown[]).length).toBeGreaterThan(0);
      // Classic Edit's ngOnInit only dives into capitalized-income / buy-down preload when these are
      // true; the wizard leaves them off, so the retrieved product loads without needing those maps.
      expect(payload.enableIncomeCapitalization).toBe(false);
      expect(payload.enableBuyDownFee).toBe(false);
      // general-tab.component reads Object.values(loanProduct.allowAttributeOverrides): must be nested.
      expect(typeof payload.allowAttributeOverrides).toBe('object');
      expect(Object.keys(payload).some((key) => key.startsWith('allowAttributeOverrides.'))).toBe(false);
      // No wizard-only helper keys leak into the persisted product.
      WIZARD_ONLY_KEYS.forEach((key) => expect(payload[key]).toBeUndefined());
      // Backend-contract keys are the ones Classic uses.
      expect(payload.loanScheduleType).toBe('PROGRESSIVE');
    });

    it('emits a Classic-shaped create payload for Custom/Advanced (standard strategy) that Edit can preload', () => {
      const component = createComponent();
      component.profileMode = 'custom-advanced';
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'INR' }],
        transactionProcessingStrategyOptions: [{ code: 'mifos-standard-strategy', name: 'Mifos standard' }]
      };

      component.ngOnInit();
      component.form.patchValue({ transactionProcessingStrategyCode: 'mifos-standard-strategy' });
      const payload = component.buildPayloadForSubmit();

      expect(payload.transactionProcessingStrategyCode).toBe('mifos-standard-strategy');
      // Non-advanced strategy: Classic Edit's non-advanced path expects no payment allocation.
      expect(payload.paymentAllocation).toBeUndefined();
      expect(payload.creditAllocation).toBeUndefined();
      expect(typeof payload.allowAttributeOverrides).toBe('object');
      expect(Object.keys(payload).some((key) => key.startsWith('allowAttributeOverrides.'))).toBe(false);
      WIZARD_ONLY_KEYS.forEach((key) => expect(payload[key]).toBeUndefined());
    });
  });

  describe('Review step summarizes the visible wizard form state, not the payload', () => {
    function personalComponent(): LoanProductWizardComponent {
      const component = createComponent();
      component.profileMode = 'personal';
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'INR' }],
        transactionProcessingStrategyOptions: [
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
        ]
      };
      component.ngOnInit();
      return component;
    }

    function customAdvancedComponent(): LoanProductWizardComponent {
      const component = createComponent();
      component.profileMode = 'custom-advanced';
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'INR' }],
        transactionProcessingStrategyOptions: [
          { code: 'mifos-standard-strategy', name: 'Mifos standard' },
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
        ]
      };
      component.ngOnInit();
      return component;
    }

    function reviewLabels(component: LoanProductWizardComponent): string[] {
      return component.reviewGroups.flatMap((group) => group.rows).map((row) => row.label);
    }

    it('every Review row corresponds to a currently-visible wizard field (single source of truth)', () => {
      const component = customAdvancedComponent();
      const visibleLabels = new Set(
        component.steps.flatMap((step) => component.visibleFields(step)).map((field) => field.label)
      );
      reviewLabels(component).forEach((label) => expect(visibleLabels.has(label)).toBe(true));
    });

    it('omits hidden defaults, backend-only params and buildPayload-injected values', () => {
      const component = customAdvancedComponent();
      const labels = reviewLabels(component);
      // Profile/strategy-determined fields hidden from the wizard must not appear in its Review either.
      expect(labels).not.toContain('Repayment start date type');
      expect(labels).not.toContain('Loan charge-off behaviour');
      expect(labels).not.toContain('Loan schedule processing type');
      expect(labels).not.toContain('Days in year – custom strategy');
      // Backend-only / injected keys have no wizard field, so they can never surface.
      expect(labels).not.toContain('graceOnInterestCharged');
      expect(labels).not.toContain('dateFormat');
      expect(labels).not.toContain('allowAttributeOverrides');
    });

    it('for Personal, omits fields the Personal profile never exposes', () => {
      const labels = reviewLabels(personalComponent());
      expect(labels).not.toContain('Enable downpayment');
      expect(labels).not.toContain('Use global config values for repayment event');
      expect(labels).not.toContain('Description');
    });

    it('reflects a user select via the field option label (form-driven, not payload-driven)', () => {
      const component = customAdvancedComponent();
      component.form.patchValue({ amortizationType: 0 });
      const row = component.reviewGroups.flatMap((group) => group.rows).find((r) => r.label === 'Amortization type');
      expect(row?.display).toBe('Equal principal payments');
    });

    it('renders visible checkboxes as Yes/No and drops empty optional fields', () => {
      const component = customAdvancedComponent();
      const topup = component.reviewGroups.flatMap((g) => g.rows).find((r) => r.label === 'Allow top-up loans');
      expect(topup?.display).toBe('No');
      // externalId is visible but empty by default → dropped from the summary.
      expect(reviewLabels(component)).not.toContain('External ID');
    });

    it('sources the banner from the form state', () => {
      const component = customAdvancedComponent();
      component.form.patchValue({ name: 'My LP', shortName: 'MLP', principal: 60000, currencyCode: 'USD' });
      expect(component.reviewName).toBe('My LP');
      expect(component.reviewShortName).toBe('MLP');
      expect(component.currencySymbol).toBe('$');
      expect(component.formattedPrincipal).toContain('60,000');
    });
  });
});
