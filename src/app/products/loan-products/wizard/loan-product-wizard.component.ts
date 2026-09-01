/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  AfterViewChecked,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject
} from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
  FORM_STEPS,
  INITIAL_FORM_STATE,
  PROFILE_EXTRA_VISIBLE_FIELDS,
  PROFILE_INITIAL_OVERRIDES,
  PROFILE_LABEL_KEYS,
  buildPayload,
  forcesProgressiveStack,
  hiddenDefaultsFor,
  isGuidedProfileMode,
  usesClassicSteps,
  ClassicStep,
  rendersDeferredIncomeStep,
  rendersBorrowerCycleStep,
  rendersInterestRefundStep,
  GUARANTEE_FUNDS_DEPENDENT_FIELDS,
  INTEREST_RECALCULATION_FIELDS,
  TEMPLATE_OPTION_SOURCES,
  NTH_DAY_ON_DAY_OPTION,
  ON_DAY_OF_MONTH_OPTIONS,
  DELINQUENCY_BUCKET_NONE_OPTION,
  VALUE_MAP,
  SelectOption,
  LoanWizardProfileMode,
  FormField,
  FormStep
} from './loan-product.config';
import { ProductsService } from '../../products.service';
import { DelinquencyBucket } from '../models/loan-product.model';
import { LoanProducts } from '../loan-products';
import {
  AdvancedCreditAllocation,
  AdvancedPaymentAllocation,
  AdvancedPaymentStrategy,
  BuyDownFee,
  CapitalizedIncome,
  CreditAllocation,
  DeferredIncomeRecognition,
  PaymentAllocation
} from '../loan-product-stepper/loan-product-payment-strategy-step/payment-allocation-model';
import { StringEnumOptionData } from 'app/shared/models/option-data.model';
import { LoanProductPaymentStrategyStepComponent } from '../loan-product-stepper/loan-product-payment-strategy-step/loan-product-payment-strategy-step.component';
import { LoanProductChargesStepComponent } from '../loan-product-stepper/loan-product-charges-step/loan-product-charges-step.component';
import { LoanProductAccountingStepComponent } from '../loan-product-stepper/loan-product-accounting-step/loan-product-accounting-step.component';
import { LoanProductInterestRefundStepComponent } from '../loan-product-stepper/loan-product-interest-refund-step/loan-product-interest-refund-step.component';
import { LoanProductDeferredIncomeRecognitionStepComponent } from '../loan-product-stepper/loan-product-capitalized-income-step/loan-product-deferred-income-recognition-step.component';
import {
  LoanProductBorrowerCycleStepComponent,
  BorrowerCycleVariations
} from './borrower-cycle-step/loan-product-borrower-cycle-step.component';
import { GlAccountDisplayComponent } from '../../../shared/accounting/gl-account-display/gl-account-display.component';
// The four Classic step components Custom/Advanced hosts in place of the config-driven field grid,
// plus Classic's own preview so its Review shows the same summary Classic's does.
import { LoanProductDetailsStepComponent } from '../loan-product-stepper/loan-product-details-step/loan-product-details-step.component';
import { LoanProductCurrencyStepComponent } from '../loan-product-stepper/loan-product-currency-step/loan-product-currency-step.component';
import { LoanProductTermsStepComponent } from '../loan-product-stepper/loan-product-terms-step/loan-product-terms-step.component';
import { LoanProductSettingsStepComponent } from '../loan-product-stepper/loan-product-settings-step/loan-product-settings-step.component';
import { LoanProductPreviewStepComponent } from '../loan-product-stepper/loan-product-preview-step/loan-product-preview-step.component';
import { LoanProductService } from '../services/loan-product.service';
import { Router } from '@angular/router';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { rangeValidator } from 'app/shared/validators/percentage.validator';

/**
 * Fallback currency symbols for the Review banner, keyed by ISO currency code. Used only when the
 * backend template has no `displaySymbol` for the selected currency (or has not loaded yet).
 */
const CURRENCY_SYMBOLS: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

/**
 * Tranche-only fields Classic renders inside its single `@if (multiDisburseLoan)` block and
 * removes/resets when multiple disbursals are switched off.
 */
const MULTI_DISBURSE_DEPENDENT_FIELDS: readonly string[] = [
  'maxTrancheCount',
  'outstandingLoanBalance',
  'disallowExpectedDisbursements',
  'allowFullTermForTranche'
];

/**
 * Interest recalculation controls Classic registers with `Validators.required` (the rest of the
 * family — the nth-day / day-of-week / on-day selects and the two checkboxes — are registered
 * without validators).
 */
const REQUIRED_INTEREST_RECALCULATION_FIELDS: readonly string[] = [
  'preClosureInterestCalculationStrategy',
  'rescheduleStrategyMethod',
  'interestRecalculationCompoundingMethod',
  'recalculationCompoundingFrequencyType',
  'recalculationCompoundingFrequencyInterval',
  'recalculationRestFrequencyType',
  'recalculationRestFrequencyInterval'
];

/**
 * Fields whose `required: true` in FORM_STEPS is conditional on a controlling toggle rather than
 * absolute. `validatorsFor` skips the static `Validators.required` for these so a hidden, empty
 * control cannot hold the whole form invalid; `syncConditionalValidators` re-applies it while the
 * field is actually visible. The interest recalculation family, which is entirely gated behind
 * `isInterestRecalculationEnabled` (off by default for every profile), plus `mandatoryGuarantee`,
 * which Classic marks required in its template but only registers while `holdGuaranteeFunds` is on.
 */
const CONDITIONALLY_REQUIRED_FIELDS: readonly string[] = [
  ...REQUIRED_INTEREST_RECALCULATION_FIELDS,
  'mandatoryGuarantee'
];

/**
 * The pattern Classic applies to a numeric control that accepts at most `decimals` decimal places:
 * `^\d+([.,]\d{1,6})?$` for the interest-rate inputs, and the whole-number equivalent for controls
 * Classic pins with `^[1-9]\d*$` (whose floor is expressed separately as `Validators.min`).
 *
 * The comma branch is Classic's, kept so the two flows accept the same strings; `<input type=number>`
 * never yields one. Rejecting the empty value is `Validators.required`'s job, and `Validators.pattern`
 * already passes an empty control, so this only ever fires on a value the operator actually entered.
 */
function decimalPlacesPattern(decimals: number): RegExp {
  return decimals > 0 ? new RegExp(`^\\d+([.,]\\d{1,${decimals}})?$`) : /^\d+$/;
}

/** `daysInYearType` id for the ACTUAL option — the only type `daysInYearCustomStrategy` applies to. */
const DAYS_IN_YEAR_ACTUAL = 1;

/**
 * `interestCalculationPeriodType` id for "Same as repayment period" — the only type
 * `allowPartialPeriodInterestCalculation` applies to (0 is Daily).
 */
const INTEREST_CALCULATION_SAME_AS_REPAYMENT_PERIOD = 1;

/** Fields Classic keeps disabled (and null) until `allowApprovedDisbursedAmountsOverApplied` is on. */
const OVER_APPLIED_DEPENDENT_FIELDS: readonly string[] = [
  'overAppliedCalculationType',
  'overAppliedNumber'
];

/**
 * The GL account controls the reused Classic accounting step collects for a Cash/Accrual loan
 * product, each paired with the exact account title Classic's summary renders. Used only to build the
 * Review's accounting section (via the reused `mifosx-gl-account-display`); the payload itself is
 * driven entirely by the step's raw form value. Receivable accounts appear only for Accrual and are
 * simply absent from the step's value for Cash, so a single presence filter covers both rules.
 */
const ACCOUNTING_REVIEW_ACCOUNTS: ReadonlyArray<{ key: string; title: string }> = [
  { key: 'fundSourceAccountId', title: 'Fund source' },
  { key: 'loanPortfolioAccountId', title: 'Loan portfolio' },
  { key: 'transfersInSuspenseAccountId', title: 'Transfer in suspense' },
  { key: 'receivableInterestAccountId', title: 'Interest Receivable' },
  { key: 'receivableFeeAccountId', title: 'Fees Receivable' },
  { key: 'receivablePenaltyAccountId', title: 'Penalties Receivable' },
  { key: 'interestOnLoanAccountId', title: 'Income from Interest' },
  { key: 'incomeFromFeeAccountId', title: 'Income from fees' },
  { key: 'incomeFromPenaltyAccountId', title: 'Income from penalties' },
  { key: 'incomeFromRecoveryAccountId', title: 'Income from Recovery Repayments' },
  { key: 'incomeFromChargeOffInterestAccountId', title: 'Income from ChargeOff Interest' },
  { key: 'incomeFromChargeOffFeesAccountId', title: 'Income from ChargeOff Fees' },
  { key: 'incomeFromChargeOffPenaltyAccountId', title: 'Income from ChargeOff Penalty' },
  { key: 'incomeFromGoodwillCreditInterestAccountId', title: 'Income from Goodwill Credit Interest' },
  { key: 'incomeFromGoodwillCreditFeesAccountId', title: 'Income from Goodwill Credit Fees' },
  { key: 'incomeFromGoodwillCreditPenaltyAccountId', title: 'Income from Goodwill Credit Penalty' },
  { key: 'writeOffAccountId', title: 'Losses written off' },
  { key: 'goodwillCreditAccountId', title: 'Expenses from Goodwill Credit' },
  { key: 'chargeOffExpenseAccountId', title: 'ChargeOff Expense' },
  { key: 'chargeOffFraudExpenseAccountId', title: 'ChargeOff Fraud Expense' },
  { key: 'overpaymentLiabilityAccountId', title: 'Over payment liability' }
];

