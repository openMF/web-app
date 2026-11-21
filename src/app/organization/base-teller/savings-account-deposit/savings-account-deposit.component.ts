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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
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
  private templateReady = false;
  private detailLoadRequestId = 0;
  private accountDetails = new Map<string, DepositSavingsAccount>();
  private accountLoadRequestId = 0;
  private templateLoadRequestId = 0;
  private receiptLoadRequestId = 0;

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

  get denominationTotal(): number {
    const total = this.denominations.controls.reduce((sum: number, control: AbstractControl) => {
      const denomination = Number(control.get('denomination')?.value ?? 0);
      const quantity = Number(control.get('quantity')?.value ?? 0);
      return sum + denomination * quantity;
    }, 0);
    return this.toMoneyAmount(total);
  }

  get cashDenominationsReconcile(): boolean {
    return (
      this.depositType !== 'CASH' ||
      (this.denominations.length > 0 &&
        this.toMoneyUnits(this.denominationTotal) === this.toMoneyUnits(this.depositAmount))
    );
  }

  ngOnInit(): void {
    this.canAccessWorkflow = this.hasPermission('DEPOSIT_SAVINGSACCOUNT');
    this.maxDate = this.settingsService.businessDate;
    this.createForms();
    if (!this.canAccessWorkflow) {
      this.errorMessage = 'labels.text.You do not have permission to deposit into savings accounts through Base Teller';
      return;
    }
    this.watchLookup();
    this.watchDepositType();
    this.addDenomination();
  }

  createForms(): void {
    this.lookupForm = new FormGroup({
      search: new FormControl<string | DepositSearchResult | null>('', Validators.required),
      savingsAccount: new FormControl<DepositSavingsAccount | '' | null>('', Validators.required)
    });
    this.depositForm = new FormGroup({
      depositType: new FormControl<DepositType | null>('CASH', Validators.required),
      transactionDate: new FormControl<Date | string | null>(this.settingsService.businessDate, Validators.required),
      transactionAmount: new FormControl<number | null>(0, [
        Validators.required,
        Validators.min(0.01)
      ]),
      paymentTypeId: new FormControl<FineractId | '' | null>('', Validators.required),
      accountNumber: new FormControl<string | null>('', Validators.maxLength(50)),
      checkNumber: new FormControl<string | null>('', Validators.maxLength(50)),
      routingCode: new FormControl<string | null>('', Validators.maxLength(50)),
      receiptNumber: new FormControl<string | null>(this.generateReceiptNumber(), Validators.maxLength(50)),
      bankNumber: new FormControl<string | null>('', Validators.maxLength(50)),
      note: new FormControl<string | null>('DEPOSITO EN VENTANILLA'),
      denominations: new FormArray<DenominationFormGroup>([])
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
        this.syncSelectedPaymentType();
      });

    this.depositForm
      .get('transactionAmount')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.depositForm.updateValueAndValidity({ emitEvent: false }));
  }

  selectLookupResult(result: DepositSearchResult): void {
    if (this.isSubmitting || this.commandResult || !result || typeof result !== 'object') {
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
    if (this.isSubmitting || this.commandResult) return;
    this.lookupForm.controls.search.setValue('');
    input.focus();
  }

  selectAccount(account: DepositSavingsAccount): void {
    if (this.isSubmitting || this.commandResult || !this.isActiveSavingsAccount(account)) return;
    if (String(this.selectedSavingsAccountId()) === String(this.savingsAccountId(account))) return;
    this.lookupForm.controls.savingsAccount.setValue(account);
  }

  retrySelection(searchInput?: HTMLInputElement): void {
    if (this.isSubmitting || this.commandResult) return;
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
    if (this.isSubmitting || !this.commandResult) return;
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
        transactionAmount: 0,
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

  addDenomination(): void {
    this.denominations.push(
      new FormGroup({
        denomination: new FormControl<number | string | null>('', [
          Validators.required,
          Validators.min(0.01)
        ]),
        quantity: new FormControl<number | string | null>(1, [
          Validators.required,
          Validators.min(1),
          this.integerValidator()
        ])
      })
    );
  }

  removeDenomination(index: number): void {
    this.denominations.removeAt(index);
  }

  selectedDenominationLineTotal(control: AbstractControl): number {
    const denomination = Number(control.get('denomination')?.value ?? 0);
    const quantity = Number(control.get('quantity')?.value ?? 0);
    return this.toMoneyAmount(denomination * quantity);
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
    if (!this.lookupForm.valid || !this.depositForm.valid || !this.selectedSavingsAccountId()) {
      return false;
    }
    if (!this.cashDenominationsReconcile) {
      this.errorMessage = 'labels.text.Cash denomination total must equal the transaction amount';
      return false;
    }
    return true;
  }

  submit(): void {
    this.errorMessage = '';
    if (!this.proceedToPreview() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.baseTellerService
      .depositToSavingsAccount(this.selectedSavingsAccountId(), this.buildPayload())
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response: SavingsDepositCommandResult) => {
          this.commandResult = response;
          this.receipt = response;
          const transactionId = response?.resourceId || response?.entityId || response?.transactionId;
          if (transactionId) {
            this.loadReceipt(transactionId);
          }
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'labels.text.Savings account deposit failed';
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
    window.print();
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
    const savingsId = this.selectedSavingsAccountId();
    const commandResult: SavingsDepositReceipt | undefined = this.commandResult;
    const receiptNumber = commandResult?.paymentDetailData?.receiptNumber;
    this.baseTellerService.getSavingsDepositReceipt(savingsId, transactionId).subscribe({
      next: (receipt: SavingsDepositReceipt) => {
        if (
          requestId !== this.receiptLoadRequestId ||
          savingsId !== this.selectedSavingsAccountId() ||
          commandResult !== this.commandResult
        ) {
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
      return;
    }
    if (!selectedPaymentTypeId && filteredOptions.length === 1) {
      paymentTypeControl?.setValue(filteredOptions[0].id);
    }
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

  private toMoneyAmount(value: number): number {
    return this.toMoneyUnits(value) / 1000000;
  }

  private toMoneyUnits(value: number): number {
    return Math.round((Number(value) || 0) * 1000000);
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
    if (this.commandResult) {
      this.depositForm.controls.receiptNumber.setValue(this.generateReceiptNumber());
    }
    this.accountLoadRequestId++;
    this.templateLoadRequestId++;
    this.customer = null;
    this.savingsAccounts = [];
    this.selectedSavingsAccount = null;
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
      return value === null || value === '' || Number.isInteger(Number(value)) ? null : { integer: true };
    };
  }
}
