/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
  HIDDEN_DEFAULTS,
  FORM_STEPS,
  INITIAL_FORM_STATE,
  buildPayload,
  VALUE_MAP,
  SelectOption,
  LoanWizardProfileMode,
  FormField,
  FormStep
} from './loan-product.config';
import { ProductsService } from '../../products.service';
import { LoanProducts } from '../loan-products';
import {
  AdvancedCreditAllocation,
  AdvancedPaymentAllocation,
  AdvancedPaymentStrategy,
  CreditAllocation,
  PaymentAllocation
} from '../loan-product-stepper/loan-product-payment-strategy-step/payment-allocation-model';
import { LoanProductPaymentStrategyStepComponent } from '../loan-product-stepper/loan-product-payment-strategy-step/loan-product-payment-strategy-step.component';
import { LoanProductChargesStepComponent } from '../loan-product-stepper/loan-product-charges-step/loan-product-charges-step.component';
import { LoanProductService } from '../services/loan-product.service';
import { Router } from '@angular/router';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

/** Currency symbols rendered in the Review banner, keyed by ISO currency code. */
const CURRENCY_SYMBOLS: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

@Component({
  selector: 'mifosx-loan-product-wizard',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepperModule,
    MatButtonModule,
    LoanProductPaymentStrategyStepComponent,
    LoanProductChargesStepComponent
  ],
  templateUrl: './loan-product-wizard.component.html',
  styleUrls: ['./loan-product-wizard.component.scss']
})
export class LoanProductWizardComponent implements OnInit, OnChanges, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly loanProducts = inject(LoanProducts);
  private readonly advancedPaymentStrategy = inject(AdvancedPaymentStrategy);
  // Exposed for the reused Payment Allocation step, which binds credit-allocation inputs on loan
  // products only (mirrors the Classic template guard).
  protected readonly loanProductService = inject(LoanProductService);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly dateUtils = inject(Dates);
  private readonly settingsService = inject(SettingsService);
  private readonly hiddenFieldKeys = new Set(Object.keys(HIDDEN_DEFAULTS));
  // Single source of truth for each control's config, so the `required`/`maxLength` metadata declared
  // in FORM_STEPS is wired into real Angular Validators instead of only decorating the template.
  private readonly fieldConfigByKey = new Map<string, FormField>(
    FORM_STEPS.flatMap((step) => step.fields).map((field) => [
      field.key,
      field
    ])
  );

  @Input() loanProductsTemplate: any;
  @Input() itemsByDefault: any[] = [];
  @Input() profileMode: LoanWizardProfileMode = 'personal';

  // Reused Classic Charges step. Rendered for the `kind: 'charges'` step; read at submit time to fold the
  // selected charge objects into the payload — mirrors Classic's `@ViewChild(LoanProductChargesStepComponent)`.
  @ViewChild(LoanProductChargesStepComponent) loanProductChargesStep?: LoanProductChargesStepComponent;

  steps = FORM_STEPS;
  valueMap = VALUE_MAP;
  form!: FormGroup;
  reviewPayload: Record<string, unknown> = {};
  private formValueChangesSubscription?: Subscription;
  private transactionProcessingStrategyOptionsCache?: SelectOption[];
  private transactionProcessingStrategyOptionsCacheTemplate?: unknown;

  // Editable Payment Allocation state, reused wholesale from the Classic flow. `advancedPaymentAllocations`
  // seeds the reused step's tabs/drag-and-drop; `paymentAllocation`/`creditAllocation` hold the payload-shaped
  // arrays the step emits (defaults on init, the user's edits thereafter).
  advancedPaymentAllocations: AdvancedPaymentAllocation[] = [];
  advancedCreditAllocations: AdvancedCreditAllocation[] = [];
  paymentAllocation: PaymentAllocation[] = [];
  creditAllocation: CreditAllocation[] = [];
  private advancedAllocationsTemplateRef?: unknown;

  ngOnInit(): void {
    this.initializeForm();
    this.syncTemplateDefaults();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loanProductsTemplate'] && this.form) {
      this.syncTemplateDefaults();
    }
  }

  ngOnDestroy(): void {
    this.formValueChangesSubscription?.unsubscribe();
  }

  /** Human-readable name of the active profile, shown in the wizard header. */
  get profileLabel(): string {
    return this.profileMode === 'custom-advanced' ? 'Custom / Advanced' : 'Personal Loan';
  }

  /**
   * The Payment Allocation step carries no config-driven fields, so it is visible only while the
   * selected repayment strategy is the advanced payment allocation strategy — exactly like the
   * `@if (isAdvancedPaymentStrategy)` guard in the Classic stepper template.
   */
  get isAdvancedPaymentStrategy(): boolean {
    const strategyCode = this.form?.get('transactionProcessingStrategyCode')?.value;
    return typeof strategyCode === 'string' && LoanProducts.isAdvancedPaymentAllocationStrategy(strategyCode);
  }

  get visibleSteps(): FormStep[] {
    return this.steps.filter((step) => {
      if (step.kind === 'review') {
        return true;
      }
      if (step.kind === 'payment-allocation') {
        return this.isAdvancedPaymentStrategy;
      }
      if (step.kind === 'charges') {
        return true;
      }
      return this.visibleFields(step).length > 0;
    });
  }

  /**
   * Controls handed to the reused Classic Charges step. It expects plain `UntypedFormControl`s (it
   * subscribes to their `valueChanges` to clear the selected charges when currency / multi-disbursal
   * changes), so the wizard exposes its own form controls under the same shapes Classic passes.
   */
  get chargesCurrencyControl(): UntypedFormControl {
    return this.form?.get('currencyCode') as UntypedFormControl;
  }

  get chargesMultiDisburseControl(): UntypedFormControl | null {
    return (this.form?.get('multiDisburseLoan') as UntypedFormControl) ?? null;
  }

  /**
   * Full charge objects (processing + overdue) selected in the reused Charges step, Classic-style. Falls
   * back to an empty list if the step was never rendered (e.g. a unit test calling the payload builder
   * directly), keeping the payload identical to the previous behaviour.
   */
  private get selectedCharges(): any[] {
    return this.loanProductChargesStep?.loanProductCharges?.charges ?? [];
  }

  trackByStepId(_index: number, step: FormStep): number {
    return step.id;
  }

  trackByFieldKey(_index: number, field: FormField): string {
    return field.key;
  }

  trackByOptionValue(_index: number, option: SelectOption): string | number {
    return option.value;
  }

  trackBySectionTitle(_index: number, group: { title: string }): string {
    return group.title;
  }

  trackByRowLabel(_index: number, row: { label: string; display: string }): string {
    return row.label;
  }

  visibleFields(step: FormStep): FormField[] {
    return step.fields
      .map((field) => {
        // Classic sources this dropdown directly from the template's `transactionProcessingStrategyOptions`
        // (loan-product-settings-step.component.ts) for every product type; the wizard must do the same for
        // both profiles so Custom/Advanced isn't stuck on the field's static fallback list, which never
        // includes the advanced payment allocation strategy.
        if (field.key === 'transactionProcessingStrategyCode') {
          return {
            ...field,
            options: this.getTransactionProcessingStrategyOptions(field.options)
          };
        }

        return field;
      })
      .filter((field) => {
        if (field.visible === false) {
          return false;
        }

        if (this.profileMode === 'personal' && this.hiddenFieldKeys.has(field.key)) {
          return false;
        }

        if (
          (field.key === 'maxTrancheCount' || field.key === 'allowFullTermForTranche') &&
          !this.form?.get('multiDisburseLoan')?.value
        ) {
          return false;
        }

        if (
          (field.key === 'disbursedAmountPercentageForDownPayment' ||
            field.key === 'enableAutoRepaymentForDownPayment') &&
          !this.form?.get('enableDownPayment')?.value
        ) {
          return false;
        }

        if (this.profileMode === 'personal' && this.isCustomOnlyField(field.key)) {
          return false;
        }

        if (this.isProfileOrStrategyDeterminedField(field.key)) {
          return false;
        }

        return true;
      });
  }

  /**
   * Fields whose value is fully determined by the selected profile or repayment strategy, so the user
   * has no meaningful choice to make. Hiding them only removes UI — the FormControl stays in the form
   * (seeded from {@link INITIAL_FORM_STATE}), so `getRawValue()` and therefore {@link buildPayload}
   * emit the exact same payload. The gates mirror the Classic Settings step
   * (`validateAdvancedPaymentStrategyControls` in loan-product-settings-step.component.ts) so the two
   * flows expose the identical set of controls.
   */
  private isProfileOrStrategyDeterminedField(key: string): boolean {
    // Single-option selects: the field config offers exactly one choice, so there is nothing to pick.
    if (key === 'repaymentStartDateType' || key === 'loanChargeOffBehaviour') {
      return true;
    }
    // Classic registers `loanScheduleProcessingType` only for the advanced payment allocation
    // strategy; for any other strategy it is an internal default (Horizontal) with no user choice.
    if (key === 'loanScheduleProcessingType') {
      return !this.isAdvancedPaymentStrategy;
    }
    // `daysInYearCustomStrategy` is only applicable for the advanced strategy AND ACTUAL days-in-year
    // (id 1) — the same gate Classic uses and the same gate buildPayload's sanitize step enforces.
    if (key === 'daysInYearCustomStrategy') {
      return !(this.isAdvancedPaymentStrategy && Number(this.form?.get('daysInYearType')?.value) === 1);
    }
    return false;
  }

  private isCustomOnlyField(key: string): boolean {
    return [
      'description',
      'startDate',
      'closeDate',
      'includeInBorrowerCycle',
      'digitsAfterDecimal',
      'inMultiplesOf',
      'installmentAmountInMultiplesOf',
      'useBorrowerCycle',
      'isLinkedToFloatingInterestRates',
      'allowApprovedDisbursedAmountsOverApplied',
      'overAppliedCalculationType',
      'overAppliedNumber',
      'minimumDaysBetweenDisbursalAndFirstRepayment',
      'interestRecognitionOnDisbursementDate',
      'repaymentStartDateType',
      'accountMovesOutOfNPAOnlyOnArrearsCompletion',
      'holdGuaranteeFunds',
      'outstandingLoanBalance',
      'disallowExpectedDisbursements',
      'allowAttributeOverrides.amortizationType',
      'allowAttributeOverrides.interestType',
      'allowAttributeOverrides.transactionProcessingStrategyCode',
      'allowAttributeOverrides.interestCalculationPeriodType',
      'allowAttributeOverrides.inArrearsTolerance',
      'allowAttributeOverrides.repaymentEvery',
      'allowAttributeOverrides.graceOnPrincipalAndInterestPayment',
      'allowAttributeOverrides.graceOnArrearsAgeing',
      'enableDownPayment',
      'disbursedAmountPercentageForDownPayment',
      'enableAutoRepaymentForDownPayment',
      'loanChargeOffBehaviour',
      'enableInstallmentLevelDelinquency',
      'useGlobalConfigForRepaymentEvent',
      'dueDaysForRepaymentEvent',
      'overDueDaysForRepaymentEvent',
      'enableIncomeCapitalization',
      'enableBuydownFees'
    ].includes(key);
  }

  buildPayloadForSubmit(): any {
    const formValue = this.getRawFormValueWithFormattedDates();
    // Fold the charges selected in the reused Classic step into the same `charges` key the payload
    // builder reads (`buildChargeReferences` -> `LoanProducts.buildPayload` map them to `[{ id }]`).
    formValue.charges = this.selectedCharges;
    const merged = buildPayload(formValue, this.profileMode, this.loanProductsTemplate);
    this.applyAdvancedPaymentAllocation(merged);
    return this.loanProducts.buildPayload(merged, this.itemsByDefault || []);
  }

  /**
   * Mirrors {@link LoanProductDetailsStepComponent.loanProductDetails}: the datepicker controls hold
   * `Date` objects, and Classic formats them to `settingsService.dateFormat` (e.g. "dd MMMM yyyy")
   * before they reach any payload builder — otherwise a raw `Date` serializes to an ISO string that
   * doesn't match the `dateFormat`/`locale` pair `LoanProducts.buildPayload` attaches. Formatting here,
   * at the same point Classic reads the FormControl value, keeps both flows on one serialization path.
   */
  private getRawFormValueWithFormattedDates(): any {
    const rawValue = this.form.getRawValue();
    const dateFormat = this.settingsService.dateFormat;
    [
      'startDate',
      'closeDate'
    ].forEach((key) => {
      if (rawValue[key] instanceof Date) {
        rawValue[key] = this.dateUtils.formatDate(rawValue[key], dateFormat) || '';
      }
    });
    return rawValue;
  }

  /**
   * Fineract rejects the advanced payment allocation strategy unless the payload also carries a
   * `paymentAllocation` collection. The reused {@link LoanProductPaymentStrategyStepComponent} emits the
   * payload-shaped allocations (defaults on init, the user's edits thereafter) into
   * {@link paymentAllocation}/{@link creditAllocation}; forward whatever the user configured.
   *
   * If the step was never rendered/initialised (e.g. a unit test invoking the payload builder directly),
   * fall back to the template-derived DEFAULT allocation via {@link AdvancedPaymentStrategy} so the
   * payload stays identical to the previous behaviour.
   */
  private applyAdvancedPaymentAllocation(payload: Record<string, unknown>): void {
    const strategyCode = payload['transactionProcessingStrategyCode'];
    if (typeof strategyCode !== 'string' || !LoanProducts.isAdvancedPaymentAllocationStrategy(strategyCode)) {
      return;
    }

    payload['paymentAllocation'] =
      this.paymentAllocation.length > 0
        ? this.paymentAllocation
        : this.advancedPaymentStrategy.buildPaymentAllocations(this.getAdvancedPaymentAllocations());

    // Only loan products carry credit allocations, and only when the user has added credit
    // transaction types. When left at the default (empty) the key is omitted, keeping the payload
    // byte-for-byte identical to the previous wizard behaviour.
    if (this.loanProductService.isLoanProduct && this.creditAllocation.length > 0) {
      payload['creditAllocation'] = this.creditAllocation;
    }
  }

  /**
   * Builds (and memoises per template reference) the editable advanced payment allocation model the
   * reused step binds to. Delegates entirely to the Classic {@link AdvancedPaymentStrategy} service so
   * there is a single source of truth for the DEFAULT allocation.
   */
  private getAdvancedPaymentAllocations(): AdvancedPaymentAllocation[] {
    if (this.advancedAllocationsTemplateRef !== this.loanProductsTemplate) {
      this.advancedAllocationsTemplateRef = this.loanProductsTemplate;
      this.advancedPaymentAllocations = this.loanProductsTemplate
        ? this.advancedPaymentStrategy.buildAdvancedPaymentAllocationList(
            this.loanProductsTemplate,
            this.loanProductService.isLoanProduct
          )
        : [];
      // Credit allocations start empty on create (matching the Classic create flow); the user adds
      // credit transaction types via the step's "add transaction" dialog.
      this.advancedCreditAllocations = [];
    }
    return this.advancedPaymentAllocations;
  }

  setPaymentAllocation(paymentAllocation: PaymentAllocation[]): void {
    this.paymentAllocation = paymentAllocation;
  }

  setCreditAllocation(creditAllocation: CreditAllocation[]): void {
    this.creditAllocation = creditAllocation;
  }

  formatValue(key: string, val: unknown): string {
    if (val === '' || val === null || val === undefined) {
      return '—';
    }

    const normalizedValue = this.normalizeValueForDisplay(val);
    if (key === 'transactionProcessingStrategyCode') {
      return this.getTransactionProcessingStrategyLabel(String(normalizedValue));
    }

    const map = this.valueMap[key];
    if (map) {
      const result = map[String(normalizedValue)];
      if (result !== undefined) {
        return result;
      }
    }

    if (typeof normalizedValue === 'boolean') {
      return normalizedValue ? 'Yes' : 'No';
    }

    if (normalizedValue instanceof Date) {
      return normalizedValue.toLocaleDateString();
    }

    if (typeof normalizedValue === 'object' && normalizedValue !== null) {
      try {
        return JSON.stringify(normalizedValue);
      } catch {
        return '—';
      }
    }

    return String(normalizedValue);
  }

  private getTransactionProcessingStrategyOptions(baseOptions: SelectOption[] = []): SelectOption[] {
    if (
      this.transactionProcessingStrategyOptionsCache &&
      this.transactionProcessingStrategyOptionsCacheTemplate === this.loanProductsTemplate
    ) {
      return this.transactionProcessingStrategyOptionsCache;
    }

    const templateOptions = this.loanProductsTemplate?.transactionProcessingStrategyOptions ?? [];
    const optionsSource = templateOptions.length > 0 ? templateOptions : baseOptions;
    const options = optionsSource.map((option: any) => ({
      value: option.code ?? option.value,
      label: option.name ?? option.label ?? option.value ?? option.code
    }));

    const result = options.some(
      (option: SelectOption) => option.value === LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
    )
      ? options
      : [
          ...options,
          {
            value: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY,
            label: this.translateService.instant('Advanced payment allocation strategy')
          }
        ];

    this.transactionProcessingStrategyOptionsCache = result;
    this.transactionProcessingStrategyOptionsCacheTemplate = this.loanProductsTemplate;
    return result;
  }

  private getTransactionProcessingStrategyLabel(code: string): string {
    const matchingOption = this.getTransactionProcessingStrategyOptions().find(
      (option: SelectOption) => option.value === code
    );
    return matchingOption?.label ?? code;
  }

  private normalizeValueForDisplay(val: unknown): unknown {
    if (val instanceof Date) {
      return val;
    }

    if (typeof val === 'object' && val !== null) {
      const record = val as Record<string, unknown>;
      if (record['label'] !== undefined) return record['label'];
      if (record['name'] !== undefined) return record['name'];
      if (record['value'] !== undefined) return record['value'];
      if (record['code'] !== undefined) return record['code'];
      if (record['id'] !== undefined) return record['id'];
    }

    return val;
  }

  /**
   * The Review summarizes the VISIBLE WIZARD FORM STATE, not the final payload.
   *
   * It walks the same `fields`-kind steps and reuses {@link visibleFields} — the single source of truth
   * for field visibility — so hidden defaults, backend-only parameters, buildPayload-injected values
   * and profile/strategy-determined fields are all excluded exactly as they were during the wizard.
   * Values are read straight from the FormGroup; nothing the user never saw can appear here. It is
   * intentionally NOT derived from {@link reviewPayload}/`buildPayload`.
   */
  get reviewGroups(): Array<{ title: string; rows: Array<{ label: string; display: string }> }> {
    if (!this.form) {
      return [];
    }
    const formValues = this.getRawFormValueWithFormattedDates();
    return this.steps
      .filter((step) => (step.kind ?? 'fields') === 'fields')
      .map((step) => ({
        title: step.title,
        rows: this.visibleFields(step)
          .map((field) => ({ label: field.label, display: this.formatFieldValue(field, formValues[field.key]) }))
          // A visible-but-empty field (an optional text/number/date the user left blank) adds no value
          // to the summary, so drop it. Selects and checkboxes always carry a chosen value.
          .filter((row) => row.display !== '—')
      }))
      .filter((group) => group.rows.length > 0);
  }

  /**
   * Formats a single visible field's current form value for the Review, reusing the field's own
   * configuration (its resolved `options` for selects). No payload/defaults logic is involved.
   */
  private formatFieldValue(field: FormField, value: unknown): string {
    if (value === '' || value === null || value === undefined) {
      return '—';
    }
    if (field.type === 'checkbox') {
      return value ? 'Yes' : 'No';
    }
    if (field.type === 'select' && field.options) {
      const match = field.options.find((option) => String(option.value) === String(value));
      if (match) {
        return String(match.label);
      }
    }
    return String(value);
  }

  get reviewName(): string {
    return (this.form?.get('name')?.value as string) || '';
  }

  get reviewShortName(): string {
    return (this.form?.get('shortName')?.value as string) || '';
  }

  get reviewExternalId(): string {
    return (this.form?.get('externalId')?.value as string) || '';
  }

  get reviewCurrencyCode(): string {
    return (this.form?.get('currencyCode')?.value as string) || '';
  }

  get currencySymbol(): string {
    return CURRENCY_SYMBOLS[this.reviewCurrencyCode] || '';
  }

  get formattedPrincipal(): string {
    const principal = this.form?.get('principal')?.value;
    if (!principal && principal !== 0) {
      return '—';
    }
    return `${this.currencySymbol}${Number(principal).toLocaleString('en-IN')}`;
  }

  get scheduleLabel(): string {
    const repaymentCount = this.form?.get('numberOfRepayments')?.value;
    const repaymentPeriod = this.formatValue('repaymentFrequencyType', this.form?.get('repaymentFrequencyType')?.value);
    return `${repaymentCount || '—'} × ${repaymentPeriod}`;
  }

  get interestLabel(): string {
    const rate = this.form?.get('interestRatePerPeriod')?.value;
    if (!rate && rate !== 0) {
      return '—';
    }
    const period = this.formatValue('interestRateFrequencyType', this.form?.get('interestRateFrequencyType')?.value);
    return `${rate}% ${period.toLowerCase()}`;
  }

  /**
   * Translates a field's FORM_STEPS metadata (`required`, `maxLength`) into Angular Validators so the
   * FormGroup — not just the template — actually rejects invalid input. Keys with no config entry
   * (UI-only helpers such as `charges`) get no validators.
   */
  private validatorsFor(key: string): ValidatorFn[] {
    const field = this.fieldConfigByKey.get(key);
    if (!field) {
      return [];
    }
    const validators: ValidatorFn[] = [];
    if (field.required) {
      validators.push(Validators.required);
    }
    if (typeof field.maxLength === 'number') {
      validators.push(Validators.maxLength(field.maxLength));
    }
    return validators;
  }

  submit(): void {
    // Every required field is visible in both profiles, so an invalid form means the user left a
    // required control blank (or exceeded a maxLength). Surface the errors instead of POSTing a
    // payload the backend would reject.
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const final = this.buildPayloadForSubmit();
    this.productsService
      .createLoanProduct(this.loanProductService.loanProductPath, final)
      .subscribe((response: any) => {
        this.router.navigate(
          [
            '/',
            'products',
            'loan-products',
            response.resourceId
          ],
          {
            queryParams: { productType: this.loanProductService.productType.value }
          }
        );
      });
  }

  private initializeForm(): void {
    const controls: Record<string, any> = {};
    const state = this.getInitialFormState();
    Object.keys(state).forEach((key) => {
      controls[key] = [
        state[key as keyof typeof state],
        this.validatorsFor(key)
      ];
    });
    this.form = this.fb.group(controls);
    this.refreshReviewPayload();
    this.formValueChangesSubscription?.unsubscribe();
    this.formValueChangesSubscription = this.form.valueChanges.subscribe(() => this.refreshReviewPayload());
  }

  private syncTemplateDefaults(): void {
    if (!this.form || !this.loanProductsTemplate) {
      return;
    }

    this.form.patchValue(
      {
        currencyCode: this.getDefaultCurrencyCode(),
        principal: this.loanProductsTemplate.principal ?? '',
        numberOfRepayments: this.loanProductsTemplate.numberOfRepayments ?? INITIAL_FORM_STATE.numberOfRepayments,
        interestRatePerPeriod: this.loanProductsTemplate.interestRatePerPeriod ?? '',
        interestRateFrequencyType: this.loanProductsTemplate.interestRateFrequencyType?.id ?? 2,
        repaymentEvery: this.loanProductsTemplate.repaymentEvery ?? INITIAL_FORM_STATE.repaymentEvery,
        repaymentFrequencyType: this.loanProductsTemplate.repaymentFrequencyType?.id ?? 2,
        amortizationType: this.loanProductsTemplate.amortizationType?.id ?? INITIAL_FORM_STATE.amortizationType,
        interestType: this.loanProductsTemplate.interestType?.id ?? INITIAL_FORM_STATE.interestType,
        calculateInterestForExactDays:
          this.loanProductsTemplate.calculateInterestForExactDays ?? INITIAL_FORM_STATE.calculateInterestForExactDays,
        isEqualAmortization: this.loanProductsTemplate.isEqualAmortization ?? INITIAL_FORM_STATE.isEqualAmortization,
        interestCalculationPeriodType:
          this.loanProductsTemplate.interestCalculationPeriodType?.id ??
          INITIAL_FORM_STATE.interestCalculationPeriodType,
        // Personal Loan always uses Progressive schedule type - never let template override this
        loanScheduleType:
          this.profileMode === 'personal'
            ? INITIAL_FORM_STATE.loanScheduleType
            : (this.loanProductsTemplate.loanScheduleType?.value ?? INITIAL_FORM_STATE.loanScheduleType),
        transactionProcessingStrategyCode:
          this.profileMode === 'personal'
            ? LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
            : (this.loanProductsTemplate.transactionProcessingStrategyCode ??
              INITIAL_FORM_STATE.transactionProcessingStrategyCode),
        loanScheduleProcessingType:
          this.loanProductsTemplate.loanScheduleProcessingType?.value ?? INITIAL_FORM_STATE.loanScheduleProcessingType,
        graceOnPrincipalPayment:
          this.loanProductsTemplate.graceOnPrincipalPayment ?? INITIAL_FORM_STATE.graceOnPrincipalPayment,
        graceOnInterestPayment:
          this.loanProductsTemplate.graceOnInterestPayment ?? INITIAL_FORM_STATE.graceOnInterestPayment,
        interestFreePeriod: this.loanProductsTemplate.interestFreePeriod ?? INITIAL_FORM_STATE.interestFreePeriod,
        // `daysInYearType`/`daysInMonthType` are numeric enums (their field options and the create
        // contract use the integer id, e.g. 1 = "Actual", 30 = "30 days"). Read `?.id`, matching the
        // Classic settings step (`daysInYearType.id`/`daysInMonthType.id`) and the sibling enums above
        // — reading `?.value` would seed the FormControl with the display string ("Actual"), which the
        // select can't match and the backend rejects. `daysInYearCustomStrategy` stays `?.value`: it is
        // a display-string enum normalized to its backend code later.
        daysInYearType: this.loanProductsTemplate.daysInYearType?.id ?? INITIAL_FORM_STATE.daysInYearType,
        daysInYearCustomStrategy:
          this.loanProductsTemplate.daysInYearCustomStrategy?.value ?? INITIAL_FORM_STATE.daysInYearCustomStrategy,
        daysInMonthType: this.loanProductsTemplate.daysInMonthType?.id ?? INITIAL_FORM_STATE.daysInMonthType,
        principalThresholdForLastInstallment:
          this.loanProductsTemplate.principalThresholdForLastInstallment ??
          INITIAL_FORM_STATE.principalThresholdForLastInstallment,
        canUseForTopup: this.loanProductsTemplate.canUseForTopup ?? INITIAL_FORM_STATE.canUseForTopup,
        isInterestRecalculationEnabled:
          this.loanProductsTemplate.isInterestRecalculationEnabled ?? INITIAL_FORM_STATE.isInterestRecalculationEnabled,
        delinquencyBucketId: this.loanProductsTemplate.delinquencyBucketId ?? INITIAL_FORM_STATE.delinquencyBucketId,
        canDefineInstallmentAmount:
          this.loanProductsTemplate.canDefineInstallmentAmount ?? INITIAL_FORM_STATE.canDefineInstallmentAmount,
        // Fineract rejects multiDisburseLoan/allowVariableInstallments unless the product uses daily
        // interest calculation or the advanced-payment-allocation repayment strategy
        // (LoanProductDataValidator: "not.supported.for.selected.interest.calculation.type"). Personal
        // Loan always forces the advanced strategy (see transactionProcessingStrategyCode below), so it
        // keeps the existing checked-by-default template/INITIAL_FORM_STATE value. Custom/Advanced
        // defaults to the standard repayment strategy, so it must default both to false here, same as
        // the Classic stepper (loan-product-settings-step.component.ts).
        allowVariableInstallments:
          this.loanProductsTemplate.allowVariableInstallments ??
          (this.profileMode === 'personal' ? INITIAL_FORM_STATE.allowVariableInstallments : false),
        multiDisburseLoan:
          this.loanProductsTemplate.multiDisburseLoan ??
          (this.profileMode === 'personal' ? INITIAL_FORM_STATE.multiDisburseLoan : false),
        maxTrancheCount: this.loanProductsTemplate.maxTrancheCount ?? INITIAL_FORM_STATE.maxTrancheCount,
        allowFullTermForTranche:
          this.loanProductsTemplate.allowFullTermForTranche ?? INITIAL_FORM_STATE.allowFullTermForTranche,
        inArrearsTolerance: this.loanProductsTemplate.inArrearsTolerance ?? INITIAL_FORM_STATE.inArrearsTolerance,
        graceOnArrearsAgeing: this.loanProductsTemplate.graceOnArrearsAgeing ?? INITIAL_FORM_STATE.graceOnArrearsAgeing,
        overdueDaysForNPA: this.loanProductsTemplate.overdueDaysForNPA ?? INITIAL_FORM_STATE.overdueDaysForNPA,
        chargeName: this.loanProductsTemplate.chargeName ?? INITIAL_FORM_STATE.chargeName,
        overdueCharge: this.loanProductsTemplate.overdueCharge ?? INITIAL_FORM_STATE.overdueCharge,
        accountingRule: this.loanProductsTemplate.accountingRule ?? INITIAL_FORM_STATE.accountingRule
      },
      { emitEvent: false }
    );
    // Seed the editable advanced payment allocation model so the reused step renders its tabs/order
    // immediately once the template is available.
    this.getAdvancedPaymentAllocations();
    this.refreshReviewPayload();
  }

  private refreshReviewPayload(): void {
    if (!this.form) {
      this.reviewPayload = {};
      return;
    }

    this.reviewPayload = buildPayload(
      this.getRawFormValueWithFormattedDates(),
      this.profileMode,
      this.loanProductsTemplate
    );
  }

  private getInitialFormState(): typeof INITIAL_FORM_STATE {
    return {
      ...INITIAL_FORM_STATE,
      currencyCode: this.getDefaultCurrencyCode(),
      principal: this.loanProductsTemplate?.principal ?? INITIAL_FORM_STATE.principal,
      transactionProcessingStrategyCode:
        this.profileMode === 'personal'
          ? LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
          : INITIAL_FORM_STATE.transactionProcessingStrategyCode,
      // See the matching comment in syncTemplateDefaults(): Custom/Advanced defaults to the standard
      // repayment strategy, so multiDisburseLoan/allowVariableInstallments must default to false there
      // to satisfy the same Fineract validation rule. Personal Loan is unaffected.
      multiDisburseLoan: this.profileMode === 'personal' ? INITIAL_FORM_STATE.multiDisburseLoan : false,
      allowVariableInstallments: this.profileMode === 'personal' ? INITIAL_FORM_STATE.allowVariableInstallments : false
    };
  }

  private getDefaultCurrencyCode(): string {
    return this.loanProductsTemplate?.currencyOptions?.[0]?.code || INITIAL_FORM_STATE.currencyCode;
  }
}
