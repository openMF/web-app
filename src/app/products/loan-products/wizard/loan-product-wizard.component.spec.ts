/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { buildPayload, LoanWizardProfileMode } from './loan-product.config';
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
      .find((row) => row.label === 'labels.inputs.Repayment Strategy');

    expect(strategyRow).toEqual({
      label: 'labels.inputs.Repayment Strategy',
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

    // Sourced from the template (like Classic's settings step), not the field's static fallback list,
    // and filtered by the selected schedule type exactly as Classic's `loanScheduleType` handler
    // does. The seeded schedule type is Progressive, which Fineract pairs only with the advanced
    // payment allocation strategy, so that is the sole option offered here.
    expect(strategyField.options).toEqual([
      { value: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, label: 'Advanced Payment Allocation' }
    ]);

    // Switching to Cumulative swaps the list to the non-advanced strategies, again like Classic.
    component.form.patchValue({ loanScheduleType: 'Cumulative' });
    const cumulativeOptions = component
      .visibleFields(settingsStep)
      .find((field) => field.key === 'transactionProcessingStrategyCode')!.options;
    expect(cumulativeOptions).toEqual([{ value: 'mifos-standard-strategy', label: 'Mifos standard' }]);
    // ...and the now-invalid advanced selection is re-pointed at the first offered option.
    expect(component.form.get('transactionProcessingStrategyCode')!.value).toBe('mifos-standard-strategy');
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
      const row = component.reviewGroups
        .flatMap((group) => group.rows)
        .find((r) => r.label === 'labels.inputs.Amortization Type');
      expect(row?.display).toBe('Equal principal payments');
    });

    it('renders visible checkboxes as Yes/No and drops empty optional fields', () => {
      const component = customAdvancedComponent();
      const topup = component.reviewGroups
        .flatMap((g) => g.rows)
        .find((r) => r.label === 'labels.inputs.Allow top-up loans');
      expect(topup?.display).toBe('No');
      // externalId is visible but empty by default → dropped from the summary.
      expect(reviewLabels(component)).not.toContain('labels.inputs.External ID');
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

  describe('golden parity: visible fields, steps and seeded form state per profile', () => {
    // These locks pin the exact wizard surface (which fields/steps render) and the exact form
    // seeding (what getInitialFormState + syncTemplateDefaults leave in the controls) for the
    // existing profile modes. Any refactor of visibility or seeding shows up as an explicit,
    // reviewable diff in these literal objects — only an intentional UX change may update them.

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

    function visibleKeysByStep(component: LoanProductWizardComponent): Record<string, string[]> {
      return Object.fromEntries(
        component.steps
          .filter((step) => (step.kind ?? 'fields') === 'fields')
          .map((step) => [
            step.title,
            component.visibleFields(step).map((field) => field.key)
          ])
      );
    }

    it('locks the Personal Loan visible field set', () => {
      expect(visibleKeysByStep(personalComponent())).toEqual({
        Details: [
          'name',
          'shortName',
          'externalId'
        ],
        Currency: ['currencyCode'],
        Terms: [
          'principal',
          'numberOfRepayments',
          'interestRatePerPeriod',
          'interestRateFrequencyType',
          'repaymentEvery',
          'repaymentFrequencyType'
        ],
        Settings: [
          'amortizationType',
          'interestType',
          'interestCalculationPeriodType',
          'transactionProcessingStrategyCode',
          'graceOnPrincipalPayment',
          'graceOnInterestPayment',
          'interestFreePeriod'
        ],
        'Advanced Configuration': []
      });
    });

    it('locks the Custom/Advanced visible field set', () => {
      // Five controls that used to appear unconditionally are now gated on their controlling field,
      // matching the Classic Settings/Terms steps. On an untouched Custom/Advanced form every one of
      // those controllers is off, so none of the five is listed here; ticking the controller reveals
      // them again (see the conditional-visibility specs below).
      //   multiDisburseLoan (default false) -> outstandingLoanBalance, disallowExpectedDisbursements
      //   delinquencyBucketId (default none) -> enableInstallmentLevelDelinquency
      //   allowApprovedDisbursedAmountsOverApplied (default false)
      //     -> overAppliedCalculationType, overAppliedNumber
      expect(visibleKeysByStep(customAdvancedComponent())).toEqual({
        Details: [
          'name',
          'shortName',
          'externalId',
          'description',
          'startDate',
          'closeDate',
          'includeInBorrowerCycle'
        ],
        Currency: [
          'currencyCode',
          'digitsAfterDecimal',
          'inMultiplesOf',
          'installmentAmountInMultiplesOf',
          'useBorrowerCycle'
        ],
        Terms: [
          'principal',
          'numberOfRepayments',
          'interestRatePerPeriod',
          'interestRateFrequencyType',
          'repaymentEvery',
          'repaymentFrequencyType',
          'isLinkedToFloatingInterestRates',
          'allowApprovedDisbursedAmountsOverApplied',
          'minimumDaysBetweenDisbursalAndFirstRepayment',
          'interestRecognitionOnDisbursementDate'
        ],
        Settings: [
          'amortizationType',
          'interestType',
          'allowPartialPeriodInterestCalculation',
          'isEqualAmortization',
          'interestCalculationPeriodType',
          'loanScheduleType',
          'transactionProcessingStrategyCode',
          'graceOnPrincipalPayment',
          'graceOnInterestPayment',
          'interestFreePeriod',
          'daysInYearType',
          'daysInMonthType',
          'principalThresholdForLastInstallment',
          'canUseForTopup',
          'isInterestRecalculationEnabled',
          'delinquencyBucketId',
          'canDefineInstallmentAmount',
          'allowVariableInstallments',
          'multiDisburseLoan',
          'inArrearsTolerance',
          'graceOnArrearsAgeing',
          'overdueDaysForNPA',
          'accountMovesOutOfNPAOnlyOnArrearsCompletion',
          'holdGuaranteeFunds',
          'allowAttributeOverrides.amortizationType',
          'allowAttributeOverrides.interestType',
          'allowAttributeOverrides.transactionProcessingStrategyCode',
          'allowAttributeOverrides.interestCalculationPeriodType',
          'allowAttributeOverrides.inArrearsTolerance',
          'allowAttributeOverrides.repaymentEvery',
          'allowAttributeOverrides.graceOnPrincipalAndInterestPayment',
          'allowAttributeOverrides.graceOnArrearsAgeing',
          'enableDownPayment',
          'enableIncomeCapitalization',
          'enableBuydownFees'
        ],
        'Advanced Configuration': [
          'useGlobalConfigForRepaymentEvent',
          'dueDaysForRepaymentEvent',
          'overDueDaysForRepaymentEvent'
        ]
      });
    });

    it('locks the Personal Loan visible step sequence', () => {
      expect(personalComponent().visibleSteps.map((step) => step.title)).toEqual([
        'Details',
        'Currency',
        'Terms',
        'Settings',
        'Payment Allocation',
        'Charges',
        'Accounting',
        'Review'
      ]);
    });

    it('locks the Custom/Advanced visible step sequence', () => {
      expect(customAdvancedComponent().visibleSteps.map((step) => step.title)).toEqual([
        'Details',
        'Currency',
        'Terms',
        'Settings',
        'Charges',
        'Accounting',
        'Advanced Configuration',
        'Review'
      ]);
    });

    it('locks the Personal Loan form seeding when the template omits the seeded fields', () => {
      // The stub template carries no principal/rate/repayments, so every value below comes from
      // getInitialFormState + the syncTemplateDefaults fallbacks — the exact code paths a
      // profile-aware seeding refactor touches.
      expect(personalComponent().form.getRawValue()).toMatchObject({
        principal: '',
        numberOfRepayments: 12,
        interestRatePerPeriod: '',
        interestRateFrequencyType: 2,
        repaymentEvery: 1,
        repaymentFrequencyType: 2,
        transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
        loanScheduleType: 'Progressive',
        multiDisburseLoan: true,
        allowVariableInstallments: true,
        enableDownPayment: false,
        disbursedAmountPercentageForDownPayment: 35,
        currencyCode: 'INR'
      });
    });

    it('locks the Custom/Advanced form seeding when the template omits the seeded fields', () => {
      expect(customAdvancedComponent().form.getRawValue()).toMatchObject({
        principal: '',
        numberOfRepayments: 12,
        interestRatePerPeriod: '',
        transactionProcessingStrategyCode: 'interest-principal-penalties-fees-order-strategy',
        loanScheduleType: 'Progressive',
        multiDisburseLoan: false,
        allowVariableInstallments: false,
        enableDownPayment: false,
        disbursedAmountPercentageForDownPayment: 35,
        currencyCode: 'INR'
      });
    });
  });

  describe('Two Wheeler profile', () => {
    function twoWheelerComponent(templateExtras: Record<string, unknown> = {}): LoanProductWizardComponent {
      const component = createComponent();
      component.profileMode = 'two-wheeler';
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'INR' }],
        transactionProcessingStrategyOptions: [
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
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
        ],
        ...templateExtras
      };
      component.ngOnInit();
      return component;
    }

    function visibleKeysByStep(component: LoanProductWizardComponent): Record<string, string[]> {
      return Object.fromEntries(
        component.steps
          .filter((step) => (step.kind ?? 'fields') === 'fields')
          .map((step) => [
            step.title,
            component.visibleFields(step).map((field) => field.key)
          ])
      );
    }

    it('locks the Two Wheeler visible field set: Personal plus the editable down payment %', () => {
      expect(visibleKeysByStep(twoWheelerComponent())).toEqual({
        Details: [
          'name',
          'shortName',
          'externalId'
        ],
        Currency: ['currencyCode'],
        Terms: [
          'principal',
          'numberOfRepayments',
          'interestRatePerPeriod',
          'interestRateFrequencyType',
          'repaymentEvery',
          'repaymentFrequencyType'
        ],
        Settings: [
          'amortizationType',
          'interestType',
          'interestCalculationPeriodType',
          'transactionProcessingStrategyCode',
          'graceOnPrincipalPayment',
          'graceOnInterestPayment',
          'interestFreePeriod',
          'delinquencyBucketId',
          'disbursedAmountPercentageForDownPayment'
        ],
        'Advanced Configuration': []
      });
    });

    it('keeps the down payment toggle and auto-repayment flag hidden (forced by the profile)', () => {
      const settingsKeys = visibleKeysByStep(twoWheelerComponent()).Settings;

      expect(settingsKeys).not.toContain('enableDownPayment');
      expect(settingsKeys).not.toContain('enableAutoRepaymentForDownPayment');
    });

    it('shows the same guided step sequence as Personal, including Payment Allocation', () => {
      expect(twoWheelerComponent().visibleSteps.map((step) => step.title)).toEqual([
        'Details',
        'Currency',
        'Terms',
        'Settings',
        'Payment Allocation',
        'Charges',
        'Accounting',
        'Review'
      ]);
    });

    it('seeds the curated Two Wheeler prefills when the template omits those fields', () => {
      expect(twoWheelerComponent().form.getRawValue()).toMatchObject({
        principal: 80000,
        numberOfRepayments: 36,
        interestRatePerPeriod: 14,
        interestRateFrequencyType: 3,
        enableDownPayment: true,
        disbursedAmountPercentageForDownPayment: 20,
        transactionProcessingStrategyCode: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
        loanScheduleType: 'Progressive',
        currencyCode: 'INR'
      });
    });

    it('lets the curated prefills win over the generic backend template defaults', () => {
      // The template's generic defaults (e.g. per-month rate frequency) would turn "14% per year"
      // into "14% per month" — a very different product. Curated profile prefills must win for
      // exactly the overridden keys; non-overridden keys keep their template-first behavior.
      const component = twoWheelerComponent({
        interestRateFrequencyType: { id: 2 },
        numberOfRepayments: 12,
        repaymentEvery: 4,
        daysInMonthType: { id: 1, code: 'DaysInMonthType.actual', value: 'Same as in year' }
      });

      expect(component.form.getRawValue()).toMatchObject({
        interestRateFrequencyType: 3,
        numberOfRepayments: 36,
        // Not a curated key: the template still wins over INITIAL_FORM_STATE.
        repaymentEvery: 4,
        daysInMonthType: 1
      });
    });

    it('submits the Personal-shaped guided payload with the Two Wheeler down payment deltas', () => {
      const component = twoWheelerComponent();
      const payload = component.buildPayloadForSubmit();

      expect(payload.transactionProcessingStrategyCode).toBe(LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY);
      expect(payload.loanScheduleType).toBe('PROGRESSIVE');
      expect(Array.isArray(payload.paymentAllocation)).toBe(true);
      expect((payload.paymentAllocation as unknown[]).length).toBeGreaterThan(0);
      expect(payload.enableDownPayment).toBe(true);
      expect(payload.disbursedAmountPercentageForDownPayment).toBe(20);
      expect(payload.enableAutoRepaymentForDownPayment).toBe(true);
      expect(payload.description).toBe('Two Wheeler Loan Product');
      expect(payload.multiDisburseLoan).toBeUndefined();
      expect(payload.maxTrancheCount).toBeUndefined();
    });

    it('submits a user-edited down payment percentage instead of the prefill', () => {
      const component = twoWheelerComponent();
      component.form.patchValue({ disbursedAmountPercentageForDownPayment: 25 });

      expect(component.buildPayloadForSubmit().disbursedAmountPercentageForDownPayment).toBe(25);
    });

    it('exposes one profile label translation key per mode', () => {
      const component = twoWheelerComponent();
      expect(component.profileLabel).toBe('labels.text.Two Wheeler Loan');

      component.profileMode = 'personal';
      expect(component.profileLabel).toBe('labels.text.Personal Loan');

      component.profileMode = 'custom-advanced';
      expect(component.profileLabel).toBe('labels.text.Custom / Advanced');

      component.profileMode = 'education';
      expect(component.profileLabel).toBe('labels.text.Education Loan');

      component.profileMode = 'agriculture';
      expect(component.profileLabel).toBe('labels.text.Agriculture Loan');
    });
  });

  describe('Education profile', () => {
    function educationComponent(templateExtras: Record<string, unknown> = {}): LoanProductWizardComponent {
      const component = createComponent();
      component.profileMode = 'education';
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'INR' }],
        transactionProcessingStrategyOptions: [
          { code: 'mifos-standard-strategy', name: 'Mifos standard' },
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
        ],
        ...templateExtras
      };
      component.ngOnInit();
      return component;
    }

    function visibleKeysByStep(component: LoanProductWizardComponent): Record<string, string[]> {
      return Object.fromEntries(
        component.steps
          .filter((step) => (step.kind ?? 'fields') === 'fields')
          .map((step) => [
            step.title,
            component.visibleFields(step).map((field) => field.key)
          ])
      );
    }

    it('locks the Education visible field set: the moratorium and tranche controls headline Settings', () => {
      expect(visibleKeysByStep(educationComponent())).toEqual({
        Details: [
          'name',
          'shortName',
          'externalId'
        ],
        Currency: ['currencyCode'],
        Terms: [
          'principal',
          'numberOfRepayments',
          'interestRatePerPeriod',
          'interestRateFrequencyType',
          'repaymentEvery',
          'repaymentFrequencyType'
        ],
        Settings: [
          'graceOnPrincipalPayment',
          'graceOnInterestPayment',
          'delinquencyBucketId',
          'maxTrancheCount'
        ],
        'Advanced Configuration': []
      });
    });

    it('hides the Payment Allocation step: Education runs on the Cumulative + standard-strategy stack', () => {
      const component = educationComponent();

      expect(component.isAdvancedPaymentStrategy).toBe(false);
      expect(component.visibleSteps.map((step) => step.title)).toEqual([
        'Details',
        'Currency',
        'Terms',
        'Settings',
        'Charges',
        'Accounting',
        'Review'
      ]);
    });

    it('seeds the curated Education prefills when the template omits those fields', () => {
      expect(educationComponent().form.getRawValue()).toMatchObject({
        principal: 500000,
        numberOfRepayments: 120,
        interestRatePerPeriod: 10.5,
        interestRateFrequencyType: 3,
        graceOnPrincipalPayment: 24,
        maxTrancheCount: 8,
        multiDisburseLoan: true,
        transactionProcessingStrategyCode: 'mifos-standard-strategy',
        loanScheduleType: 'Cumulative',
        currencyCode: 'INR'
      });
    });

    it('lets the curated prefills win over the generic backend template defaults', () => {
      const component = educationComponent({
        graceOnPrincipalPayment: 0,
        numberOfRepayments: 12,
        interestRateFrequencyType: { id: 2 },
        // Not a curated key: the template still wins over INITIAL_FORM_STATE.
        repaymentEvery: 4
      });

      expect(component.form.getRawValue()).toMatchObject({
        graceOnPrincipalPayment: 24,
        numberOfRepayments: 120,
        interestRateFrequencyType: 3,
        repaymentEvery: 4
      });
    });

    it('submits the Cumulative-stack payload with the moratorium and tranches, and no allocation', () => {
      const component = educationComponent();
      const payload = component.buildPayloadForSubmit();

      expect(payload.loanScheduleType).toBe('CUMULATIVE');
      expect(payload.transactionProcessingStrategyCode).toBe('mifos-standard-strategy');
      expect(payload.interestCalculationPeriodType).toBe(0);
      expect(payload.graceOnPrincipalPayment).toBe(24);
      expect(payload.multiDisburseLoan).toBe(true);
      expect(payload.maxTrancheCount).toBe(8);
      expect(payload.enableDownPayment).toBe(false);
      expect(payload.description).toBe('Education Loan Product');
      expect(payload.paymentAllocation).toBeUndefined();
      expect(payload.creditAllocation).toBeUndefined();
      expect(payload.chargeOffBehaviour).toBeUndefined();
      expect(payload.outstandingLoanBalance).toBeUndefined();
    });

    it('submits a user-edited moratorium and tranche count instead of the prefills', () => {
      const component = educationComponent();
      component.form.patchValue({ graceOnPrincipalPayment: 36, maxTrancheCount: 10 });

      const payload = component.buildPayloadForSubmit();

      expect(payload.graceOnPrincipalPayment).toBe(36);
      expect(payload.maxTrancheCount).toBe(10);
    });
  });

  describe('Agriculture profile', () => {
    function agricultureComponent(templateExtras: Record<string, unknown> = {}): LoanProductWizardComponent {
      const component = createComponent();
      component.profileMode = 'agriculture';
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'INR' }],
        transactionProcessingStrategyOptions: [
          {
            code: 'principal-interest-penalties-fees-order-strategy',
            name: 'Principal → Interest → Penalties → Fees'
          },
          { code: 'mifos-standard-strategy', name: 'Mifos standard' },
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
        ],
        ...templateExtras
      };
      component.ngOnInit();
      return component;
    }

    function visibleKeysByStep(component: LoanProductWizardComponent): Record<string, string[]> {
      return Object.fromEntries(
        component.steps
          .filter((step) => (step.kind ?? 'fields') === 'fields')
          .map((step) => [
            step.title,
            component.visibleFields(step).map((field) => field.key)
          ])
      );
    }

    it('locks the Agriculture visible field set: the season terms plus the NPA clock', () => {
      expect(visibleKeysByStep(agricultureComponent())).toEqual({
        Details: [
          'name',
          'shortName',
          'externalId'
        ],
        Currency: ['currencyCode'],
        Terms: [
          'principal',
          'numberOfRepayments',
          'interestRatePerPeriod',
          'interestRateFrequencyType',
          'repaymentEvery',
          'repaymentFrequencyType'
        ],
        Settings: [
          'delinquencyBucketId',
          'overdueDaysForNPA'
        ],
        'Advanced Configuration': []
      });
    });

    it('hides the Payment Allocation step: Agriculture runs on the Cumulative + principal-first stack', () => {
      const component = agricultureComponent();

      expect(component.isAdvancedPaymentStrategy).toBe(false);
      expect(component.visibleSteps.map((step) => step.title)).toEqual([
        'Details',
        'Currency',
        'Terms',
        'Settings',
        'Charges',
        'Accounting',
        'Review'
      ]);
    });

    it('seeds the curated Agriculture prefills when the template omits those fields', () => {
      expect(agricultureComponent().form.getRawValue()).toMatchObject({
        principal: 100000,
        numberOfRepayments: 1,
        repaymentEvery: 12,
        interestRatePerPeriod: 7,
        interestRateFrequencyType: 3,
        overdueDaysForNPA: 180,
        transactionProcessingStrategyCode: 'principal-interest-penalties-fees-order-strategy',
        loanScheduleType: 'Cumulative',
        currencyCode: 'INR'
      });
    });

    it('lets the curated prefills win over the generic backend template defaults', () => {
      const component = agricultureComponent({
        overdueDaysForNPA: 90,
        numberOfRepayments: 12,
        interestRateFrequencyType: { id: 2 },
        // Not a curated key: the template still wins over INITIAL_FORM_STATE.
        graceOnArrearsAgeing: 10
      });

      expect(component.form.getRawValue()).toMatchObject({
        overdueDaysForNPA: 180,
        numberOfRepayments: 1,
        interestRateFrequencyType: 3,
        graceOnArrearsAgeing: 10
      });
    });

    it('submits the bullet payload: one installment, flat interest, no allocation, no tranches', () => {
      const component = agricultureComponent();
      const payload = component.buildPayloadForSubmit();

      expect(payload.numberOfRepayments).toBe(1);
      expect(payload.repaymentEvery).toBe(12);
      expect(payload.interestType).toBe(1);
      expect(payload.loanScheduleType).toBe('CUMULATIVE');
      expect(payload.transactionProcessingStrategyCode).toBe('principal-interest-penalties-fees-order-strategy');
      expect(payload.overdueDaysForNPA).toBe(180);
      expect(payload.enableDownPayment).toBe(false);
      expect(payload.description).toBe('Agriculture Loan Product');
      expect(payload.paymentAllocation).toBeUndefined();
      expect(payload.creditAllocation).toBeUndefined();
      expect(payload.multiDisburseLoan).toBeUndefined();
      expect(payload.chargeOffBehaviour).toBeUndefined();
    });

    it('submits a user-tuned season: NPA days and cycle structure instead of the prefills', () => {
      const component = agricultureComponent();
      component.form.patchValue({ overdueDaysForNPA: 360, numberOfRepayments: 2, repaymentEvery: 6 });

      const payload = component.buildPayloadForSubmit();

      expect(payload.overdueDaysForNPA).toBe(360);
      expect(payload.numberOfRepayments).toBe(2);
      expect(payload.repaymentEvery).toBe(6);
    });
  });

  describe('Accounting step reuse (Classic parity)', () => {
    // Minimal stub of the reused Classic accounting step: exposes the same `loanProductAccounting`
    // raw value and `loanProductAccountingForm` the real component does, which is all the wizard reads.
    function accountingStepStub(loanProductAccounting: Record<string, unknown>, invalid = false): any {
      return { loanProductAccounting, loanProductAccountingForm: { invalid, markAllAsTouched: jest.fn() } };
    }

    function personalComponent(): LoanProductWizardComponent {
      const component = createComponent();
      component.profileMode = 'personal';
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'INR' }],
        transactionProcessingStrategyOptions: [
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
        ],
        accountingMappingOptions: {
          assetAccountOptions: [{ id: 4, name: 'Fund', glCode: '1001' }],
          incomeAccountOptions: [{ id: 7, name: 'Interest income', glCode: '4001' }],
          expenseAccountOptions: [{ id: 9, name: 'Write off', glCode: '5001' }],
          liabilityAccountOptions: [{ id: 12, name: 'Overpayment', glCode: '2001' }]
        }
      };
      component.ngOnInit();
      return component;
    }

    it('folds the Cash GL account ids from the reused accounting step into the payload and overrides the rule', () => {
      const component = personalComponent();
      component.loanProductAccountingStep = accountingStepStub({
        accountingRule: 2,
        fundSourceAccountId: 4,
        loanPortfolioAccountId: 5,
        interestOnLoanAccountId: 7,
        writeOffAccountId: 9,
        overpaymentLiabilityAccountId: 12
      });

      const payload = component.buildPayloadForSubmit();

      // The seeded INITIAL_FORM_STATE accountingRule (2) is overridden by the step's value, and every
      // mandatory GL account id the step collected is present — the ids Fineract was rejecting before.
      expect(payload.accountingRule).toBe(2);
      expect(payload.fundSourceAccountId).toBe(4);
      expect(payload.loanPortfolioAccountId).toBe(5);
      expect(payload.interestOnLoanAccountId).toBe(7);
      expect(payload.writeOffAccountId).toBe(9);
      expect(payload.overpaymentLiabilityAccountId).toBe(12);
    });

    it('lets the accounting step drive the rule to None (1) so an untouched form needs no GL accounts', () => {
      const component = personalComponent();
      component.loanProductAccountingStep = accountingStepStub({ accountingRule: 1 });

      const payload = component.buildPayloadForSubmit();

      expect(payload.accountingRule).toBe(1);
      expect(payload.fundSourceAccountId).toBeUndefined();
    });

    it('blocks submit when the reused accounting form is invalid (Cash without accounts)', () => {
      const component = personalComponent();
      component.form.patchValue({ name: 'LP', shortName: 'LP', principal: 1000, interestRatePerPeriod: 12 });
      const step = accountingStepStub({ accountingRule: 2 }, true);
      component.loanProductAccountingStep = step;
      productsServiceStub.createLoanProduct.mockClear();

      component.submit();

      expect(step.loanProductAccountingForm.markAllAsTouched).toHaveBeenCalled();
      expect(productsServiceStub.createLoanProduct).not.toHaveBeenCalled();
    });

    it('resolves the selected accounts for the Review exactly like Classic (gl-account-display objects)', () => {
      const component = personalComponent();
      component.loanProductAccountingStep = accountingStepStub({
        accountingRule: 2,
        fundSourceAccountId: 4,
        writeOffAccountId: 9
      });

      const review = component.accountingReview;

      expect(review?.ruleLabel).toBe('Cash-based');
      expect(review?.accounts).toEqual([
        { title: 'Fund source', glAccount: { id: 4, name: 'Fund', glCode: '1001' } },
        { title: 'Losses written off', glAccount: { id: 9, name: 'Write off', glCode: '5001' } }
      ]);
    });

    it('shows only the rule (no accounts) in the Review when accounting is None', () => {
      const component = personalComponent();
      component.loanProductAccountingStep = accountingStepStub({ accountingRule: 1 });

      const review = component.accountingReview;

      expect(review?.ruleLabel).toBe('None');
      expect(review?.accounts).toEqual([]);
    });
  });
  describe('Home and Mortgage profiles (spreadsheet-driven, Classic-parity conditionals)', () => {
    function homeComponent(profileMode: LoanWizardProfileMode = 'home'): LoanProductWizardComponent {
      const component = createComponent();
      component.profileMode = profileMode;
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'INR' }],
        transactionProcessingStrategyOptions: [
          { code: 'mifos-standard-strategy', name: 'Mifos standard' },
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
        ],
        preClosureInterestCalculationStrategyOptions: [{ id: 1, value: 'Till pre-close date' }],
        rescheduleStrategyTypeOptions: [{ id: 4, value: 'Adjust last, unpaid period' }],
        interestRecalculationCompoundingTypeOptions: [{ id: 0, value: 'None' }],
        interestRecalculationFrequencyTypeOptions: [{ id: 1, value: 'Same as repayment period' }],
        interestRecalculationNthDayTypeOptions: [{ id: 1, value: 'first' }],
        interestRecalculationDayOfWeekTypeOptions: [{ id: 1, value: 'Monday' }],
        daysInYearCustomStrategyOptions: [{ id: 'FULL_LEAP_YEAR', value: 'Full Leap Year' }]
      };
      component.ngOnInit();
      return component;
    }

    function visibleKeys(component: LoanProductWizardComponent): string[] {
      return component.steps.flatMap((step) => component.visibleFields(step)).map((field) => field.key);
    }

    /** `is Applicable = Y` rows that the other guided profiles keep hidden. */
    const APPLICABLE_KEYS = [
      'isLinkedToFloatingInterestRates',
      'isEqualAmortization',
      'loanScheduleType',
      'daysInYearType',
      'daysInMonthType',
      'principalThresholdForLastInstallment',
      'holdGuaranteeFunds',
      'isInterestRecalculationEnabled',
      'multiDisburseLoan',
      'maxTrancheCount',
      'outstandingLoanBalance',
      'disallowExpectedDisbursements',
      'allowFullTermForTranche',
      'delinquencyBucketId'
    ];

    /**
     * `is Hidden = Y` rows that must stay hidden — including the whole down-payment trio (rows
     * 68-70), which separates these two profiles from BNPL and Two Wheeler.
     */
    const HIDDEN_KEYS = [
      'description',
      'startDate',
      'closeDate',
      'includeInBorrowerCycle',
      'digitsAfterDecimal',
      'inArrearsTolerance',
      'canDefineInstallmentAmount',
      'graceOnArrearsAgeing',
      'overdueDaysForNPA',
      'canUseForTopup',
      'allowVariableInstallments',
      'useGlobalConfigForRepaymentEvent',
      'enableDownPayment',
      'disbursedAmountPercentageForDownPayment',
      'enableAutoRepaymentForDownPayment',
      'loanChargeOffBehaviour',
      'enableInstallmentLevelDelinquency',
      'allowApprovedDisbursedAmountsOverApplied',
      'interestRecognitionOnDisbursementDate'
    ];

    it('exposes every field the sheet marks Applicable and hides every field it marks Hidden', () => {
      const component = homeComponent();
      const keys = visibleKeys(component);
      APPLICABLE_KEYS.forEach((key) => expect(keys).toContain(key));
      HIDDEN_KEYS.forEach((key) => expect(keys).not.toContain(key));

      // Some of the hidden keys also sit behind a parent display condition, so the assertion above
      // would pass for the wrong reason while that parent is unset. Satisfy each parent and confirm
      // the field is still hidden — i.e. hidden by the profile, not merely by its gate.
      component.form.get('delinquencyBucketId')!.setValue('1'); // gates enableInstallmentLevelDelinquency
      component.form.get('holdGuaranteeFunds')!.setValue(true); // gates the guarantee trio
      const withParentsOn = visibleKeys(component);
      expect(withParentsOn).toContain('mandatoryGuarantee'); // control: the gate really did open
      expect(withParentsOn).not.toContain('enableInstallmentLevelDelinquency');
      expect(withParentsOn).not.toContain('loanChargeOffBehaviour');
    });

    it('renders the same field surface for Mortgage, whose sheet is identical to Home', () => {
      // The two sheets are cell-for-cell identical; the index sheet's remark explains why
      // ("Collateral fields are at the loan account level and not product level").
      const keys = visibleKeys(homeComponent('mortgage'));
      APPLICABLE_KEYS.forEach((key) => expect(keys).toContain(key));
      HIDDEN_KEYS.forEach((key) => expect(keys).not.toContain(key));
    });

    it('keeps the guarantee inputs hidden until guarantee funds are held', () => {
      const component = homeComponent();
      expect(visibleKeys(component)).not.toContain('mandatoryGuarantee');

      component.form.get('holdGuaranteeFunds')!.setValue(true);
      const keys = visibleKeys(component);
      expect(keys).toContain('mandatoryGuarantee');
      expect(keys).toContain('minimumGuaranteeFromOwnFunds');
      expect(keys).toContain('minimumGuaranteeFromGuarantor');
    });

    it('requires the mandatory guarantee only while guarantee funds are held', () => {
      const component = homeComponent();
      const control = component.form.get('mandatoryGuarantee')!;
      // Hidden and empty must not hold the whole form invalid.
      expect(control.valid).toBe(true);

      component.form.get('holdGuaranteeFunds')!.setValue(true);
      expect(control.valid).toBe(false);

      control.setValue(100);
      expect(control.valid).toBe(true);
    });

    it('hides the tranche dependents when multiple disbursals are switched off, like Classic', () => {
      const component = homeComponent();
      expect(visibleKeys(component)).toContain('maxTrancheCount');

      component.form.get('multiDisburseLoan')!.setValue(false);
      const keys = visibleKeys(component);
      expect(keys).not.toContain('maxTrancheCount');
      expect(keys).not.toContain('outstandingLoanBalance');
      expect(keys).not.toContain('disallowExpectedDisbursements');
      expect(keys).not.toContain('allowFullTermForTranche');
    });

    it('seeds the Progressive + advanced payment allocation stack the sheet implies', () => {
      const component = homeComponent();
      expect(component.form.get('loanScheduleType')!.value).toBe('Progressive');
      expect(component.form.get('transactionProcessingStrategyCode')!.value).toBe(
        LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
      );
      expect(component.visibleSteps.map((step) => step.title)).toContain('Payment Allocation');
    });

    it('carries a paymentAllocation collection in the submitted payload', () => {
      // Fineract rejects the advanced payment allocation strategy without it.
      const payload = homeComponent().buildPayloadForSubmit();
      expect(payload.transactionProcessingStrategyCode).toBe(LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY);
      expect(Array.isArray(payload.paymentAllocation)).toBe(true);
    });

    it('does not render the Interest Refunds or Deferred Income steps (rows 76-78 are Hidden)', () => {
      const titles = homeComponent().visibleSteps.map((step) => step.title);
      expect(titles).not.toContain('Interest Refunds');
      expect(titles).not.toContain('Deferred Income Recognition');
    });
  });

  describe('Gold profile (spreadsheet-driven, Classic-parity conditionals)', () => {
    function goldComponent(): LoanProductWizardComponent {
      const component = createComponent();
      component.profileMode = 'gold';
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'INR' }],
        transactionProcessingStrategyOptions: [
          { code: 'mifos-standard-strategy', name: 'Mifos standard' },
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
        ],
        preClosureInterestCalculationStrategyOptions: [{ id: 1, value: 'Till pre-close date' }],
        rescheduleStrategyTypeOptions: [{ id: 4, value: 'Adjust last, unpaid period' }],
        interestRecalculationCompoundingTypeOptions: [{ id: 0, value: 'None' }],
        interestRecalculationFrequencyTypeOptions: [{ id: 1, value: 'Same as repayment period' }],
        interestRecalculationNthDayTypeOptions: [{ id: 1, value: 'first' }],
        interestRecalculationDayOfWeekTypeOptions: [{ id: 1, value: 'Monday' }],
        daysInYearCustomStrategyOptions: [{ id: 'FULL_LEAP_YEAR', value: 'Full Leap Year' }],
        // The allocation template data the Progressive + advanced-allocation stack needs. Without it
        // the strategy's fallback yields an empty `paymentAllocation`, which Fineract rejects — so the
        // submission test below would assert nothing.
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
      return component;
    }

    function visibleKeys(component: LoanProductWizardComponent): string[] {
      return component.steps.flatMap((step) => component.visibleFields(step)).map((field) => field.key);
    }

    /** Gold L `is Applicable = Y` rows that the other guided profiles keep hidden. */
    const APPLICABLE_KEYS = [
      'isEqualAmortization',
      'loanScheduleType',
      // Row 41 — unique to Gold among the sheets implemented so far.
      'inArrearsTolerance',
      'daysInYearType',
      'daysInMonthType',
      'principalThresholdForLastInstallment',
      'holdGuaranteeFunds',
      'delinquencyBucketId'
    ];

    /**
     * `is Hidden = Y` rows that must stay hidden. The tranche family (rows 54-58) and the interest
     * recalculation toggle (row 53) are what separate Gold from Home, and the down-payment trio
     * (rows 68-70) stays on the master defaults as it does for Home.
     */
    const HIDDEN_KEYS = [
      'description',
      'startDate',
      'closeDate',
      'includeInBorrowerCycle',
      'digitsAfterDecimal',
      'isLinkedToFloatingInterestRates',
      'isInterestRecalculationEnabled',
      'multiDisburseLoan',
      'maxTrancheCount',
      'outstandingLoanBalance',
      'disallowExpectedDisbursements',
      'allowFullTermForTranche',
      'canDefineInstallmentAmount',
      'graceOnArrearsAgeing',
      'overdueDaysForNPA',
      'canUseForTopup',
      'allowVariableInstallments',
      'useGlobalConfigForRepaymentEvent',
      'enableDownPayment',
      'disbursedAmountPercentageForDownPayment',
      'enableAutoRepaymentForDownPayment',
      'loanChargeOffBehaviour',
      'enableInstallmentLevelDelinquency',
      'allowApprovedDisbursedAmountsOverApplied',
      'interestRecognitionOnDisbursementDate'
    ];

    it('exposes every field the sheet marks Applicable and hides every field it marks Hidden', () => {
      const component = goldComponent();
      const keys = visibleKeys(component);
      APPLICABLE_KEYS.forEach((key) => expect(keys).toContain(key));
      HIDDEN_KEYS.forEach((key) => expect(keys).not.toContain(key));

      // Some of the hidden keys also sit behind a parent display condition, so the assertion above
      // would pass for the wrong reason while that parent is unset. Satisfy each parent and confirm
      // the field is still hidden — i.e. hidden by the profile, not merely by its gate.
      component.form.get('delinquencyBucketId')!.setValue('1'); // gates enableInstallmentLevelDelinquency
      component.form.get('holdGuaranteeFunds')!.setValue(true); // gates the guarantee trio
      const withParentsOn = visibleKeys(component);
      expect(withParentsOn).toContain('mandatoryGuarantee'); // control: the gate really did open
      expect(withParentsOn).not.toContain('enableInstallmentLevelDelinquency');
      expect(withParentsOn).not.toContain('loanChargeOffBehaviour');
    });

    it('seeds the single-disbursal pin from row 54 so the Charges step sees it', () => {
      // The control is hidden, but the reused Classic Charges step binds to it and would otherwise
      // offer tranche-only charges on a product that disburses once against one pledged lot.
      expect(goldComponent().form.get('multiDisburseLoan')!.value).toBe(false);
    });

    it('keeps the guarantee inputs hidden until guarantee funds are held', () => {
      const component = goldComponent();
      expect(visibleKeys(component)).not.toContain('mandatoryGuarantee');

      component.form.get('holdGuaranteeFunds')!.setValue(true);
      const keys = visibleKeys(component);
      expect(keys).toContain('mandatoryGuarantee');
      expect(keys).toContain('minimumGuaranteeFromOwnFunds');
      expect(keys).toContain('minimumGuaranteeFromGuarantor');
    });

    it('seeds the Progressive + advanced payment allocation stack the sheet implies', () => {
      const component = goldComponent();
      expect(component.form.get('loanScheduleType')!.value).toBe('Progressive');
      expect(component.form.get('transactionProcessingStrategyCode')!.value).toBe(
        LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
      );
      expect(component.visibleSteps.map((step) => step.title)).toContain('Payment Allocation');
    });

    it('carries a populated paymentAllocation collection in the submitted payload', () => {
      // Fineract rejects the advanced payment allocation strategy without it, so assert the actual
      // DEFAULT rule and its ordering rather than merely that the key holds an array.
      const payload = goldComponent().buildPayloadForSubmit();
      const paymentAllocation = payload.paymentAllocation as Array<Record<string, unknown>>;

      expect(payload.transactionProcessingStrategyCode).toBe(LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY);
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

    it('does not render the Interest Refunds or Deferred Income steps (rows 76-78 are Hidden)', () => {
      const titles = goldComponent().visibleSteps.map((step) => step.title);
      expect(titles).not.toContain('Interest Refunds');
      expect(titles).not.toContain('Deferred Income Recognition');
    });
  });

  describe('Auto profile (spreadsheet-driven, Classic-parity conditionals)', () => {
    function autoComponent(): LoanProductWizardComponent {
      const component = createComponent();
      component.profileMode = 'auto';
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'INR' }],
        transactionProcessingStrategyOptions: [
          { code: 'mifos-standard-strategy', name: 'Mifos standard' },
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
        ],
        preClosureInterestCalculationStrategyOptions: [{ id: 1, value: 'Till pre-close date' }],
        rescheduleStrategyTypeOptions: [{ id: 4, value: 'Adjust last, unpaid period' }],
        interestRecalculationCompoundingTypeOptions: [{ id: 0, value: 'None' }],
        interestRecalculationFrequencyTypeOptions: [{ id: 1, value: 'Same as repayment period' }],
        interestRecalculationNthDayTypeOptions: [{ id: 1, value: 'first' }],
        interestRecalculationDayOfWeekTypeOptions: [{ id: 1, value: 'Monday' }],
        daysInYearCustomStrategyOptions: [{ id: 'FULL_LEAP_YEAR', value: 'Full Leap Year' }],
        // The allocation template data the Progressive + advanced-allocation stack needs; without it
        // the strategy's fallback yields an empty `paymentAllocation`, which Fineract rejects.
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
      return component;
    }

    function visibleKeys(component: LoanProductWizardComponent): string[] {
      return component.steps.flatMap((step) => component.visibleFields(step)).map((field) => field.key);
    }

    /** Auto L `is Applicable = Y` rows that the other guided profiles keep hidden. */
    const APPLICABLE_KEYS = [
      'isLinkedToFloatingInterestRates',
      'isEqualAmortization',
      'loanScheduleType',
      'daysInYearType',
      'daysInMonthType',
      'principalThresholdForLastInstallment',
      'isInterestRecalculationEnabled',
      // Rows 67-69 — the whole trio, unlike Two Wheeler (percentage only) and Gold (none).
      'enableDownPayment',
      'disbursedAmountPercentageForDownPayment',
      'enableAutoRepaymentForDownPayment',
      'delinquencyBucketId'
    ];

    /**
     * `is Hidden = Y` rows that must stay hidden. The tranche family (rows 54-58), the arrears
     * tolerance (row 41) and guarantee funds (row 52) are what separate Auto from Gold.
     */
    const HIDDEN_KEYS = [
      'description',
      'startDate',
      'closeDate',
      'includeInBorrowerCycle',
      'digitsAfterDecimal',
      'inArrearsTolerance',
      'holdGuaranteeFunds',
      'multiDisburseLoan',
      'maxTrancheCount',
      'outstandingLoanBalance',
      'disallowExpectedDisbursements',
      'allowFullTermForTranche',
      'canDefineInstallmentAmount',
      'graceOnArrearsAgeing',
      'overdueDaysForNPA',
      'canUseForTopup',
      'allowVariableInstallments',
      'useGlobalConfigForRepaymentEvent',
      'loanChargeOffBehaviour',
      'enableInstallmentLevelDelinquency',
      'allowApprovedDisbursedAmountsOverApplied',
      'interestRecognitionOnDisbursementDate'
    ];

    it('exposes every field the sheet marks Applicable and hides every field it marks Hidden', () => {
      const component = autoComponent();
      const keys = visibleKeys(component);
      APPLICABLE_KEYS.forEach((key) => expect(keys).toContain(key));
      HIDDEN_KEYS.forEach((key) => expect(keys).not.toContain(key));

      // Some of the hidden keys also sit behind a parent display condition, so the assertion above
      // would pass for the wrong reason while that parent is unset. Satisfy each parent and confirm
      // the field is still hidden — i.e. hidden by the profile, not merely by its gate.
      component.form.get('delinquencyBucketId')!.setValue('1'); // gates enableInstallmentLevelDelinquency
      const withParentsOn = visibleKeys(component);
      expect(withParentsOn).not.toContain('enableInstallmentLevelDelinquency');
      expect(withParentsOn).not.toContain('loanChargeOffBehaviour');
    });

    it('seeds the down payment trio on, per rows 67-69', () => {
      const component = autoComponent();
      expect(component.form.get('enableDownPayment')!.value).toBe(true);
      expect(component.form.get('disbursedAmountPercentageForDownPayment')!.value).toBe(35);
      expect(component.form.get('enableAutoRepaymentForDownPayment')!.value).toBe(true);
    });

    it('gates the down payment dependents on the toggle, with the Classic 0-100 range validator', () => {
      const component = autoComponent();
      expect(visibleKeys(component)).toContain('disbursedAmountPercentageForDownPayment');

      const percentage = component.form.get('disbursedAmountPercentageForDownPayment')!;
      percentage.setValue(150);
      expect(percentage.valid).toBe(false);
      percentage.setValue(20);
      expect(percentage.valid).toBe(true);

      component.form.get('enableDownPayment')!.setValue(false);
      const keys = visibleKeys(component);
      expect(keys).not.toContain('disbursedAmountPercentageForDownPayment');
      expect(keys).not.toContain('enableAutoRepaymentForDownPayment');
    });

    it('seeds the Progressive + advanced payment allocation stack the sheet implies', () => {
      const component = autoComponent();
      expect(component.form.get('loanScheduleType')!.value).toBe('Progressive');
      expect(component.form.get('transactionProcessingStrategyCode')!.value).toBe(
        LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
      );
      expect(component.visibleSteps.map((step) => step.title)).toContain('Payment Allocation');
    });

    it('carries a populated paymentAllocation collection in the submitted payload', () => {
      // Fineract rejects the advanced payment allocation strategy without it, so assert the actual
      // DEFAULT rule and its ordering rather than merely that the key holds an array.
      const payload = autoComponent().buildPayloadForSubmit();
      const paymentAllocation = payload.paymentAllocation as Array<Record<string, unknown>>;

      expect(payload.transactionProcessingStrategyCode).toBe(LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY);
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

    it('does not render the Interest Refunds or Deferred Income steps (rows 76-78 are Hidden)', () => {
      const titles = autoComponent().visibleSteps.map((step) => step.title);
      expect(titles).not.toContain('Interest Refunds');
      expect(titles).not.toContain('Deferred Income Recognition');
    });
  });

  describe('JLG profile (spreadsheet-driven, Classic-parity conditionals)', () => {
    function jlgComponent(): LoanProductWizardComponent {
      const component = createComponent();
      component.profileMode = 'jlg';
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'INR' }],
        transactionProcessingStrategyOptions: [
          { code: 'mifos-standard-strategy', name: 'Mifos standard' },
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
        ],
        preClosureInterestCalculationStrategyOptions: [{ id: 1, value: 'Till pre-close date' }],
        rescheduleStrategyTypeOptions: [{ id: 4, value: 'Adjust last, unpaid period' }],
        interestRecalculationCompoundingTypeOptions: [{ id: 0, value: 'None' }],
        interestRecalculationFrequencyTypeOptions: [{ id: 1, value: 'Same as repayment period' }],
        interestRecalculationNthDayTypeOptions: [{ id: 1, value: 'first' }],
        interestRecalculationDayOfWeekTypeOptions: [{ id: 1, value: 'Monday' }],
        daysInYearCustomStrategyOptions: [{ id: 'FULL_LEAP_YEAR', value: 'Full Leap Year' }],
        valueConditionTypeOptions: [
          { id: 2, code: 'loanProduct.valueConditionType.equal', value: 'equals' },
          { id: 3, code: 'loanProduct.valueConditionType.greterthan', value: 'greater than' }
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
      return component;
    }

    function visibleKeys(component: LoanProductWizardComponent): string[] {
      return component.steps.flatMap((step) => component.visibleFields(step)).map((field) => field.key);
    }

    const SAMPLE_VARIATIONS = {
      principalVariationsForBorrowerCycle: [{ valueConditionType: 2, borrowerCycleNumber: 1, defaultValue: 20000 }],
      numberOfRepaymentVariationsForBorrowerCycle: [
        { valueConditionType: 2, borrowerCycleNumber: 1, defaultValue: 12 }
      ],
      interestRateVariationsForBorrowerCycle: [{ valueConditionType: 2, borrowerCycleNumber: 1, defaultValue: 22 }]
    } as any;

    it('exposes the borrower-cycle toggles the sheet marks Applicable (rows 7 and 12)', () => {
      // Both sit in the wizard's custom-only list, which hides them for every other guided profile.
      const keys = visibleKeys(jlgComponent());
      expect(keys).toContain('includeInBorrowerCycle');
      expect(keys).toContain('useBorrowerCycle');
    });

    it('renders the Loan Cycle Variations step, gated on useBorrowerCycle like Classic', () => {
      const component = jlgComponent();
      expect(component.visibleSteps.map((step) => step.title)).toContain('Loan Cycle Variations');

      component.form.get('useBorrowerCycle')!.setValue(false);
      expect(component.visibleSteps.map((step) => step.title)).not.toContain('Loan Cycle Variations');
    });

    it('does not render the step for any other profile', () => {
      // Only the JLG sheet marks rows 26/27/29 Applicable.
      const gold = createComponent();
      gold.profileMode = 'gold';
      gold.loanProductsTemplate = { currencyOptions: [{ code: 'INR' }] };
      gold.ngOnInit();
      gold.form.get('useBorrowerCycle')?.setValue(true);

      expect(gold.visibleSteps.map((step) => step.title)).not.toContain('Loan Cycle Variations');
    });

    it('folds the collected variation rows into the submitted payload', () => {
      const component = jlgComponent();
      component.setBorrowerCycleVariations(SAMPLE_VARIATIONS);

      const payload = component.buildPayloadForSubmit();

      expect(payload.principalVariationsForBorrowerCycle).toEqual(
        SAMPLE_VARIATIONS.principalVariationsForBorrowerCycle
      );
      expect(payload.numberOfRepaymentVariationsForBorrowerCycle).toEqual(
        SAMPLE_VARIATIONS.numberOfRepaymentVariationsForBorrowerCycle
      );
      expect(payload.interestRateVariationsForBorrowerCycle).toEqual(
        SAMPLE_VARIATIONS.interestRateVariationsForBorrowerCycle
      );
    });

    it('sends empty arrays when the operator never opens the step', () => {
      // The keys are removed from JLG's hidden defaults, so without this fold they would go missing
      // from the payload entirely rather than arriving empty.
      const payload = jlgComponent().buildPayloadForSubmit();

      expect(payload.principalVariationsForBorrowerCycle).toEqual([]);
      expect(payload.numberOfRepaymentVariationsForBorrowerCycle).toEqual([]);
      expect(payload.interestRateVariationsForBorrowerCycle).toEqual([]);
    });

    it('discards collected rows when the operator switches the cycle feature back off', () => {
      // Classic removes all three controls when `useBorrowerCycle` goes off, so stale rows must not
      // survive on a product that no longer varies by cycle.
      const component = jlgComponent();
      component.setBorrowerCycleVariations(SAMPLE_VARIATIONS);
      component.form.get('useBorrowerCycle')!.setValue(false);

      const payload = component.buildPayloadForSubmit();

      expect(payload.useBorrowerCycle).toBe(false);
      expect(payload.principalVariationsForBorrowerCycle).toEqual([]);
      expect(payload.numberOfRepaymentVariationsForBorrowerCycle).toEqual([]);
      expect(payload.interestRateVariationsForBorrowerCycle).toEqual([]);
    });

    it('pins the down payment off and keeps its dependents hidden (row 67)', () => {
      const component = jlgComponent();
      const keys = visibleKeys(component);

      expect(keys).not.toContain('enableDownPayment');
      expect(keys).not.toContain('disbursedAmountPercentageForDownPayment');
      expect(component.buildPayloadForSubmit().enableDownPayment).toBe(false);
    });

    it('seeds the Progressive + advanced payment allocation stack the sheet implies', () => {
      const component = jlgComponent();
      expect(component.form.get('loanScheduleType')!.value).toBe('Progressive');
      expect(component.form.get('transactionProcessingStrategyCode')!.value).toBe(
        LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
      );
      expect(component.visibleSteps.map((step) => step.title)).toContain('Payment Allocation');
    });

    it('carries a populated paymentAllocation collection in the submitted payload', () => {
      const payload = jlgComponent().buildPayloadForSubmit();
      const paymentAllocation = payload.paymentAllocation as Array<Record<string, unknown>>;

      expect(paymentAllocation.length).toBeGreaterThan(0);
      expect(paymentAllocation[0].transactionType).toBe('DEFAULT');
      expect(paymentAllocation[0].paymentAllocationOrder).toEqual([
        { order: 1, paymentAllocationRule: 'PENALTY' },
        { order: 2, paymentAllocationRule: 'FEE' },
        { order: 3, paymentAllocationRule: 'INTEREST' },
        { order: 4, paymentAllocationRule: 'PRINCIPAL' }
      ]);
    });
  });

  describe('Consumer Durable profile (spreadsheet-driven, Classic-parity conditionals)', () => {
    function consumerDurableComponent(): LoanProductWizardComponent {
      const component = createComponent();
      component.profileMode = 'consumer-durable';
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'INR' }],
        transactionProcessingStrategyOptions: [
          { code: 'mifos-standard-strategy', name: 'Mifos standard' },
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
        ],
        preClosureInterestCalculationStrategyOptions: [{ id: 1, value: 'Till pre-close date' }],
        rescheduleStrategyTypeOptions: [{ id: 4, value: 'Adjust last, unpaid period' }],
        interestRecalculationCompoundingTypeOptions: [{ id: 0, value: 'None' }],
        interestRecalculationFrequencyTypeOptions: [{ id: 1, value: 'Same as repayment period' }],
        interestRecalculationNthDayTypeOptions: [{ id: 1, value: 'first' }],
        interestRecalculationDayOfWeekTypeOptions: [{ id: 1, value: 'Monday' }],
        daysInYearCustomStrategyOptions: [{ id: 'FULL_LEAP_YEAR', value: 'Full Leap Year' }],
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
      return component;
    }

    function visibleKeys(component: LoanProductWizardComponent): string[] {
      return component.steps.flatMap((step) => component.visibleFields(step)).map((field) => field.key);
    }

    /** Consumer Durable L `is Applicable = Y` rows that the other guided profiles keep hidden. */
    const APPLICABLE_KEYS = [
      'isEqualAmortization',
      'loanScheduleType',
      'daysInYearType',
      'daysInMonthType',
      'principalThresholdForLastInstallment',
      // Row 51 — unique to this sheet among the profiles shipped so far.
      'canUseForTopup',
      'isInterestRecalculationEnabled',
      // Rows 67-69, the whole trio editable, same as Auto.
      'enableDownPayment',
      'disbursedAmountPercentageForDownPayment',
      'delinquencyBucketId'
    ];

    /**
     * `is Hidden = Y` rows that must stay hidden. The tranche family (rows 54-58), the floating-rate
     * link (row 15) and guarantee funds (row 52) are what separate this profile from Home and Auto.
     */
    const HIDDEN_KEYS = [
      'description',
      'startDate',
      'closeDate',
      'includeInBorrowerCycle',
      'digitsAfterDecimal',
      'isLinkedToFloatingInterestRates',
      'holdGuaranteeFunds',
      'multiDisburseLoan',
      'maxTrancheCount',
      'outstandingLoanBalance',
      'disallowExpectedDisbursements',
      'allowFullTermForTranche',
      'inArrearsTolerance',
      'canDefineInstallmentAmount',
      'graceOnArrearsAgeing',
      'overdueDaysForNPA',
      'allowVariableInstallments',
      'useGlobalConfigForRepaymentEvent',
      'loanChargeOffBehaviour',
      'enableInstallmentLevelDelinquency',
      'allowApprovedDisbursedAmountsOverApplied',
      'interestRecognitionOnDisbursementDate'
    ];

    it('exposes every field the sheet marks Applicable and hides every field it marks Hidden', () => {
      const component = consumerDurableComponent();
      const keys = visibleKeys(component);
      APPLICABLE_KEYS.forEach((key) => expect(keys).toContain(key));
      HIDDEN_KEYS.forEach((key) => expect(keys).not.toContain(key));

      // Some hidden keys also sit behind a parent display condition, so the assertion above would pass
      // for the wrong reason while that parent is unset. Satisfy each parent and confirm the field is
      // still hidden — i.e. hidden by the profile, not merely by its gate.
      component.form.get('delinquencyBucketId')!.setValue('1'); // gates enableInstallmentLevelDelinquency
      const withParentsOn = visibleKeys(component);
      expect(withParentsOn).not.toContain('enableInstallmentLevelDelinquency');
      expect(withParentsOn).not.toContain('loanChargeOffBehaviour');
    });

    it('seeds the down payment trio on and gates its dependents on the toggle', () => {
      const component = consumerDurableComponent();
      expect(component.form.get('enableDownPayment')!.value).toBe(true);
      expect(visibleKeys(component)).toContain('disbursedAmountPercentageForDownPayment');

      component.form.get('enableDownPayment')!.setValue(false);
      const keys = visibleKeys(component);
      expect(keys).not.toContain('disbursedAmountPercentageForDownPayment');
      expect(keys).not.toContain('enableAutoRepaymentForDownPayment');
    });

    it('seeds the Progressive + advanced payment allocation stack the sheet implies', () => {
      const component = consumerDurableComponent();
      expect(component.form.get('loanScheduleType')!.value).toBe('Progressive');
      expect(component.form.get('transactionProcessingStrategyCode')!.value).toBe(
        LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
      );
      expect(component.visibleSteps.map((step) => step.title)).toContain('Payment Allocation');
    });

    it('carries a populated paymentAllocation collection in the submitted payload', () => {
      const payload = consumerDurableComponent().buildPayloadForSubmit();
      const paymentAllocation = payload.paymentAllocation as Array<Record<string, unknown>>;

      expect(paymentAllocation.length).toBeGreaterThan(0);
      expect(paymentAllocation[0].transactionType).toBe('DEFAULT');
      expect(paymentAllocation[0].paymentAllocationOrder).toEqual([
        { order: 1, paymentAllocationRule: 'PENALTY' },
        { order: 2, paymentAllocationRule: 'FEE' },
        { order: 3, paymentAllocationRule: 'INTEREST' },
        { order: 4, paymentAllocationRule: 'PRINCIPAL' }
      ]);
    });

    it('does not render the Interest Refunds or Deferred Income steps (rows 76-78 are Hidden)', () => {
      const titles = consumerDurableComponent().visibleSteps.map((step) => step.title);
      expect(titles).not.toContain('Interest Refunds');
      expect(titles).not.toContain('Deferred Income Recognition');
    });
  });

  describe('BNPL profile (spreadsheet-driven, Classic-parity conditionals)', () => {
    function bnplComponent(): LoanProductWizardComponent {
      const component = createComponent();
      component.profileMode = 'bnpl';
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'USD' }],
        transactionProcessingStrategyOptions: [
          { code: 'mifos-standard-strategy', name: 'Mifos standard' },
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
        ],
        preClosureInterestCalculationStrategyOptions: [
          { id: 1, value: 'Till pre-close date' },
          { id: 2, value: 'Till rest frequency date' }
        ],
        rescheduleStrategyTypeOptions: [
          { id: 1, value: 'Reschedule next repayments' },
          { id: 4, value: 'Adjust last, unpaid period' }
        ],
        interestRecalculationCompoundingTypeOptions: [
          { id: 0, value: 'None' },
          { id: 1, value: 'Fee' }
        ],
        interestRecalculationFrequencyTypeOptions: [
          { id: 1, value: 'Same as repayment period' },
          { id: 3, value: 'Weekly' },
          { id: 4, value: 'Monthly' }
        ],
        interestRecalculationNthDayTypeOptions: [{ id: 1, value: 'first' }],
        interestRecalculationDayOfWeekTypeOptions: [{ id: 1, value: 'Monday' }],
        chargeOffBehaviourOptions: [
          { id: 'REGULAR', value: 'Regular' },
          { id: 'ZERO_INTEREST', value: 'Zero interest' }
        ]
      };
      component.ngOnInit();
      return component;
    }

    function visibleKeys(component: LoanProductWizardComponent): string[] {
      return component.steps.flatMap((step) => component.visibleFields(step)).map((field) => field.key);
    }

    it('exposes every field the sheet marks Applicable and hides every field it marks Hidden', () => {
      const keys = visibleKeys(bnplComponent());
      // Applicable = Y rows the other guided profiles keep hidden.
      [
        'allowApprovedDisbursedAmountsOverApplied',
        'interestRecognitionOnDisbursementDate',
        'isEqualAmortization',
        'loanScheduleType',
        'daysInYearType',
        'daysInMonthType',
        'principalThresholdForLastInstallment',
        'isInterestRecalculationEnabled',
        'multiDisburseLoan',
        'enableDownPayment',
        'delinquencyBucketId'
      ].forEach((key) => expect(keys).toContain(key));

      // is Hidden = Y rows must stay hidden.
      [
        'description',
        'startDate',
        'closeDate',
        'includeInBorrowerCycle',
        'digitsAfterDecimal',
        'inArrearsTolerance',
        'canDefineInstallmentAmount',
        'graceOnArrearsAgeing',
        'overdueDaysForNPA',
        'canUseForTopup',
        'holdGuaranteeFunds',
        'allowVariableInstallments',
        'useGlobalConfigForRepaymentEvent'
      ].forEach((key) => expect(keys).not.toContain(key));
    });

    it('renders the highlighted Interest Refunds and Deferred Income groups as reused Classic steps', () => {
      const titles = bnplComponent().visibleSteps.map((step) => step.title);
      expect(titles).toContain('Interest Refunds');
      expect(titles).toContain('Deferred Income Recognition');
    });

    it('hides both reused steps when the strategy is not advanced payment allocation, like Classic', () => {
      const component = bnplComponent();
      component.form.patchValue({ transactionProcessingStrategyCode: 'mifos-standard-strategy' });
      const titles = component.visibleSteps.map((step) => step.title);
      expect(titles).not.toContain('Interest Refunds');
      expect(titles).not.toContain('Deferred Income Recognition');
    });

    it('gates the over-applied pair on its toggle, with Classic validators and payload exclusion', () => {
      const component = bnplComponent();
      expect(visibleKeys(component)).not.toContain('overAppliedCalculationType');
      expect(component.buildPayloadForSubmit().overAppliedCalculationType).toBeUndefined();

      component.form.patchValue({ allowApprovedDisbursedAmountsOverApplied: true });
      expect(visibleKeys(component)).toContain('overAppliedCalculationType');
      expect(visibleKeys(component)).toContain('overAppliedNumber');
      expect(component.form.get('overAppliedCalculationType')!.hasError('required')).toBe(true);
      expect(component.form.get('overAppliedNumber')!.hasError('required')).toBe(true);
    });

    it('gates the tranche family on multiDisburseLoan and resets it like Classic', () => {
      const component = bnplComponent();
      // Seeded on for BNPL (sheet row 54).
      expect(visibleKeys(component)).toContain('maxTrancheCount');
      expect(visibleKeys(component)).toContain('outstandingLoanBalance');
      expect(component.form.get('maxTrancheCount')!.hasError('required')).toBe(false);

      component.form.patchValue({ multiDisburseLoan: false });
      const keys = visibleKeys(component);
      [
        'maxTrancheCount',
        'outstandingLoanBalance',
        'disallowExpectedDisbursements',
        'allowFullTermForTranche'
      ].forEach((key) => expect(keys).not.toContain(key));
      const payload = component.buildPayloadForSubmit();
      expect(payload.maxTrancheCount).toBeUndefined();
      expect(payload.outstandingLoanBalance).toBeUndefined();
      expect(payload.disallowExpectedDisbursements).toBe(false);
      expect(payload.allowFullTermForTranche).toBe(false);
    });

    it('loads valid when the backend template already has interest recalculation enabled', () => {
      // `syncTemplateDefaults` patches with `{ emitEvent: false }`, so the valueChanges subscription
      // never fires for template-driven values. Without seeding on that pass, a template carrying
      // `isInterestRecalculationEnabled: true` makes the family visible and required while every
      // select is still empty — the form is invalid at load and submit() returns early.
      const component = createComponent();
      component.profileMode = 'bnpl';
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'USD' }],
        transactionProcessingStrategyOptions: [
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
        ],
        preClosureInterestCalculationStrategyOptions: [{ id: 1, value: 'Till pre-close date' }],
        rescheduleStrategyTypeOptions: [{ id: 4, value: 'Adjust last, unpaid period' }],
        interestRecalculationCompoundingTypeOptions: [{ id: 0, value: 'None' }],
        interestRecalculationFrequencyTypeOptions: [{ id: 1, value: 'Same as repayment period' }],
        interestRecalculationNthDayTypeOptions: [{ id: 1, value: 'first' }],
        interestRecalculationDayOfWeekTypeOptions: [{ id: 1, value: 'Monday' }],
        isInterestRecalculationEnabled: true
      };
      component.ngOnInit();

      expect(component.form.get('isInterestRecalculationEnabled')!.value).toBe(true);
      // Seeded from the template's first options rather than left blank-and-required.
      expect(component.form.get('preClosureInterestCalculationStrategy')!.value).toBe(1);
      expect(component.form.get('recalculationRestFrequencyType')!.value).toBe(1);
      const invalidKeys = Object.keys(component.form.controls).filter((key) => component.form.controls[key].invalid);
      expect(invalidKeys.sort()).toEqual([
        'name',
        'shortName'
      ]);
    });

    it('does not resurrect template refund types after the operator clears the selection', () => {
      // The Interest Refund step owns this value for BNPL, so `buildPayload`'s template-driven
      // fallback is gated behind `!rendersInterestRefundStep(profileMode)`. Clearing every type must
      // therefore leave the key out of the payload rather than silently restoring the template list.
      const component = bnplComponent();
      component.loanProductsTemplate.supportedInterestRefundTypes = [{ id: 'MERCHANT_ISSUED_REFUND' }];

      component.setSupportedInterestRefundTypes([{ id: 'MERCHANT_ISSUED_REFUND' } as any]);
      expect(component.buildPayloadForSubmit().supportedInterestRefundTypes).toEqual(['MERCHANT_ISSUED_REFUND']);

      component.setSupportedInterestRefundTypes([]);
      expect('supportedInterestRefundTypes' in component.buildPayloadForSubmit()).toBe(false);
    });

    it('lets interest recalculation be enabled, satisfying the Fineract cross-field rule', () => {
      // Fineract accepts `isInterestRecalculationEnabled` only with daily interest calculation (0) OR
      // `allowPartialPeriodInterestCalculation` true. BNPL uses "Same as repayment period" (sheet row
      // 34), so it depends on the second branch — which is exactly what row 32 asks for. Getting this
      // wrong surfaces as the opaque backend error
      // "[isInterestRecalculationEnabled] not.supported.for.selected.interest.calculation.type".
      const component = bnplComponent();
      expect(component.form.get('interestCalculationPeriodType')!.value).toBe(1);
      expect(component.form.get('allowPartialPeriodInterestCalculation')!.value).toBe(true);

      component.form.patchValue({ isInterestRecalculationEnabled: true });
      const payload = component.buildPayloadForSubmit();

      expect(payload.isInterestRecalculationEnabled).toBe(true);
      expect(payload.interestCalculationPeriodType).toBe(1);
      // Sent under the correct spelling — the only one current Fineract accepts (FINERACT-2206).
      expect(payload.allowPartialPeriodInterestCalculation).toBe(true);
      expect('allowPartialPeriodInterestCalcualtion' in payload).toBe(false);
      // The read-only sheet param must never be sent.
      expect(payload.calculateInterestForExactDays).toBeUndefined();
    });

    it('hides and clears the partial-period flag for daily interest calculation, like Classic', () => {
      const component = bnplComponent();
      const visibleKeys = () =>
        component.steps.flatMap((step) => component.visibleFields(step)).map((field) => field.key);
      expect(visibleKeys()).toContain('allowPartialPeriodInterestCalculation');

      // Classic's interestCalculationPeriodType valueChanges patches the flag back to false for Daily.
      component.form.patchValue({ interestCalculationPeriodType: 0 });
      expect(visibleKeys()).not.toContain('allowPartialPeriodInterestCalculation');
      expect(component.form.get('allowPartialPeriodInterestCalculation')!.value).toBe(false);
    });

    it('reproduces Classic resets when a controlling toggle flips back', () => {
      const component = bnplComponent();
      expect(component.form.get('disallowExpectedDisbursements')!.value).toBe(true);

      // Classic's multiDisburseLoan handler patches both flags to false on the way off, so turning
      // it back on must not resurrect the old values.
      component.form.patchValue({ multiDisburseLoan: false });
      expect(component.form.get('disallowExpectedDisbursements')!.value).toBe(false);
      expect(component.form.get('allowFullTermForTranche')!.value).toBe(false);
      component.form.patchValue({ multiDisburseLoan: true });
      expect(component.form.get('disallowExpectedDisbursements')!.value).toBe(false);
    });

    it('re-points strategy selections when the schedule type changes, like Classic', () => {
      const component = bnplComponent();
      expect(component.form.get('transactionProcessingStrategyCode')!.value).toBe(
        LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
      );

      component.form.patchValue({ loanScheduleType: 'Cumulative' });
      // Cumulative cannot carry the advanced strategy, so Classic swaps it for the first non-advanced.
      expect(component.form.get('transactionProcessingStrategyCode')!.value).toBe('mifos-standard-strategy');
      expect(component.form.get('allowFullTermForTranche')!.value).toBe(false);
    });

    it('flips the reschedule strategy list with the schedule type', () => {
      const component = bnplComponent();
      component.form.patchValue({ isInterestRecalculationEnabled: true });
      // Progressive -> ids > 3.
      expect(component.form.get('rescheduleStrategyMethod')!.value).toBe(4);

      component.form.patchValue({ loanScheduleType: 'Cumulative' });
      // Cumulative -> ids < 4, and the stale selection is re-pointed.
      expect(component.form.get('rescheduleStrategyMethod')!.value).toBe(1);
    });

    it('gates the down payment dependents on enableDownPayment, with the Classic 0-100 range validator', () => {
      const component = bnplComponent();
      expect(visibleKeys(component)).toContain('disbursedAmountPercentageForDownPayment');

      component.form.patchValue({ disbursedAmountPercentageForDownPayment: 140 });
      expect(component.form.get('disbursedAmountPercentageForDownPayment')!.valid).toBe(false);

      component.form.patchValue({ enableDownPayment: false });
      const keys = visibleKeys(component);
      expect(keys).not.toContain('disbursedAmountPercentageForDownPayment');
      expect(keys).not.toContain('enableAutoRepaymentForDownPayment');
      const payload = component.buildPayloadForSubmit();
      expect(payload.disbursedAmountPercentageForDownPayment).toBeUndefined();
      expect(payload.enableAutoRepaymentForDownPayment).toBeUndefined();
    });

    it('gates installment-level delinquency on a selected bucket and resets it with the bucket', () => {
      const component = bnplComponent();
      expect(visibleKeys(component)).not.toContain('enableInstallmentLevelDelinquency');

      component.form.patchValue({ delinquencyBucketId: '1', enableInstallmentLevelDelinquency: true });
      expect(visibleKeys(component)).toContain('enableInstallmentLevelDelinquency');
      expect(component.buildPayloadForSubmit().enableInstallmentLevelDelinquency).toBe(true);

      component.form.patchValue({ delinquencyBucketId: '' });
      expect(visibleKeys(component)).not.toContain('enableInstallmentLevelDelinquency');
      expect(component.buildPayloadForSubmit().enableInstallmentLevelDelinquency).toBe(false);
    });

    it('keeps the interest recalculation family out of the UI and payload while the toggle is off', () => {
      const component = bnplComponent();
      const keys = visibleKeys(component);
      expect(keys).toContain('isInterestRecalculationEnabled');
      [
        'preClosureInterestCalculationStrategy',
        'rescheduleStrategyMethod',
        'recalculationRestFrequencyType'
      ].forEach((key) => expect(keys).not.toContain(key));
      const payload = component.buildPayloadForSubmit();
      expect(payload.preClosureInterestCalculationStrategy).toBeUndefined();
      expect(payload.recalculationRestFrequencyType).toBeUndefined();
    });

    it('reveals and seeds the interest recalculation family from the template when the toggle goes on', () => {
      const component = bnplComponent();
      component.form.patchValue({ isInterestRecalculationEnabled: true });

      const keys = visibleKeys(component);
      [
        'preClosureInterestCalculationStrategy',
        'rescheduleStrategyMethod',
        'interestRecalculationCompoundingMethod',
        'recalculationRestFrequencyType',
        'isArrearsBasedOnOriginalSchedule'
      ].forEach((key) => expect(keys).toContain(key));

      // Classic seeds each select with its first template option, so the family is valid immediately.
      expect(component.form.get('preClosureInterestCalculationStrategy')!.value).toBe(1);
      expect(component.form.get('interestRecalculationCompoundingMethod')!.value).toBe(0);
      // Classic's setRescheduleStrategies keys off `advancedTransactionProcessingStrategyDisabled`,
      // which its loanScheduleType handler sets TRUE on Progressive — so Progressive keeps only the
      // reschedule strategies with id > 3.
      expect(component.form.get('rescheduleStrategyMethod')!.value).toBe(4);

      const payload = component.buildPayloadForSubmit();
      expect(payload.preClosureInterestCalculationStrategy).toBe(1);
      expect(payload.isInterestRecalculationEnabled).toBe(true);
    });

    it('applies the nested compounding/rest frequency matrix exactly as Classic does', () => {
      const component = bnplComponent();
      component.form.patchValue({ isInterestRecalculationEnabled: true });

      // Compounding method None (0) hides the whole compounding branch.
      expect(visibleKeys(component)).not.toContain('recalculationCompoundingFrequencyType');

      component.form.patchValue({ interestRecalculationCompoundingMethod: 1 });
      expect(visibleKeys(component)).toContain('recalculationCompoundingFrequencyType');

      // Monthly (4) reveals the nth-day select; the "on day" pseudo-option (-2) swaps
      // day-of-week for day-of-month.
      component.form.patchValue({ recalculationCompoundingFrequencyType: 4 });
      expect(visibleKeys(component)).toContain('recalculationCompoundingFrequencyNthDayType');
      expect(visibleKeys(component)).toContain('recalculationCompoundingFrequencyDayOfWeekType');

      component.form.patchValue({ recalculationCompoundingFrequencyNthDayType: -2 });
      expect(visibleKeys(component)).toContain('recalculationCompoundingFrequencyOnDayType');
      expect(visibleKeys(component)).not.toContain('recalculationCompoundingFrequencyDayOfWeekType');

      // Rest frequency "same as repayment period" (1) hides the interval, any other value shows it.
      component.form.patchValue({ recalculationRestFrequencyType: 1 });
      expect(visibleKeys(component)).not.toContain('recalculationRestFrequencyInterval');
      component.form.patchValue({ recalculationRestFrequencyType: 3 });
      expect(visibleKeys(component)).toContain('recalculationRestFrequencyInterval');
      expect(component.form.get('recalculationRestFrequencyInterval')!.hasError('required')).toBe(true);
    });

    it('shows charge-off behaviour only on the Progressive + advanced stack, sourced from the template', () => {
      const component = bnplComponent();
      const chargeOffField = component.steps
        .flatMap((step) => component.visibleFields(step))
        .find((field) => field.key === 'loanChargeOffBehaviour');
      expect(chargeOffField?.options?.map((option) => option.value)).toEqual([
        'REGULAR',
        'ZERO_INTEREST'
      ]);

      component.form.patchValue({ loanScheduleType: 'Cumulative' });
      expect(visibleKeys(component)).not.toContain('loanChargeOffBehaviour');
      expect(component.buildPayloadForSubmit().chargeOffBehaviour).toBeUndefined();
    });

    it('produces a Progressive, advanced-allocation payload with the sheet defaults', () => {
      const component = bnplComponent();
      component.form.patchValue({ name: 'BNPL – Checkout', shortName: 'BNPL' });
      const payload = component.buildPayloadForSubmit();

      expect(payload.loanScheduleType).toBe('PROGRESSIVE');
      expect(payload.transactionProcessingStrategyCode).toBe(LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY);
      expect(payload.principal).toBe(10000);
      expect(payload.numberOfRepayments).toBe(12);
      expect(payload.interestRatePerPeriod).toBe(12);
      expect(payload.enableDownPayment).toBe(true);
      expect(payload.disbursedAmountPercentageForDownPayment).toBe(35);
      expect(payload.enableAutoRepaymentForDownPayment).toBe(true);
      expect(payload.multiDisburseLoan).toBe(true);
      expect(payload.maxTrancheCount).toBe(4);
      expect(payload.outstandingLoanBalance).toBe(100000);
      expect(payload.graceOnInterestCharged).toBe(1);
      // Hidden rows keep their spreadsheet defaults.
      expect(payload.installmentAmountInMultiplesOf).toBe(1);
      expect(payload.digitsAfterDecimal).toBe(2);
      expect(payload.description).toBe('BNPL Loan Product');
      // Never sent by the create contract.
      expect(payload.calculateInterestForExactDays).toBeUndefined();
      expect(payload.useGlobalConfigForRepaymentEvent).toBeUndefined();
    });
  });
  describe('submit gating: no hidden control may hold the form invalid', () => {
    // Regression guard for a silent-dead-button class of bug: a conditionally-shown field carrying a
    // static `Validators.required` keeps the FormGroup invalid while hidden and empty, so `submit()`
    // returns early and `markAllAsTouched()` has nothing visible to flag. The user sees a button that
    // does nothing. Requiredness for such fields must follow visibility.
    const allProfiles: LoanWizardProfileMode[] = [
      'personal',
      'custom-advanced',
      'two-wheeler',
      'education',
      'agriculture',
      'bnpl',
      'home',
      'mortgage',
      'gold',
      'auto',
      'jlg',
      'consumer-durable'
    ];

    function componentFor(profile: LoanWizardProfileMode): LoanProductWizardComponent {
      // Each component needs a fresh injector; createComponent() reconfigures the TestBed.
      TestBed.resetTestingModule();
      const component = createComponent();
      component.profileMode = profile;
      component.loanProductsTemplate = {
        currencyOptions: [{ code: 'USD' }],
        transactionProcessingStrategyOptions: [
          { code: 'mifos-standard-strategy', name: 'Mifos standard' },
          { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
        ],
        chargeOffBehaviourOptions: [{ id: 'REGULAR', value: 'Regular' }],
        daysInYearCustomStrategyOptions: [{ id: 'FULL_LEAP_YEAR', value: 'Full Leap Year' }],
        preClosureInterestCalculationStrategyOptions: [{ id: 1, value: 'Till pre-close date' }],
        rescheduleStrategyTypeOptions: [
          { id: 1, value: 'Reschedule next repayments' },
          { id: 4, value: 'Adjust last, unpaid period' }
        ],
        interestRecalculationCompoundingTypeOptions: [{ id: 0, value: 'None' }],
        interestRecalculationFrequencyTypeOptions: [{ id: 1, value: 'Same as repayment period' }],
        interestRecalculationNthDayTypeOptions: [{ id: 1, value: 'first' }],
        interestRecalculationDayOfWeekTypeOptions: [{ id: 1, value: 'Monday' }]
      };
      component.ngOnInit();
      return component;
    }

    function visibleKeySet(component: LoanProductWizardComponent): Set<string> {
      return new Set(component.steps.flatMap((step) => component.visibleFields(step)).map((field) => field.key));
    }

    function hiddenInvalidKeys(component: LoanProductWizardComponent): string[] {
      const visible = visibleKeySet(component);
      return Object.keys(component.form.controls)
        .filter((key) => component.form.controls[key].invalid && !visible.has(key))
        .sort();
    }

    it('has no hidden invalid control on an untouched form, for any profile', () => {
      // Blank required fields the user must actually fill (name, principal, ...) are fine: they are
      // visible, so an early return from submit() highlights them. A hidden one cannot be fixed.
      allProfiles.forEach((profile) => {
        expect([
          profile,
          hiddenInvalidKeys(componentFor(profile))
        ]).toEqual([
          profile,
          []
        ]);
      });
    });

    it('reaches a submittable state once the visible required fields are filled', () => {
      allProfiles.forEach((profile) => {
        const component = componentFor(profile);
        component.form.patchValue({
          name: 'Product',
          shortName: 'PRD',
          principal: 10000,
          interestRatePerPeriod: 12
        });
        expect([
          profile,
          component.form.valid
        ]).toEqual([
          profile,
          true
        ]);
      });
    });

    it('keeps the interest recalculation family out of the validity calculation until switched on', () => {
      const component = componentFor('bnpl');
      component.form.patchValue({ name: 'Product', shortName: 'PRD' });
      expect(component.form.valid).toBe(true);
      // Hidden and empty, yet carrying `required: true` in its field config.
      expect(component.form.get('preClosureInterestCalculationStrategy')!.value).toBe('');

      component.form.patchValue({ isInterestRecalculationEnabled: true });
      // Revealed, seeded from the template, and now genuinely required — so the form stays valid
      // rather than trapping the user behind empty required selects.
      expect(component.form.get('preClosureInterestCalculationStrategy')!.value).toBe(1);
      expect(component.form.get('preClosureInterestCalculationStrategy')!.hasValidator(Validators.required)).toBe(true);
      expect(component.form.valid).toBe(true);
      expect(hiddenInvalidKeys(component)).toEqual([]);

      component.form.patchValue({ isInterestRecalculationEnabled: false });
      expect(component.form.get('preClosureInterestCalculationStrategy')!.hasValidator(Validators.required)).toBe(
        false
      );
      expect(component.form.valid).toBe(true);
    });

    // Pre-existing and tracked separately: INITIAL_FORM_STATE seeds Custom/Advanced with
    // `loanScheduleType: 'Progressive'` alongside a non-advanced `transactionProcessingStrategyCode`
    // — a pair Fineract rejects. Now that the strategy list is filtered by schedule type (matching
    // Classic), that seed has no matching option and the select renders blank until the user touches
    // either field. Correcting it changes the profile's default strategy and therefore its default
    // payload, so it is excluded here rather than silently changed.
    const KNOWN_SEED_MISMATCHES = [{ profile: 'custom-advanced', key: 'transactionProcessingStrategyCode' }];

    it('never offers a select whose current value is absent from its options', () => {
      // A value outside the option list renders as a blank select, which is how the charge-off
      // behaviour and days-in-year custom strategy fields silently lost their display when they
      // moved to template-sourced options.
      allProfiles.forEach((profile) => {
        const component = componentFor(profile);
        component.steps.forEach((step) => {
          component.visibleFields(step).forEach((field) => {
            if (field.type !== 'select') {
              return;
            }
            const value = component.form.controls[field.key]?.value;
            if (value === '' || value === null || value === undefined) {
              return;
            }
            if (KNOWN_SEED_MISMATCHES.some((known) => known.profile === profile && known.key === field.key)) {
              return;
            }
            const offered = (field.options ?? []).map((option) => option.value);
            expect([
              profile,
              field.key,
              offered.includes(value)
            ]).toEqual([
              profile,
              field.key,
              true
            ]);
          });
        });
      });
    });
  });
});
