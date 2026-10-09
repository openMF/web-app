/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
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
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  finalize,
  forkJoin,
  map,
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
  private accountLoadRequestId = 0;
  private templateLoadRequestId = 0;

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
      receiptNumber: new FormControl<string | null>('', Validators.maxLength(50)),
      bankNumber: new FormControl<string | null>('', Validators.maxLength(50)),
      note: new FormControl<string | null>(''),
      denominations: new FormArray<DenominationFormGroup>([])
    });
  }

  watchLookup(): void {
    this.lookupForm
      .get('search')
      ?.valueChanges.pipe(
        tap((value: string | DepositSearchResult | null) => {
          if (typeof value === 'string') {
            this.clearSelectedAccount();
          }
        }),
        map((value: string | DepositSearchResult | null) => (typeof value === 'string' ? value.trim() : '')),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm: string) => {
          if (searchTerm.length < 2) {
            this.searchResults = [];
            this.isSearching = false;
            this.cdr.markForCheck();
            return EMPTY;
          }
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
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response: DepositSearchResponse) => {
        this.searchResults = Array.isArray(response) ? response : response?.pageItems || [];
      });

    this.lookupForm
      .get('savingsAccount')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((account: DepositSavingsAccount | '' | null) => {
        if (account && typeof account === 'object') {
          this.selectedSavingsAccount = account;
          const savingsId = this.savingsAccountId(account);
          if (savingsId) {
            this.loadDepositTemplate(savingsId);
          }
        }
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
    if (!result || typeof result !== 'object') {
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
    const clientId = result.entityId || result.id || result.clientId;
    if (clientId) {
      this.loadClientAccounts(clientId);
    }
  }

  loadClientAccounts(clientId: FineractId): void {
    const requestId = ++this.accountLoadRequestId;
    this.isLoadingAccounts = true;
    forkJoin({
      customer: this.baseTellerService.getDepositClient(clientId).pipe(catchError(() => of(null))),
      accounts: this.baseTellerService.getDepositClientAccounts(clientId)
    })
      .pipe(
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
          this.customer = customer;
          this.savingsAccounts = this.activeSavingsAccounts(
            accounts?.savingsAccounts || accounts?.savingAccounts || []
          );
          if (!this.savingsAccounts.length) {
            this.errorMessage = 'labels.text.No active savings accounts available for this customer';
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
          this.selectedSavingsAccount = account;
          this.savingsAccounts = this.isActiveSavingsAccount(account) ? [account] : [];
          this.customer = {
            id: account.clientId,
            displayName: account.clientName || account.clientDisplayName
          };
          if (this.savingsAccounts.length) {
            this.lookupForm.patchValue({ savingsAccount: account });
          } else {
            this.errorMessage = 'labels.text.Selected savings account is not active';
          }
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
    this.baseTellerService
      .getSavingsDepositTemplate(savingsId)
      .pipe(
        finalize(() => {
          if (requestId === this.templateLoadRequestId) {
            this.isLoadingTemplate = false;
            this.cdr.markForCheck();
          }
        })
      )
      .subscribe({
        next: (template: SavingsDepositTemplate) => {
          if (requestId !== this.templateLoadRequestId) {
            return;
          }
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
          this.errorMessage = this.extractErrorMessage(error) || 'labels.text.Payment types could not be loaded';
        }
      });
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
    return `${result.entityAccountNo || result.accountNo || result.id || result.entityId || ''} - ${
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
    this.baseTellerService.getSavingsDepositReceipt(this.selectedSavingsAccountId(), transactionId).subscribe({
      next: (receipt: SavingsDepositReceipt) => {
        this.receipt = receipt;
        this.cdr.markForCheck();
      },
      error: () => {
        this.receipt = this.commandResult;
        this.cdr.markForCheck();
      }
    });
  }

  private activeSavingsAccounts(accounts: DepositSavingsAccount[]): DepositSavingsAccount[] {
    return accounts.filter((account: DepositSavingsAccount) => this.isActiveSavingsAccount(account));
  }

  private isActiveSavingsAccount(account: DepositSavingsAccount): boolean {
    return (
      (typeof account?.status === 'object' && account.status?.active === true) ||
      (typeof account?.status === 'object' && account.status?.value === 'Active') ||
      (typeof account?.status === 'object' && account.status?.code === 'savingsAccountStatusType.active')
    );
  }

  private entityType(result: DepositSearchResult): string {
    return String(result.entityType || result.subEntityType || result.accountType || '').toLowerCase();
  }

  private selectedSavingsAccountId(): FineractId {
    return this.selectedSavingsAccount ? this.savingsAccountId(this.selectedSavingsAccount) : '';
  }

  private savingsAccountId(account: DepositSavingsAccount): FineractId {
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

  private clearSelectedAccount(): void {
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
