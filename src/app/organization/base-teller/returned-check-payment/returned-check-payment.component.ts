/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { finalize, forkJoin } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { environment } from 'environments/environment';
import {
  BaseTellerOption,
  BaseTellerService,
  FineractId,
  ReturnedCheckDetail,
  ReturnedCheckPaymentPayload,
  ReturnedCheckReceipt,
  ReturnedCheckSearchResult
} from '../base-teller.service';

type DenominationGroup = FormGroup<{
  value: FormControl<number | string | null>;
  quantity: FormControl<number | string | null>;
}>;

@Component({
  selector: 'mifosx-returned-check-payment',
  templateUrl: './returned-check-payment.component.html',
  styleUrls: ['./returned-check-payment.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatTableModule,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReturnedCheckPaymentComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private baseTellerService = inject(BaseTellerService);
  private authenticationService = inject(AuthenticationService);
  private settingsService = inject(SettingsService);
  private dateUtils = inject(Dates);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild(MatStepper) stepper?: MatStepper;

  readonly displayedColumns = [
    'checkNumber',
    'customerName',
    'amount',
    'returnedOnDate',
    'currencyCode',
    'status',
    'officeName',
    'action'
  ];
  readonly maxDate = this.settingsService.businessDate;

  searchForm = this.formBuilder.group({
    date: new FormControl<Date | string | null>(this.settingsService.businessDate, Validators.required),
    customerName: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
    tellerId: new FormControl<FineractId | null>(null, Validators.required),
    currencyCode: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
    selectedCheckId: new FormControl<FineractId | null>(null, Validators.required)
  });
  paymentForm = this.formBuilder.group({
    transactionDate: new FormControl<Date | string | null>(this.settingsService.businessDate, Validators.required),
    paymentTypeId: new FormControl<FineractId | null>(null, Validators.required),
    note: new FormControl<string>('', { nonNullable: true }),
    denominations: new FormArray<DenominationGroup>([])
  });

  tellers: BaseTellerOption[] = [];
  currencies: BaseTellerOption[] = [];
  cashPaymentTypes: BaseTellerOption[] = [];
  results: ReturnedCheckSearchResult[] = [];
  selectedCheck?: ReturnedCheckDetail;
  receipt?: ReturnedCheckReceipt;
  errorMessage = '';
  hasSearched = false;
  isLoadingOptions = false;
  isSearching = false;
  isLoadingDetail = false;
  isSubmitting = false;
  canRead = false;
  canCreate = false;
  private detailRequestId = 0;
  private idempotencyKey = this.createIdempotencyKey();

  get denominations(): FormArray<DenominationGroup> {
    return this.paymentForm.controls.denominations;
  }

  get totalCashUnits(): bigint {
    return this.denominations.controls.reduce((total: bigint, control: AbstractControl) => {
      const value = this.toMoneyUnits(control.get('value')?.value);
      const quantity = this.toQuantityUnits(control.get('quantity')?.value);
      return total + value * quantity;
    }, 0n);
  }

  get totalCashReceived(): number {
    return this.fromMoneyUnits(this.totalCashUnits);
  }

  get changeUnits(): bigint {
    return this.totalCashUnits - this.toMoneyUnits(this.selectedCheck?.amount);
  }

  get changeAmount(): number {
    return this.fromMoneyUnits(this.changeUnits);
  }

  get cashIsSufficient(): boolean {
    return !!this.selectedCheck && this.totalCashUnits >= this.toMoneyUnits(this.selectedCheck.amount);
  }

  ngOnInit(): void {
    this.canRead = this.hasPermission('READ_BASE_TELLER_RETURNED_CHECK_PAYMENT');
    this.canCreate = this.hasPermission('CREATE_BASE_TELLER_RETURNED_CHECK_PAYMENT');
    if (!this.canRead) {
      this.errorMessage = 'labels.text.You do not have permission to view returned check payments';
      return;
    }
    this.addDenomination();
    this.loadOptions();
  }

  loadOptions(): void {
    this.isLoadingOptions = true;
    forkJoin({
      tellers: this.baseTellerService.getReturnedCheckTellers(),
      currencies: this.baseTellerService.getReturnedCheckCurrencies(),
      paymentTypes: this.baseTellerService.getReturnedCheckPaymentTypes()
    })
      .pipe(
        finalize(() => {
          this.isLoadingOptions = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: ({ tellers, currencies, paymentTypes }) => {
          this.tellers = this.extractOptions(tellers);
          this.currencies = currencies.selectedCurrencyOptions ?? [];
          this.cashPaymentTypes = this.extractOptions(paymentTypes).filter(
            (paymentType: BaseTellerOption) => paymentType.isCashPayment === true
          );
          if (this.cashPaymentTypes.length === 1) {
            this.paymentForm.controls.paymentTypeId.setValue(this.cashPaymentTypes[0].id);
          }
        },
        error: (error: unknown) => {
          this.errorMessage =
            this.extractErrorMessage(error) || 'labels.text.Returned check options could not be loaded';
        }
      });
  }

  search(): void {
    this.errorMessage = '';
    this.hasSearched = false;
    this.invalidateDetailRequest();
    this.searchForm.controls.selectedCheckId.setValue(null);
    this.selectedCheck = undefined;
    this.results = [];
    const filters = this.searchForm.getRawValue();
    const filterControls = [
      this.searchForm.controls.date,
      this.searchForm.controls.customerName,
      this.searchForm.controls.tellerId,
      this.searchForm.controls.currencyCode
    ];
    filterControls.forEach((control: AbstractControl) => control.markAsTouched());
    if (filterControls.some((control: AbstractControl) => control.invalid)) {
      return;
    }

    this.isSearching = true;
    this.baseTellerService
      .searchReturnedChecks({
        date: this.formatSearchDate(filters.date),
        customerName: filters.customerName.trim(),
        tellerId: filters.tellerId as FineractId,
        currencyCode: filters.currencyCode,
        offset: 0,
        limit: 100
      })
      .pipe(
        finalize(() => {
          this.isSearching = false;
          this.hasSearched = true;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          this.results = response.pageItems ?? [];
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'labels.text.Returned check search failed';
        }
      });
  }

  clearSearch(): void {
    this.invalidateDetailRequest();
    this.searchForm.reset({
      date: this.settingsService.businessDate,
      customerName: '',
      tellerId: null,
      currencyCode: '',
      selectedCheckId: null
    });
    this.results = [];
    this.selectedCheck = undefined;
    this.hasSearched = false;
    this.errorMessage = '';
  }

  selectCheck(check: ReturnedCheckSearchResult): void {
    if (check.status !== 'RETURNED' || this.isLoadingDetail) {
      return;
    }
    this.errorMessage = '';
    this.isLoadingDetail = true;
    const requestId = ++this.detailRequestId;
    this.baseTellerService
      .getReturnedCheck(check.id)
      .pipe(
        finalize(() => {
          if (requestId === this.detailRequestId) {
            this.isLoadingDetail = false;
            this.cdr.markForCheck();
          }
        })
      )
      .subscribe({
        next: (detail: ReturnedCheckDetail) => {
          if (requestId !== this.detailRequestId) {
            return;
          }
          this.selectedCheck = detail;
          this.searchForm.controls.selectedCheckId.setValue(detail.id);
        },
        error: (error: unknown) => {
          if (requestId !== this.detailRequestId) {
            return;
          }
          this.errorMessage =
            this.extractErrorMessage(error) || 'labels.text.Returned check details could not be loaded';
        }
      });
  }

  addDenomination(): void {
    this.denominations.push(
      this.formBuilder.group({
        value: new FormControl<number | string | null>(null, [
          Validators.required,
          Validators.min(0.000001)
        ]),
        quantity: new FormControl<number | string | null>(0, [
          Validators.required,
          Validators.min(0),
          Validators.pattern(/^\d+$/)
        ])
      })
    );
  }

  removeDenomination(index: number): void {
    this.denominations.removeAt(index);
  }

  lineTotal(control: AbstractControl): number {
    const quantity = this.toQuantityUnits(control.get('quantity')?.value);
    return this.fromMoneyUnits(this.toMoneyUnits(control.get('value')?.value) * quantity);
  }

  finalizePayment(): void {
    this.errorMessage = '';
    if (
      this.isSubmitting ||
      !this.canCreate ||
      !this.selectedCheck ||
      this.paymentForm.invalid ||
      !this.cashIsSufficient
    ) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    this.receipt = undefined;
    this.isSubmitting = true;
    this.baseTellerService
      .settleReturnedCheck(this.selectedCheck.id, this.buildPayload())
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt: ReturnedCheckReceipt) => {
          this.receipt = receipt;
          if (receipt.status !== 'SETTLED') {
            this.errorMessage = receipt.failureMessage || 'labels.text.Returned check payment failed';
            return;
          }
          this.stepper?.next();
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'labels.text.Returned check payment failed';
        }
      });
  }

  buildPayload(): ReturnedCheckPaymentPayload {
    const formValue = this.paymentForm.getRawValue();
    return {
      idempotencyKey: this.idempotencyKey,
      locale: this.settingsService.language.code,
      dateFormat: this.settingsService.dateFormat,
      transactionDate:
        formValue.transactionDate instanceof Date
          ? this.dateUtils.formatDate(formValue.transactionDate, this.settingsService.dateFormat)
          : String(formValue.transactionDate),
      cashReceived: this.totalCashReceived,
      currencyCode: this.selectedCheck?.currencyCode ?? '',
      paymentTypeId: formValue.paymentTypeId as FineractId,
      note: formValue.note || undefined,
      denominations: this.denominations.controls.map((control: DenominationGroup) => {
        const value = this.fromMoneyUnits(this.toMoneyUnits(control.controls.value.value));
        return {
          denominationId: String(value),
          value,
          quantity: Number(control.controls.quantity.value)
        };
      })
    };
  }

  newOperation(): void {
    this.stepper?.reset();
    this.clearSearch();
    this.paymentForm.reset({
      transactionDate: this.settingsService.businessDate,
      paymentTypeId: this.cashPaymentTypes.length === 1 ? this.cashPaymentTypes[0].id : null,
      note: ''
    });
    this.denominations.clear();
    this.addDenomination();
    this.receipt = undefined;
    this.idempotencyKey = this.createIdempotencyKey();
  }

  printReceipt(): void {
    window.print();
  }

  statusTranslationKey(status: ReturnedCheckSearchResult['status']): string {
    return status === 'SETTLED' ? 'labels.inputs.Settled' : 'labels.inputs.Returned';
  }

  private formatSearchDate(value: Date | string | null): string {
    return value instanceof Date ? this.dateUtils.formatDate(value, 'yyyy-MM-dd') : String(value ?? '');
  }

  private invalidateDetailRequest(): void {
    this.detailRequestId++;
    this.isLoadingDetail = false;
  }

  private extractOptions(value: BaseTellerOption[] | { pageItems?: BaseTellerOption[] }): BaseTellerOption[] {
    return Array.isArray(value) ? value : (value.pageItems ?? []);
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
    const candidate = error as {
      error?: {
        defaultUserMessage?: string;
        developerMessage?: string;
        message?: string;
        errors?: Array<{ defaultUserMessage?: string; developerMessage?: string }>;
      };
      message?: string;
    };
    return (
      candidate?.error?.errors?.[0]?.defaultUserMessage ||
      candidate?.error?.errors?.[0]?.developerMessage ||
      candidate?.error?.defaultUserMessage ||
      candidate?.error?.developerMessage ||
      candidate?.error?.message ||
      candidate?.message ||
      ''
    );
  }

  private toMoneyUnits(value: unknown): bigint {
    const normalized = String(value ?? 0).trim();
    if (!/^\d+(\.\d+)?$/.test(normalized)) {
      return 0n;
    }
    const [
      whole,
      fraction = ''
    ] = normalized.split('.');
    return BigInt(whole) * 1000000n + BigInt((fraction + '000000').slice(0, 6));
  }

  private fromMoneyUnits(value: bigint): number {
    return Number(value) / 1000000;
  }

  private toQuantityUnits(value: unknown): bigint {
    const quantity = Number(value);
    return Number.isSafeInteger(quantity) && quantity >= 0 ? BigInt(quantity) : 0n;
  }

  private createIdempotencyKey(): string {
    return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `returned-check-${Date.now()}`;
  }
}
