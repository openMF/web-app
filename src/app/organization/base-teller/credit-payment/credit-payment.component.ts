/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { finalize } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { environment } from 'environments/environment';
import {
  BaseTellerOption,
  BaseTellerService,
  CreditPaymentBank,
  CreditPaymentCheckClassification,
  CreditPaymentContext,
  CreditPaymentCustomer,
  CreditPaymentDenominationConfiguration,
  CreditPaymentLoan,
  CreditPaymentMethod,
  CreditPaymentPreview,
  CreditPaymentReceipt,
  CreditPaymentRequest,
  CreditPaymentTransaction,
  CreditPaymentTransitionRequest,
  FineractId
} from '../base-teller.service';

type DenominationGroup = FormGroup<{
  denominationId: FormControl<string>;
  value: FormControl<string>;
  quantity: FormControl<number | null>;
}>;

@Component({
  selector: 'mifosx-credit-payment',
  templateUrl: './credit-payment.component.html',
  styleUrls: ['./credit-payment.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButtonToggleModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatTabsModule,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditPaymentComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private baseTellerService = inject(BaseTellerService);
  private authenticationService = inject(AuthenticationService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild(MatStepper) stepper?: MatStepper;

  customerForm = this.formBuilder.group({
    search: new FormControl('', { nonNullable: true, validators: Validators.required })
  });
  paymentForm = this.formBuilder.group({
    paymentMethod: new FormControl<CreditPaymentMethod>('CASH', { nonNullable: true }),
    amount: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(0.000001),
        Validators.pattern(/^\d+(\.\d{1,6})?$/)
      ]
    }),
    paymentTypeId: new FormControl<FineractId | null>(null, Validators.required),
    note: new FormControl('', { nonNullable: true, validators: Validators.maxLength(500) })
  });
  cashForm = this.formBuilder.group({
    denominations: new FormArray<DenominationGroup>([])
  });
  checkForm = this.formBuilder.group({
    bankId: new FormControl<FineractId | null>(null, Validators.required),
    checkType: new FormControl('', { nonNullable: true, validators: Validators.required }),
    checkNumber: new FormControl('', { nonNullable: true, validators: Validators.required }),
    accountNumber: new FormControl('', { nonNullable: true }),
    routingCode: new FormControl('', { nonNullable: true }),
    classification: new FormControl<CreditPaymentCheckClassification>('SUBJECT_TO_COLLECTION', {
      nonNullable: true,
      validators: Validators.required
    })
  });
  returnForm = this.formBuilder.group({
    reason: new FormControl('', { nonNullable: true, validators: Validators.required })
  });

  context?: CreditPaymentContext;
  customers: CreditPaymentCustomer[] = [];
  loans: CreditPaymentLoan[] = [];
  selectedCustomer?: CreditPaymentCustomer;
  selectedLoan?: CreditPaymentLoan;
  preview?: CreditPaymentPreview;
  receipt?: CreditPaymentReceipt;
  selectedStepIndex = 0;
  errorMessage = '';
  isLoading = false;
  isSearching = false;
  isLoadingLoans = false;
  isLoadingLoan = false;
  isPreviewing = false;
  isSubmitting = false;
  isLoadingReceipt = false;
  isTransitioning = false;
  hasSearched = false;
  canRead = false;
  canCreate = false;
  canReprint = false;
  canClear = false;
  canReturn = false;
  private createIdempotencyKey = this.newIdempotencyKey('credit-payment');
  private clearIdempotencyKey?: string;
  private returnIdempotencyKey?: string;

  get denominations(): FormArray<DenominationGroup> {
    return this.cashForm.controls.denominations;
  }

  get paymentMethod(): CreditPaymentMethod {
    return this.paymentForm.controls.paymentMethod.value;
  }

  get banks(): CreditPaymentBank[] {
    return this.context?.banks ?? [];
  }

  get selectedBank(): CreditPaymentBank | undefined {
    return this.banks.find((bank) => String(bank.id) === String(this.checkForm.controls.bankId.value));
  }

  get paymentTypes(): BaseTellerOption[] {
    const isCash = this.paymentMethod === 'CASH';
    return (this.context?.paymentTypes ?? []).filter((type) => type.isCashPayment === isCash);
  }

  get totalCashUnits(): bigint {
    return this.denominations.controls.reduce(
      (sum, denomination) =>
        sum + this.toUnits(denomination.controls.value.value) * this.toQuantity(denomination.controls.quantity.value),
      0n
    );
  }

  get totalCash(): string {
    return this.fromUnits(this.totalCashUnits);
  }

  get changeAmount(): string {
    return this.fromUnits(this.totalCashUnits - this.toUnits(this.paymentForm.controls.amount.value));
  }

  get cashIsSufficient(): boolean {
    return this.totalCashUnits >= this.toUnits(this.paymentForm.controls.amount.value);
  }

  get paymentDetailsValid(): boolean {
    if (this.paymentForm.invalid || !this.selectedLoan) {
      return false;
    }
    return this.paymentMethod === 'CASH'
      ? this.denominations.length > 0 && this.cashForm.valid && this.cashIsSufficient
      : this.checkForm.valid;
  }

  get schedulePeriods() {
    return this.selectedLoan?.repaymentSchedule?.periods ?? [];
  }

  get transactions(): CreditPaymentTransaction[] {
    return this.selectedLoan?.transactions ?? [];
  }

  ngOnInit(): void {
    this.canRead = this.hasPermission('READ_BASE_TELLER_CREDIT_PAYMENT');
    this.canCreate = this.hasPermission('CREATE_BASE_TELLER_CREDIT_PAYMENT') && this.hasPermission('REPAYMENT_LOAN');
    this.canReprint = this.hasPermission('REPRINT_BASE_TELLER_CREDIT_PAYMENT');
    this.canClear = this.hasPermission('AUTHORIZE_BASE_TELLER_CHECK_CLEARING') && this.hasPermission('REPAYMENT_LOAN');
    this.canReturn = this.hasPermission('RETURN_BASE_TELLER_CREDIT_PAYMENT_CHECK');
    if (!this.canRead) {
      this.errorMessage = 'creditPayment.errors.noReadPermission';
      return;
    }
    this.paymentForm.valueChanges.subscribe(() => this.invalidatePreview());
    this.cashForm.valueChanges.subscribe(() => this.invalidatePreview());
    this.checkForm.valueChanges.subscribe(() => this.invalidatePreview());
    this.loadContext();
  }

  loadContext(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.baseTellerService
      .getCreditPaymentContext()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (context) => {
          this.context = context;
          this.methodChanged();
          this.loadReceiptFromUrl();
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'creditPayment.errors.configuration';
        }
      });
  }

  searchCustomers(): void {
    const search = this.customerForm.controls.search.value.trim();
    if (!search || this.isSearching) {
      this.customerForm.markAllAsTouched();
      return;
    }
    this.resetCustomerSelection();
    this.isSearching = true;
    this.hasSearched = false;
    this.errorMessage = '';
    this.baseTellerService
      .searchCreditPaymentCustomers(search)
      .pipe(
        finalize(() => {
          this.isSearching = false;
          this.hasSearched = true;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (customers) => (this.customers = customers),
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'creditPayment.errors.customerSearch';
        }
      });
  }

  selectCustomer(customer: CreditPaymentCustomer): void {
    if (this.isLoadingLoans) {
      return;
    }
    this.selectedCustomer = customer;
    this.selectedLoan = undefined;
    this.loans = [];
    this.customers = [];
    this.customerForm.controls.search.setValue(customer.displayName, { emitEvent: false });
    this.isLoadingLoans = true;
    this.errorMessage = '';
    this.baseTellerService
      .getCreditPaymentLoans(customer.clientId)
      .pipe(
        finalize(() => {
          this.isLoadingLoans = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (loans) => {
          if (String(this.selectedCustomer?.clientId) !== String(customer.clientId)) {
            return;
          }
          this.loans = loans.filter((loan) => loan.payable);
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'creditPayment.errors.loanList';
        }
      });
  }

  selectLoan(loan: CreditPaymentLoan): void {
    if (this.isLoadingLoan) {
      return;
    }
    const customerId = this.selectedCustomer?.clientId;
    this.isLoadingLoan = true;
    this.errorMessage = '';
    this.baseTellerService
      .getCreditPaymentLoan(loan.id)
      .pipe(
        finalize(() => {
          this.isLoadingLoan = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (details) => {
          if (
            customerId === undefined ||
            String(this.selectedCustomer?.clientId) !== String(customerId) ||
            String(details.clientId) !== String(customerId) ||
            String(details.id) !== String(loan.id)
          ) {
            return;
          }
          this.selectedLoan = details;
          this.setDenominations();
          this.methodChanged();
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'creditPayment.errors.loanDetails';
        }
      });
  }

  methodChanged(): void {
    this.paymentForm.controls.paymentTypeId.setValue(this.paymentTypes.length === 1 ? this.paymentTypes[0].id : null, {
      emitEvent: false
    });
    this.invalidatePreview();
  }

  lineTotal(denomination: DenominationGroup): string {
    return this.fromUnits(
      this.toUnits(denomination.controls.value.value) * this.toQuantity(denomination.controls.quantity.value)
    );
  }

  requestPreview(): void {
    this.paymentForm.markAllAsTouched();
    this.cashForm.markAllAsTouched();
    this.checkForm.markAllAsTouched();
    if (!this.paymentDetailsValid || this.isPreviewing) {
      return;
    }
    this.isPreviewing = true;
    this.errorMessage = '';
    const request = this.buildRequest(false);
    this.baseTellerService
      .previewCreditPayment(request)
      .pipe(
        finalize(() => {
          this.isPreviewing = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (preview) => {
          this.createIdempotencyKey = this.newIdempotencyKey('credit-payment');
          this.preview = preview;
          this.selectedStepIndex = 3;
          this.stepper?.next();
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'creditPayment.errors.preview';
        }
      });
  }

  submitPayment(): void {
    if (!this.preview || !this.canCreate || this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    this.baseTellerService
      .createCreditPayment(this.buildRequest(true))
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => this.showReceipt(receipt),
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'creditPayment.errors.submit';
        }
      });
  }

  retrieveReceipt(printAfterLoad = false): void {
    if (!this.receipt || this.isLoadingReceipt) {
      return;
    }
    this.isLoadingReceipt = true;
    this.errorMessage = '';
    this.baseTellerService
      .getCreditPaymentReceipt(this.receipt.receiptNumber)
      .pipe(
        finalize(() => {
          this.isLoadingReceipt = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => {
          this.receipt = receipt;
          if (printAfterLoad) {
            setTimeout(() => window.print());
          }
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'creditPayment.errors.receipt';
        }
      });
  }

  clearCheck(): void {
    if (!this.canClear || !this.canTransitionCheck() || this.isTransitioning) {
      return;
    }
    this.clearIdempotencyKey ??= this.newIdempotencyKey('credit-check-clear');
    this.transitionCheck(
      this.baseTellerService.clearCreditPaymentCheck(
        this.receipt?.check?.id as FineractId,
        this.transitionRequest(this.clearIdempotencyKey)
      )
    );
  }

  returnCheck(): void {
    this.returnForm.markAllAsTouched();
    if (!this.canReturn || !this.canTransitionCheck() || this.returnForm.invalid || this.isTransitioning) {
      return;
    }
    this.returnIdempotencyKey ??= this.newIdempotencyKey('credit-check-return');
    this.transitionCheck(
      this.baseTellerService.returnCreditPaymentCheck(
        this.receipt?.check?.id as FineractId,
        this.transitionRequest(this.returnIdempotencyKey, this.returnForm.controls.reason.value.trim())
      )
    );
  }

  printReceipt(): void {
    window.print();
  }

  newPayment(): void {
    this.stepper?.reset();
    this.selectedStepIndex = 0;
    this.customerForm.reset({ search: '' });
    this.paymentForm.reset({ paymentMethod: 'CASH', amount: '', paymentTypeId: null, note: '' });
    this.checkForm.reset({
      bankId: null,
      checkType: '',
      checkNumber: '',
      accountNumber: '',
      routingCode: '',
      classification: 'SUBJECT_TO_COLLECTION'
    });
    this.returnForm.reset({ reason: '' });
    this.customers = [];
    this.loans = [];
    this.selectedCustomer = undefined;
    this.selectedLoan = undefined;
    this.preview = undefined;
    this.receipt = undefined;
    this.denominations.clear();
    this.createIdempotencyKey = this.newIdempotencyKey('credit-payment');
    this.clearIdempotencyKey = undefined;
    this.returnIdempotencyKey = undefined;
    this.methodChanged();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { receiptNumber: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  displayDate(value: string | number[] | undefined): string {
    return Array.isArray(value) ? value.join('-') : (value ?? '');
  }

  transactionType(transaction: CreditPaymentTransaction): string {
    return typeof transaction.type === 'string'
      ? transaction.type
      : (transaction.type?.value ?? transaction.type?.code ?? '');
  }

  private buildRequest(includeIdempotencyKey: boolean): CreditPaymentRequest {
    const payment = this.paymentForm.getRawValue();
    const request: CreditPaymentRequest = {
      clientId: this.selectedCustomer?.clientId as FineractId,
      loanId: this.selectedLoan?.id as FineractId,
      paymentMethod: payment.paymentMethod,
      amount: payment.amount,
      currencyCode: this.selectedLoan?.currencyCode ?? '',
      paymentTypeId: payment.paymentTypeId as FineractId,
      transactionDate: this.context?.businessDate ?? '',
      dateFormat: 'yyyy-MM-dd',
      locale: 'en',
      note: payment.note.trim() || undefined
    };
    if (includeIdempotencyKey) {
      request.idempotencyKey = this.createIdempotencyKey;
    }
    if (payment.paymentMethod === 'CASH') {
      request.denominations = this.denominations.controls.map((denomination) => ({
        denominationId: denomination.controls.denominationId.value,
        value: denomination.controls.value.value,
        quantity: Number(this.toQuantity(denomination.controls.quantity.value))
      }));
    } else {
      const check = this.checkForm.getRawValue();
      request.check = {
        bankId: check.bankId as FineractId,
        checkType: check.checkType.trim(),
        checkNumber: check.checkNumber.trim(),
        accountNumber: check.accountNumber.trim() || undefined,
        routingCode: check.routingCode.trim() || undefined,
        classification: check.classification
      };
    }
    return request;
  }

  private transitionRequest(idempotencyKey: string, reason?: string): CreditPaymentTransitionRequest {
    return {
      idempotencyKey,
      transactionDate: this.context?.businessDate ?? this.receipt?.businessDate ?? '',
      dateFormat: 'yyyy-MM-dd',
      locale: 'en',
      reason
    };
  }

  private transitionCheck(request: ReturnType<BaseTellerService['clearCreditPaymentCheck']>): void {
    this.isTransitioning = true;
    this.errorMessage = '';
    request
      .pipe(
        finalize(() => {
          this.isTransitioning = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => {
          this.receipt = receipt;
          if (receipt.status === 'CLEARED') {
            this.refreshSelectedLoan();
          }
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'creditPayment.errors.transition';
        }
      });
  }

  private showReceipt(receipt: CreditPaymentReceipt): void {
    this.receipt = receipt;
    this.selectedStepIndex = 4;
    this.stepper?.next();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { receiptNumber: receipt.receiptNumber },
      replaceUrl: true
    });
  }

  private loadReceiptFromUrl(): void {
    const receiptNumber = this.route.snapshot.queryParamMap.get('receiptNumber');
    if (!receiptNumber || !this.canReprint) {
      return;
    }
    this.isLoadingReceipt = true;
    this.baseTellerService
      .getCreditPaymentReceipt(receiptNumber)
      .pipe(
        finalize(() => {
          this.isLoadingReceipt = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => this.showReceipt(receipt),
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'creditPayment.errors.receipt';
        }
      });
  }

  private refreshSelectedLoan(): void {
    if (!this.selectedLoan) {
      return;
    }
    this.baseTellerService.getCreditPaymentLoan(this.selectedLoan.id).subscribe({
      next: (loan) => {
        this.selectedLoan = loan;
        this.cdr.markForCheck();
      }
    });
  }

  private canTransitionCheck(): boolean {
    return this.receipt?.status === 'PENDING_COLLECTION' && this.receipt.check?.status === 'PENDING_COLLECTION';
  }

  private setDenominations(): void {
    this.denominations.clear();
    const currency = this.selectedLoan?.currencyCode;
    (this.context?.denominations ?? [])
      .filter((denomination) => denomination.currencyCode === currency)
      .forEach((denomination) => this.denominations.push(this.denominationControl(denomination)));
  }

  private denominationControl(denomination: CreditPaymentDenominationConfiguration): DenominationGroup {
    return this.formBuilder.group({
      denominationId: new FormControl(denomination.identifier, { nonNullable: true }),
      value: new FormControl(String(denomination.value), { nonNullable: true }),
      quantity: new FormControl<number | null>(0, [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^\d+$/)
      ])
    });
  }

  private resetCustomerSelection(): void {
    this.customers = [];
    this.loans = [];
    this.selectedCustomer = undefined;
    this.selectedLoan = undefined;
    this.denominations.clear();
    this.invalidatePreview();
  }

  private invalidatePreview(): void {
    if (this.receipt) {
      return;
    }
    this.preview = undefined;
  }

  private hasPermission(permission: string): boolean {
    if (!environment.productionModeEnableRBAC) {
      return true;
    }
    const permissions = this.authenticationService.getCredentials()?.permissions ?? [];
    return (
      permissions.includes('ALL_FUNCTIONS') ||
      (permission.startsWith('READ_') && permissions.includes('ALL_FUNCTIONS_READ')) ||
      permissions.includes(permission)
    );
  }

  private extractErrorMessage(error: unknown): string {
    const response = error as {
      error?: {
        defaultUserMessage?: string;
        developerMessage?: string;
        message?: string;
        errors?: Array<{ defaultUserMessage?: string; developerMessage?: string }>;
      };
    };
    return (
      response?.error?.errors?.[0]?.defaultUserMessage ||
      response?.error?.errors?.[0]?.developerMessage ||
      response?.error?.defaultUserMessage ||
      response?.error?.developerMessage ||
      response?.error?.message ||
      ''
    );
  }

  private toUnits(value: unknown): bigint {
    const match = String(value ?? '0')
      .trim()
      .match(/^(-?)(\d+)(?:\.(\d{1,6}))?$/);
    if (!match) {
      return 0n;
    }
    const units = BigInt(match[2]) * 1_000_000n + BigInt((match[3] ?? '').padEnd(6, '0'));
    return match[1] ? -units : units;
  }

  private fromUnits(units: bigint): string {
    const negative = units < 0n;
    const absolute = negative ? -units : units;
    const fraction = String(absolute % 1_000_000n)
      .padStart(6, '0')
      .replace(/0+$/, '');
    return `${negative ? '-' : ''}${absolute / 1_000_000n}${fraction ? `.${fraction}` : ''}`;
  }

  private toQuantity(value: unknown): bigint {
    const normalized = String(value ?? '0').trim();
    return /^\d+$/.test(normalized) ? BigInt(normalized) : 0n;
  }

  private newIdempotencyKey(prefix: string): string {
    return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
