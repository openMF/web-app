/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, map, of, Subscription, switchMap, tap } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';
import {
  BaseTellerService,
  CashAllocationCashier,
  CashAllocationContext,
  CashAllocationCurrency,
  CashAllocationDenomination,
  CashAllocationPreview,
  CashAllocationReceipt,
  CashAllocationRequest,
  CashAllocationType,
  FineractId
} from '../base-teller.service';
import { CashAllocationConfirmDialogComponent } from './cash-allocation-confirm-dialog.component';

type DenominationGroup = FormGroup<{
  denominationId: FormControl<string>;
  type: FormControl<string>;
  value: FormControl<string>;
  quantity: FormControl<number | null>;
}>;

const integerValidator = (control: AbstractControl): ValidationErrors | null =>
  control.value === null || (Number.isInteger(control.value) && control.value >= 0) ? null : { integer: true };

@Component({
  selector: 'mifosx-cash-allocation',
  templateUrl: './cash-allocation.component.html',
  styleUrls: ['./cash-allocation.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashAllocationComponent implements OnInit, OnDestroy {
  private formBuilder = inject(FormBuilder);
  private baseTellerService = inject(BaseTellerService);
  private authenticationService = inject(AuthenticationService);
  private settingsService = inject(SettingsService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  readonly operationTypes: CashAllocationType[] = [
    'SAFE_VAULT_OPENING',
    'HEAD_CASHIER_ALLOCATION',
    'OPERATIONAL_TELLER_ALLOCATION'
  ];

  readonly allocationForm = this.formBuilder.group({
    operationType: new FormControl<CashAllocationType>('SAFE_VAULT_OPENING', { nonNullable: true }),
    currencyCode: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
    sourceCashierId: new FormControl<FineractId | null>(null),
    destinationCashierId: new FormControl<FineractId | null>(null),
    note: new FormControl<string>('', { nonNullable: true, validators: Validators.maxLength(500) }),
    denominations: new FormArray<DenominationGroup>([])
  });

  context?: CashAllocationContext;
  receipt?: CashAllocationReceipt;
  isLoading = false;
  isPreviewing = false;
  isPosting = false;
  isReprinting = false;
  errorMessage = '';
  canRead = false;
  canCreate = false;
  canReprint = false;
  contextLoadFailed = false;
  private contextSubscription?: Subscription;
  private contextScope = '';
  private pendingRequest?: CashAllocationRequest;
  private pendingSignature = '';
  private pendingAllocationId?: FineractId;
  private postAttempted = false;

  get denominations(): FormArray<DenominationGroup> {
    return this.allocationForm.controls.denominations;
  }

  get operationType(): CashAllocationType {
    return this.allocationForm.controls.operationType.value;
  }

  get selectedCurrency(): CashAllocationCurrency | undefined {
    const code = this.allocationForm.controls.currencyCode.value;
    return this.context?.currencies.find((currency) => currency.code === code);
  }

  get sourceCashiers(): CashAllocationCashier[] {
    return (this.context?.cashiers ?? []).filter((cashier) => cashier.headCashierSource);
  }

  get destinationCashiers(): CashAllocationCashier[] {
    const sourceId = this.allocationForm.controls.sourceCashierId.value;
    return (this.context?.cashiers ?? []).filter((cashier) => String(cashier.cashierId) !== String(sourceId));
  }

  get total(): string {
    const precision = this.selectedCurrency?.decimalPlaces ?? 0;
    const totalUnits = this.denominations.controls.reduce(
      (sum, denomination) =>
        sum +
        this.toUnits(denomination.controls.value.value, precision) * BigInt(denomination.controls.quantity.value ?? 0),
      0n
    );
    return this.fromUnits(totalUnits, precision);
  }

  get canPreview(): boolean {
    return (
      this.canCreate &&
      !this.isLoading &&
      !this.contextLoadFailed &&
      !!this.selectedCurrency &&
      this.contextScope === this.currentContextScope() &&
      !this.isPreviewing &&
      !this.isPosting &&
      this.allocationForm.valid &&
      this.hasRequiredCashiers() &&
      this.denominations.length > 0 &&
      this.totalUnits > 0n
    );
  }

  get canRetryPost(): boolean {
    return (
      ((this.postAttempted && !!this.pendingRequest) || this.pendingAllocationId !== undefined) &&
      !this.isPosting &&
      !this.receipt
    );
  }

  ngOnInit(): void {
    this.canRead = this.hasPermission('READ_BASE_TELLER_CASH_ALLOCATION');
    this.canCreate = this.hasPermission('CREATE_BASE_TELLER_CASH_ALLOCATION');
    this.canReprint = this.hasPermission('REPRINT_BASE_TELLER_CASH_ALLOCATION');
    if (!this.canRead) {
      this.errorMessage = 'cashAllocation.errors.noReadPermission';
      return;
    }
    this.loadContext();
  }

  ngOnDestroy(): void {
    this.contextSubscription?.unsubscribe();
  }

  retryContext(): void {
    this.loadContext();
  }

  operationChanged(): void {
    this.allocationForm.patchValue({ sourceCashierId: null, destinationCashierId: null });
    this.clearPendingRequest();
  }

  currencyChanged(): void {
    const currencyCode = this.allocationForm.controls.currencyCode.value;
    this.clearPendingRequest();
    this.loadContext(currencyCode);
  }

  lineTotal(control: DenominationGroup): string {
    const precision = this.selectedCurrency?.decimalPlaces ?? 0;
    return this.fromUnits(
      this.toUnits(control.controls.value.value, precision) * BigInt(control.controls.quantity.value ?? 0),
      precision
    );
  }

  preview(): void {
    this.errorMessage = '';
    this.allocationForm.markAllAsTouched();
    if (!this.canPreview) {
      return;
    }
    const request = this.buildRequest();
    this.isPreviewing = true;
    this.baseTellerService
      .previewCashAllocation(request)
      .pipe(
        finalize(() => {
          this.isPreviewing = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (preview) => this.openConfirmation(preview, request),
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'cashAllocation.errors.preview';
        }
      });
  }

  retryPosting(): void {
    if (this.pendingAllocationId !== undefined) {
      this.retrieveCreatedAllocation(this.pendingAllocationId);
    } else if (this.postAttempted && this.pendingRequest) {
      this.post(this.pendingRequest);
    }
  }

  printReceipt(): void {
    if (!this.receipt || this.isReprinting) {
      return;
    }
    this.isReprinting = true;
    this.errorMessage = '';
    this.baseTellerService
      .getCashAllocation(this.receipt.id)
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
          this.errorMessage = this.extractErrorMessage(error) || 'cashAllocation.errors.receipt';
        }
      });
  }

  reprintReceipt(): void {
    if (!this.receipt || !this.canReprint || this.isReprinting) {
      return;
    }
    this.isReprinting = true;
    this.errorMessage = '';
    this.baseTellerService
      .reprintCashAllocationReceipt(this.receipt.id)
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
          this.errorMessage = this.extractErrorMessage(error) || 'cashAllocation.errors.receipt';
        }
      });
  }

  newOperation(): void {
    this.receipt = undefined;
    this.errorMessage = '';
    this.clearPendingRequest();
    this.allocationForm.patchValue({
      sourceCashierId: null,
      destinationCashierId: null,
      note: ''
    });
    this.denominations.controls.forEach((control) => control.controls.quantity.setValue(0));
    this.loadContext();
  }

  private loadContext(currencyCode?: string): void {
    // Cancel before starting the next request so a slow response cannot overwrite a newer selection.
    this.contextSubscription?.unsubscribe();
    this.setDenominations([]);
    this.clearPendingRequest();
    this.errorMessage = '';
    this.contextLoadFailed = false;
    const officeId = this.authenticationService.getCredentials()?.officeId;
    const scope = this.currentContextScope();
    if (scope !== this.contextScope) {
      this.context = undefined;
      this.allocationForm.controls.currencyCode.setValue('');
      currencyCode = undefined;
      this.contextScope = scope;
    }
    if (!Number.isSafeInteger(officeId) || officeId <= 0) {
      this.context = undefined;
      this.allocationForm.controls.currencyCode.setValue('');
      this.contextLoadFailed = true;
      this.errorMessage = 'cashAllocation.errors.office';
      return;
    }
    this.isLoading = true;
    // Only the unfiltered context defines the available currencies for this office and tenant.
    const catalog = this.context?.currencies ?? [];
    this.contextSubscription = this.baseTellerService
      .getCashAllocationContext(officeId, currencyCode)
      .pipe(
        switchMap((context) => {
          if (scope !== this.currentContextScope() || String(context.officeId) !== String(officeId)) {
            throw new Error('cashAllocation.errors.office');
          }
          const currencies = Array.from(
            new Map(
              context.currencies.map((currency) => [
                currency.code,
                currency
              ])
            ).values()
          );
          if (currencyCode) {
            return of(this.mergeCurrencyContext(context, catalog, currencyCode));
          }
          this.context = { ...context, currencies };
          this.cdr.markForCheck();
          const previousCode = this.allocationForm.controls.currencyCode.value;
          if (currencies.length === 0) {
            this.allocationForm.controls.currencyCode.setValue('');
            return of(this.context);
          }
          if (previousCode && !currencies.some((currency) => currency.code === previousCode)) {
            this.allocationForm.controls.currencyCode.setValue('');
            throw new Error('cashAllocation.errors.currencyUnavailable');
          }
          const selectedCode = previousCode || currencies[0].code;
          this.allocationForm.controls.currencyCode.setValue(selectedCode);
          return this.baseTellerService
            .getCashAllocationContext(officeId, selectedCode)
            .pipe(map((selectedContext) => this.mergeCurrencyContext(selectedContext, currencies, selectedCode)));
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (context) => {
          if (scope !== this.currentContextScope() || String(context.officeId) !== String(officeId)) {
            this.context = undefined;
            this.allocationForm.controls.currencyCode.setValue('');
            this.contextLoadFailed = true;
            this.errorMessage = 'cashAllocation.errors.office';
            return;
          }
          this.context = context;
          this.setDenominations(this.selectedCurrency?.denominations ?? []);
        },
        error: (error: unknown) => {
          this.contextLoadFailed = true;
          this.errorMessage = this.contextErrorMessage(error);
          if (this.errorMessage === 'cashAllocation.errors.currencyUnavailable') {
            if (this.context) {
              const unavailableCode = this.allocationForm.controls.currencyCode.value;
              this.context = {
                ...this.context,
                currencies: this.context.currencies.filter((currency) => currency.code !== unavailableCode)
              };
            }
            this.allocationForm.controls.currencyCode.setValue('');
          }
          if (scope !== this.currentContextScope() || this.errorMessage === 'cashAllocation.errors.office') {
            this.context = undefined;
            this.allocationForm.controls.currencyCode.setValue('');
          }
        }
      });
  }

  private mergeCurrencyContext(
    context: CashAllocationContext,
    catalog: CashAllocationCurrency[],
    currencyCode: string
  ): CashAllocationContext {
    const selected = context.currencies.find((currency) => currency.code === currencyCode);
    if (!selected) {
      throw new Error('cashAllocation.errors.currencyUnavailable');
    }
    return {
      ...context,
      currencies: catalog.map((currency) => (currency.code === currencyCode ? selected : currency))
    };
  }

  private currentContextScope(): string {
    const credentials = this.authenticationService.getCredentials();
    return JSON.stringify([
      this.settingsService.server,
      this.settingsService.tenantIdentifier,
      credentials?.userId,
      credentials?.officeId
    ]);
  }

  private contextErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message.startsWith('cashAllocation.errors.')) {
      return error.message;
    }
    const response = error as {
      status?: number;
      error?: { errors?: Array<{ userMessageGlobalisationCode?: string }> };
    };
    const code = response?.error?.errors?.[0]?.userMessageGlobalisationCode ?? '';
    if (code.includes('office.')) {
      return 'cashAllocation.errors.office';
    }
    if (code.endsWith('currency.unsupported')) {
      return 'cashAllocation.errors.currencyUnavailable';
    }
    switch (response?.status) {
      case 401:
        return 'cashAllocation.errors.authentication';
      case 403:
        return 'cashAllocation.errors.noReadPermission';
      case 404:
        return 'cashAllocation.errors.apiUnavailable';
      default:
        return this.extractErrorMessage(error) || 'cashAllocation.errors.context';
    }
  }

  private setDenominations(configurations: CashAllocationDenomination[]): void {
    this.denominations.clear();
    configurations.forEach((denomination) => {
      this.denominations.push(
        this.formBuilder.group({
          denominationId: new FormControl(denomination.identifier, { nonNullable: true }),
          type: new FormControl(
            [
              'NOTE',
              'BILL'
            ].includes(denomination.type) ? 'BANKNOTE' : denomination.type,
            { nonNullable: true }
          ),
          value: new FormControl(String(denomination.value), { nonNullable: true }),
          quantity: new FormControl<number | null>(0, [
            Validators.required,
            integerValidator
          ])
        })
      );
    });
  }

  private openConfirmation(preview: CashAllocationPreview, request: CashAllocationRequest): void {
    this.dialog
      .open(CashAllocationConfirmDialogComponent, {
        data: preview,
        disableClose: true,
        width: '560px'
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.post(request);
        }
      });
  }

  private post(request: CashAllocationRequest): void {
    if (this.isPosting) {
      return;
    }
    this.isPosting = true;
    this.postAttempted = true;
    this.errorMessage = '';
    this.baseTellerService
      .createCashAllocation(request)
      .pipe(
        tap((created) => {
          this.pendingAllocationId = created.id;
        }),
        switchMap((created) => this.baseTellerService.getCashAllocation(created.id)),
        finalize(() => {
          this.isPosting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => {
          this.receipt = receipt;
          this.clearPendingRequest();
        },
        error: (error: unknown) => {
          this.errorMessage =
            this.extractErrorMessage(error) ||
            (this.pendingAllocationId === undefined ? 'cashAllocation.errors.create' : 'cashAllocation.errors.receipt');
        }
      });
  }

  private retrieveCreatedAllocation(allocationId: FineractId): void {
    if (this.isPosting) {
      return;
    }
    this.isPosting = true;
    this.errorMessage = '';
    this.baseTellerService
      .getCashAllocation(allocationId)
      .pipe(
        finalize(() => {
          this.isPosting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => {
          this.receipt = receipt;
          this.clearPendingRequest();
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'cashAllocation.errors.receipt';
        }
      });
  }

  private buildRequest(): CashAllocationRequest {
    const raw = this.allocationForm.getRawValue();
    const unsignedRequest = {
      operationType: raw.operationType,
      officeId: this.context?.officeId as FineractId,
      ...(raw.operationType === 'OPERATIONAL_TELLER_ALLOCATION' && raw.sourceCashierId
        ? { sourceCashierId: raw.sourceCashierId }
        : {}),
      ...(raw.operationType !== 'SAFE_VAULT_OPENING' && raw.destinationCashierId
        ? { destinationCashierId: raw.destinationCashierId }
        : {}),
      businessDate: this.context?.businessDate ?? '',
      currencyCode: raw.currencyCode,
      amount: this.total,
      denominations: raw.denominations.map((denomination) => ({
        denominationId: denomination.denominationId,
        quantity: denomination.quantity ?? 0
      })),
      ...(raw.note.trim() ? { note: raw.note.trim() } : {})
    };
    const signature = JSON.stringify(unsignedRequest);
    if (!this.pendingRequest || this.pendingSignature !== signature) {
      this.postAttempted = false;
      this.pendingSignature = signature;
      this.pendingRequest = {
        idempotencyKey: this.createIdempotencyKey(),
        ...unsignedRequest
      };
    }
    return this.pendingRequest;
  }

  private hasRequiredCashiers(): boolean {
    if (this.operationType === 'SAFE_VAULT_OPENING') {
      return true;
    }
    if (!this.allocationForm.controls.destinationCashierId.value) {
      return false;
    }
    return (
      this.operationType !== 'OPERATIONAL_TELLER_ALLOCATION' || !!this.allocationForm.controls.sourceCashierId.value
    );
  }

  private clearPendingRequest(): void {
    this.pendingRequest = undefined;
    this.pendingSignature = '';
    this.pendingAllocationId = undefined;
    this.postAttempted = false;
  }

  private get totalUnits(): bigint {
    const precision = this.selectedCurrency?.decimalPlaces ?? 0;
    return this.toUnits(this.total, precision);
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

  private toUnits(value: unknown, precision: number): bigint {
    const normalized = String(value ?? '0').trim();
    const match = normalized.match(/^(-?)(\d+)(?:\.(\d+))?$/);
    if (!match || (match[3]?.length ?? 0) > precision) {
      return 0n;
    }
    const scale = 10n ** BigInt(precision);
    const units = BigInt(match[2]) * scale + BigInt((match[3] ?? '').padEnd(precision, '0') || '0');
    return match[1] ? -units : units;
  }

  private fromUnits(units: bigint, precision: number): string {
    if (precision === 0) {
      return String(units);
    }
    const negative = units < 0n;
    const absolute = negative ? -units : units;
    const scale = 10n ** BigInt(precision);
    const fraction = String(absolute % scale).padStart(precision, '0');
    return `${negative ? '-' : ''}${absolute / scale}.${fraction}`;
  }

  private createIdempotencyKey(): string {
    return globalThis.crypto?.randomUUID?.() ?? `cash-allocation-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
