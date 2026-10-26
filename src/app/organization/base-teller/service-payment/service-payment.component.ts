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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatListModule } from '@angular/material/list';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { finalize, forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { environment } from 'environments/environment';
import {
  BaseTellerOption,
  BaseTellerService,
  DepositSearchResult,
  FineractId,
  ServicePaymentClient,
  ServicePaymentDenominationConfiguration,
  ServicePaymentPayerType,
  ServicePaymentQuote,
  ServicePaymentQuoteRequest,
  ServicePaymentReceipt,
  ServicePaymentRequest,
  ServicePaymentServiceConfiguration
} from '../base-teller.service';

type DenominationGroup = FormGroup<{
  denominationId: FormControl<string>;
  value: FormControl<string>;
  quantity: FormControl<number | null>;
}>;

@Component({
  selector: 'mifosx-service-payment',
  templateUrl: './service-payment.component.html',
  styleUrls: ['./service-payment.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButtonToggleModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicePaymentComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private baseTellerService = inject(BaseTellerService);
  private authenticationService = inject(AuthenticationService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild(MatStepper) stepper?: MatStepper;

  detailsForm = this.formBuilder.group({
    payerType: new FormControl<ServicePaymentPayerType>('CLIENT', { nonNullable: true }),
    clientSearch: new FormControl<string>('', { nonNullable: true }),
    payerName: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(250)] }),
    serviceId: new FormControl<FineractId | null>(null, Validators.required),
    serviceReference: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(200)
      ]
    }),
    baseAmount: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(0.000001),
        Validators.pattern(/^\d+(\.\d{1,6})?$/)
      ]
    })
  });
  cashForm = this.formBuilder.group({
    paymentTypeId: new FormControl<FineractId | null>(null, Validators.required),
    denominations: new FormArray<DenominationGroup>([])
  });

  services: ServicePaymentServiceConfiguration[] = [];
  cashPaymentTypes: BaseTellerOption[] = [];
  clientResults: DepositSearchResult[] = [];
  selectedClient?: ServicePaymentClient;
  quote?: ServicePaymentQuote;
  receipt?: ServicePaymentReceipt;
  selectedStepIndex = 0;
  errorMessage = '';
  isLoading = false;
  isSearchingClients = false;
  isResolvingClient = false;
  isQuoting = false;
  isSubmitting = false;
  isReprinting = false;
  hasSearchedClients = false;
  canRead = false;
  canCreate = false;
  private idempotencyKey = this.createIdempotencyKey();

  get denominations(): FormArray<DenominationGroup> {
    return this.cashForm.controls.denominations;
  }

  get selectedService(): ServicePaymentServiceConfiguration | undefined {
    return this.services.find((service) => String(service.id) === String(this.detailsForm.controls.serviceId.value));
  }

  get totalCashUnits(): bigint {
    return this.denominations.controls.reduce(
      (sum, denomination) =>
        sum + this.toUnits(denomination.controls.value.value) * this.toQuantity(denomination.controls.quantity.value),
      0n
    );
  }

  get totalCashReceived(): string {
    return this.fromUnits(this.totalCashUnits);
  }

  get changeUnits(): bigint {
    return this.totalCashUnits - this.toUnits(this.quote?.totalToPay);
  }

  get changeAmount(): string {
    return this.fromUnits(this.changeUnits);
  }

  get cashIsSufficient(): boolean {
    return !!this.quote && this.totalCashUnits >= this.toUnits(this.quote.totalToPay);
  }

  get payerIsValid(): boolean {
    return this.detailsForm.controls.payerType.value === 'CLIENT'
      ? !!this.selectedClient
      : !!this.detailsForm.controls.payerName.value.trim() && this.detailsForm.controls.payerName.valid;
  }

  ngOnInit(): void {
    this.canRead = this.hasPermission('READ_BASE_TELLER_SERVICE_PAYMENT');
    this.canCreate = this.hasPermission('CREATE_BASE_TELLER_SERVICE_PAYMENT');
    if (!this.canRead) {
      this.errorMessage = 'servicePayment.text.noReadPermission';
      return;
    }
    this.detailsForm.valueChanges.subscribe(() => {
      this.invalidateQuote();
      this.cdr.markForCheck();
    });
    this.loadConfiguration();
  }

  loadConfiguration(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.loadReceiptFromUrl();
    forkJoin({
      services: this.baseTellerService.getServicePaymentServices(),
      paymentTypes: this.baseTellerService.getReturnedCheckPaymentTypes()
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: ({ services, paymentTypes }) => {
          this.services = services;
          this.cashPaymentTypes = this.extractOptions(paymentTypes).filter((option) => option.isCashPayment === true);
          if (this.cashPaymentTypes.length === 1) {
            this.cashForm.controls.paymentTypeId.setValue(this.cashPaymentTypes[0].id);
          }
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'servicePayment.text.configurationError';
        }
      });
  }

  changePayerType(payerType: ServicePaymentPayerType): void {
    if (this.detailsForm.controls.payerType.value !== payerType) {
      this.detailsForm.controls.payerType.setValue(payerType);
    }
    this.selectedClient = undefined;
    this.clientResults = [];
    this.detailsForm.controls.clientSearch.setValue('');
    this.detailsForm.controls.payerName.setValue('');
    if (payerType === 'NON_CLIENT') {
      this.detailsForm.controls.payerName.addValidators(Validators.required);
    } else {
      this.detailsForm.controls.payerName.removeValidators(Validators.required);
    }
    this.detailsForm.controls.payerName.updateValueAndValidity();
  }

  searchClients(): void {
    const term = this.detailsForm.controls.clientSearch.value.trim();
    if (!term || this.isSearchingClients) {
      return;
    }
    this.errorMessage = '';
    this.hasSearchedClients = false;
    this.clientResults = [];
    if (this.selectedClient) {
      this.invalidateQuote();
    }
    this.selectedClient = undefined;
    this.isSearchingClients = true;
    this.baseTellerService
      .searchServicePaymentClients(term)
      .pipe(
        finalize(() => {
          this.isSearchingClients = false;
          this.hasSearchedClients = true;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          this.clientResults = Array.isArray(response) ? response : (response.pageItems ?? []);
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'servicePayment.text.clientSearchError';
        }
      });
  }

  selectClient(result: DepositSearchResult): void {
    const clientId = result.clientId ?? result.entityId ?? result.id;
    if (clientId === undefined || clientId === null || this.isResolvingClient) {
      return;
    }
    this.errorMessage = '';
    this.isResolvingClient = true;
    this.baseTellerService
      .getServicePaymentClient(clientId)
      .pipe(
        finalize(() => {
          this.isResolvingClient = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (client) => {
          this.selectedClient = client;
          this.clientResults = [];
          this.detailsForm.controls.clientSearch.setValue(client.displayName, { emitEvent: false });
          this.invalidateQuote();
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'servicePayment.text.clientError';
        }
      });
  }

  serviceChanged(): void {
    this.invalidateQuote();
    this.setDenominations(this.selectedService?.denominations ?? []);
  }

  requestQuote(): void {
    this.errorMessage = '';
    this.detailsForm.markAllAsTouched();
    if (this.detailsForm.invalid || !this.payerIsValid || !this.selectedService || this.isQuoting) {
      return;
    }
    const request = this.buildQuoteRequest();
    this.invalidateQuote();
    this.isQuoting = true;
    this.baseTellerService
      .quoteServicePayment(request)
      .pipe(
        finalize(() => {
          this.isQuoting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (quote) => {
          if (!this.quoteRequestMatchesCurrentContext(request)) {
            return;
          }
          this.quote = quote;
          this.setDenominations(this.selectedService?.denominations ?? []);
        },
        error: (error: unknown) => {
          if (!this.quoteRequestMatchesCurrentContext(request)) {
            return;
          }
          this.invalidateQuote();
          this.errorMessage = this.extractErrorMessage(error) || 'servicePayment.text.quoteError';
        }
      });
  }

  lineTotal(control: DenominationGroup): string {
    return this.fromUnits(
      this.toUnits(control.controls.value.value) * this.toQuantity(control.controls.quantity.value)
    );
  }

  finalizePayment(): void {
    this.errorMessage = '';
    if (this.isSubmitting || !this.canCreate || !this.quote || this.cashForm.invalid || !this.cashIsSufficient) {
      this.cashForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.baseTellerService
      .createServicePayment(this.buildPaymentRequest())
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => {
          this.receipt = receipt;
          this.selectedStepIndex = 3;
          this.stepper?.next();
          void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { transactionId: receipt.transactionId },
            replaceUrl: true
          });
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'servicePayment.text.paymentError';
        }
      });
  }

  reprintReceipt(): void {
    if (!this.receipt || this.isReprinting) {
      return;
    }
    this.isReprinting = true;
    this.errorMessage = '';
    this.baseTellerService
      .getServicePaymentReceipt(this.receipt.transactionId)
      .pipe(
        finalize(() => {
          this.isReprinting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => {
          this.receipt = receipt;
          setTimeout(() => window.print());
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'servicePayment.text.receiptError';
        }
      });
  }

  printReceipt(): void {
    window.print();
  }

  newPayment(): void {
    this.stepper?.reset();
    this.selectedStepIndex = 0;
    this.detailsForm.reset({
      payerType: 'CLIENT',
      clientSearch: '',
      payerName: '',
      serviceReference: '',
      baseAmount: ''
    });
    this.detailsForm.controls.payerName.removeValidators(Validators.required);
    this.detailsForm.controls.payerName.updateValueAndValidity();
    this.cashForm.controls.paymentTypeId.setValue(
      this.cashPaymentTypes.length === 1 ? this.cashPaymentTypes[0].id : null
    );
    this.denominations.clear();
    this.selectedClient = undefined;
    this.clientResults = [];
    this.quote = undefined;
    this.receipt = undefined;
    this.errorMessage = '';
    this.idempotencyKey = this.createIdempotencyKey();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { transactionId: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  clientName(result: DepositSearchResult): string {
    return result.displayName || result.entityName || result.name || result.accountNo || String(result.id ?? '');
  }

  private buildQuoteRequest(): ServicePaymentQuoteRequest {
    const values = this.detailsForm.getRawValue();
    const clientPayer = values.payerType === 'CLIENT';
    return {
      payerType: values.payerType,
      clientId: clientPayer ? this.selectedClient?.clientId : undefined,
      payerName: clientPayer ? undefined : values.payerName.trim(),
      serviceId: values.serviceId as FineractId,
      serviceReference: values.serviceReference.trim(),
      baseAmount: values.baseAmount,
      currencyCode: this.selectedService?.currencyCode ?? ''
    };
  }

  private buildPaymentRequest(): ServicePaymentRequest {
    return {
      ...this.buildQuoteRequest(),
      idempotencyKey: this.idempotencyKey,
      businessDate: this.quote?.businessDate ?? '',
      paymentTypeId: this.cashForm.controls.paymentTypeId.value as FineractId,
      denominations: this.denominations.controls
        .filter((control) => this.toQuantity(control.controls.quantity.value) > 0n)
        .map((control) => ({
          denominationId: control.controls.denominationId.value,
          value: control.controls.value.value,
          quantity: Number(this.toQuantity(control.controls.quantity.value))
        }))
    };
  }

  private invalidateQuote(): void {
    this.quote = undefined;
    this.idempotencyKey = this.createIdempotencyKey();
  }

  private quoteRequestMatchesCurrentContext(request: ServicePaymentQuoteRequest): boolean {
    const current = this.buildQuoteRequest();
    return (
      current.payerType === request.payerType &&
      current.clientId === request.clientId &&
      current.payerName === request.payerName &&
      String(current.serviceId) === String(request.serviceId) &&
      current.serviceReference === request.serviceReference &&
      current.baseAmount === request.baseAmount &&
      current.currencyCode === request.currencyCode
    );
  }

  private setDenominations(configurations: ServicePaymentDenominationConfiguration[]): void {
    this.denominations.clear();
    configurations.forEach((denomination) => {
      this.denominations.push(
        this.formBuilder.group({
          denominationId: new FormControl(denomination.identifier, { nonNullable: true }),
          value: new FormControl(String(denomination.value), { nonNullable: true }),
          quantity: new FormControl<number | null>(0, [
            Validators.required,
            Validators.min(0),
            Validators.pattern(/^\d+$/)
          ])
        })
      );
    });
  }

  private extractOptions(value: BaseTellerOption[] | { pageItems?: BaseTellerOption[] }): BaseTellerOption[] {
    return Array.isArray(value) ? value : (value.pageItems ?? []);
  }

  private loadReceiptFromUrl(): void {
    const transactionId = this.route.snapshot.queryParamMap.get('transactionId');
    if (!transactionId || !/^\d+$/.test(transactionId)) {
      return;
    }
    this.isReprinting = true;
    this.baseTellerService
      .getServicePaymentReceipt(transactionId)
      .pipe(
        finalize(() => {
          this.isReprinting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => {
          this.receipt = receipt;
          this.selectedStepIndex = 3;
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'servicePayment.text.receiptError';
        }
      });
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
    const normalized = String(value ?? '0').trim();
    const match = normalized.match(/^(-?)(\d+)(?:\.(\d{1,6}))?$/);
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

  private createIdempotencyKey(): string {
    return globalThis.crypto?.randomUUID?.() ?? `service-payment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
