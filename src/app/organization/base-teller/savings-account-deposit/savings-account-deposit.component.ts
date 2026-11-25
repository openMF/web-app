/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  inject
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { toUnits } from '../cash-exchange/cash-exchange.models';
import { MAX_DEPOSIT_QUANTITY, MXN_DEPOSIT_DENOMINATIONS } from './deposit-denominations.config';
import { MatIconButton } from '@angular/material/button';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatIcon } from '@angular/material/icon';
import { MatPrefix } from '@angular/material/form-field';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  MatStepper,
  MatStepperIcon,
  MatStep,
  MatStepLabel,
  MatStepperNext,
  MatStepperPrevious
} from '@angular/material/stepper';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  filter,
  finalize,
  forkJoin,
  map,
  merge,
  Subject,
  timer,
  of,
  switchMap,
  tap
} from 'rxjs';

/** Custom Imports */
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import {
  BaseTellerService,
  DepositClient,
  DepositAccountTransaction,
  DepositClientAccounts,
  DepositPaymentType,
  DepositSavingsAccount,
  DepositSearchResult,
  FineractId,
  SavingsDepositCommandPayload,
  SavingsDepositCommandResult,
  SavingsDepositReceipt,
  SavingsDepositTemplate
} from '../base-teller.service';

import {
  buildDepositReceiptViewModel,
  commandTransactionId,
  depositTransactionId,
  matchesPendingDeposit,
  hasDepositCurrency,
  DepositReceiptContext,
  DepositReceiptViewModel
} from './deposit-receipt.model';
import {
  DepositReconciliationService,
  NonPostingOutcome,
  RecordedDepositDecision
} from './deposit-reconciliation.service';
import { DepositSubmissionStateService } from './deposit-submission-state.service';
import { DepositReceiptExportService, DepositReceiptField } from './deposit-receipt-export.service';

function extract(value: string): string {
  return value;
}

type DepositType = 'CASH' | 'CHECK';
type DepositSearchResponse = DepositSearchResult[] | { pageItems?: DepositSearchResult[] };
type DenominationFormGroup = FormGroup<{
  denomination: FormControl<number | string | null>;
  quantity: FormControl<number | string | null>;
}>;
type LookupFormGroup = FormGroup<{
  search: FormControl<string | DepositSearchResult | null>;
  savingsAccount: FormControl<DepositSavingsAccount | '' | null>;
}>;
type DepositFormGroup = FormGroup<{
  depositType: FormControl<DepositType | null>;
  transactionDate: FormControl<Date | string | null>;
  transactionAmount: FormControl<number | null>;
  paymentTypeId: FormControl<FineractId | '' | null>;
  accountNumber: FormControl<string | null>;
  checkNumber: FormControl<string | null>;
  routingCode: FormControl<string | null>;
  receiptNumber: FormControl<string | null>;
  bankNumber: FormControl<string | null>;
  note: FormControl<string | null>;
  denominations: FormArray<DenominationFormGroup>;
}>;

/**
 * Base Teller deposit workflow for existing savings accounts.
 */
