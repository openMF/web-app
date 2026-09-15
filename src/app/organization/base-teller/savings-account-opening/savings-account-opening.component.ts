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
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDivider } from '@angular/material/divider';
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
import { catchError, debounceTime, distinctUntilChanged, EMPTY, finalize, map, of, switchMap } from 'rxjs';

/** Custom Imports */
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { OrganizationService } from '../../organization.service';
import { BaseTellerService } from '../base-teller.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';

type FundingType = 'CASH' | 'CHECK';

/**
 * Base Teller savings account opening workflow.
 */
@Component({
  selector: 'mifosx-base-teller-savings-account-opening',
  templateUrl: './savings-account-opening.component.html',
  styleUrls: ['./savings-account-opening.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatDivider,
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
export class SavingsAccountOpeningComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);
  private organizationService = inject(OrganizationService);
  private baseTellerService = inject(BaseTellerService);
  private authenticationService = inject(AuthenticationService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  customerForm: FormGroup;
  productForm: FormGroup;
  accountForm: FormGroup;
  fundingForm: FormGroup;

  customersData: any[] = [];
  customerPosition: any;
  productsData: any[] = [];
  paymentTypeOptions: any[] = [];
  denominationOptions: any[] = [];
  receipt: any;
  errorMessage = '';
  isSearchingCustomers = false;
  isLoadingPosition = false;
  isLoadingProducts = false;
  isSubmitting = false;
  canAccessWorkflow = false;
  private idempotencyKey = this.createIdempotencyKey();

  get denominations(): FormArray {
    return this.fundingForm.get('denominations') as FormArray;
  }

  get fundingType(): FundingType {
    return this.fundingForm?.get('fundingType')?.value;
  }

  get filteredPaymentTypeOptions(): any[] {
    if (this.fundingType !== 'CASH') {
      return this.paymentTypeOptions;
    }
    return this.paymentTypeOptions.filter((paymentType: any) => paymentType.isCashPayment === true);
  }

  get selectedCustomer(): any {
    return this.customerForm?.get('customer')?.value;
  }

  get selectedProduct(): any {
    return this.productForm?.get('product')?.value;
  }

  get selectedCustomerId(): string | number | undefined {
    return this.selectedCustomer?.id || this.selectedCustomer?.clientId;
  }

  get selectedProductId(): string | number | undefined {
    return this.selectedProduct?.id || this.selectedProduct?.productId;
  }

  get selectedCurrencyCode(): string {
    return (
      this.selectedProduct?.currency?.code ||
      this.selectedProduct?.currencyCode ||
      this.productForm?.get('currencyCode')?.value ||
      ''
    );
  }

  get denominationTotal(): number {
    const total = this.denominations.controls.reduce((sum: number, control: AbstractControl) => {
      const denomination = this.findDenomination(control.get('denomination')?.value);
      const value = this.denominationValue(denomination);
      const quantity = Number(control.get('quantity')?.value ?? 0);
      return sum + value * quantity;
    }, 0);
    return this.toMoneyAmount(total);
  }

  get fundingAmount(): number {
    return Number(this.fundingForm?.get('amount')?.value ?? 0);
  }

  get cashDenominationsReconcile(): boolean {
    return (
      this.fundingType !== 'CASH' ||
      (this.denominations.length > 0 &&
        this.toMoneyUnits(this.denominationTotal) === this.toMoneyUnits(this.fundingAmount))
    );
  }

  ngOnInit(): void {
    this.canAccessWorkflow = this.hasPermission('READ_TELLER');
    this.maxDate = this.settingsService.businessDate;
    this.createForms();
    if (!this.canAccessWorkflow) {
      this.errorMessage = 'labels.text.You do not have permission to open savings accounts through Base Teller';
      return;
    }
    this.watchForms();
    this.loadPaymentTypes();
  }

  createForms(): void {
    this.customerForm = this.formBuilder.group({
      customer: [
        '',
        Validators.required
      ]
    });
    this.productForm = this.formBuilder.group({
      product: [
        '',
        Validators.required
      ],
      currencyCode: [{ value: '', disabled: true }]
    });
    this.accountForm = this.formBuilder.group({
      submittedOnDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      externalId: [''],
      fieldOfficerId: [''],
      nominalAnnualInterestRate: [''],
      interestCompoundingPeriodType: [''],
      interestPostingPeriodType: [''],
      interestCalculationType: [''],
      interestCalculationDaysInYearType: [''],
      minRequiredOpeningBalance: [''],
      lockinPeriodFrequency: [''],
      lockinPeriodFrequencyType: [''],
      allowOverdraft: [false],
      enforceMinRequiredBalance: [false],
      approve: [true],
      activate: [true]
    });
    this.fundingForm = this.formBuilder.group({
      fundingType: [
        'CASH',
        Validators.required
      ],
      amount: [
        0,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],
      paymentTypeId: [
        '',
        Validators.required
      ],
      accountNumber: [''],
      checkType: [''],
      checkNumber: [''],
      routingCode: [''],
      receiptNumber: [''],
      bankNumber: [''],
      note: [''],
      denominations: this.formBuilder.array([])
    });
  }

  watchForms(): void {
    this.customerForm
      .get('customer')
      ?.valueChanges.pipe(
        map((value: any) => (typeof value === 'string' ? value.trim() : '')),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm: string) => {
          if (searchTerm.length < 2) {
            this.customersData = [];
            this.isSearchingCustomers = false;
            this.cdr.markForCheck();
            return EMPTY;
          }
          this.isSearchingCustomers = true;
          this.errorMessage = '';
          this.cdr.markForCheck();
          return this.baseTellerService.searchSavingsOpeningCustomers(searchTerm).pipe(
            catchError(() => {
              this.customersData = [];
              this.errorMessage = 'labels.text.Customer search failed';
              return of([]);
            }),
            finalize(() => {
              this.isSearchingCustomers = false;
              this.cdr.markForCheck();
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response: any) => {
        this.customersData = this.extractArray(response, [
          'customers',
          'clients',
          'pageItems',
          'data'
        ]);
      });

    this.productForm
      .get('product')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((product: any) => {
        if (product && typeof product === 'object') {
          this.productForm.get('currencyCode')?.setValue(product.currency?.code || product.currencyCode || '');
          this.applyProductDefaults(product);
        }
      });

    this.fundingForm
      .get('fundingType')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((fundingType: FundingType) => {
        this.applyFundingValidators(fundingType);
        this.syncSelectedPaymentType();
      });

    this.fundingForm
      .get('amount')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.fundingForm.updateValueAndValidity({ emitEvent: false }));
  }

  selectCustomer(customer: any): void {
    if (!customer || typeof customer !== 'object') {
      return;
    }
    this.customerPosition = null;
    this.productsData = [];
    this.productForm.reset({ product: '', currencyCode: '' });
    this.loadCustomerPosition(customer);
    this.loadProducts();
  }

  loadCustomerPosition(customer: any): void {
    this.isLoadingPosition = true;
    const customerId = customer.id || customer.clientId;
    this.baseTellerService
      .getSavingsOpeningCustomerPosition(customerId)
      .pipe(
        finalize(() => {
          this.isLoadingPosition = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (position: any) => {
          this.customerPosition = position;
        },
        error: () => {
          this.customerPosition = null;
          this.errorMessage = 'labels.text.Customer position could not be loaded';
        }
      });
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.baseTellerService
      .getSavingsOpeningProducts(this.productForm.get('currencyCode')?.value)
      .pipe(
        finalize(() => {
          this.isLoadingProducts = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response: any) => {
          this.productsData = this.extractArray(response, [
            'savingsProducts',
            'productOptions',
            'products',
            'pageItems',
            'data'
          ]);
          this.denominationOptions = this.extractArray(
            response,
            [
              'denominationOptions',
              'cashDenominationOptions',
              'denominations'
            ],
            false
          );
        },
        error: () => {
          this.productsData = [];
          this.denominationOptions = [];
          this.errorMessage = 'labels.text.Savings products could not be loaded';
        }
      });
  }

  loadPaymentTypes(): void {
    this.organizationService.getPaymentTypes().subscribe({
      next: (paymentTypes: any) => {
        this.paymentTypeOptions = this.extractArray(paymentTypes, [
          'paymentTypeOptions',
          'paymentTypes',
          'pageItems',
          'data'
        ]);
        this.syncSelectedPaymentType();
        this.cdr.markForCheck();
      },
      error: () => {
        this.paymentTypeOptions = [];
        this.errorMessage = 'labels.text.Payment types could not be loaded';
        this.cdr.markForCheck();
      }
    });
  }

  applyProductDefaults(product: any): void {
    const productDenominationOptions = this.extractArray(
      product,
      [
        'denominationOptions',
        'cashDenominationOptions',
        'denominations'
      ],
      false
    );
    if (productDenominationOptions.length) {
      this.denominationOptions = productDenominationOptions;
    }
    this.accountForm.patchValue({
      fieldOfficerId: product?.fieldOfficerId || '',
      nominalAnnualInterestRate: product?.nominalAnnualInterestRate ?? '',
      interestCompoundingPeriodType:
        product?.interestCompoundingPeriodType?.id ?? product?.interestCompoundingPeriodType ?? '',
      interestPostingPeriodType: product?.interestPostingPeriodType?.id ?? product?.interestPostingPeriodType ?? '',
      interestCalculationType: product?.interestCalculationType?.id ?? product?.interestCalculationType ?? '',
      interestCalculationDaysInYearType:
        product?.interestCalculationDaysInYearType?.id ?? product?.interestCalculationDaysInYearType ?? '',
      minRequiredOpeningBalance: product?.minRequiredOpeningBalance ?? product?.minimumOpeningBalance ?? ''
    });
    this.fundingForm.patchValue({
      paymentTypeId:
        this.filteredPaymentTypeOptions.length === 1
          ? this.filteredPaymentTypeOptions[0].id
          : this.fundingForm.value.paymentTypeId
    });
  }

  displayCustomer(customer: any): string {
    return customer
      ? `${customer.id || customer.clientId || ''} - ${customer.displayName || customer.fullname || customer.name || ''}`
      : '';
  }

  displayProduct(product: any): string {
    return product ? `${product.name || product.productName || ''}` : '';
  }

  addDenomination(): void {
    this.denominations.push(
      this.formBuilder.group({
        denomination: [
          '',
          Validators.required
        ],
        quantity: [
          1,
          [
            Validators.required,
            Validators.min(1)
          ]
        ]
      })
    );
  }

  removeDenomination(index: number): void {
    this.denominations.removeAt(index);
  }

  denominationLabel(denomination: any): string {
    return denomination?.label || denomination?.name || this.denominationValue(denomination) || '';
  }

  selectedDenominationLineTotal(control: AbstractControl): number {
    const denomination = this.findDenomination(control.get('denomination')?.value);
    const value = this.denominationValue(denomination);
    const quantity = Number(control.get('quantity')?.value ?? 0);
    return this.toMoneyAmount(value * quantity);
  }

  submit(): void {
    this.errorMessage = '';
    if (!this.customerForm.valid || !this.productForm.valid || !this.accountForm.valid || !this.fundingForm.valid) {
      return;
    }
    if (!this.cashDenominationsReconcile) {
      this.errorMessage = 'labels.text.Cash denomination total must equal the funding amount';
      return;
    }

    this.isSubmitting = true;
    this.baseTellerService
      .createSavingsAccountOpening(this.buildPayload())
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response: any) => {
          this.receipt = response?.receipt || response;
          this.errorMessage = '';
        },
        error: (error: any) => {
          this.errorMessage =
            error?.error?.defaultUserMessage ||
            error?.error?.message ||
            error?.message ||
            'Savings account opening failed.';
        }
      });
  }

  buildPayload(): any {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const accountValue = this.refineObject(this.accountForm.value);
    const fundingValue = this.refineObject(this.fundingForm.value);
    const { approve, activate, ...savingsAccountValue } = accountValue;
    const submittedOnDate =
      savingsAccountValue.submittedOnDate instanceof Date
        ? this.dateUtils.formatDate(savingsAccountValue.submittedOnDate, dateFormat)
        : savingsAccountValue.submittedOnDate;

    const initialFunding = this.refineObject({
      type: fundingValue.fundingType,
      amount: Number(fundingValue.amount),
      currencyCode: this.selectedCurrencyCode,
      paymentTypeId: fundingValue.paymentTypeId,
      receiptNumber: fundingValue.receiptNumber,
      note: fundingValue.note,
      denominations: this.buildDenominationsPayload(),
      check: this.buildCheckPayload(fundingValue)
    });

    return this.refineObject({
      idempotencyKey: this.idempotencyKey,
      clientId: this.selectedCustomerId,
      productId: this.selectedProductId,
      approve,
      activate,
      locale,
      dateFormat,
      transactionDate: this.dateUtils.formatDate(this.settingsService.businessDate, dateFormat),
      savingsAccount: {
        ...savingsAccountValue,
        submittedOnDate
      },
      initialFunding
    });
  }

  buildDenominationsPayload(): any[] | undefined {
    if (this.fundingType !== 'CASH' || !this.denominations.length) {
      return undefined;
    }
    return this.denominations.controls.map((control: AbstractControl) => {
      const denomination = this.findDenomination(control.get('denomination')?.value);
      return this.refineObject({
        denominationId: denomination?.denominationId ?? denomination?.id,
        value: this.denominationValue(denomination),
        quantity: Number(control.get('quantity')?.value)
      });
    });
  }

  buildCheckPayload(fundingValue: any): any | undefined {
    if (fundingValue.fundingType !== 'CHECK') {
      return undefined;
    }
    return this.refineObject({
      checkType: fundingValue.checkType,
      checkNumber: fundingValue.checkNumber,
      bank: fundingValue.bankNumber,
      accountNumber: fundingValue.accountNumber,
      routingCode: fundingValue.routingCode
    });
  }

  reviewReceipt(): void {
    const receiptNumber = this.receipt?.receiptNumber || this.receipt?.receiptNo;
    if (!receiptNumber) {
      return;
    }
    this.baseTellerService.getSavingsOpeningReceipt(receiptNumber).subscribe({
      next: (receipt: any) => {
        this.receipt = receipt;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'labels.text.Payment receipt could not be loaded';
        this.cdr.markForCheck();
      }
    });
  }

  printReceipt(): void {
    window.print();
  }

  private applyFundingValidators(fundingType: FundingType): void {
    const checkControls = [
      'accountNumber',
      'checkType',
      'checkNumber',
      'routingCode',
      'bankNumber'
    ];
    checkControls.forEach((controlName: string) => {
      const control = this.fundingForm.get(controlName);
      control?.clearValidators();
      if (fundingType === 'CHECK') {
        control?.addValidators(Validators.required);
      }
      control?.updateValueAndValidity({ emitEvent: false });
    });
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

  private syncSelectedPaymentType(): void {
    const paymentTypeControl = this.fundingForm.get('paymentTypeId');
    const selectedPaymentTypeId = paymentTypeControl?.value;
    const filteredOptions = this.filteredPaymentTypeOptions;
    if (
      selectedPaymentTypeId &&
      !filteredOptions.some((paymentType: any) => paymentType.id === selectedPaymentTypeId)
    ) {
      paymentTypeControl?.setValue('');
      return;
    }
    if (!selectedPaymentTypeId && filteredOptions.length === 1) {
      paymentTypeControl?.setValue(filteredOptions[0].id);
    }
  }

  private findDenomination(value: any): any {
    if (value && typeof value === 'object') {
      return value;
    }
    return (
      this.denominationOptions.find(
        (option: any) =>
          option.id === value || option.denominationId === value || this.denominationValue(option) === Number(value)
      ) || value
    );
  }

  private extractArray(response: any, keys: string[], includeTopLevelArray: boolean = true): any[] {
    if (includeTopLevelArray && Array.isArray(response)) {
      return response;
    }
    for (const key of keys) {
      if (Array.isArray(response?.[key])) {
        return response[key];
      }
    }
    return [];
  }

  private denominationValue(denomination: any): number {
    if (denomination === null || denomination === undefined || denomination === '') {
      return 0;
    }
    if (typeof denomination === 'number' || typeof denomination === 'string') {
      return Number(denomination) || 0;
    }
    return Number(
      denomination.value ?? denomination.amount ?? denomination.denominationValue ?? denomination.denomination ?? 0
    );
  }

  private toMoneyAmount(value: number): number {
    return this.toMoneyUnits(value) / 1000000;
  }

  private toMoneyUnits(value: number): number {
    return Math.round((Number(value) || 0) * 1000000);
  }

  private refineObject(dataObj: any): any {
    const refined = { ...dataObj };
    Object.keys(refined).forEach((key: string) => {
      if (refined[key] === null || refined[key] === undefined || refined[key] === '') {
        delete refined[key];
      }
    });
    return refined;
  }

  private createIdempotencyKey(): string {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `bt-savings-opening-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