@Component({
  selector: 'mifosx-loan-product-wizard',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepperModule,
    MatButtonModule,
    LoanProductPaymentStrategyStepComponent,
    LoanProductChargesStepComponent,
    LoanProductAccountingStepComponent,
    LoanProductInterestRefundStepComponent,
    LoanProductDeferredIncomeRecognitionStepComponent,
    LoanProductBorrowerCycleStepComponent,
    LoanProductDetailsStepComponent,
    LoanProductCurrencyStepComponent,
    LoanProductTermsStepComponent,
    LoanProductSettingsStepComponent,
    LoanProductPreviewStepComponent,
    GlAccountDisplayComponent
  ],
  templateUrl: './loan-product-wizard.component.html',
  styleUrls: ['./loan-product-wizard.component.scss']
})
export class LoanProductWizardComponent implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
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
  // Hidden-key set derived from the ACTIVE profile's hidden defaults (Two Wheeler, for example,
  // removes the down payment % from its defaults so it can be a visible control). Computed lazily
  // and memoised per mode because `profileMode` is an @Input, not yet set when class fields
  // initialize.
  private hiddenFieldKeysCache?: { profileMode: LoanWizardProfileMode; keys: Set<string> };
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
  // The accounting-rule display names (NONE / CASH_BASED / ACCRUAL_PERIODIC / ACCRUAL_UPFRONT) the
  // reused Classic accounting step renders as radio options — resolved by the host from the shared
  // `Accounting` util, identical to Classic.
  @Input() accountingRuleData: any[] = [];

  // Reused Classic Charges step. Rendered for the `kind: 'charges'` step; read at submit time to fold the
  // selected charge objects into the payload — mirrors Classic's `@ViewChild(LoanProductChargesStepComponent)`.
  @ViewChild(LoanProductChargesStepComponent) loanProductChargesStep?: LoanProductChargesStepComponent;

  // Reused Classic Accounting step. Rendered for the `kind: 'accounting'` step; it owns the accounting
  // rule and — for Cash/Accrual — every mandatory GL account selector, validator and advanced mapping
  // rule. Read at submit time so its collected values are folded into the payload exactly like Classic.
  @ViewChild(LoanProductAccountingStepComponent) loanProductAccountingStep?: LoanProductAccountingStepComponent;

  // Reused Classic Interest Refund + Deferred Income Recognition steps — the sheet's highlighted
  // "Interest Refunds" and "Defered Income recognition" groups. Both are advanced-payment-allocation
  // only in Classic, and both own their conditional dependents internally, so the wizard only has to
  // hold the values they emit and fold them into the payload exactly like Classic's create flow does.
  @ViewChild(LoanProductDeferredIncomeRecognitionStepComponent)
  loanProductDeferredIncomeRecognitionStep?: LoanProductDeferredIncomeRecognitionStepComponent;

  // Borrower-cycle variations step. Read at submit time for its validity: Fineract rejects a variation
  // list that does not start with `equals`, end with `greater than` and carry advancing cycle numbers,
  // so the step's own check gates the POST rather than letting the backend 400.
  @ViewChild(LoanProductBorrowerCycleStepComponent)
  loanProductBorrowerCycleStep?: LoanProductBorrowerCycleStepComponent;

  // The four Classic step components hosted for Custom/Advanced. Each owns its own typed FormGroup
  // and exposes a payload getter, exactly as in Classic's create flow — the wizard reads them at
  // submit time instead of assembling those fields from its flat FormGroup.
  @ViewChild(LoanProductDetailsStepComponent) loanProductDetailsStep?: LoanProductDetailsStepComponent;
  @ViewChild(LoanProductCurrencyStepComponent) loanProductCurrencyStep?: LoanProductCurrencyStepComponent;
  @ViewChild(LoanProductTermsStepComponent) loanProductTermsStep?: LoanProductTermsStepComponent;
  @ViewChild(LoanProductSettingsStepComponent) loanProductSettingsStep?: LoanProductSettingsStepComponent;

  /**
   * Whether the Classic Settings step has reported the advanced payment allocation strategy. In
   * Classic mode the strategy lives in that step's own FormGroup, not the wizard's flat one, so it
   * arrives through the step's `advancePaymentStrategy` output — the same signal Classic's host
   * listens to.
   */
  private classicAdvancedPaymentStrategy = false;

  /** Selected refund types, mirroring Classic's `supportedInterestRefundTypes` field. */
  supportedInterestRefundTypes: StringEnumOptionData[] = [];
  /** Deferred income state the reused step binds to, mirroring Classic's field of the same name. */
  deferredIncomeRecognition: DeferredIncomeRecognition | null = null;

  /**
   * Per-cycle variation rows collected by {@link LoanProductBorrowerCycleStepComponent}. Held here
   * rather than in the FormGroup because the wizard's single flat group cannot carry FormArrays of
   * objects; folded into the payload at submit time, like the other reused steps' emitted state.
   */
  borrowerCycleVariations: BorrowerCycleVariations | null = null;

  steps = FORM_STEPS;
  valueMap = VALUE_MAP;
  form!: FormGroup;
  reviewPayload: Record<string, unknown> = {};
  private formValueChangesSubscription?: Subscription;
  private transactionProcessingStrategyOptionsCache?: SelectOption[];
  private transactionProcessingStrategyOptionsCacheTemplate?: unknown;
  // The strategy list depends on the schedule type too (Classic rebuilds it per type), so the cache
  // must invalidate when the user switches between Progressive and Cumulative.
  private transactionProcessingStrategyOptionsCacheProgressive?: boolean;

  // Editable Payment Allocation state, reused wholesale from the Classic flow. `advancedPaymentAllocations`
  // seeds the reused step's tabs/drag-and-drop; `paymentAllocation`/`creditAllocation` hold the payload-shaped
  // arrays the step emits (defaults on init, the user's edits thereafter).
  advancedPaymentAllocations: AdvancedPaymentAllocation[] = [];
  advancedCreditAllocations: AdvancedCreditAllocation[] = [];
  paymentAllocation: PaymentAllocation[] = [];
  creditAllocation: CreditAllocation[] = [];
  private advancedAllocationsTemplateRef?: unknown;
  // Last repayment strategy the deferred-income seeding reacted to, so it re-seeds only on a real
  // strategy change (Classic's `advancePaymentStrategy` emission) and never on unrelated edits.
  private lastSeenStrategyCode?: unknown;
  // Previous values of the two controllers whose transitions Classic reacts to with an explicit
  // `patchValue` reset — see `syncDependentResets`.
  private lastSeenMultiDisburseLoan?: boolean;
  private lastSeenProgressiveSchedule?: boolean;
  // Classic-mode bridge between the hosted Classic forms and the controls the Charges step binds to.
  private readonly classicMirrorSubscriptions: Subscription[] = [];
  // Bridge between the hosted Classic forms and the wizard controls its sibling steps bind to.
  // Holds the control instances currently mirrored, so re-created hosted steps are re-wired.
  private wiredClassicControls?: { currency: unknown; multiDisburse: unknown; floatingRates: unknown };

  ngOnInit(): void {
    this.initializeForm();
    this.syncTemplateDefaults();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loanProductsTemplate'] && this.form) {
      this.syncTemplateDefaults();
    }
  }

  ngAfterViewChecked(): void {
    // The hosted Classic steps live inside *ngFor/*ngIf, so their @ViewChild refs cannot be `static`
    // and are not guaranteed by ngAfterViewInit. Retry each pass until wired, then never again.
    this.wireClassicControlMirrors();
  }

  ngOnDestroy(): void {
    this.formValueChangesSubscription?.unsubscribe();
    this.classicMirrorSubscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  /**
   * In Classic mode the authoritative values live in the hosted Classic forms, but three of them are
   * consumed by SIBLING steps that capture their control once, in `ngOnInit`, before any `@ViewChild`
   * has resolved:
   *   - `currencyCode` / `multiDisburseLoan` -> the Charges step, which clears its selections on change;
   *   - `isLinkedToFloatingInterestRates` -> the Settings step, which forces interest recalculation and
   *     partial-period interest on when it becomes true (and subscribes with `?.`, so a missing control
   *     fails silently rather than loudly).
   * Each sibling is therefore bound to the wizard's own stable control, and this mirrors the hosted
   * value into it — reproducing what Classic gets for free by passing its own step forms directly.
   *
   * Runs once, as soon as both hosted forms exist. The patches are deferred to a microtask because
   * they happen during the after-view phase, and writing a value the template already read in the
   * same tick raises ExpressionChangedAfterItHasBeenCheckedError in dev mode.
   */
  private wireClassicControlMirrors(): void {
    if (!this.usesClassicSteps) {
      return;
    }
    const currencyControl = this.loanProductCurrencyStep?.loanProductCurrencyForm?.get('currencyCode');
    const multiDisburseControl = this.loanProductSettingsStep?.loanProductSettingsForm?.get('multiDisburseLoan');
    const floatingRatesControl = this.loanProductTermsStep?.loanProductTermsForm?.get(
      'isLinkedToFloatingInterestRates'
    );
    if (!currencyControl || !multiDisburseControl || !floatingRatesControl) {
      return;
    }

    // Keyed on the CONTROL INSTANCES rather than a one-shot boolean. If Angular ever tears down and
    // recreates the hosted steps, the wizard would otherwise stay subscribed to the destroyed forms'
    // controls and the Charges step would silently stop reacting to currency / multi-disbursal
    // changes — the same stale-subscription failure this mirror exists to prevent. Comparing
    // instances makes the wiring self-correcting: it re-subscribes to whatever is current, and is a
    // no-op on every other change-detection pass.
    if (
      this.wiredClassicControls?.currency === currencyControl &&
      this.wiredClassicControls?.multiDisburse === multiDisburseControl &&
      this.wiredClassicControls?.floatingRates === floatingRatesControl
    ) {
      return;
    }
    this.classicMirrorSubscriptions.forEach((subscription) => subscription.unsubscribe());
    this.classicMirrorSubscriptions.length = 0;
    this.wiredClassicControls = {
      currency: currencyControl,
      multiDisburse: multiDisburseControl,
      floatingRates: floatingRatesControl
    };

    const mirror = (key: string, value: unknown): void => {
      // emitEvent stays TRUE: the consuming steps react through their own valueChanges subscriptions,
      // which is the entire point of the mirror.
      Promise.resolve().then(() => this.form?.get(key)?.setValue(value));
    };

    (
      [
        [
          'currencyCode',
          currencyControl
        ],
        [
          'multiDisburseLoan',
          multiDisburseControl
        ],
        [
          'isLinkedToFloatingInterestRates',
          floatingRatesControl
        ]
      ] as const
    ).forEach(
      ([
        key,
        control
      ]) => {
        mirror(key, control.value);
        this.classicMirrorSubscriptions.push(control.valueChanges.subscribe((value) => mirror(key, value)));
      }
    );
  }

  /** Translation key for the active profile's name, shown in the wizard header. */
  get profileLabel(): string {
    return PROFILE_LABEL_KEYS[this.profileMode];
  }

  private get hiddenFieldKeys(): Set<string> {
    if (this.hiddenFieldKeysCache?.profileMode !== this.profileMode) {
      this.hiddenFieldKeysCache = {
        profileMode: this.profileMode,
        keys: new Set(Object.keys(hiddenDefaultsFor(this.profileMode)))
      };
    }
    return this.hiddenFieldKeysCache.keys;
  }

  private get isGuidedProfile(): boolean {
    return isGuidedProfileMode(this.profileMode);
  }

  private get forcesProgressiveStack(): boolean {
    return forcesProgressiveStack(this.profileMode);
  }

  /** Keys the active profile re-exposes even though the guided-hidden lists would hide them. */
  private isProfileExtraVisibleField(key: string): boolean {
    return (PROFILE_EXTRA_VISIBLE_FIELDS[this.profileMode] ?? []).includes(key);
  }

  /**
   * The Payment Allocation step carries no config-driven fields, so it is visible only while the
   * selected repayment strategy is the advanced payment allocation strategy — exactly like the
   * `@if (isAdvancedPaymentStrategy)` guard in the Classic stepper template.
   */
  /**
   * Whether this profile hosts Classic's four step components instead of the config-driven field
   * grid. The single seam between the two rendering modes: it selects the template branch, the
   * source of `isAdvancedPaymentStrategy`, the validity check and the payload assembly.
   */
  get usesClassicSteps(): boolean {
    return usesClassicSteps(this.profileMode);
  }

  get isAdvancedPaymentStrategy(): boolean {
    if (this.usesClassicSteps) {
      // Derived from the hosted Settings form, which owns the control, rather than trusting the
      // cached flag alone. The flag is only as good as the `advancePaymentStrategy` emission that
      // sets it, and this profile's payment allocation, interest-refund and deferred-income steps —
      // plus the payload extras they contribute — all hang off this one boolean. Reading the source
      // of truth means a missed emission degrades to "reads the form" instead of silently building
      // a product without its allocation data. The flag remains the fallback for the window before
      // the step's @ViewChild resolves.
      const strategy = this.loanProductSettingsStep?.loanProductSettingsForm?.get(
        'transactionProcessingStrategyCode'
      )?.value;
      return typeof strategy === 'string'
        ? LoanProducts.isAdvancedPaymentAllocationStrategy(strategy)
        : this.classicAdvancedPaymentStrategy;
    }
    const strategyCode = this.form?.get('transactionProcessingStrategyCode')?.value;
    return typeof strategyCode === 'string' && LoanProducts.isAdvancedPaymentAllocationStrategy(strategyCode);
  }

  /** The Classic Terms form, exposed for the hosted steps' cross-references. */
  get classicTermsForm(): UntypedFormGroup | undefined {
    return this.loanProductTermsStep?.loanProductTermsForm;
  }

  /**
   * The stable control the hosted Settings step binds to. See {@link wireClassicControlMirrors} for
   * why it cannot be the Terms form's control directly.
   */
  get floatingRatesMirrorControl(): UntypedFormControl | null {
    return (this.form?.get('isLinkedToFloatingInterestRates') as UntypedFormControl) ?? null;
  }

  /**
   * Mirrors Classic's host: the Settings step reports the selected repayment strategy, which gates the
   * Payment Allocation, Interest Refund and Deferred Income steps and seeds the deferred-income
   * defaults. Copied from `CreateLoanProductClassicComponent.advancePaymentStrategy` so both flows
   * derive the same starting state from the same template options.
   */
  onClassicAdvancePaymentStrategy(value: string): void {
    this.classicAdvancedPaymentStrategy = LoanProducts.isAdvancedPaymentAllocationStrategy(value);
    if (!this.classicAdvancedPaymentStrategy || !this.loanProductsTemplate) {
      return;
    }
    const template = this.loanProductsTemplate;
    this.deferredIncomeRecognition = {
      capitalizedIncome: template.enableIncomeCapitalization
        ? {
            enableIncomeCapitalization: true,
            capitalizedIncomeCalculationType: template.capitalizedIncomeCalculationTypeOptions?.[0],
            capitalizedIncomeStrategy: template.capitalizedIncomeStrategyOptions?.[0],
            capitalizedIncomeType: template.capitalizedIncomeTypeOptions?.[0]
          }
        : { enableIncomeCapitalization: false },
      buyDownFee: template.enableBuyDownFee
        ? {
            enableBuyDownFee: true,
            buyDownFeeCalculationType: template.buyDownFeeCalculationTypeOptions?.[0],
            buyDownFeeStrategy: template.buyDownFeeStrategyOptions?.[0],
            buyDownFeeIncomeType: template.buyDownFeeIncomeTypeOptions?.[0],
            merchantBuyDownFee: true
          }
        : { enableBuyDownFee: false }
    };
  }

  /**
   * Whether the selected schedule type is Progressive. The control carries the display label
   * ('Progressive'), which `buildPayload` later normalizes to the backend code ('PROGRESSIVE'), so
   * compare case-insensitively against the code — the same condition Classic tests as
   * `loanScheduleType === LoanProducts.LOAN_SCHEDULE_TYPE_PROGRESSIVE`.
   */
  get isProgressiveSchedule(): boolean {
    const scheduleType = this.form?.get('loanScheduleType')?.value;
    return (
      typeof scheduleType === 'string' && scheduleType.toUpperCase() === LoanProducts.LOAN_SCHEDULE_TYPE_PROGRESSIVE
    );
  }

  get visibleSteps(): FormStep[] {
    return this.steps.filter((step) => {
      // Classic mode renders the four hosted components unconditionally: each owns its own internal
      // show/hide rules, which is the whole point of hosting them.
      if (this.usesClassicSteps && step.classicStep) {
        return true;
      }
      if (this.usesClassicSteps) {
        // Two steps become duplicates once Classic's own components are hosted:
        //   - Loan Cycle Variations: Classic's Terms step owns the three variation FormArrays and
        //     renders them inline under `useBorrowerCycle`.
        //   - Advanced Configuration: Classic's Settings step owns the same Event Settings block
        //     (`useDueForRepaymentsConfigurations` plus the due / overdue day inputs).
        if (step.kind === 'borrower-cycle' || step.title === 'Advanced Configuration') {
          return false;
        }
      }
      if (step.kind === 'review') {
        return true;
      }
      if (step.kind === 'payment-allocation') {
        return this.isAdvancedPaymentStrategy;
      }
      if (step.kind === 'charges') {
        return true;
      }
      if (step.kind === 'accounting') {
        return true;
      }
      // Same gate Classic puts on both steps (`@if (isAdvancedPaymentStrategy)` in
      // create-loan-product-classic.component.html), plus the profile opt-in: only profiles whose
      // sheet marks these groups Applicable render them.
      // Classic renders both for ANY advanced-payment-allocation product, so Classic mode drops the
      // per-profile opt-in and keeps only Classic's own strategy gate.
      if (step.kind === 'interest-refund') {
        return (this.usesClassicSteps || rendersInterestRefundStep(this.profileMode)) && this.isAdvancedPaymentStrategy;
      }
      if (step.kind === 'deferred-income') {
        return (this.usesClassicSteps || rendersDeferredIncomeStep(this.profileMode)) && this.isAdvancedPaymentStrategy;
      }
      // Same gate Classic puts on the block (`@if (loanProductTermsForm.value.useBorrowerCycle)` in
      // loan-product-terms-step.component.html), plus the profile opt-in: only JLG's sheet marks the
      // variation rows Applicable.
      if (step.kind === 'borrower-cycle') {
        return rendersBorrowerCycleStep(this.profileMode) && !!this.form?.get('useBorrowerCycle')?.value;
      }
      return this.visibleFields(step).length > 0;
    });
  }

  /**
   * Controls handed to the reused Classic Charges step. It expects plain `UntypedFormControl`s (it
   * subscribes to their `valueChanges` to clear the selected charges when currency / multi-disbursal
   * changes), so the wizard exposes its own form controls under the same shapes Classic passes.
   */
  /**
   * ALWAYS the wizard's own control, in both modes.
   *
   * The reused Charges step reads `currencyCode.value` on every change detection AND captures the
   * control once in its `ngOnInit` (`this.currencyCode.valueChanges.subscribe(...)`). A `@ViewChild`
   * is still undefined during that first pass, so handing it the hosted Classic form's control threw
   * `Cannot read properties of undefined (reading 'value')` and, had it resolved later, would have
   * left the step subscribed to a stale instance. The wizard's flat control exists from
   * `initializeForm()`, so it is a stable target; {@link wireClassicChargeControlMirrors} keeps its
   * value in step with the hosted Classic forms.
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

  trackByAccountTitle(_index: number, account: { title: string }): string {
    return account.title;
  }

  /**
   * The one message the field grid renders for a control, in the order the constraints are worth
   * reporting: a blank required field first, then its floor, its decimal places, its length.
   *
   * Resolved here rather than in the template because `mat-form-field` projects on the `mat-error`
   * selector, and the compiler can only infer that selector for a control-flow block whose single
   * root node is the element itself (`ingestControlFlowInsertionPoint`). A branch nested inside an
   * outer `@if` has another block at its root, so every error lands in the field's default slot
   * instead — rendering inside the box, and ignoring the touched/dirty gating that normally keeps a
   * required message hidden until the user has actually visited the control. Keeping this a flat key
   * lets each `@if` in the template stay one level deep with a `<mat-error>` at its root.
   */
  fieldErrorKey(field: FormField): 'required' | 'min' | 'pattern' | 'maxlength' | null {
    const control = this.form?.get(field.key);
    if (!control) {
      return null;
    }
    if (control.hasError('required')) {
      return 'required';
    }
    if (control.hasError('min')) {
      return 'min';
    }
    if (control.hasError('pattern')) {
      return 'pattern';
    }
    if (control.hasError('maxlength')) {
      return 'maxlength';
    }
    return null;
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

        // Selects Classic also fills from the backend template (the interest recalculation family and
        // the charge-off behaviour). Resolved here so both flows offer the identical choices.
        const templateOptions = this.getTemplateSourcedOptions(field.key);
        if (templateOptions) {
          return { ...field, options: templateOptions };
        }

        return field;
      })
      .filter((field) => {
        if (field.visible === false) {
          return false;
        }

        if (
          this.isGuidedProfile &&
          this.hiddenFieldKeys.has(field.key) &&
          !this.isProfileExtraVisibleField(field.key)
        ) {
          return false;
        }

        // Classic's Settings step wraps maxTrancheCount / outstandingLoanBalance /
        // disallowExpectedDisbursements / allowFullTermForTranche in a single
        // `@if (multiDisburseLoan)` block (loan-product-settings-step.component.html), and its
        // `multiDisburseLoan` valueChanges removes/resets the same set.
        if (MULTI_DISBURSE_DEPENDENT_FIELDS.includes(field.key) && !this.form?.get('multiDisburseLoan')?.value) {
          return false;
        }

        // ...with allowFullTermForTranche carrying a second, nested gate in Classic: it renders only
        // for a Progressive schedule, and Classic patches it back to false when the schedule type
        // changes to Cumulative.
        if (field.key === 'allowFullTermForTranche' && !this.isProgressiveSchedule) {
          return false;
        }

        if (
          (field.key === 'disbursedAmountPercentageForDownPayment' ||
            field.key === 'enableAutoRepaymentForDownPayment') &&
          !this.form?.get('enableDownPayment')?.value
        ) {
          return false;
        }

        // Classic's Terms step keeps both over-applied controls `disabled` until
        // `allowApprovedDisbursedAmountsOverApplied` is ticked, and patches both back to null when it
        // is unticked (loan-product-terms-step.component.ts) — so they are neither editable nor
        // present in the payload while the toggle is off.
        if (
          OVER_APPLIED_DEPENDENT_FIELDS.includes(field.key) &&
          !this.form?.get('allowApprovedDisbursedAmountsOverApplied')?.value
        ) {
          return false;
        }

        // Classic renders the installment-level delinquency checkbox only while a delinquency bucket
        // is selected (`@if (... && loanProductSettingsForm.value.delinquencyBucketId)`).
        if (field.key === 'enableInstallmentLevelDelinquency' && !this.form?.get('delinquencyBucketId')?.value) {
          return false;
        }

        if (INTEREST_RECALCULATION_FIELDS.includes(field.key) && !this.isInterestRecalculationVisible(field.key)) {
          return false;
        }

        // Classic wraps the three guarantee inputs in `@if (loanProductSettingsForm.value
        // .holdGuaranteeFunds)` and its valueChanges handler removes the same three controls.
        if (GUARANTEE_FUNDS_DEPENDENT_FIELDS.includes(field.key) && !this.form?.get('holdGuaranteeFunds')?.value) {
          return false;
        }

        // Classic renders the partial-period checkbox only for "Same as repayment period"
        // (`@if (loanProductSettingsForm.value.interestCalculationPeriodType === 1)`); its tooltip says
        // as much, and its `interestCalculationPeriodType` valueChanges patches the flag back to false
        // for the Daily type.
        if (
          field.key === 'allowPartialPeriodInterestCalculation' &&
          Number(this.form?.get('interestCalculationPeriodType')?.value) !==
            INTEREST_CALCULATION_SAME_AS_REPAYMENT_PERIOD
        ) {
          return false;
        }

        if (this.isGuidedProfile && this.isCustomOnlyField(field.key) && !this.isProfileExtraVisibleField(field.key)) {
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
    // Single-option select: the field config offers exactly one choice, so there is nothing to pick.
    if (key === 'repaymentStartDateType') {
      return true;
    }
    // Classic registers `loanScheduleProcessingType` only for the advanced payment allocation
    // strategy; for any other strategy it is an internal default (Horizontal) with no user choice.
    if (key === 'loanScheduleProcessingType') {
      return !this.isAdvancedPaymentStrategy;
    }
    // Classic adds the `chargeOffBehaviour` control only on a Progressive schedule and removes it on
    // Cumulative (loan-product-settings-step.component.ts `loanScheduleType` valueChanges), which is
    // also the only case `POST /loanproducts` accepts it. Classic's template additionally guards the
    // select on the advanced strategy, so both conditions must hold.
    if (key === 'loanChargeOffBehaviour') {
      return !(this.isProgressiveSchedule && this.isAdvancedPaymentStrategy);
    }
    if (key === 'daysInYearCustomStrategy') {
      return !this.isDaysInYearCustomStrategyApplicable;
    }
    return false;
  }

  /**
   * `daysInYearCustomStrategy` is applicable only for the advanced payment allocation strategy AND an
   * ACTUAL days-in-year type — the pair of conditions under which Classic registers the control
   * (`validateAdvancedPaymentStrategyControls` + the `daysInYearType` valueChanges handler), and the
   * same pair `buildPayload`'s sanitize step enforces before letting the key reach the create API.
   * Single source of truth for visibility, the required validator and payload inclusion.
   */
  private get isDaysInYearCustomStrategyApplicable(): boolean {
    return this.isAdvancedPaymentStrategy && Number(this.form?.get('daysInYearType')?.value) === DAYS_IN_YEAR_ACTUAL;
  }

  /**
   * The nested visibility matrix Classic applies inside its
   * `@if (loanProductSettingsForm.value.isInterestRecalculationEnabled)` block
   * (loan-product-settings-step.component.html). Frequency ids: 1 = Same as repayment period,
   * 3 = Weekly, 4 = Monthly; compounding method 0 = None; nth-day -2 = the "on day" pseudo-option.
   */
  private isInterestRecalculationVisible(key: string): boolean {
    if (!this.form?.get('isInterestRecalculationEnabled')?.value) {
      return false;
    }
    const value = (controlKey: string): number => Number(this.form?.get(controlKey)?.value);
    const compoundingMethod = value('interestRecalculationCompoundingMethod');
    const compoundingFrequency = value('recalculationCompoundingFrequencyType');
    const compoundingNthDay = value('recalculationCompoundingFrequencyNthDayType');
    const restFrequency = value('recalculationRestFrequencyType');
    const restNthDay = value('recalculationRestFrequencyNthDayType');

    switch (key) {
      case 'recalculationCompoundingFrequencyType':
        return compoundingMethod !== 0;
      case 'recalculationCompoundingFrequencyInterval':
        return compoundingMethod !== 0 && compoundingFrequency !== 1;
      case 'recalculationCompoundingFrequencyNthDayType':
        return compoundingMethod !== 0 && compoundingFrequency === 4;
      case 'recalculationCompoundingFrequencyDayOfWeekType':
        return (
          compoundingMethod !== 0 &&
          ((compoundingFrequency === 4 && compoundingNthDay !== -2) || compoundingFrequency === 3)
        );
      case 'recalculationCompoundingFrequencyOnDayType':
        return compoundingMethod !== 0 && compoundingFrequency === 4 && compoundingNthDay === -2;
      case 'recalculationRestFrequencyInterval':
        return restFrequency !== 1;
      case 'recalculationRestFrequencyNthDayType':
        return restFrequency === 4;
      case 'recalculationRestFrequencyDayOfWeekType':
        return (restFrequency === 4 && restNthDay !== -2) || restFrequency === 3;
      case 'recalculationRestFrequencyOnDayType':
        return restFrequency === 4 && restNthDay === -2;
      case 'disallowInterestCalculationOnPastDue':
        return this.isProgressiveSchedule;
      default:
        // preClosureInterestCalculationStrategy, rescheduleStrategyMethod,
        // interestRecalculationCompoundingMethod, recalculationRestFrequencyType and
        // isArrearsBasedOnOriginalSchedule are unconditional inside the block.
        return true;
    }
  }

  /**
   * Options for a select Classic sources from the backend template. Returns `undefined` for fields
   * that keep their static config list, so the caller leaves them untouched.
   */
  private getTemplateSourcedOptions(key: string): SelectOption[] | undefined {
    if (key === 'recalculationCompoundingFrequencyOnDayType' || key === 'recalculationRestFrequencyOnDayType') {
      return ON_DAY_OF_MONTH_OPTIONS;
    }
    const templateProperty = TEMPLATE_OPTION_SOURCES[key];
    if (!templateProperty || !this.loanProductsTemplate) {
      return undefined;
    }
    const rawOptions = this.loanProductsTemplate[templateProperty];
    if (!Array.isArray(rawOptions)) {
      return undefined;
    }
    // `currencyOptions` is the one template list keyed by ISO `code`/`name` instead of `id`/`value`:
    // Classic binds `[value]="currency.code"` and renders `currency.name`
    // (loan-product-currency-step.component.html), so the wizard maps the same pair.
    if (key === 'currencyCode') {
      return rawOptions.map((option: any) => ({
        value: option.code,
        label: option.name ?? option.displayLabel ?? option.code
      }));
    }
    // `delinquencyBucketOptions` is keyed `id`/`name` (DelinquencyBucket in models/loan-product.model.ts),
    // so the generic `option.value ?? option.code` mapping below would label every bucket `undefined`.
    // Classic binds `[value]="delinquencyBucket.id"` and renders `delinquencyBucket.name`. The "None"
    // choice leads the list because the wizard renders it as an option where Classic uses a clear button.
    if (key === 'delinquencyBucketId') {
      return [
        DELINQUENCY_BUCKET_NONE_OPTION,
        ...(rawOptions as DelinquencyBucket[]).map((bucket) => ({
          value: bucket.id,
          label: bucket.name ?? String(bucket.id)
        }))
      ];
    }
    // Classic's reschedule strategy list is filtered by schedule type in `setRescheduleStrategies`,
    // keyed off `advancedTransactionProcessingStrategyDisabled` — which its `loanScheduleType`
    // handler sets to TRUE on Progressive and FALSE on Cumulative. So Progressive keeps ids > 3 and
    // Cumulative keeps ids < 4.
    const filteredOptions =
      key === 'rescheduleStrategyMethod'
        ? rawOptions.filter((option: any) => (this.isProgressiveSchedule ? option.id > 3 : option.id < 4))
        : rawOptions;
    const options: SelectOption[] = filteredOptions.map((option: any) => ({
      value: option.id,
      label: option.value ?? option.code
    }));
    // Classic appends the "on day" pseudo-option to both nth-day selects.
    if (key === 'recalculationCompoundingFrequencyNthDayType' || key === 'recalculationRestFrequencyNthDayType') {
      options.push(NTH_DAY_ON_DAY_OPTION);
    }
    return options;
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
      ...GUARANTEE_FUNDS_DEPENDENT_FIELDS,
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

  /**
   * Classic's `loanProductFormValid`: the four hosted steps plus accounting, and — on the advanced
   * payment allocation strategy — the deferred income step, whose dependents carry `required`.
   * The Charges step has no validators in either flow.
   */
  get classicFormsValid(): boolean {
    const forms = [
      this.loanProductDetailsStep?.loanProductDetailsForm,
      this.loanProductCurrencyStep?.loanProductCurrencyForm,
      this.loanProductTermsStep?.loanProductTermsForm,
      this.loanProductSettingsStep?.loanProductSettingsForm,
      this.loanProductAccountingStep?.loanProductAccountingForm
    ];
    if (forms.some((form) => !form || form.invalid)) {
      return false;
    }
    if (this.isAdvancedPaymentStrategy) {
      const deferredIncomeForm = this.loanProductDeferredIncomeRecognitionStep?.loanDeferredIncomeRecognitionForm;
      return !!deferredIncomeForm && deferredIncomeForm.valid;
    }
    return true;
  }

  /**
   * Titles of the hosted steps that are not yet valid, in wizard order.
   *
   * Classic hides its preview step entirely until the whole product is valid
   * (`@if (loanProductFormValid)`), which is a hard requirement rather than a stylistic one: the
   * summary dereferences the assembled product in `ngOnChanges` (`codeValue.name` in
   * `setCurrentValues`) and throws on an incomplete one. The wizard keeps the Review step visible at
   * all times — a step that vanishes from the stepper is worse than one that explains itself — and
   * gates only the summary, telling the operator exactly which steps still need attention.
   */
  get incompleteClassicSteps(): string[] {
    // Translation KEYS, not labels: this list is rendered to the operator, so the template pipes each
    // through `translate`. All six already exist, so no new keys are introduced.
    const steps: Array<{ title: string; form?: { invalid: boolean } }> = [
      { title: 'labels.heading.Details', form: this.loanProductDetailsStep?.loanProductDetailsForm },
      { title: 'labels.heading.Currency', form: this.loanProductCurrencyStep?.loanProductCurrencyForm },
      { title: 'labels.heading.Terms', form: this.loanProductTermsStep?.loanProductTermsForm },
      { title: 'labels.heading.Settings', form: this.loanProductSettingsStep?.loanProductSettingsForm },
      { title: 'labels.heading.Accounting', form: this.loanProductAccountingStep?.loanProductAccountingForm }
    ];
    // Only required on the advanced payment allocation strategy, which is the only case where the
    // step renders at all (and where Classic also demands its validity).
    if (this.isAdvancedPaymentStrategy) {
      steps.push({
        // No sentence-case key exists for the full step name; this is the closest existing one.
        title: 'labels.inputs.Deferred income',
        form: this.loanProductDeferredIncomeRecognitionStep?.loanDeferredIncomeRecognitionForm
      });
    }
    return steps.filter(({ form }) => !form || form.invalid).map(({ title }) => title);
  }

  /**
   * The payload for Classic mode, assembled the way `CreateLoanProductClassicComponent` assembles it:
   * spread each hosted step's own getter, then apply the advanced-payment-allocation extras and the
   * two create-time fixups from its `submitLoanProduct`. Deliberately does NOT go through the config
   * `buildPayload` — the hidden defaults and profile transforms there exist to complete a curated
   * guided form, and Classic's steps already emit a complete product.
   */
  /**
   * The assembled-but-not-yet-built product, mirroring Classic's `loanProduct` getter. Classic feeds
   * exactly this shape to its preview step (before `LoanProducts.buildPayload` stamps dateFormat /
   * locale and strips the UI-only keys), so the wizard's Classic-mode Review shows what Classic shows.
   */
  get classicPreviewProduct(): Record<string, any> {
    const loanProduct: Record<string, any> = {
      ...this.loanProductDetailsStep?.loanProductDetails,
      ...this.loanProductCurrencyStep?.loanProductCurrency,
      ...this.loanProductTermsStep?.loanProductTerms,
      ...this.loanProductSettingsStep?.loanProductSettings,
      ...this.loanProductChargesStep?.loanProductCharges,
      ...this.loanProductAccountingStep?.loanProductAccounting
    };

    // The advanced-allocation extras belong to the PRODUCT, not to the submit step: Classic's own
    // `loanProduct` getter adds them here and feeds that same object to its preview. Assembling them
    // later, inside the payload builder, would have let the Review present a configuration the create
    // request then contradicted — the operator could approve a product without the payment allocation,
    // credit allocation, interest-refund types or deferred-income settings that were actually sent.
    if (this.isAdvancedPaymentStrategy) {
      loanProduct['paymentAllocation'] = this.paymentAllocation;
      loanProduct['creditAllocation'] = this.creditAllocation;
      // Raw option objects here, exactly as Classic holds them; `buildClassicPayload` maps them to the
      // id list the create contract wants, mirroring Classic's `mapStringEnumOptionToIdList`.
      loanProduct['supportedInterestRefundTypes'] = this.supportedInterestRefundTypes;

      const capitalizedIncome = this.deferredIncomeRecognition?.capitalizedIncome;
      if (capitalizedIncome) {
        loanProduct['enableIncomeCapitalization'] = capitalizedIncome.enableIncomeCapitalization;
        if (capitalizedIncome.enableIncomeCapitalization) {
          loanProduct['capitalizedIncomeCalculationType'] = capitalizedIncome.capitalizedIncomeCalculationType;
          loanProduct['capitalizedIncomeStrategy'] = capitalizedIncome.capitalizedIncomeStrategy;
          loanProduct['capitalizedIncomeType'] = capitalizedIncome.capitalizedIncomeType;
        }
      }

      const buyDownFee = this.deferredIncomeRecognition?.buyDownFee;
      if (buyDownFee) {
        loanProduct['enableBuyDownFee'] = buyDownFee.enableBuyDownFee;
        if (buyDownFee.enableBuyDownFee) {
          loanProduct['buyDownFeeCalculationType'] = buyDownFee.buyDownFeeCalculationType;
          loanProduct['buyDownFeeStrategy'] = buyDownFee.buyDownFeeStrategy;
          loanProduct['buyDownFeeIncomeType'] = buyDownFee.buyDownFeeIncomeType;
          loanProduct['merchantBuyDownFee'] = buyDownFee.merchantBuyDownFee;
        }
      }
    }

    return loanProduct;
  }

  /**
   * The create payload for Classic mode: {@link classicPreviewProduct} — the exact model the Review
   * shows — passed through `LoanProducts.buildPayload`, then Classic's two create-time fixups from
   * `submitLoanProduct`. One model, so preview and submission can never disagree.
   */
  private buildClassicPayload(): any {
    const payload = this.loanProducts.buildPayload(this.classicPreviewProduct, this.itemsByDefault || []);

    // The global-configuration toggle nulls the explicit repayment-event days and is itself UI-only.
    if (payload['useDueForRepaymentsConfigurations'] === true) {
      payload['dueDaysForRepaymentEvent'] = null;
      payload['overDueDaysForRepaymentEvent'] = null;
    }
    delete payload['useDueForRepaymentsConfigurations'];

    // Refund types are only meaningful — and only accepted — on the advanced payment allocation
    // strategy, and travel as an id list rather than the option objects the preview renders.
    if (this.isAdvancedPaymentStrategy) {
      payload['supportedInterestRefundTypes'] = (this.supportedInterestRefundTypes ?? []).map((type) => type.id);
    } else {
      delete payload['supportedInterestRefundTypes'];
      delete payload['daysInYearCustomStrategy'];
    }

    return payload;
  }

  buildPayloadForSubmit(): any {
    if (this.usesClassicSteps) {
      return this.buildClassicPayload();
    }
    const formValue = this.getRawFormValueWithFormattedDates();
    // Fold the charges selected in the reused Classic step into the same `charges` key the payload
    // builder reads (`buildChargeReferences` -> `LoanProducts.buildPayload` map them to `[{ id }]`).
    formValue.charges = this.selectedCharges;
    // Fold the reused Interest Refund step's selection in as the id list the create contract expects,
    // the same `mapStringEnumOptionToIdList` shape Classic submits. Only profiles that render the step
    // set this; for the rest the key stays absent and buildPayload keeps its template-driven default.
    if (rendersInterestRefundStep(this.profileMode) && this.supportedInterestRefundTypes.length > 0) {
      formValue.supportedInterestRefundTypes = this.supportedInterestRefundTypes.map((type) => type.id);
    }
    const merged = buildPayload(formValue, this.profileMode, this.loanProductsTemplate);
    this.applyAdvancedPaymentAllocation(merged);
    // Fold in the accounting rule + GL account mappings collected by the reused Classic accounting
    // step, mirroring Classic's `...this.loanProductAccountingStep.loanProductAccounting` spread. For
    // None it overrides the seeded `accountingRule` with 1; for Cash/Accrual it also supplies every
    // mandatory account id (fundSourceAccountId, loanPortfolioAccountId, …) so Fineract accepts the
    // request. Guarded so unit tests that invoke the builder without rendering the step are unchanged.
    if (this.loanProductAccountingStep) {
      Object.assign(merged, this.loanProductAccountingStep.loanProductAccounting);
    }
    this.applyDeferredIncomeRecognition(merged);
    this.applyBorrowerCycleVariations(merged);
    return this.loanProducts.buildPayload(merged, this.itemsByDefault || []);
  }

  /**
   * Folds the borrower-cycle step's collected rows into the payload (sheet rows 26, 27 and 29).
   *
   * The three keys are removed from JLG's hidden defaults — otherwise the guided merge, which spreads
   * the defaults last, would overwrite the operator's rows with the base `[]`. That leaves them absent
   * from the payload, so this method supplies them.
   *
   * Classic removes all three controls when `useBorrowerCycle` is off
   * (loan-product-terms-step.component.ts), so an unchecked toggle must send empty arrays regardless
   * of anything the step collected before it was unchecked — otherwise stale rows would reach a
   * product that no longer varies by cycle. Every other profile keeps the `[]` from its hidden
   * defaults and never enters this branch.
   */
  private applyBorrowerCycleVariations(payload: Record<string, unknown>): void {
    if (!rendersBorrowerCycleStep(this.profileMode)) {
      return;
    }
    const usesBorrowerCycle = !!this.form?.get('useBorrowerCycle')?.value;
    const collected = usesBorrowerCycle ? this.borrowerCycleVariations : null;
    payload['principalVariationsForBorrowerCycle'] = collected?.principalVariationsForBorrowerCycle ?? [];
    payload['numberOfRepaymentVariationsForBorrowerCycle'] =
      collected?.numberOfRepaymentVariationsForBorrowerCycle ?? [];
    payload['interestRateVariationsForBorrowerCycle'] = collected?.interestRateVariationsForBorrowerCycle ?? [];
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
   * Folds the reused Deferred Income Recognition step's state into the payload, mirroring Classic's
   * create flow (create-loan-product-classic.component.ts): each family's dependent fields are only
   * emitted while its toggle is on, and both toggles are dropped entirely unless the product is on
   * the advanced payment allocation strategy — the same condition that renders the step.
   *
   * Runs only for profiles that render the step; every other profile keeps whatever
   * `enableIncomeCapitalization` / `enableBuyDownFee` its hidden defaults already produced.
   */
  private applyDeferredIncomeRecognition(payload: Record<string, unknown>): void {
    if (!rendersDeferredIncomeStep(this.profileMode)) {
      return;
    }
    const strategyCode = payload['transactionProcessingStrategyCode'];
    const usesAdvancedPaymentAllocation =
      typeof strategyCode === 'string' && LoanProducts.isAdvancedPaymentAllocationStrategy(strategyCode);
    if (!usesAdvancedPaymentAllocation || !this.deferredIncomeRecognition) {
      delete payload['enableIncomeCapitalization'];
      delete payload['enableBuyDownFee'];
      return;
    }

    const { capitalizedIncome, buyDownFee } = this.deferredIncomeRecognition;
    if (capitalizedIncome) {
      payload['enableIncomeCapitalization'] = capitalizedIncome.enableIncomeCapitalization;
      if (capitalizedIncome.enableIncomeCapitalization) {
        payload['capitalizedIncomeCalculationType'] = capitalizedIncome.capitalizedIncomeCalculationType;
        payload['capitalizedIncomeStrategy'] = capitalizedIncome.capitalizedIncomeStrategy;
        payload['capitalizedIncomeType'] = capitalizedIncome.capitalizedIncomeType;
      }
    }
    if (buyDownFee) {
      payload['enableBuyDownFee'] = buyDownFee.enableBuyDownFee;
      if (buyDownFee.enableBuyDownFee) {
        payload['buyDownFeeCalculationType'] = buyDownFee.buyDownFeeCalculationType;
        payload['buyDownFeeStrategy'] = buyDownFee.buyDownFeeStrategy;
        payload['buyDownFeeIncomeType'] = buyDownFee.buyDownFeeIncomeType;
        payload['merchantBuyDownFee'] = buyDownFee.merchantBuyDownFee;
      }
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

  /** Mirrors Classic's handler of the same name (create-loan-product-classic.component.ts). */
  setSupportedInterestRefundTypes(supportedInterestRefundTypes: StringEnumOptionData[]): void {
    this.supportedInterestRefundTypes = supportedInterestRefundTypes;
  }

  /**
   * True while the borrower-cycle step has a rule violation. The step renders its own inline messages,
   * but those live on a different wizard step from the submit button, so the Review step surfaces this
   * too — otherwise the button would just appear dead.
   */
  get borrowerCycleStepInvalid(): boolean {
    return this.loanProductBorrowerCycleStep ? !this.loanProductBorrowerCycleStep.isValid : false;
  }

  /** Receives the borrower-cycle step's collected rows; folded into the payload at submit time. */
  setBorrowerCycleVariations(borrowerCycleVariations: BorrowerCycleVariations): void {
    this.borrowerCycleVariations = borrowerCycleVariations;
  }

  /**
   * Mirrors Classic's `setViewChildForm` + `setDeferredIncomeRecognition` pair: the reused step emits
   * its whole FormGroup on every change, and the host reduces it to the `DeferredIncomeRecognition`
   * shape — dropping each family's dependents whenever its toggle is off, which is what keeps the
   * disabled halves out of the payload.
   */
  setDeferredIncomeRecognitionForm(viewChildForm: FormGroup): void {
    if (!this.isAdvancedPaymentStrategy) {
      return;
    }
    const formValues: any = viewChildForm.getRawValue();
    const capitalizedIncome: CapitalizedIncome = formValues.enableIncomeCapitalization
      ? {
          enableIncomeCapitalization: true,
          capitalizedIncomeCalculationType: formValues.capitalizedIncomeCalculationType,
          capitalizedIncomeStrategy: formValues.capitalizedIncomeStrategy,
          capitalizedIncomeType: formValues.capitalizedIncomeType
        }
      : { enableIncomeCapitalization: false };
    const buyDownFee: BuyDownFee = formValues.enableBuyDownFee
      ? {
          enableBuyDownFee: true,
          buyDownFeeCalculationType: formValues.buyDownFeeCalculationType,
          buyDownFeeStrategy: formValues.buyDownFeeStrategy,
          buyDownFeeIncomeType: formValues.buyDownFeeIncomeType,
          merchantBuyDownFee: formValues.merchantBuyDownFee
        }
      : { enableBuyDownFee: false };
    this.deferredIncomeRecognition = { capitalizedIncome, buyDownFee };
  }

  /**
   * Seeds {@link deferredIncomeRecognition} from the template the first time the advanced payment
   * allocation strategy is selected, mirroring Classic's `advancePaymentStrategy(value)`. Guarded by
   * the last-seen strategy so a later edit to any other control cannot re-seed (and so discard) what
   * the operator configured in the step.
   */
  private syncDeferredIncomeRecognition(): void {
    if (!rendersDeferredIncomeStep(this.profileMode) || !this.loanProductsTemplate) {
      return;
    }
    const strategyCode = this.form?.get('transactionProcessingStrategyCode')?.value;
    if (strategyCode === this.lastSeenStrategyCode) {
      return;
    }
    this.lastSeenStrategyCode = strategyCode;
    if (!this.isAdvancedPaymentStrategy) {
      return;
    }
    const template = this.loanProductsTemplate;
    // Which halves start enabled comes from the profile's seeded form value (the sheet's default —
    // BNPL rows 77/78 are TRUE/FALSE), falling back to the template exactly as Classic does when the
    // profile expresses no opinion. The option defaults inside each half are the template's first
    // option, identical to Classic's `advancePaymentStrategy`.
    const enableIncomeCapitalization =
      (this.form?.get('enableIncomeCapitalization')?.value as boolean | undefined) ??
      template.enableIncomeCapitalization;
    const enableBuyDownFee =
      (this.form?.get('enableBuydownFees')?.value as boolean | undefined) ?? template.enableBuyDownFee;
    this.deferredIncomeRecognition = {
      capitalizedIncome: enableIncomeCapitalization
        ? {
            enableIncomeCapitalization: true,
            capitalizedIncomeCalculationType: template.capitalizedIncomeCalculationTypeOptions?.[0],
            capitalizedIncomeStrategy: template.capitalizedIncomeStrategyOptions?.[0],
            capitalizedIncomeType: template.capitalizedIncomeTypeOptions?.[0]
          }
        : { enableIncomeCapitalization: false },
      buyDownFee: enableBuyDownFee
        ? {
            enableBuyDownFee: true,
            buyDownFeeCalculationType: template.buyDownFeeCalculationTypeOptions?.[0],
            buyDownFeeStrategy: template.buyDownFeeStrategyOptions?.[0],
            buyDownFeeIncomeType: template.buyDownFeeIncomeTypeOptions?.[0],
            merchantBuyDownFee: true
          }
        : { enableBuyDownFee: false }
    };
  }

  formatValue(key: string, val: unknown): string {
    if (val === '' || val === null || val === undefined) {
      return '—';
    }

    const normalizedValue = this.normalizeValueForDisplay(val);
    if (key === 'transactionProcessingStrategyCode') {
      return this.getTransactionProcessingStrategyLabel(String(normalizedValue));
    }

    // The Review chip names the currency the way Classic's dropdown does — from the tenant's own
    // `currencyOptions` — falling through to VALUE_MAP for a template-less render.
    if (key === 'currencyCode') {
      const currencyLabel = this.getTemplateSourcedOptions('currencyCode')?.find(
        (option) => String(option.value) === String(normalizedValue)
      )?.label;
      if (currencyLabel) {
        return String(currencyLabel);
      }
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
      this.transactionProcessingStrategyOptionsCacheTemplate === this.loanProductsTemplate &&
      this.transactionProcessingStrategyOptionsCacheProgressive === this.isProgressiveSchedule
    ) {
      return this.transactionProcessingStrategyOptionsCache;
    }

    const templateOptions = this.loanProductsTemplate?.transactionProcessingStrategyOptions ?? [];
    const optionsSource = templateOptions.length > 0 ? templateOptions : baseOptions;
    const options = optionsSource.map((option: any) => ({
      value: option.code ?? option.value,
      label: option.name ?? option.label ?? option.value ?? option.code
    }));

    const withAdvanced = options.some(
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

    // Classic's `loanScheduleType` handler rebuilds this list per schedule type: Progressive offers
    // ONLY the advanced payment allocation strategy, Cumulative offers only the non-advanced ones
    // (loan-product-settings-step.component.ts). Fineract enforces the same pairing, so without this
    // filter a profile that exposes the schedule type (BNPL, Custom/Advanced) could submit an
    // advanced strategy on a Cumulative product and be rejected.
    const result = withAdvanced.filter((option: SelectOption) =>
      this.isProgressiveSchedule
        ? LoanProducts.isAdvancedPaymentAllocationStrategy(String(option.value))
        : !LoanProducts.isAdvancedPaymentAllocationStrategy(String(option.value))
    );

    this.transactionProcessingStrategyOptionsCache = result;
    this.transactionProcessingStrategyOptionsCacheTemplate = this.loanProductsTemplate;
    this.transactionProcessingStrategyOptionsCacheProgressive = this.isProgressiveSchedule;
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
   * Accounting summary for the Review, driven by the reused Classic accounting step's collected
   * values and rendered with the atomic Classic `mifosx-gl-account-display` (identical GL-code + name
   * formatting). Each selected account id is resolved to its GL account object from the template's
   * account options — account ids are globally unique in Fineract, so one union lookup covers every
   * field without duplicating Classic's per-category mapping. Returns just the rule for None (or when
   * the step has not been rendered), matching Classic's "Type: <rule>" summary line.
   */
  get accountingReview(): { ruleLabel: string; accounts: Array<{ title: string; glAccount: unknown }> } | null {
    const accounting = this.loanProductAccountingStep?.loanProductAccounting;
    if (!accounting) {
      return null;
    }
    const ruleLabel = this.formatValue('accountingRule', accounting.accountingRule);
    const ruleId = Number(accounting.accountingRule);
    if (!(ruleId >= 2 && ruleId <= 4)) {
      return { ruleLabel, accounts: [] };
    }
    const options = this.loanProductsTemplate?.accountingMappingOptions ?? {};
    const glAccounts: any[] = [
      ...(options.assetAccountOptions ?? []),
      ...(options.incomeAccountOptions ?? []),
      ...(options.expenseAccountOptions ?? []),
      ...(options.liabilityAccountOptions ?? [])
    ];
    const accounts = ACCOUNTING_REVIEW_ACCOUNTS.map((field) => {
      const id = (accounting as Record<string, unknown>)[field.key];
      if (id === null || id === undefined || id === '') {
        return null;
      }
      // Compared as strings: the control's value is a `mat-option` [value] binding of the numeric
      // `GLAccount.id` today, but the guard above already tolerates a string (''), so a strict `===`
      // would silently drop a row if any caller ever seeded the step with string ids. Both sides come
      // from the same id space, so stringifying cannot introduce a false match.
      const glAccount = glAccounts.find((account) => String(account.id) === String(id)) ?? null;
      return glAccount ? { title: field.title, glAccount } : null;
    }).filter((row): row is { title: string; glAccount: unknown } => row !== null);
    return { ruleLabel, accounts };
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

  /**
   * Value lookup for the Review banner, mode-aware so both flows show the identical header.
   *
   * Guided profiles read the flat FormGroup. Classic mode reads whichever hosted step owns the
   * control — the banner keys (name, shortName, externalId, currencyCode, principal, the repayment
   * pair and the interest pair) are spread across Details, Currency and Terms.
   */
  private reviewValue(key: string): unknown {
    if (!this.usesClassicSteps) {
      return this.form?.get(key)?.value;
    }
    const hostedForms = [
      this.loanProductDetailsStep?.loanProductDetailsForm,
      this.loanProductCurrencyStep?.loanProductCurrencyForm,
      this.loanProductTermsStep?.loanProductTermsForm,
      this.loanProductSettingsStep?.loanProductSettingsForm
    ];
    for (const form of hostedForms) {
      const control = form?.get(key);
      if (control) {
        return control.value;
      }
    }
    return undefined;
  }

  get reviewName(): string {
    return (this.reviewValue('name') as string) || '';
  }

  get reviewShortName(): string {
    return (this.reviewValue('shortName') as string) || '';
  }

  get reviewExternalId(): string {
    return (this.reviewValue('externalId') as string) || '';
  }

  get reviewCurrencyCode(): string {
    return (this.reviewValue('currencyCode') as string) || '';
  }

  get currencySymbol(): string {
    // The tenant's own symbol for the selected currency first (`displaySymbol`, e.g. 'KSh'); the
    // static map only covers four codes and cannot cover every currency Fineract may be configured with.
    const templateSymbol = (this.loanProductsTemplate?.currencyOptions ?? []).find(
      (option: any) => option.code === this.reviewCurrencyCode
    )?.displaySymbol;
    return templateSymbol || CURRENCY_SYMBOLS[this.reviewCurrencyCode] || '';
  }

  get formattedPrincipal(): string {
    const principal = this.reviewValue('principal');
    if (!principal && principal !== 0) {
      return '—';
    }
    // The operator's active locale, not a hardcoded one: `en-IN` groups digits in the Indian
    // system (1,00,000), which is wrong for every other locale the app ships.
    return `${this.currencySymbol}${Number(principal).toLocaleString(this.settingsService.languageCode)}`;
  }

  get scheduleLabel(): string {
    const repaymentCount = this.reviewValue('numberOfRepayments');
    const repaymentPeriod = this.formatValue('repaymentFrequencyType', this.reviewValue('repaymentFrequencyType'));
    return `${repaymentCount || '—'} × ${repaymentPeriod}`;
  }

  get interestLabel(): string {
    const rate = this.reviewValue('interestRatePerPeriod');
    if (!rate && rate !== 0) {
      return '—';
    }
    const period = this.formatValue('interestRateFrequencyType', this.reviewValue('interestRateFrequencyType'));
    return `${rate}% ${period.toLowerCase()}`;
  }

  /**
   * The wizard keeps every control in one flat FormGroup, so where Classic calls `addControl` /
   * `removeControl` as a toggle flips, the wizard instead swaps the dependent control's validators.
   * The effect is the same: while the controlling field is off the dependent carries no validators
   * (and is hidden, and excluded from the payload by `buildPayload`); while it is on it carries
   * exactly the validators Classic attaches at `addControl` time.
   *
   * Sources, all in the Classic stepper:
   * - `overAppliedCalculationType` / `overAppliedNumber` — `required` in the Terms template, with
   *   `[min]="0"` on the number input.
   * - `maxTrancheCount` (required, min 0) and `outstandingLoanBalance` (min 0) — the `multiDisburseLoan`
   *   valueChanges handler in the Settings step.
   * - `disbursedAmountPercentageForDownPayment` (required, 0-100) — the `enableDownPayment` handler,
   *   which uses the shared {@link rangeValidator}.
   */
  private syncConditionalValidators(): void {
    if (!this.form) {
      return;
    }
    const overAppliedEnabled = !!this.form.get('allowApprovedDisbursedAmountsOverApplied')?.value;
    const multiDisburseEnabled = !!this.form.get('multiDisburseLoan')?.value;
    const downPaymentEnabled = !!this.form.get('enableDownPayment')?.value;
    const guaranteeFundsEnabled = !!this.form.get('holdGuaranteeFunds')?.value;

    this.applyValidators('overAppliedCalculationType', overAppliedEnabled ? [Validators.required] : []);
    this.applyValidators(
      'overAppliedNumber',
      overAppliedEnabled ? [
            Validators.required,
            Validators.min(0)
          ] : []
    );
    this.applyValidators(
      'maxTrancheCount',
      multiDisburseEnabled ? [
            Validators.required,
            Validators.min(0)
          ] : []
    );
    this.applyValidators('outstandingLoanBalance', multiDisburseEnabled ? [Validators.min(0)] : []);
    // Classic's `holdGuaranteeFunds` handler registers `mandatoryGuarantee` with
    // `[Validators.required, Validators.min(0)]` and the two minimum-guarantee inputs with
    // `Validators.min(0)` (their templates carry `min="0"` but no `required`).
    this.applyValidators(
      'mandatoryGuarantee',
      guaranteeFundsEnabled ? [
            Validators.required,
            Validators.min(0)
          ] : []
    );
    this.applyValidators('minimumGuaranteeFromOwnFunds', guaranteeFundsEnabled ? [Validators.min(0)] : []);
    this.applyValidators('minimumGuaranteeFromGuarantor', guaranteeFundsEnabled ? [Validators.min(0)] : []);
    this.applyValidators(
      'disbursedAmountPercentageForDownPayment',
      downPaymentEnabled ? [
            Validators.required,
            rangeValidator(0, 100)
          ] : []
    );

    // The interest recalculation family carries `Validators.required` in Classic only on the controls
    // it actually registers for the chosen frequency — which is exactly the set the nested visibility
    // matrix exposes. The nth-day / day-of-week / on-day selects are registered without validators.
    INTEREST_RECALCULATION_FIELDS.forEach((key) => {
      const isRequired =
        REQUIRED_INTEREST_RECALCULATION_FIELDS.includes(key) && this.isInterestRecalculationVisible(key);
      this.applyValidators(key, isRequired ? [Validators.required] : []);
    });

    // Classic registers `daysInYearCustomStrategy` with `Validators.required` — but only under the
    // two conditions that make it applicable at all: the advanced payment allocation strategy AND an
    // ACTUAL days-in-year type (`validateAdvancedPaymentStrategyControls` and the `daysInYearType`
    // valueChanges handler both call `addControl(..., Validators.required)`; every other path calls
    // `removeControl`). `isDaysInYearCustomStrategyApplicable` is the single expression of that gate,
    // shared with the visibility filter, so the control can never be required while hidden.
    this.applyValidators(
      'daysInYearCustomStrategy',
      this.isDaysInYearCustomStrategyApplicable ? [Validators.required] : []
    );
  }

  /**
   * The explicit `patchValue` resets Classic performs when a controlling field changes, which the
   * wizard must reproduce because its controls survive the toggle instead of being removed:
   *
   * - `multiDisburseLoan` -> false resets `disallowExpectedDisbursements` and
   *   `allowFullTermForTranche` to false (Settings step `multiDisburseLoan` valueChanges).
   * - `loanScheduleType` -> Cumulative resets `allowFullTermForTranche` to false, and re-points
   *   `transactionProcessingStrategyCode` / `rescheduleStrategyMethod` at the first option of the
   *   newly filtered list (`loanScheduleType` valueChanges + `setRescheduleStrategies`).
   *
   * Without these the payload is still correct (buildPayload forces the same values), but the form
   * would show stale values after the user toggles the controller back on — a visible divergence
   * from Classic.
   */
  private syncDependentResets(): void {
    if (!this.form) {
      return;
    }
    const multiDisburseLoan = !!this.form.get('multiDisburseLoan')?.value;
    const isProgressive = this.isProgressiveSchedule;

    if (this.lastSeenMultiDisburseLoan === true && !multiDisburseLoan) {
      this.form.patchValue(
        { disallowExpectedDisbursements: false, allowFullTermForTranche: false },
        { emitEvent: false }
      );
    }
    this.lastSeenMultiDisburseLoan = multiDisburseLoan;

    // Classic's `interestCalculationPeriodType` valueChanges patches the partial-period flag back to
    // false as soon as the Daily type is chosen, so a hidden `true` can never reach the payload (the
    // backend only accepts the flag for "Same as repayment period").
    if (
      Number(this.form.get('interestCalculationPeriodType')?.value) !== INTEREST_CALCULATION_SAME_AS_REPAYMENT_PERIOD &&
      this.form.get('allowPartialPeriodInterestCalculation')?.value
    ) {
      this.form.patchValue({ allowPartialPeriodInterestCalculation: false }, { emitEvent: false });
    }

    // Only a real Progressive -> Cumulative transition clears the tranche flag, mirroring Classic's
    // `patchValue({ allowFullTermForTranche: false })` in that branch.
    if (this.lastSeenProgressiveSchedule === true && !isProgressive) {
      this.form.patchValue({ allowFullTermForTranche: false }, { emitEvent: false });
    }
    const scheduleTypeChanged =
      this.lastSeenProgressiveSchedule !== undefined && this.lastSeenProgressiveSchedule !== isProgressive;
    this.lastSeenProgressiveSchedule = isProgressive;

    // The strategy/reschedule re-point fires only on a real schedule-type change, mirroring Classic's
    // `loanScheduleType` valueChanges. It deliberately does NOT run on the initial pass: the wizard
    // treats the seeded strategy as the user's starting choice, and re-pointing at load would make
    // `transactionProcessingStrategyCode` a pure function of the schedule type, so it could never be
    // set independently. (Classic does normalize on load, because its `ngOnInit` patch re-fires the
    // handler — see the note in the audit about Custom/Advanced's contradictory Progressive +
    // non-advanced seed, which is pre-existing and tracked separately.)
    if (!scheduleTypeChanged) {
      return;
    }
    const strategyOptions = this.getTransactionProcessingStrategyOptions(
      this.fieldConfigByKey.get('transactionProcessingStrategyCode')?.options
    );
    const strategyControl = this.form.get('transactionProcessingStrategyCode');
    if (strategyOptions.length > 0 && !strategyOptions.some((option) => option.value === strategyControl?.value)) {
      strategyControl?.setValue(strategyOptions[0].value, { emitEvent: false });
    }
    // Same for the reschedule strategy, whose valid id range flips with the schedule type.
    if (this.form.get('isInterestRecalculationEnabled')?.value) {
      const rescheduleOptions = this.getTemplateSourcedOptions('rescheduleStrategyMethod') ?? [];
      const rescheduleControl = this.form.get('rescheduleStrategyMethod');
      if (
        rescheduleOptions.length > 0 &&
        !rescheduleOptions.some((option) => option.value === rescheduleControl?.value)
      ) {
        rescheduleControl?.setValue(rescheduleOptions[0].value, { emitEvent: false });
      }
    }
  }

  /**
   * Classic registers each interest recalculation select with its first template option as the
   * initial value (`new UntypedFormControl(this.preClosureInterestCalculationStrategyData[0].id, ...)`
   * and siblings), so switching the toggle on yields a complete, valid configuration rather than
   * empty required selects. The wizard's controls already exist, so seed any that is currently
   * visible and still empty — which happens the moment the toggle, or a parent frequency, first
   * exposes it.
   */
  private seedInterestRecalculationDefaults(): void {
    if (!this.form?.get('isInterestRecalculationEnabled')?.value) {
      return;
    }
    INTEREST_RECALCULATION_FIELDS.forEach((key) => {
      const field = this.fieldConfigByKey.get(key);
      if (!field || field.type !== 'select' || !this.isInterestRecalculationVisible(key)) {
        return;
      }
      const control = this.form.get(key);
      if (!control || (control.value !== '' && control.value !== null && control.value !== undefined)) {
        return;
      }
      const firstOption = this.getTemplateSourcedOptions(key)?.[0];
      if (firstOption !== undefined) {
        control.setValue(firstOption.value, { emitEvent: false });
      }
    });
  }

  /**
   * Replaces a control's validators with the static ones declared in FORM_STEPS plus the supplied
   * conditional ones, without emitting — the caller runs inside a `valueChanges` handler, and
   * re-emitting there would recurse.
   */
  private applyValidators(key: string, conditionalValidators: ValidatorFn[]): void {
    const control = this.form.get(key);
    if (!control) {
      return;
    }
    control.setValidators([
      ...this.validatorsFor(key),
      ...conditionalValidators
    ]);
    control.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Translates a field's FORM_STEPS metadata (`required`, `maxLength`, `min`, `decimals`) into
   * Angular Validators so the FormGroup — not just the template — actually rejects invalid input.
   * Keys with no config entry (UI-only helpers such as `charges`) get no validators.
   *
   * `min` and `decimals` mirror the constraints the matching Classic step declares on the same
   * control, so a value the Classic form rejects is rejected here too — see {@link FormField}.
   * Fields whose Classic constraints are attached only while a controlling toggle is on
   * (`overAppliedNumber`, `maxTrancheCount`, `outstandingLoanBalance`, the guarantee inputs and
   * `disbursedAmountPercentageForDownPayment`) deliberately carry no `min` in the config: their
   * bounds come from {@link syncConditionalValidators} instead, which is also where Classic's
   * `addControl` attaches them.
   *
   * `required` in the field config means "required whenever this field is shown". For a field that is
   * always shown the two readings coincide, but for a conditionally-shown one a static
   * `Validators.required` would keep the control invalid while it is hidden and empty — silently
   * blocking submit with no visible offending control. Those keys are listed in
   * {@link CONDITIONALLY_REQUIRED_FIELDS} and get their `Validators.required` from
   * {@link syncConditionalValidators} instead, which applies it only while the field is visible. The
   * config flag still drives the template's `required` attribute, so the asterisk and inline error
   * render exactly as before.
   */
  private validatorsFor(key: string): ValidatorFn[] {
    const field = this.fieldConfigByKey.get(key);
    if (!field) {
      return [];
    }
    const validators: ValidatorFn[] = [];
    if (field.required && !CONDITIONALLY_REQUIRED_FIELDS.includes(key)) {
      validators.push(Validators.required);
    }
    if (typeof field.maxLength === 'number') {
      validators.push(Validators.maxLength(field.maxLength));
    }
    if (typeof field.min === 'number') {
      validators.push(Validators.min(field.min));
    }
    if (typeof field.decimals === 'number') {
      validators.push(Validators.pattern(decimalPlacesPattern(field.decimals)));
    }
    return validators;
  }

  submit(): void {
    // Every required field is visible in both profiles, so an invalid form means the user left a
    // required control blank (or exceeded a maxLength). The reused Classic accounting step keeps its
    // own FormGroup (with the mandatory GL account validators for Cash/Accrual), so it must be checked
    // alongside the wizard form — otherwise a Cash product with unselected accounts would POST and the
    // backend would reject it with "fundSourceAccountId is mandatory". Surface the errors instead.
    // In Classic mode the flat FormGroup holds none of the product's data — the four hosted steps do
    // — so validity and the "mark everything touched" pass run against their forms instead.
    if (this.usesClassicSteps) {
      if (!this.classicFormsValid) {
        [
          this.loanProductDetailsStep?.loanProductDetailsForm,
          this.loanProductCurrencyStep?.loanProductCurrencyForm,
          this.loanProductTermsStep?.loanProductTermsForm,
          this.loanProductSettingsStep?.loanProductSettingsForm,
          this.loanProductAccountingStep?.loanProductAccountingForm,
          this.loanProductDeferredIncomeRecognitionStep?.loanDeferredIncomeRecognitionForm
        ].forEach((form) => form?.markAllAsTouched());
        return;
      }
      this.postLoanProduct(this.buildPayloadForSubmit());
      return;
    }

    const accountingForm = this.loanProductAccountingStep?.loanProductAccountingForm;
    // Classic's `loanProductFormValid` additionally requires `loanIncomeCapitalizationForm.valid`
    // whenever the advanced payment allocation strategy is selected: the reused Deferred Income
    // Recognition step attaches `Validators.required` to each dependent it registers, so an
    // incomplete capitalized-income / buydown-fee configuration must block submit here too.
    const deferredIncomeForm = this.loanProductDeferredIncomeRecognitionStep?.loanDeferredIncomeRecognitionForm;
    // The borrower-cycle step holds FormArrays of objects rather than a FormGroup, so its rules cannot
    // ride on `form.invalid`. It renders inline messages on its own step, and the Review step shows a
    // notice next to the button, so there is nothing extra to mark as touched here.
    if (this.form.invalid || accountingForm?.invalid || deferredIncomeForm?.invalid || this.borrowerCycleStepInvalid) {
      this.form.markAllAsTouched();
      accountingForm?.markAllAsTouched();
      deferredIncomeForm?.markAllAsTouched();
      return;
    }
    this.postLoanProduct(this.buildPayloadForSubmit());
  }

  /** The create call and success navigation, shared by both rendering modes. */
  private postLoanProduct(payload: any): void {
    this.productsService
      .createLoanProduct(this.loanProductService.loanProductPath, payload)
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
    this.syncDependentResets();
    // Must run BEFORE syncConditionalValidators: if the profile or the backend template arrives with
    // `isInterestRecalculationEnabled` already true, the family is visible from the first render and
    // would otherwise be handed `Validators.required` while still empty — leaving the form invalid at
    // load and `submit()` returning early. Classic never has this window, because it seeds each
    // control at `addControl` time.
    this.seedInterestRecalculationDefaults();
    this.refreshReviewPayload();
    this.syncConditionalValidators();
    this.syncDeferredIncomeRecognition();
    this.formValueChangesSubscription?.unsubscribe();
    this.formValueChangesSubscription = this.form.valueChanges.subscribe(() => {
      // Order matters: apply Classic's resets first, then seed anything the new state newly exposes,
      // so validators and the review payload below observe the settled state.
      this.syncDependentResets();
      this.seedInterestRecalculationDefaults();
      this.refreshReviewPayload();
      this.syncConditionalValidators();
      this.syncDeferredIncomeRecognition();
    });
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
        // Seeded from the template exactly as Classic's settings step does
        // (`allowPartialPeriodInterestCalculation: this.loanProductsTemplate.allowPartialPeriodInterestCalculation`).
        allowPartialPeriodInterestCalculation:
          this.loanProductsTemplate.allowPartialPeriodInterestCalculation ??
          INITIAL_FORM_STATE.allowPartialPeriodInterestCalculation,
        isEqualAmortization: this.loanProductsTemplate.isEqualAmortization ?? INITIAL_FORM_STATE.isEqualAmortization,
        interestCalculationPeriodType:
          this.loanProductsTemplate.interestCalculationPeriodType?.id ??
          INITIAL_FORM_STATE.interestCalculationPeriodType,
        // Progressive-stack profiles pin the schedule type and strategy - never let the template
        // override them. Education pins its Cumulative stack via PROFILE_INITIAL_OVERRIDES instead
        // (spread last below), so it intentionally falls through this branch.
        loanScheduleType: this.forcesProgressiveStack
          ? INITIAL_FORM_STATE.loanScheduleType
          : (this.loanProductsTemplate.loanScheduleType?.value ?? INITIAL_FORM_STATE.loanScheduleType),
        transactionProcessingStrategyCode: this.forcesProgressiveStack
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
        // select can't match and the backend rejects. `daysInYearCustomStrategy` reads `?.id` for the
        // same reason: Classic registers that control as
        // `this.loanProductsTemplate.daysInYearCustomStrategy.id` and its select binds option ids, so
        // the wizard's template-sourced options share that backend-code value space.
        daysInYearType: this.loanProductsTemplate.daysInYearType?.id ?? INITIAL_FORM_STATE.daysInYearType,
        daysInYearCustomStrategy:
          this.loanProductsTemplate.daysInYearCustomStrategy?.id ?? INITIAL_FORM_STATE.daysInYearCustomStrategy,
        daysInMonthType: this.loanProductsTemplate.daysInMonthType?.id ?? INITIAL_FORM_STATE.daysInMonthType,
        principalThresholdForLastInstallment:
          this.loanProductsTemplate.principalThresholdForLastInstallment ??
          INITIAL_FORM_STATE.principalThresholdForLastInstallment,
        canUseForTopup: this.loanProductsTemplate.canUseForTopup ?? INITIAL_FORM_STATE.canUseForTopup,
        isInterestRecalculationEnabled:
          this.loanProductsTemplate.isInterestRecalculationEnabled ?? INITIAL_FORM_STATE.isInterestRecalculationEnabled,
        delinquencyBucketId: this.getDefaultDelinquencyBucketId(),
        canDefineInstallmentAmount:
          this.loanProductsTemplate.canDefineInstallmentAmount ?? INITIAL_FORM_STATE.canDefineInstallmentAmount,
        // Fineract rejects multiDisburseLoan/allowVariableInstallments unless the product uses daily
        // interest calculation or the advanced-payment-allocation repayment strategy
        // (LoanProductDataValidator: "not.supported.for.selected.interest.calculation.type"). Guided
        // profiles satisfy the rule either way — Personal/Two Wheeler force the advanced strategy,
        // Education pins daily interest calculation — so they keep the checked-by-default
        // template/INITIAL_FORM_STATE value. Custom/Advanced defaults to the standard repayment
        // strategy, so it must default both to false here, same as the Classic stepper
        // (loan-product-settings-step.component.ts).
        allowVariableInstallments:
          this.loanProductsTemplate.allowVariableInstallments ??
          (this.isGuidedProfile ? INITIAL_FORM_STATE.allowVariableInstallments : false),
        multiDisburseLoan:
          this.loanProductsTemplate.multiDisburseLoan ??
          (this.isGuidedProfile ? INITIAL_FORM_STATE.multiDisburseLoan : false),
        maxTrancheCount: this.loanProductsTemplate.maxTrancheCount ?? INITIAL_FORM_STATE.maxTrancheCount,
        allowFullTermForTranche:
          this.loanProductsTemplate.allowFullTermForTranche ?? INITIAL_FORM_STATE.allowFullTermForTranche,
        inArrearsTolerance: this.loanProductsTemplate.inArrearsTolerance ?? INITIAL_FORM_STATE.inArrearsTolerance,
        graceOnArrearsAgeing: this.loanProductsTemplate.graceOnArrearsAgeing ?? INITIAL_FORM_STATE.graceOnArrearsAgeing,
        overdueDaysForNPA: this.loanProductsTemplate.overdueDaysForNPA ?? INITIAL_FORM_STATE.overdueDaysForNPA,
        chargeName: this.loanProductsTemplate.chargeName ?? INITIAL_FORM_STATE.chargeName,
        overdueCharge: this.loanProductsTemplate.overdueCharge ?? INITIAL_FORM_STATE.overdueCharge,
        accountingRule: this.loanProductsTemplate.accountingRule ?? INITIAL_FORM_STATE.accountingRule,
        // Curated profile prefills win over the generic backend template for exactly the overridden
        // keys (e.g. the Two Wheeler product quotes 14% per YEAR, while the template would reset the
        // frequency to per month — a very different product). Every other key keeps its
        // template-first behavior above. Spread order: template-derived entries first, profile
        // overrides last.
        ...PROFILE_INITIAL_OVERRIDES[this.profileMode]
      },
      { emitEvent: false }
    );
    // Seed the editable advanced payment allocation model so the reused step renders its tabs/order
    // immediately once the template is available.
    this.getAdvancedPaymentAllocations();
    // Same ordering requirement as in initializeForm(): the patchValue above runs with
    // `{ emitEvent: false }`, so the valueChanges subscription never fires for template-driven
    // values and this is the only chance to seed before the validators are recomputed.
    this.seedInterestRecalculationDefaults();
    this.refreshReviewPayload();
    this.syncConditionalValidators();
    this.syncDeferredIncomeRecognition();
  }

  private refreshReviewPayload(): void {
    // Classic mode previews through Classic's own preview step, fed by buildClassicPayload().
    if (this.usesClassicSteps) {
      return;
    }
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
    // Profile prefills layer between the shared seed and the template/profile-forced entries below:
    // INITIAL_FORM_STATE < PROFILE_INITIAL_OVERRIDES < the explicit entries in the return object.
    const state = { ...INITIAL_FORM_STATE, ...PROFILE_INITIAL_OVERRIDES[this.profileMode] };
    return {
      ...state,
      currencyCode: this.getDefaultCurrencyCode(),
      principal: this.loanProductsTemplate?.principal ?? state.principal,
      transactionProcessingStrategyCode: this.forcesProgressiveStack
        ? LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
        : state.transactionProcessingStrategyCode,
      // See the matching comment in syncTemplateDefaults(): Custom/Advanced defaults to the standard
      // repayment strategy, so multiDisburseLoan/allowVariableInstallments must default to false there
      // to satisfy the same Fineract validation rule. Guided profiles are unaffected.
      multiDisburseLoan: this.isGuidedProfile ? state.multiDisburseLoan : false,
      allowVariableInstallments: this.isGuidedProfile ? state.allowVariableInstallments : false
    };
  }

  private getDefaultCurrencyCode(): string {
    return this.loanProductsTemplate?.currencyOptions?.[0]?.code || INITIAL_FORM_STATE.currencyCode;
  }

  /**
   * The bucket currently assigned on the template, mirroring Classic's own seed
   * (`this.loanProductsTemplate.delinquencyBucket.id > 0 ? ... : null` in
   * loan-product-settings-step.component.ts). The template nests the assigned bucket under
   * `delinquencyBucket` — not a flat `delinquencyBucketId` — so reading the flat key here (as this
   * used to) always missed it and reset the select to None even when the template had a bucket
   * assigned. `delinquencyBucketId` is kept as a fallback for a template shape that does carry the
   * flat key; on the real API response it never does, so this degrades to the previous behaviour.
   */
  private getDefaultDelinquencyBucketId(): number | string | null {
    const delinquencyBucket = this.loanProductsTemplate?.delinquencyBucket;
    if (delinquencyBucket) {
      return delinquencyBucket.id > 0 ? delinquencyBucket.id : null;
    }
    return this.loanProductsTemplate?.delinquencyBucketId ?? INITIAL_FORM_STATE.delinquencyBucketId;
  }
}