@Component({
  selector: 'mifosx-base-teller-savings-account-deposit',
  templateUrl: './savings-account-deposit.component.html',
  styleUrls: ['./savings-account-deposit.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatIconButton,
    MatIcon,
    MatPrefix,
    MatRadioButton,
    MatRadioGroup,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatProgressSpinner,
    MatStepper,
    MatStepperIcon,
    MatStep,
    MatStepLabel,
    MatStepperNext,
    MatStepperPrevious,
    CdkTextareaAutosize,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavingsAccountDepositComponent implements OnInit {
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);
  private baseTellerService = inject(BaseTellerService);
  private authenticationService = inject(AuthenticationService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private injector = inject(Injector);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private receiptExport = inject(DepositReceiptExportService);
  private reconciliationService = inject(DepositReconciliationService);
  nonPostingForm: ReturnType<SavingsAccountDepositComponent['createNonPostingForm']>;
  recordedNonPosting?: RecordedDepositDecision;
  isRecordingDecision = false;

  private readonly formBuilder: FormBuilder;

  constructor() {
    this.formBuilder = inject(FormBuilder);
    this.nonPostingForm = this.createNonPostingForm();
  }

  private createNonPostingForm() {
    return this.formBuilder.nonNullable.group({
      outcome: [
        '' as NonPostingOutcome | '',
        [
          Validators.required,
          Validators.pattern(/^(NOT_POSTED|REJECTED)$/)
        ]
      ],
      reference: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ],
      evidence: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100)
        ]
      ],
      reason: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(400)
        ]
      ],
      acknowledged: [
        false,
        Validators.requiredTrue
      ]
    });
  }

  private submissionState = inject(DepositSubmissionStateService);
  initialStepIndex = 0;
  isVerifyingDeposit = false;
  recoveryError = '';
  recoveryTransactionId = new FormControl('', [
    Validators.required,
    Validators.pattern(/^[1-9]\d*$/),
    Validators.maxLength(64)
  ]);
  private submittedContext?: DepositReceiptContext;
  outcomeUncertain = false;
  isLoadingReceipt = false;
  receiptUnavailable = false;
  isExportingPdf = false;
  pdfError = false;
  private searchRetry = new Subject<void>();

  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  lookupForm: LookupFormGroup;
  depositForm: DepositFormGroup;

  searchResults: DepositSearchResult[] = [];
  customer: DepositClient | null = null;
  savingsAccounts: DepositSavingsAccount[] = [];
  selectedSavingsAccount: DepositSavingsAccount | null = null;
  paymentTypeOptions: DepositPaymentType[] = [];
  commandResult?: SavingsDepositCommandResult;
  receipt?: SavingsDepositReceipt;
  errorMessage = '';
  isSearching = false;
  isLoadingAccounts = false;
  isLoadingTemplate = false;
  isSubmitting = false;
  canAccessWorkflow = false;
  isLoadingDetails = false;
  accountDetailsUnavailable = false;
  hasSearched = false;
  readonly maxQuantity = MAX_DEPOSIT_QUANTITY;
  private denominationContext = '';
  private templateReady = false;
  private detailLoadRequestId = 0;
  private accountDetails = new Map<string, DepositSavingsAccount>();
  private accountLoadRequestId = 0;
  private templateLoadRequestId = 0;
  private receiptLoadRequestId = 0;

  readonly receiptMessages = {
    uncertain: extract('depositReceipt.uncertain'),
    reconcile: extract('depositReceipt.reconcile'),
    review: extract('depositReceipt.review'),
    reviewHint: extract('depositReceipt.reviewHint'),
    wait: extract('depositReceipt.wait'),
    explicitConfirmation: extract('depositReceipt.explicitConfirmation'),
    notSubmitted: extract('depositReceipt.notSubmitted'),
    verifying: extract('depositReceipt.verifying'),
    verifyTransaction: extract('depositReceipt.verifyTransaction')
  };

  get denominations(): FormArray<DenominationFormGroup> {
    return this.depositForm.get('denominations') as FormArray<DenominationFormGroup>;
  }

  get depositType(): DepositType {
    return this.depositForm?.get('depositType')?.value || 'CASH';
  }

  get depositAmount(): number {
    return Number(this.depositForm?.get('transactionAmount')?.value ?? 0);
  }

  get filteredPaymentTypeOptions(): DepositPaymentType[] {
    if (this.depositType === 'CASH') {
      return this.paymentTypeOptions.filter((paymentType: DepositPaymentType) => paymentType.isCashPayment === true);
    }
    const hasCashMetadata = this.paymentTypeOptions.some(
      (paymentType: DepositPaymentType) => 'isCashPayment' in paymentType
    );
    return hasCashMetadata
      ? this.paymentTypeOptions.filter((paymentType: DepositPaymentType) => paymentType.isCashPayment !== true)
      : this.paymentTypeOptions;
  }

  get currencyPrecision(): number {
    const precision = this.selectedSavingsAccount?.currency?.decimalPlaces;
    if (precision != null && Number.isInteger(precision) && precision >= 0 && precision <= 20) return precision;
    const currency = this.accountCurrencyCode();
    // Before account metadata is available, retain the existing six-place calculation scale.
    // Never invent a currency for the input or summary.
    return currency
      ? new Intl.NumberFormat(this.settingsService.language.code, { style: 'currency', currency }).resolvedOptions()
          .maximumFractionDigits
      : 6;
  }

  get currencySymbol(): string {
    const currency = this.accountCurrencyCode();
    return currency
      ? new Intl.NumberFormat(this.settingsService.language.code, {
          style: 'currency',
          currency,
          currencyDisplay: 'narrowSymbol'
        })
          .formatToParts(0)
          .find((part) => part.type === 'currency')?.value || currency
      : '';
  }

  get currencyStep(): number {
    return 1 / 10 ** this.currencyPrecision;
  }

  get usesPresetDenominations(): boolean {
    return this.accountCurrencyCode() === 'MXN' && this.currencyPrecision >= 2;
  }

  get banknoteCount(): number {
    return MXN_DEPOSIT_DENOMINATIONS.filter((item) => item.kind === 'banknote').length;
  }

  get presetDenominationCount(): number {
    return this.usesPresetDenominations ? MXN_DEPOSIT_DENOMINATIONS.length : 0;
  }

  get denominationGroups() {
    if (!this.usesPresetDenominations) {
      return [{ label: 'labels.inputs.Denominations', rows: this.denominations.controls, offset: 0, preset: false }];
    }
    const groups = [
      {
        label: extract('depositDetails.banknotes'),
        rows: this.denominations.controls.slice(0, this.banknoteCount),
        offset: 0,
        preset: true
      },
      {
        label: extract('depositDetails.coins'),
        rows: this.denominations.controls.slice(this.banknoteCount, this.presetDenominationCount),
        offset: this.banknoteCount,
        preset: true
      }
    ];
    if (this.denominations.length > this.presetDenominationCount) {
      groups.push({
        label: 'labels.inputs.Denominations',
        rows: this.denominations.controls.slice(this.presetDenominationCount),
        offset: this.presetDenominationCount,
        preset: false
      });
    }
    return groups;
  }

  get hasCountedCustomDenominations(): boolean {
    return this.denominations.controls
      .slice(this.presetDenominationCount)
      .some((row) => Number(row.controls.quantity.value) > 0);
  }

  get validCashCount(): boolean {
    return this.denominations.valid && this.countedUnits() != null;
  }

  get denominationTotal(): number {
    const units = this.countedUnits();
    return units == null ? 0 : this.toMoneyAmount(units);
  }

  get cashDenominationsReconcile(): boolean {
    if (this.depositType !== 'CASH') return true;
    const units = this.toMoneyUnits(this.depositForm?.controls.transactionAmount.value);
    const counted = this.countedUnits();
    return units != null && units > 0n && counted != null && units === counted && this.denominations.valid;
  }

  readonly reconciliationMessages = {
    matched: extract('depositDetails.matched'),
    missing: extract('depositDetails.missing'),
    excess: extract('depositDetails.excess'),
    neutral: extract('depositDetails.neutral'),
    invalid: extract('depositDetails.invalid')
  };

  get reconciliationState(): 'neutral' | 'matched' | 'missing' | 'excess' | 'invalid' {
    if (!this.depositForm.controls.transactionAmount.valid) return 'neutral';
    if (!this.denominations.valid || this.countedUnits() == null) return 'invalid';
    if (this.cashDenominationsReconcile) return 'matched';
    return this.denominationTotal < this.depositAmount ? 'missing' : 'excess';
  }

  get cashDifference(): number {
    const amount = this.toMoneyUnits(this.depositForm.controls.transactionAmount.value);
    const counted = this.countedUnits();
    return amount == null || counted == null
      ? 0
      : this.toMoneyAmount(counted > amount ? counted - amount : amount - counted);
  }

  get pieceCounts(): { banknotes: number; coins: number } {
    const quantities = this.denominations.controls.map((row) =>
      row.controls.quantity.valid ? Number(row.controls.quantity.value) : 0
    );
    return {
      banknotes: quantities.slice(0, this.banknoteCount).reduce((a, b) => a + b, 0),
      coins: quantities.slice(this.banknoteCount, this.presetDenominationCount).reduce((a, b) => a + b, 0)
    };
  }

  get currentBalance(): number | null {
    const balance = this.selectedSavingsAccount?.summary?.accountBalance ?? this.selectedSavingsAccount?.accountBalance;
    return typeof balance === 'number' && Number.isFinite(balance) ? balance : null;
  }

  get estimatedBalance(): number | null {
    if (this.currentBalance == null || !this.depositForm.controls.transactionAmount.valid) return null;
    // Balance may be negative (overdraft). Scale its magnitude using the same exact conversion.
    const balance = this.toMoneyUnits(Math.abs(this.currentBalance));
    const amount = this.toMoneyUnits(this.depositAmount);
    if (balance == null || amount == null) return null;
    const result = (this.currentBalance < 0 ? -balance : balance) + amount;
    return result > BigInt(Number.MAX_SAFE_INTEGER) ? null : this.toMoneyAmount(result);
  }

  money(amount: number | null): string {
    return amount == null || !Number.isFinite(amount) || !this.selectedSavingsAccount
      ? '—'
      : this.formatMoney(amount, this.selectedSavingsAccount);
  }

  get summaryDate(): string {
    const date = this.depositForm.controls.transactionDate.value;
    return date instanceof Date && Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat(this.settingsService.language.code, {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }).format(date)
      : '—';
  }

  get detailsValidationMessage(): string {
    if (!this.selectionReady) return extract('depositDetails.selectionInvalid');
    if (!hasDepositCurrency(this.selectedSavingsAccount)) return extract('depositReceipt.currencyRequired');
    if (!this.depositForm.controls.transactionAmount.valid) return extract('depositDetails.amountInvalid');
    if (!this.depositForm.controls.transactionDate.valid) return extract('depositDetails.dateInvalid');
    if (!this.filteredPaymentTypeOptions.some((option) => option.id === this.depositForm.controls.paymentTypeId.value))
      return extract('depositDetails.paymentRequired');
    if (this.depositType === 'CHECK' && [
        'accountNumber',
        'checkNumber',
        'routingCode',
        'bankNumber'
      ].some((name) => this.depositForm.get(name)?.invalid)) return extract('depositDetails.checkRequired');
    if (!this.cashDenominationsReconcile)
      return 'labels.text.Cash denomination total must equal the transaction amount';
    return this.depositForm.valid ? extract('depositDetails.complete') : extract('depositDetails.reviewFields');
  }

  get depositCurrencyReady(): boolean {
    return hasDepositCurrency(this.selectedSavingsAccount);
  }

  retryDepositCurrency(): void {
    if (this.workflowLocked || this.isLoadingDetails || !this.selectedSavingsAccount) return;
    this.accountDetails.delete(String(this.selectedSavingsAccountId()));
    this.loadSelectedAccountDetails(this.selectedSavingsAccount);
  }

  get canContinueDetails(): boolean {
    return (
      this.selectionReady &&
      hasDepositCurrency(this.selectedSavingsAccount) &&
      this.depositForm.valid &&
      this.cashDenominationsReconcile &&
      !this.workflowLocked
    );
  }

  goToPreview(stepper: MatStepper): void {
    this.depositForm.markAllAsTouched();
    if (this.canContinueDetails && this.proceedToPreview()) stepper.next();
  }

  changeDestination(stepper: MatStepper): void {
    if (this.workflowLocked) return;
    stepper.selectedIndex = 0;
  }

  ngOnInit(): void {
    this.canAccessWorkflow = this.hasPermission('DEPOSIT_SAVINGSACCOUNT');
    this.maxDate = this.settingsService.businessDate;
    const pending = this.canAccessWorkflow ? this.submissionState.pending : null;
    if (pending) {
      this.outcomeUncertain = true;
      this.submittedContext = pending.context || undefined;
      this.initialStepIndex = 2;
    }
    this.createForms();
    if (!this.canAccessWorkflow) {
      this.errorMessage = 'labels.text.You do not have permission to deposit into savings accounts through Base Teller';
      return;
    }
    this.watchLookup();
    this.watchDepositType();
    this.addDenomination();
    if (pending?.context) {
      const context = pending.context;
      this.customer = context.customer;
      this.selectedSavingsAccount = context.account;
      this.depositForm.patchValue(
        {
          receiptNumber: context.receiptReference,
          transactionAmount: context.amount,
          depositType: context.depositType,
          note: context.note
        },
        { emitEvent: false }
      );
    }
  }

  createForms(): void {
    this.lookupForm = new FormGroup({
      search: new FormControl<string | DepositSearchResult | null>('', Validators.required),
      savingsAccount: new FormControl<DepositSavingsAccount | '' | null>('', Validators.required)
    });
    this.depositForm = new FormGroup({
      depositType: new FormControl<DepositType | null>('CASH', [
        Validators.required,
        Validators.pattern(/^(CASH|CHECK)$/)
      ]),
      transactionDate: new FormControl<Date | string | null>(this.settingsService.businessDate, Validators.required),
      transactionAmount: new FormControl<number | null>(null, [
        Validators.required,
        this.moneyValidator()
      ]),
      paymentTypeId: new FormControl<FineractId | '' | null>('', Validators.required),
      accountNumber: new FormControl<string | null>('', Validators.maxLength(50)),
      checkNumber: new FormControl<string | null>('', Validators.maxLength(50)),
      routingCode: new FormControl<string | null>('', Validators.maxLength(50)),
      receiptNumber: new FormControl<string | null>(
        this.submittedContext?.receiptReference || (this.outcomeUncertain ? '' : this.generateReceiptNumber()),
        Validators.maxLength(50)
      ),
      bankNumber: new FormControl<string | null>('', Validators.maxLength(50)),
      note: new FormControl<string | null>('DEPOSITO EN VENTANILLA'),
      denominations: new FormArray<DenominationFormGroup>([])
    });
    this.depositForm.addValidators(() => {
      if (!this.cashDenominationsReconcile) return { cashReconciliation: true };
      const paymentId = this.depositForm.controls.paymentTypeId.value;
      return paymentId && !this.filteredPaymentTypeOptions.some((option) => option.id === paymentId)
        ? { incompatiblePayment: true }
        : null;
    });
  }

  watchLookup(): void {
    const queryChanges = this.lookupForm.controls.search.valueChanges.pipe(
      map((value) => (typeof value === 'string' ? value.trim() : null)),
      distinctUntilChanged()
    );
    merge(
      queryChanges,
      this.searchRetry.pipe(
        map(() => {
          const value = this.lookupForm.controls.search.value;
          return typeof value === 'string' ? value.trim() : null;
        })
      )
    )
      .pipe(
        filter(() => !this.workflowLocked),
        tap((searchTerm) => {
          if (searchTerm !== null) this.clearSelectedAccount();
          this.searchResults = [];
          this.hasSearched = false;
          this.isSearching = false;
        }),
        // Switching before the debounce cancels an old request immediately, but equivalent
        // trimmed queries keep their current results or in-flight request.
        switchMap((searchTerm) => {
          if (searchTerm === null || searchTerm.length < 2) {
            this.cdr.markForCheck();
            return EMPTY;
          }
          return timer(300).pipe(
            switchMap(() => {
              this.isSearching = true;
              this.errorMessage = '';
              this.cdr.markForCheck();
              return this.baseTellerService.searchDepositCustomersAndAccounts(searchTerm).pipe(
                catchError((error: unknown) => {
                  this.searchResults = [];
                  this.errorMessage =
                    this.extractErrorMessage(error) || 'labels.text.Customer or savings account search failed';
                  return of([]);
                }),
                finalize(() => {
                  this.isSearching = false;
                  this.cdr.markForCheck();
                })
              );
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response: DepositSearchResponse) => {
        const results = Array.isArray(response) ? response : response?.pageItems || [];
        this.searchResults = results.filter((result) => [
            'client',
            'clients',
            'savings'
          ].includes(this.entityType(result)));
        this.hasSearched = !this.errorMessage;
        this.cdr.markForCheck();
      });

    this.lookupForm
      .get('savingsAccount')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((account: DepositSavingsAccount | '' | null) => {
        if (this.workflowLocked) {
          this.lookupForm.controls.savingsAccount.setValue(this.selectedSavingsAccount, { emitEvent: false });
          return;
        }
        if (
          !account ||
          typeof account !== 'object' ||
          !this.isActiveSavingsAccount(account) ||
          !this.savingsAccounts.some(
            (option) => String(this.savingsAccountId(option)) === String(this.savingsAccountId(account))
          )
        ) {
          this.detailLoadRequestId++;
          this.templateLoadRequestId++;
          this.isLoadingDetails = false;
          this.isLoadingTemplate = false;
          this.templateReady = false;
          this.paymentTypeOptions = [];
          this.selectedSavingsAccount = null;
          this.lookupForm.controls.savingsAccount.setErrors({ ineligible: true });
          return;
        }
        this.templateLoadRequestId++;
        this.templateReady = false;
        this.paymentTypeOptions = [];
        this.selectedSavingsAccount = account;
        this.configureDenominations();
        this.loadSelectedAccountDetails(account);
        if (this.selectedSavingsAccount) this.loadDepositTemplate(this.savingsAccountId(account));
      });
  }

  watchDepositType(): void {
    this.depositForm
      .get('depositType')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((depositType: DepositType | null) => {
        this.applyCheckValidators(depositType || 'CASH');
        if (depositType === 'CHECK') this.denominations.disable({ emitEvent: false });
        else this.denominations.enable({ emitEvent: false });
        this.syncSelectedPaymentType();
      });

    this.depositForm
      .get('transactionAmount')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.depositForm.updateValueAndValidity({ emitEvent: false }));
  }

  selectLookupResult(result: DepositSearchResult): void {
    if (this.workflowLocked || !result || typeof result !== 'object') {
      return;
    }
    this.clearSelectedAccount();
    const resultType = this.entityType(result);
    if (resultType === 'savings') {
      const savingsId = result.entityId || result.accountId;
      if (savingsId) {
        this.loadSavingsAccount(savingsId);
      }
      return;
    }
    if (resultType !== 'client' && resultType !== 'clients') return;
    const clientId = result.entityId || result.id || result.clientId;
    if (clientId) {
      this.loadClientAccounts(clientId);
    }
  }

  loadClientAccounts(clientId: FineractId, selectedId?: FineractId): void {
    const requestId = ++this.accountLoadRequestId;
    this.isLoadingAccounts = true;
    forkJoin({
      customer: this.baseTellerService.getDepositClient(clientId),
      accounts: this.baseTellerService.getDepositClientAccounts(clientId)
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.accountLoadRequestId) {
            this.isLoadingAccounts = false;
            this.cdr.markForCheck();
          }
        })
      )
      .subscribe({
        next: ({ customer, accounts }: { customer: DepositClient | null; accounts: DepositClientAccounts }) => {
          if (requestId !== this.accountLoadRequestId) {
            return;
          }
          if (!customer?.id || String(customer.id) !== String(clientId)) {
            this.errorMessage = 'depositSelection.customerUnavailable';
            return;
          }
          this.customer = customer;
          this.savingsAccounts = accounts?.savingsAccounts || accounts?.savingAccounts || [];
          if (selectedId !== undefined) {
            const selected = this.savingsAccounts.find(
              (account) => String(this.savingsAccountId(account)) === String(selectedId)
            );
            if (selected && this.isActiveSavingsAccount(selected)) {
              this.lookupForm.controls.savingsAccount.setValue(selected);
            } else {
              this.errorMessage = 'depositSelection.ineligible';
            }
          }
        },
        error: (error: unknown) => {
          if (requestId !== this.accountLoadRequestId) {
            return;
          }
          this.errorMessage = this.extractErrorMessage(error) || 'labels.text.Savings accounts could not be loaded';
        }
      });
  }

  loadSavingsAccount(savingsId: FineractId): void {
    const requestId = ++this.accountLoadRequestId;
    this.isLoadingAccounts = true;
    this.baseTellerService
      .getDepositSavingsAccount(savingsId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.accountLoadRequestId) {
            this.isLoadingAccounts = false;
            this.cdr.markForCheck();
          }
        })
      )
      .subscribe({
        next: (account: DepositSavingsAccount) => {
          if (requestId !== this.accountLoadRequestId) {
            return;
          }
          if (!account.clientId || String(this.savingsAccountId(account)) !== String(savingsId)) {
            this.errorMessage = 'depositSelection.customerUnavailable';
            return;
          }
          this.accountDetails.set(String(savingsId), account);
          this.loadClientAccounts(account.clientId, savingsId);
        },
        error: (error: unknown) => {
          if (requestId !== this.accountLoadRequestId) {
            return;
          }
          this.errorMessage = this.extractErrorMessage(error) || 'labels.text.Savings account could not be loaded';
        }
      });
  }

  loadDepositTemplate(savingsId: FineractId): void {
    const requestId = ++this.templateLoadRequestId;
    this.isLoadingTemplate = true;
    this.templateReady = false;
    this.paymentTypeOptions = [];
    this.errorMessage = '';
    this.lookupForm.controls.savingsAccount.setErrors({ loading: true });
    this.baseTellerService
      .getSavingsDepositTemplate(savingsId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.templateLoadRequestId) {
            this.isLoadingTemplate = false;
            this.updateSelectionValidity();
            this.cdr.markForCheck();
          }
        })
      )
      .subscribe({
        next: (template: SavingsDepositTemplate) => {
          if (requestId !== this.templateLoadRequestId) {
            return;
          }
          this.templateReady = true;
          this.updateSelectionValidity();
          this.paymentTypeOptions = template?.paymentTypeOptions || [];
          this.syncSelectedPaymentType();
          if (!this.filteredPaymentTypeOptions.length) {
            this.errorMessage = 'labels.text.No eligible payment types available';
          }
        },
        error: (error: unknown) => {
          if (requestId !== this.templateLoadRequestId) {
            return;
          }
          this.paymentTypeOptions = [];
          this.depositForm.controls.paymentTypeId.setValue('');
          this.lookupForm.controls.savingsAccount.setErrors({ templateUnavailable: true });
          this.errorMessage = this.extractErrorMessage(error) || 'labels.text.Payment types could not be loaded';
        }
      });
  }

  get selectionReady(): boolean {
    return (
      !!this.customer?.id &&
      !!this.selectedSavingsAccount &&
      this.isActiveSavingsAccount(this.selectedSavingsAccount) &&
      this.lookupForm.valid &&
      this.templateReady &&
      !this.isLoadingAccounts &&
      !this.isLoadingTemplate
    );
  }

  get customerName(): string {
    return this.customer?.displayName || this.customer?.fullname || this.customer?.name || '';
  }

  get customerInitials(): string {
    return this.customerName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('');
  }

  changeCustomer(input: HTMLInputElement): void {
    if (this.workflowLocked) return;
    this.lookupForm.controls.search.setValue('');
    input.focus();
  }

  selectAccount(account: DepositSavingsAccount): void {
    if (this.workflowLocked || !this.isActiveSavingsAccount(account)) return;
    if (String(this.selectedSavingsAccountId()) === String(this.savingsAccountId(account))) return;
    this.lookupForm.controls.savingsAccount.setValue(account);
  }

  retrySelection(searchInput?: HTMLInputElement): void {
    if (this.workflowLocked) return;
    if (this.selectedSavingsAccount) {
      this.loadDepositTemplate(this.savingsAccountId(this.selectedSavingsAccount));
    } else {
      const result = this.lookupForm.controls.search.value;
      if (result && typeof result === 'object') this.selectLookupResult(result);
      else if (typeof result === 'string' && result.trim().length >= 2) {
        this.searchRetry.next();
        searchInput?.focus();
      }
    }
  }

  startNewDeposit(stepper: MatStepper, searchInput: HTMLInputElement): void {
    if (this.isSubmitting || this.isExportingPdf || (!this.commandResult && !this.recordedNonPosting)) return;
    const businessDate = this.settingsService.businessDate;
    this.maxDate = businessDate;
    // Invalidates pending receipt/account responses and generates the next receipt number once.
    this.clearSelectedAccount();
    const receiptNumber = this.depositForm.controls.receiptNumber.value;
    stepper.reset();
    this.lookupForm.reset({ search: '', savingsAccount: '' });
    this.depositForm.reset(
      {
        depositType: 'CASH',
        transactionDate: businessDate,
        transactionAmount: null,
        paymentTypeId: '',
        accountNumber: '',
        checkNumber: '',
        routingCode: '',
        receiptNumber,
        bankNumber: '',
        note: 'DEPOSITO EN VENTANILLA'
      },
      { emitEvent: false }
    );
    this.denominations.clear();
    this.addDenomination();
    this.applyCheckValidators('CASH');
    this.searchResults = [];
    this.hasSearched = false;
    this.cdr.markForCheck();
    afterNextRender(() => searchInput.focus(), { injector: this.injector });
  }

  accountStatusLabel(account: DepositSavingsAccount): string {
    const status = account.status;
    return (
      (typeof status === 'string' ? status : status?.value) ||
      (this.isActiveSavingsAccount(account) ? 'labels.status.Active' : 'depositSelection.ineligible')
    );
  }

  accountBalance(account: DepositSavingsAccount): number | null {
    return account.summary?.availableBalance ?? account.summary?.accountBalance ?? account.accountBalance ?? null;
  }

  balanceLabel(account: DepositSavingsAccount): string {
    return account.summary?.availableBalance != null
      ? 'labels.inputs.Available Balance'
      : 'labels.inputs.Account Balance';
  }

  formatMoney(amount: number | null | undefined, account: DepositSavingsAccount, currency = account.currency): string {
    if (amount == null) return '';
    const code = currency?.code || account.currencyCode;
    const digits = currency?.decimalPlaces;
    const locale = this.settingsService.language.code;
    // Intl only formats the server amount; it never changes the stored balance or transaction payload.
    return new Intl.NumberFormat(locale, {
      ...(code ? ({ style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' } as const) : {}),
      ...(digits != null ? { minimumFractionDigits: digits, maximumFractionDigits: digits } : {})
    }).format(amount);
  }

  formatAccountDate(date: number[] | undefined): string {
    if (!date || date.length < 3) return '';
    return new Intl.DateTimeFormat(this.settingsService.language.code, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date[0], date[1] - 1, date[2]));
  }

  get recentTransactions(): DepositAccountTransaction[] {
    return [...(this.selectedSavingsAccount?.transactions || [])]
      .sort((a, b) => this.transactionOrder(b) - this.transactionOrder(a) || Number(b.id) - Number(a.id))
      .slice(0, 3);
  }

  transactionDirection(transaction: DepositAccountTransaction): string {
    // Reversed entries are historical records, not a new credit/debit movement.
    if (transaction.reversed || transaction.isReversal) return '';
    if (transaction.entryType === 'CREDIT') return '+';
    if (transaction.entryType === 'DEBIT') return '−';
    const type = transaction.transactionType;
    if (type?.deposit || type?.interestPosting || type?.dividendPayout) return '+';
    if (type?.withdrawal || type?.feeDeduction || type?.overdraftInterest || type?.withholdTax) return '−';
    return '';
  }

  private transactionOrder(transaction: DepositAccountTransaction): number {
    const date = transaction.date;
    return date?.length === 3 ? new Date(date[0], date[1] - 1, date[2]).getTime() : 0;
  }

  private loadSelectedAccountDetails(account: DepositSavingsAccount): void {
    const requestId = ++this.detailLoadRequestId;
    const savingsId = this.savingsAccountId(account);
    this.accountDetailsUnavailable = false;
    const cached = this.accountDetails.get(String(savingsId));
    this.isLoadingDetails = true;
    (cached ? of(cached) : this.baseTellerService.getDepositSavingsAccount(savingsId))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.detailLoadRequestId) {
            this.isLoadingDetails = false;
            this.updateSelectionValidity();
            this.cdr.markForCheck();
          }
        })
      )
      .subscribe({
        next: (details) => {
          if (requestId !== this.detailLoadRequestId || this.isSubmitting || this.commandResult) return;
          if (
            String(this.savingsAccountId(details)) !== String(savingsId) ||
            !details.clientId ||
            String(details.clientId) !== String(this.customer?.id)
          ) {
            this.selectedSavingsAccount = null;
            this.lookupForm.controls.savingsAccount.setValue('', { emitEvent: false });
            this.templateLoadRequestId++;
            this.templateReady = false;
            this.isLoadingTemplate = false;
            this.paymentTypeOptions = [];
            this.errorMessage = 'depositSelection.customerUnavailable';
            return;
          }
          // Preserve known identifiers only; status, currency and balances come from details.
          const detailedAccount: DepositSavingsAccount = {
            ...details,
            productName:
              details.productName || details.savingsProductName || account.productName || account.savingsProductName,
            accountNo: details.accountNo || details.accountNumber || account.accountNo || account.accountNumber
          };
          this.accountDetails.set(String(savingsId), detailedAccount);
          this.selectedSavingsAccount = detailedAccount;
          this.configureDenominations();
          this.savingsAccounts = this.savingsAccounts.map((item) =>
            String(this.savingsAccountId(item)) === String(savingsId) ? detailedAccount : item
          );
          this.lookupForm.controls.savingsAccount.setValue(detailedAccount, { emitEvent: false });
          this.updateSelectionValidity();
          this.cdr.markForCheck();
        },
        error: () => {
          if (requestId !== this.detailLoadRequestId) return;
          // The client account list already establishes ownership and eligibility. Optional history is independent.
          this.accountDetailsUnavailable = true;
          this.cdr.markForCheck();
        }
      });
  }

  private updateSelectionValidity(): void {
    const control = this.lookupForm.controls.savingsAccount;
    control.updateValueAndValidity({ emitEvent: false });
    if (!this.selectedSavingsAccount || !this.isActiveSavingsAccount(this.selectedSavingsAccount)) {
      control.setErrors({ ineligible: true });
    } else if (!this.templateReady || this.isLoadingTemplate) {
      control.setErrors({ selectionPending: true });
    }
  }

  private configureDenominations(): void {
    const key = `${this.selectedSavingsAccountId()}:${this.accountCurrencyCode()}:${this.currencyPrecision}`;
    if (key !== this.denominationContext) {
      this.denominationContext = key;
      this.denominations.clear({ emitEvent: false });
      if (this.usesPresetDenominations) {
        MXN_DEPOSIT_DENOMINATIONS.forEach((item) => this.addDenomination(item.value));
      } else this.addDenomination();
    }
    this.depositForm.controls.transactionAmount.updateValueAndValidity({ emitEvent: false });
    this.denominations.controls.forEach((row) =>
      row.controls.denomination.updateValueAndValidity({ emitEvent: false })
    );
    if (this.depositType === 'CHECK') this.denominations.disable({ emitEvent: false });
    this.depositForm.updateValueAndValidity({ emitEvent: false });
  }

  addDenomination(value?: number): void {
    this.denominations.push(
      new FormGroup({
        denomination: new FormControl<number | string | null>(value ?? '', [
          Validators.required,
          this.moneyValidator()
        ]),
        quantity: new FormControl<number | string | null>(value == null ? 1 : 0, [
          Validators.required,
          Validators.min(0),
          Validators.max(this.maxQuantity),
          this.integerValidator()
        ])
      })
    );
  }

  removeDenomination(index: number): void {
    if (index >= this.presetDenominationCount && index < this.denominations.length) this.denominations.removeAt(index);
  }

  adjustQuantity(index: number, change: number): void {
    const control = this.denominations.at(index).controls.quantity;
    if (!control.valid) return;
    control.setValue(Math.min(this.maxQuantity, Math.max(0, Number(control.value) + change)));
    control.markAsDirty();
  }

  clearCount(): void {
    this.denominations.controls.forEach((row) => row.controls.quantity.setValue(0));
    this.denominations.markAsDirty();
  }

  selectedDenominationLineTotal(control: AbstractControl): number | null {
    const units = this.toMoneyUnits(control.get('denomination')?.value);
    const quantity = Number(control.get('quantity')?.value);
    if (units == null || !Number.isInteger(quantity) || quantity < 0 || quantity > this.maxQuantity) return null;
    const total = units * BigInt(quantity);
    return total > BigInt(Number.MAX_SAFE_INTEGER) ? null : this.toMoneyAmount(total);
  }

  private countedUnits(): bigint | null {
    if (!this.depositForm || !this.denominations.length) return null;
    let total = 0n;
    for (const row of this.denominations.controls) {
      const units = this.toMoneyUnits(row.controls.denomination.value);
      const quantity = Number(row.controls.quantity.value);
      if (
        units == null ||
        units <= 0n ||
        row.controls.quantity.value === '' ||
        row.controls.quantity.value == null ||
        !Number.isInteger(quantity) ||
        quantity < 0 ||
        quantity > this.maxQuantity
      )
        return null;
      total += units * BigInt(quantity);
      if (total > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    }
    return total;
  }

  displayLookupResult(result: DepositSearchResult | string | null): string {
    if (!result) {
      return '';
    }
    if (typeof result === 'string') {
      return result;
    }
    return `${result.entityAccountNo || result.accountNo || result.id || result.entityId || result.accountId || ''} - ${
      result.entityName || result.displayName || result.name || ''
    }`;
  }

  displaySavingsAccount(account: DepositSavingsAccount | string | null): string {
    if (!account) {
      return '';
    }
    if (typeof account === 'string') {
      return account;
    }
    return `${account.accountNo || account.accountNumber || account.id || ''} - ${
      account.productName || account.savingsProductName || ''
    }`;
  }

  proceedToPreview(): boolean {
    this.errorMessage = '';
    if (!this.cashDenominationsReconcile) {
      this.errorMessage = 'labels.text.Cash denomination total must equal the transaction amount';
      return false;
    }
    return this.canContinueDetails;
  }

  submit(): void {
    if (this.workflowLocked || !this.canAccessWorkflow) return;
    this.errorMessage = '';
    if (!hasDepositCurrency(this.selectedSavingsAccount)) {
      this.errorMessage = extract('depositReceipt.currencyRequired');
      return;
    }
    if (!this.proceedToPreview()) return;
    const context = this.captureReceiptContext();
    if (!context) return;
    if (!this.submissionState.begin(context)) {
      this.errorMessage = extract('depositReceipt.storageUnavailable');
      return;
    }
    this.submittedContext = context;
    const payload = this.buildPayload();
    this.isSubmitting = true;
    this.baseTellerService
      .depositToSavingsAccount(context.accountId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response: SavingsDepositCommandResult) => {
          // A null/empty response or a maker-checker command awaiting approval is not proof of posting.
          // A nonempty successful command may omit the transaction ID; retain that confirmation,
          // but never invent an ID or attempt a receipt GET without one.
          if (
            !response ||
            !Object.keys(response).length ||
            (response.commandId && !commandTransactionId(response)) ||
            (response.savingsId != null && String(response.savingsId) !== String(context.accountId))
          ) {
            this.outcomeUncertain = true;
            return;
          }
          this.submissionState.resolve(context.receiptReference);
          this.commandResult = response;
          this.receipt = response;
          const transactionId = commandTransactionId(response);
          this.receiptUnavailable = !transactionId;
          if (transactionId) this.loadReceipt(transactionId);
        },
        error: (error: unknown) => {
          const status = (error as { status?: number })?.status;
          // A definitive client/business rejection can be corrected. Transport, timeout and server
          // failures may have happened after posting: retain the original reference and block retries.
          this.outcomeUncertain = !(status != null && status >= 400 && status < 500 && status !== 408);
          this.errorMessage = this.outcomeUncertain
            ? ''
            : this.extractErrorMessage(error) || 'labels.text.Savings account deposit failed';
          if (!this.outcomeUncertain) {
            this.submissionState.resolve(context.receiptReference);
            this.submittedContext = undefined;
          }
        }
      });
  }

  buildPayload(): SavingsDepositCommandPayload {
    const depositFormData = this.depositForm.getRawValue();
    const dateFormat = this.settingsService.dateFormat;
    const transactionDate =
      depositFormData.transactionDate instanceof Date
        ? this.dateUtils.formatDate(depositFormData.transactionDate, dateFormat)
        : depositFormData.transactionDate;

    const payload: SavingsDepositCommandPayload = {
      transactionDate: String(transactionDate),
      transactionAmount: Number(depositFormData.transactionAmount),
      paymentTypeId: depositFormData.paymentTypeId as FineractId,
      dateFormat,
      locale: this.settingsService.language.code
    };

    if (depositFormData.receiptNumber) {
      payload.receiptNumber = depositFormData.receiptNumber;
    }
    if (depositFormData.note) {
      payload.note = depositFormData.note;
    }

    if (this.depositType === 'CHECK') {
      payload.accountNumber = depositFormData.accountNumber || undefined;
      payload.checkNumber = depositFormData.checkNumber || undefined;
      payload.routingCode = depositFormData.routingCode || undefined;
      payload.bankNumber = depositFormData.bankNumber || undefined;
    }

    return payload;
  }

  printReceipt(): void {
    if (this.commandResult && !this.isExportingPdf) window.print();
  }

  get workflowLocked(): boolean {
    return this.isSubmitting || !!this.commandResult || this.outcomeUncertain || !!this.recordedNonPosting;
  }

  get receiptView(): DepositReceiptViewModel | null {
    const context = this.submittedContext || this.captureReceiptContext();
    return context
      ? buildDepositReceiptViewModel(context, this.commandResult, this.commandResult ? this.receipt : undefined)
      : null;
  }

  get accountRoute(): (string | number)[] | null {
    const context = this.submittedContext;
    const customerId = context?.customer.id ?? this.customer?.id;
    const accountId = context?.accountId ?? this.selectedSavingsAccountId();
    return customerId && accountId && this.hasPermission('READ_SAVINGSACCOUNT') ? [
          '/clients',
          customerId,
          'savings-accounts',
          accountId
        ] : null;
  }

  get canReviewReversal(): boolean {
    return this.hasPermission('ADJUSTTRANSACTION_SAVINGSACCOUNT');
  }

  get accountHistoryRoute(): (string | number)[] | null {
    return this.accountRoute ? [
          ...this.accountRoute,
          'transactions'
        ] : null;
  }

  finish(): void {
    if ((this.commandResult || this.recordedNonPosting) && !this.isSubmitting && !this.isExportingPdf)
      void this.router.navigate(['/organization/base-teller']);
  }

  retryReceipt(): void {
    const id = commandTransactionId(this.commandResult);
    if (this.commandResult && id && !this.isLoadingReceipt && !this.isExportingPdf) this.loadReceipt(id);
  }

  receiptMoney(value: number | null): string {
    const view = this.receiptView;
    if (value == null || !Number.isFinite(value) || !view) return '—';
    return new Intl.NumberFormat(this.settingsService.language.code, {
      ...(view.currency
        ? { style: 'currency' as const, currency: view.currency, currencyDisplay: 'narrowSymbol' as const }
        : {}),
      minimumFractionDigits: view.precision,
      maximumFractionDigits: view.precision
    }).format(value);
  }

  get receiptDate(): string {
    const date = this.receiptView?.date;
    if (!date || date.length !== 3) return '—';
    const [
      year,
      month,
      day
    ] = date;
    const civilDate = new Date(Date.UTC(year, month - 1, day));
    if (
      !Number.isFinite(civilDate.getTime()) ||
      civilDate.getUTCFullYear() !== year ||
      civilDate.getUTCMonth() !== month - 1 ||
      civilDate.getUTCDate() !== day
    )
      return '—';
    // A ledger date is a calendar date, not an instant in the browser's zone.
    return new Intl.DateTimeFormat(this.settingsService.language.code, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(civilDate);
  }

  get receiptTime(): string | null {
    const time = this.receiptView?.time;
    return time && /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(time)
      ? time
      : null;
  }

  verifyUncertainDeposit(): void {
    const context = this.submittedContext;
    const transactionId = this.recoveryTransactionId.value || '';
    if (
      !this.outcomeUncertain ||
      !context ||
      this.isVerifyingDeposit ||
      this.isRecordingDecision ||
      !this.accountHistoryRoute ||
      this.recoveryTransactionId.invalid
    )
      return;
    this.isVerifyingDeposit = true;
    this.recoveryError = '';
    this.baseTellerService
      .getSavingsDepositReceipt(context.accountId, transactionId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isVerifyingDeposit = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => {
          if (!receipt || !matchesPendingDeposit(context, transactionId, receipt)) {
            this.recoveryError = extract('depositReceipt.recoveryMismatch');
            return;
          }
          this.submissionState.resolve(context.receiptReference);
          // The transaction GET independently confirms this reference; no financial POST is replayed.
          this.commandResult = { resourceId: receipt.id, savingsId: receipt.accountId };
          this.receipt = receipt;
          this.outcomeUncertain = false;
          this.receiptUnavailable = false;
        },
        error: () => {
          this.recoveryError = extract('depositReceipt.recoveryMismatch');
        }
      });
  }

  get canRecordNonPosting(): boolean {
    return this.outcomeUncertain && !!this.submittedContext && this.reconciliationService.canRecord;
  }

  get canSubmitNonPosting(): boolean {
    return (
      this.canRecordNonPosting &&
      this.nonPostingForm.valid &&
      this.nonPostingForm.controls.reference.value === this.submittedContext?.receiptReference &&
      !this.isRecordingDecision &&
      !this.isVerifyingDeposit
    );
  }

  recordNonPostingDecision(): void {
    const context = this.submittedContext;
    if (!context || !this.canSubmitNonPosting) return;
    this.isRecordingDecision = true;
    this.recoveryError = '';
    this.reconciliationService
      .record(context, this.nonPostingForm.getRawValue())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isRecordingDecision = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (recorded) => {
          if (!this.submissionState.resolve(context.receiptReference)) {
            this.recoveryError = extract('depositReceipt.nonPostingFailed');
            return;
          }
          this.recordedNonPosting = recorded;
          this.outcomeUncertain = false;
        },
        error: () => {
          this.recoveryError = extract('depositReceipt.nonPostingFailed');
        }
      });
  }

  /** One field list drives screen, print and PDF. Missing values remain explicitly unavailable. */
  get receiptFields(): DepositReceiptField[] {
    const view = this.receiptView;
    if (!view) return [];
    const t = (key: string) => this.translate.instant(key);
    const missing = t(extract('depositReceipt.unavailable'));
    return [
      { label: t('labels.inputs.Transaction Id'), value: view.transactionId || missing },
      {
        label: t(view.receiptConfirmed ? 'labels.inputs.Receipt Number' : 'depositReceipt.requestReference'),
        value: view.receiptNumber || missing
      },
      {
        label: t(view.dateFromReceipt ? 'labels.inputs.Transaction Date' : extract('depositReceipt.requestDate')),
        value: this.receiptDate
      },
      ...(this.receiptTime ? [{ label: t(extract('depositReceipt.transactionTime')), value: this.receiptTime }] : []),
      { label: t('labels.inputs.Client'), value: view.customer || missing },
      { label: t('labels.inputs.Savings Account'), value: view.accountNumber || missing },
      { label: t('labels.inputs.Product'), value: view.product || missing },
      { label: t('labels.inputs.Transaction Type'), value: t(view.transactionType) },
      { label: t('labels.inputs.Payment Type'), value: view.paymentMethod || missing },
      {
        label: t('labels.inputs.Deposit Type'),
        value: t(view.depositType === 'CASH' ? 'labels.inputs.Cash' : 'labels.inputs.Check')
      },
      ...(view.operator ? [{ label: t(extract('depositReceipt.recordedOperator')), value: view.operator }] : []),
      { label: t('labels.inputs.Notes'), value: view.note || t(extract('depositReceipt.noNote')) },
      {
        label: t('depositReceipt.resultingBalance'),
        value: view.resultingBalance == null ? missing : `${this.receiptMoney(view.resultingBalance)} ${view.currency}`
      }
    ];
  }

  async downloadReceiptPdf(): Promise<void> {
    const view = this.receiptView;
    if (!this.commandResult || !view || this.isExportingPdf || this.isLoadingReceipt) return;
    this.isExportingPdf = true;
    this.pdfError = false;
    const fields = [...this.receiptFields];
    if (!view.receiptConfirmed)
      fields.push({
        label: this.translate.instant('depositReceipt.requestReference'),
        value: this.translate.instant('depositReceipt.referenceNotice')
      });
    if (!view.amountFromReceipt)
      fields.push({
        label: this.translate.instant('labels.inputs.Amount'),
        value: this.translate.instant('depositReceipt.requestAmount')
      });
    try {
      await this.receiptExport.download(
        this.translate.instant('labels.heading.Payment Receipt'),
        `${this.receiptMoney(view.amount)} ${view.currency}`,
        fields,
        view.transactionId || view.receiptNumber || 'receipt'
      );
    } catch {
      this.pdfError = true;
    } finally {
      this.isExportingPdf = false;
      this.cdr.markForCheck();
    }
  }

  private captureReceiptContext(): DepositReceiptContext | null {
    if (!this.customer || !this.selectedSavingsAccount) return null;
    const values = this.depositForm.getRawValue();
    const date = values.transactionDate;
    return {
      customer: { ...this.customer },
      account: { ...this.selectedSavingsAccount, currency: { ...this.selectedSavingsAccount.currency } },
      accountId: this.selectedSavingsAccountId(),
      amount: this.depositAmount,
      depositType: this.depositType,
      paymentMethod: this.paymentTypeName(values.paymentTypeId),
      receiptReference: values.receiptNumber || '',
      date: date instanceof Date && Number.isFinite(date.getTime()) ? [
              date.getFullYear(),
              date.getMonth() + 1,
              date.getDate()
            ] : null,
      note: values.note || ''
    };
  }

  paymentTypeName(paymentTypeId: FineractId | '' | null | undefined): string {
    if (!paymentTypeId) {
      return '';
    }
    const paymentType = this.paymentTypeOptions.find((option: DepositPaymentType) => option.id === paymentTypeId);
    return paymentType?.name || paymentType?.value || '';
  }

  accountCurrencyCode(): string {
    return this.selectedSavingsAccount?.currency?.code || this.selectedSavingsAccount?.currencyCode || '';
  }

  private loadReceipt(transactionId: FineractId): void {
    const requestId = ++this.receiptLoadRequestId;
    const savingsId = this.submittedContext?.accountId ?? this.selectedSavingsAccountId();
    const commandResult: SavingsDepositReceipt | undefined = this.commandResult;
    const receiptNumber = commandResult?.paymentDetailData?.receiptNumber;
    this.isLoadingReceipt = true;
    this.receiptUnavailable = false;
    this.baseTellerService
      .getSavingsDepositReceipt(savingsId, transactionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (receipt: SavingsDepositReceipt) => {
          if (
            requestId !== this.receiptLoadRequestId ||
            savingsId !== this.selectedSavingsAccountId() ||
            commandResult !== this.commandResult
          ) {
            return;
          }
          this.isLoadingReceipt = false;
          if (
            !receipt ||
            (receipt.id != null && depositTransactionId(receipt.id) !== depositTransactionId(transactionId)) ||
            (receipt.accountId != null && String(receipt.accountId) !== String(savingsId))
          ) {
            this.receiptUnavailable = true;
            this.cdr.markForCheck();
            return;
          }
          if (!receipt.paymentDetailData?.receiptNumber && receiptNumber) {
            receipt = {
              ...receipt,
              paymentDetailData: {
                ...receipt.paymentDetailData,
                receiptNumber
              }
            };
          }
          this.receipt = receipt;
          this.cdr.markForCheck();
        },
        error: () => {
          if (
            requestId !== this.receiptLoadRequestId ||
            savingsId !== this.selectedSavingsAccountId() ||
            commandResult !== this.commandResult
          ) {
            return;
          }
          this.receipt = commandResult;
          this.isLoadingReceipt = false;
          this.receiptUnavailable = true;
          this.cdr.markForCheck();
        }
      });
  }

  isActiveSavingsAccount(account: DepositSavingsAccount): boolean {
    return (
      (typeof account?.status === 'object' && account.status?.active === true) ||
      (typeof account?.status === 'object' && account.status?.value === 'Active') ||
      (typeof account?.status === 'object' && account.status?.code === 'savingsAccountStatusType.active')
    );
  }

  entityType(result: DepositSearchResult): string {
    return String(result.entityType || result.subEntityType || result.accountType || '').toLowerCase();
  }

  private selectedSavingsAccountId(): FineractId {
    return this.selectedSavingsAccount ? this.savingsAccountId(this.selectedSavingsAccount) : '';
  }

  savingsAccountId(account: DepositSavingsAccount): FineractId {
    return account.id || account.accountId || account.savingsId || '';
  }

  private applyCheckValidators(depositType: DepositType): void {
    [
      'accountNumber',
      'checkNumber',
      'routingCode',
      'bankNumber'
    ].forEach((controlName: string) => {
      const control = this.depositForm.get(controlName);
      control?.clearValidators();
      control?.addValidators(Validators.maxLength(50));
      if (depositType === 'CHECK') {
        control?.addValidators(Validators.required);
      }
      control?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private syncSelectedPaymentType(): void {
    const paymentTypeControl = this.depositForm?.get('paymentTypeId');
    const selectedPaymentTypeId = paymentTypeControl?.value;
    const filteredOptions = this.filteredPaymentTypeOptions;
    if (
      selectedPaymentTypeId &&
      !filteredOptions.some((paymentType: DepositPaymentType) => paymentType.id === selectedPaymentTypeId)
    ) {
      paymentTypeControl?.setValue('');
    } else if (!selectedPaymentTypeId && filteredOptions.length === 1) {
      paymentTypeControl?.setValue(filteredOptions[0].id);
    }
    // Replacing options can change compatibility even when the control value stays the same.
    this.depositForm.updateValueAndValidity({ emitEvent: false });
  }

  private hasPermission(permission: string): boolean {
    if (!environment.productionModeEnableRBAC) {
      return true;
    }
    const userPermissions = this.authenticationService.getCredentials()?.permissions ?? [];
    return (
      userPermissions.includes('ALL_FUNCTIONS') ||
      (permission.startsWith('READ_') && userPermissions.includes('ALL_FUNCTIONS_READ')) ||
      userPermissions.includes(permission)
    );
  }

  private extractErrorMessage(error: unknown): string {
    const candidate = error as {
      error?: {
        defaultUserMessage?: string;
        developerMessage?: string;
        message?: string;
      };
      message?: string;
    };
    return (
      candidate?.error?.defaultUserMessage ||
      candidate?.error?.developerMessage ||
      candidate?.error?.message ||
      candidate?.message ||
      ''
    );
  }

  private toMoneyAmount(value: bigint): number {
    return Number(value) / 10 ** this.currencyPrecision;
  }

  private toMoneyUnits(value: unknown): bigint | null {
    if ((typeof value !== 'number' && typeof value !== 'string') || value === '' || !Number.isFinite(Number(value)))
      return null;
    try {
      const units = toUnits(value, this.currencyPrecision);
      return units <= BigInt(Number.MAX_SAFE_INTEGER) ? units : null;
    } catch {
      return null;
    }
  }

  private moneyValidator(): ValidatorFn {
    return (control) => {
      if (control.value == null || control.value === '') return null;
      const units = this.toMoneyUnits(control.value);
      return units != null && units > 0n ? null : { money: true };
    };
  }

  private generateReceiptNumber(): string {
    // RFC 9562 UUIDv7: 48-bit Unix milliseconds, version/variant bits, and 74 secure random bits.
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    let timestamp = Date.now();
    for (let index = 5; index >= 0; index--) {
      bytes[index] = timestamp % 256;
      timestamp = Math.floor(timestamp / 256);
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x70;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte: number) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  private clearSelectedAccount(): void {
    this.detailLoadRequestId++;
    this.accountDetails.clear();
    this.isLoadingDetails = false;
    this.accountDetailsUnavailable = false;
    this.templateReady = false;
    this.errorMessage = '';
    this.receiptLoadRequestId++;
    if (this.commandResult || this.recordedNonPosting) {
      this.depositForm.controls.receiptNumber.setValue(this.generateReceiptNumber());
    }
    this.accountLoadRequestId++;
    this.templateLoadRequestId++;
    this.submittedContext = undefined;
    this.recordedNonPosting = undefined;
    this.nonPostingForm.reset();
    this.recoveryError = '';
    this.outcomeUncertain = false;
    this.isLoadingReceipt = false;
    this.receiptUnavailable = false;
    this.pdfError = false;
    this.customer = null;
    this.savingsAccounts = [];
    this.selectedSavingsAccount = null;
    this.denominationContext = '';
    this.denominations.clear({ emitEvent: false });
    this.addDenomination();
    this.paymentTypeOptions = [];
    this.commandResult = undefined;
    this.receipt = undefined;
    this.isLoadingAccounts = false;
    this.isLoadingTemplate = false;
    this.lookupForm?.patchValue({ savingsAccount: '' }, { emitEvent: false });
    this.depositForm?.patchValue({ paymentTypeId: '' }, { emitEvent: false });
    this.cdr.markForCheck();
  }

  private integerValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      return value == null ||
        value === '' ||
        ((typeof value === 'number' || /^\d+$/.test(value)) && Number.isInteger(Number(value)))
        ? null
        : { integer: true };
    };
  }
}
