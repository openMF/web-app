/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService, _ as extract } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EMPTY, Subject, catchError, finalize, map, of, switchMap, tap } from 'rxjs';

import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { SettingsService } from 'app/settings/settings.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
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
  control.value === null || (Number.isSafeInteger(control.value) && control.value >= 0) ? null : { integer: true };

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
export class CashAllocationComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private baseTellerService = inject(BaseTellerService);
  private authenticationService = inject(AuthenticationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private settingsService = inject(SettingsService);
  private translate = inject(TranslateService);
  private contextRequests = new Subject<string | undefined>();

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

  currencyOptions: CashAllocationCurrency[] = [];
  private currencyOptionsScope?: string;
  context?: CashAllocationContext;
  private contextScope?: string;
  receipt?: CashAllocationReceipt;
  isLoading = false;
  isPreviewing = false;
  isConfirming = false;
  isPosting = false;
  isReprinting = false;
  errorMessage = '';
  recoveryWarning = '';
  private unreadableRecoveryRecord?: { key: string; value: string };
  canRead = false;
  canCreate = false;
  canReprint = false;
  private pendingRequest?: CashAllocationRequest;
  private pendingRecoveryStorageKey?: string;
  private pendingSignature = '';
  private pendingAllocationId?: FineractId;
  private postAttempted = false;
  private createOutcomeUncertain = false;

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

  private get precision(): number {
    const value = this.selectedCurrency?.decimalPlaces;
    return Number.isInteger(value) && value! >= 0 && value! <= 12 ? value! : 0;
  }

  get total(): string {
    const precision = this.precision;
    const totalUnits = this.denominations.controls.reduce(
      (sum, denomination) =>
        sum +
        this.toUnits(denomination.controls.value.value, precision) *
          this.quantityUnits(denomination.controls.quantity.value),
      0n
    );
    return this.fromUnits(totalUnits, precision);
  }

  get canPreview(): boolean {
    return (
      this.canCreate &&
      !!this.context &&
      !!this.selectedCurrency &&
      this.contextScope === this.recoveryStorageKey &&
      !this.isLoading &&
      !this.isPreviewing &&
      !this.isPosting &&
      !this.isConfirming &&
      !this.postAttempted &&
      !this.unreadableRecoveryRecord &&
      !this.receipt &&
      this.allocationForm.valid &&
      this.hasRequiredCashiers() &&
      !this.insufficientSourceBalance &&
      this.denominations.length > 0 &&
      this.totalUnits > 0n
    );
  }

  get recoveryRequest(): CashAllocationRequest | undefined {
    return this.postAttempted ? this.pendingRequest : undefined;
  }

  get canRetryPost(): boolean {
    return (
      ((this.postAttempted && !!this.pendingRequest) || this.pendingAllocationId !== undefined) &&
      !this.isPosting &&
      !this.isConfirming &&
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
    this.contextRequests
      .pipe(
        switchMap((currencyCode) => {
          const officeId = this.authenticationService.getCredentials()?.officeId;
          const scope = this.recoveryStorageKey;
          if (this.currencyOptionsScope !== undefined && this.currencyOptionsScope !== scope) {
            this.currencyOptions = [];
            this.allocationForm.controls.currencyCode.setValue('');
            currencyCode = undefined;
          }
          this.context = undefined;
          this.denominations.clear();
          this.errorMessage = '';
          if (!Number.isSafeInteger(officeId) || officeId! <= 0) {
            this.errorMessage = 'cashAllocation.errors.office';
            return EMPTY;
          }
          this.isLoading = true;
          return this.baseTellerService.getCashAllocationContext(officeId!, currencyCode).pipe(
            switchMap((context) => {
              if (!Array.isArray(context.currencies)) throw new Error('Invalid currency context');
              if (scope !== this.recoveryStorageKey || String(context.officeId) !== String(officeId))
                throw new Error('cashAllocation.errors.office');
              if (currencyCode) return of(this.selectedContext(context, currencyCode));
              this.updateCurrencyOptions(context.currencies, scope, true);
              const previousCode = this.allocationForm.controls.currencyCode.value;
              if (this.currencyOptions.length === 0) {
                this.allocationForm.controls.currencyCode.setValue('');
                return of({ ...context, currencies: [] });
              }
              if (previousCode && !this.currencyOptions.some((currency) => currency.code === previousCode)) {
                this.allocationForm.controls.currencyCode.setValue('');
                throw new Error('cashAllocation.errors.currencyUnavailable');
              }
              const selectedCode = previousCode || this.currencyOptions[0].code;
              this.allocationForm.controls.currencyCode.setValue(selectedCode);
              return this.baseTellerService
                .getCashAllocationContext(officeId!, selectedCode)
                .pipe(map((selected) => this.selectedContext(selected, selectedCode)));
            }),
            tap((context) => {
              const code = this.allocationForm.controls.currencyCode.value;
              if (scope !== this.recoveryStorageKey) throw new Error('cashAllocation.errors.office');
              this.contextScope = scope;
              this.updateCurrencyOptions(context.currencies, scope, false);
              if (
                String(context.officeId) !== String(officeId) ||
                !Array.isArray(context.cashiers) ||
                (context.currencies.length > 0 && context.currencyCode !== code)
              ) {
                throw new Error('cashAllocation.errors.office');
              }
              if (this.pendingRequest && this.pendingRequest.businessDate !== context.businessDate) {
                this.recoveryWarning = extract('cashAllocation.recovery.stale');
              } else if (this.recoveryWarning === 'cashAllocation.recovery.stale') this.recoveryWarning = '';
              // Selector metadata is retained separately; financial data comes only from this response.
              this.context = {
                ...context,
                currencies: context.currencies
              };
              const selected = context.currencies.find((currency) => currency.code === code);
              if ((currencyCode || context.currencies.length > 0) && (!selected || !this.validCatalog(selected))) {
                this.errorMessage = extract('cashAllocation.errors.configuration');
                return;
              }
              this.setDenominations(selected?.denominations ?? []);
              if (this.postAttempted) this.allocationForm.disable();
              this.allocationForm.patchValue({ sourceCashierId: null, destinationCashierId: null });
            }),
            catchError((error: unknown) => {
              this.context = undefined;
              if (this.currencyOptionsScope !== this.recoveryStorageKey) this.currencyOptions = [];
              this.denominations.clear();
              this.errorMessage = this.contextErrorMessage(error);
              if (this.errorMessage === 'cashAllocation.errors.currencyUnavailable') {
                const code = this.allocationForm.controls.currencyCode.value;
                this.currencyOptions = this.currencyOptions.filter((currency) => currency.code !== code);
                this.allocationForm.controls.currencyCode.setValue('');
              }
              return EMPTY;
            }),
            finalize(() => {
              this.isLoading = false;
              this.cdr.markForCheck();
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
    this.restorePendingRequest();
    this.loadContext(this.pendingRequest?.currencyCode);
  }

  operationChanged(): void {
    if (this.allocationForm.disabled) return;
    this.allocationForm.patchValue({ sourceCashierId: null, destinationCashierId: null });
    this.clearPendingRequest();
  }

  retryContext(): void {
    if (!this.canRead || this.isLoading || this.isPreviewing || this.isConfirming || this.isPosting || this.receipt)
      return;
    this.loadContext();
  }

  currencyChanged(): void {
    if (this.allocationForm.disabled) return;
    const currencyCode = this.allocationForm.controls.currencyCode.value;
    this.clearPendingRequest();
    this.loadContext(currencyCode);
  }

  lineTotal(control: DenominationGroup): string {
    const precision = this.precision;
    return this.fromUnits(
      this.toUnits(control.controls.value.value, precision) * this.quantityUnits(control.controls.quantity.value),
      precision
    );
  }

  preview(): void {
    this.errorMessage = '';
    this.allocationForm.markAllAsTouched();
    const scope = this.recoveryStorageKey;
    if (this.context && this.contextScope !== scope) {
      this.invalidateReview();
      return;
    }
    if (!this.canPreview) return;
    const request = this.buildRequest();
    this.isPreviewing = true;
    this.allocationForm.disable();
    this.baseTellerService
      .previewCashAllocation(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isPreviewing = false;
          this.unlockForm();
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (preview) => {
          if (scope !== this.recoveryStorageKey) this.invalidateReview();
          else this.openConfirmation(preview, request, scope);
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'cashAllocation.errors.preview';
        }
      });
  }

  get canDiscardRecovery(): boolean {
    return (
      !this.isLoading &&
      !this.isPosting &&
      !this.isPreviewing &&
      !this.isConfirming &&
      !this.receipt &&
      ((this.postAttempted &&
        !!this.pendingRequest &&
        this.pendingAllocationId === undefined &&
        this.pendingRecoveryStorageKey === this.recoveryStorageKey) ||
        (!!this.unreadableRecoveryRecord && this.unreadableRecoveryRecord.key === this.recoveryStorageKey))
    );
  }

  discardRecovery(): void {
    if (!this.canDiscardRecovery) return;
    const scope = this.pendingRecoveryStorageKey ?? this.unreadableRecoveryRecord!.key;
    let stored: string | null;
    try {
      stored = sessionStorage.getItem(scope);
      if (
        (this.pendingRequest &&
          stored !== null &&
          (!this.ownsRecoveryRecord(stored) || JSON.parse(stored).allocationId != null)) ||
        (this.unreadableRecoveryRecord && stored !== this.unreadableRecoveryRecord.value)
      ) {
        this.recoveryWarning = extract('cashAllocation.recovery.changed');
        return;
      }
    } catch {
      this.recoveryWarning = extract('cashAllocation.recovery.storage');
      return;
    }
    this.isConfirming = true;
    this.allocationForm.disable();
    this.dialog
      .open(ConfirmationDialogComponent, {
        disableClose: true,
        data: {
          heading: this.translate.instant(extract('cashAllocation.recovery.discard')),
          dialogContext: this.translate.instant(extract('cashAllocation.recovery.confirmDiscard')),
          type: 'Strong'
        }
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: { confirm?: boolean } | undefined) => {
        this.isConfirming = false;
        if (result?.confirm) {
          try {
            if (scope !== this.recoveryStorageKey || sessionStorage.getItem(scope) !== stored) {
              this.recoveryWarning = extract('cashAllocation.recovery.changed');
            } else {
              if (stored !== null) sessionStorage.removeItem(scope);
              this.clearPendingRequest();
              this.unreadableRecoveryRecord = undefined;
              this.recoveryWarning = '';
              this.context = undefined;
              this.currencyOptions = [];
              this.contextScope = undefined;
              this.allocationForm.patchValue({
                currencyCode: '',
                sourceCashierId: null,
                destinationCashierId: null,
                note: ''
              });
              this.loadContext();
            }
          } catch {
            this.recoveryWarning = extract('cashAllocation.recovery.storage');
          }
        }
        this.unlockForm();
        this.cdr.markForCheck();
      });
  }

  retryPosting(): void {
    if (!this.canRetryPost) return;
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
    if (this.isPosting || this.postAttempted || this.isConfirming || this.isPreviewing) return;
    this.receipt = undefined;
    this.allocationForm.enable();
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
    this.contextRequests.next(currencyCode);
  }

  private updateCurrencyOptions(currencies: CashAllocationCurrency[], scope: string, replace: boolean): void {
    const options = Array.from(
      new Map(
        currencies.map((currency) => {
          if (
            !currency ||
            typeof currency.code !== 'string' ||
            (currency.name != null && typeof currency.name !== 'string')
          )
            throw new Error('Invalid currency option');
          return [
            currency.code,
            currency
          ] as const;
        })
      ).values()
    );
    this.currencyOptions = replace ? options : this.mergeCurrencies(this.currencyOptions, options);
    this.currencyOptionsScope = scope;
  }

  private mergeCurrencies(
    previous: CashAllocationCurrency[],
    current: CashAllocationCurrency[]
  ): CashAllocationCurrency[] {
    return Array.from(
      new Map(
        [
          ...previous,
          ...current
        ].map((currency) => [
          currency.code,
          currency
        ])
      ).values()
    );
  }

  private selectedContext(context: CashAllocationContext, code: string): CashAllocationContext {
    const selected = context.currencies.find((currency) => currency.code === code);
    if (!selected || (context.currencyCode && context.currencyCode !== code))
      throw new Error('cashAllocation.errors.currencyUnavailable');
    return { ...context, currencyCode: code, currencies: this.mergeCurrencies(this.currencyOptions, [selected]) };
  }

  private contextErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message.startsWith('cashAllocation.errors.')) return error.message;
    const response = error as {
      status?: number;
      error?: { errors?: Array<{ userMessageGlobalisationCode?: string }> };
    };
    const code = response?.error?.errors?.[0]?.userMessageGlobalisationCode ?? '';
    if (code.includes('office.')) return 'cashAllocation.errors.office';
    if (code.endsWith('currency.unsupported')) return 'cashAllocation.errors.currencyUnavailable';
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

  private validCatalog(currency: CashAllocationCurrency): boolean {
    if (
      !Number.isInteger(currency.decimalPlaces) ||
      currency.decimalPlaces < 0 ||
      currency.decimalPlaces > 12 ||
      !Array.isArray(currency.denominations)
    )
      return false;
    const identifiers = new Set<string>();
    return currency.denominations.every((denomination) => {
      if (!denomination || typeof denomination.identifier !== 'string' || !denomination.identifier.trim() || ![
          'BANKNOTE',
          'NOTE',
          'BILL',
          'COIN'
        ].includes(denomination.type) || this.toUnits(denomination.value, currency.decimalPlaces) <= 0n) return false;
      const identifier = denomination.identifier.trim().toLowerCase();
      if (identifiers.has(identifier)) return false;
      identifiers.add(identifier);
      return true;
    });
  }

  get insufficientSourceBalance(): boolean {
    if (this.operationType === 'SAFE_VAULT_OPENING' || !this.selectedCurrency) return false;
    const balance =
      this.operationType === 'HEAD_CASHIER_ALLOCATION'
        ? this.context?.vaultBalance
        : this.sourceCashiers.find(
            (cashier) => String(cashier.cashierId) === String(this.allocationForm.controls.sourceCashierId.value)
          )?.currentBalance;
    return balance !== undefined && this.totalUnits > this.toUnits(balance, this.precision);
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

  private invalidateReview(): void {
    this.clearPendingRequest();
    this.currencyOptions = [];
    this.currencyOptionsScope = undefined;
    this.allocationForm.controls.currencyCode.setValue('');
    this.context = undefined;
    this.contextScope = undefined;
    this.denominations.clear();
    this.errorMessage = 'cashAllocation.errors.context';
  }

  private openConfirmation(preview: CashAllocationPreview, request: CashAllocationRequest, scope: string): void {
    this.isConfirming = true;
    this.dialog
      .open(CashAllocationConfirmDialogComponent, {
        data: preview,
        disableClose: true,
        width: '560px'
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed: boolean) => {
        this.isConfirming = false;
        if (scope !== this.recoveryStorageKey) this.invalidateReview();
        else if (confirmed) {
          this.post(request, scope);
        }
        this.unlockForm();
        this.cdr.markForCheck();
      });
  }

  private post(request: CashAllocationRequest, scope = this.pendingRecoveryStorageKey): void {
    if (this.destroyRef.destroyed || this.isPosting || !this.hasRecoveryScope()) {
      return;
    }
    if (!scope || scope !== this.recoveryStorageKey) {
      if (!this.postAttempted) this.invalidateReview();
      return;
    }
    try {
      this.pendingRecoveryStorageKey ??= scope;
      this.savePendingRequest();
    } catch {
      this.errorMessage = extract('cashAllocation.recovery.storage');
      return;
    }
    this.isPosting = true;
    this.allocationForm.disable();
    this.postAttempted = true;
    this.errorMessage = '';
    this.baseTellerService
      .createCashAllocation(request)
      .pipe(
        tap((created) => {
          this.pendingAllocationId = created.id;
          try {
            this.savePendingRequest();
          } catch {
            // The pre-create identity is already saved; read the known receipt even if this update fails.
          }
        }),
        switchMap((created) =>
          this.hasRecoveryScope()
            ? this.baseTellerService
                .getCashAllocation(created.id)
                .pipe(map((receipt) => this.completedReceipt(receipt, created.id)))
            : EMPTY
        ),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isPosting = false;
          this.unlockForm();
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => {
          this.receipt = receipt;
          this.recoveryWarning = '';
          this.clearPendingRequest();
        },
        error: (error: unknown) => {
          const status = (error as { status?: number })?.status;
          if (
            !this.createOutcomeUncertain &&
            this.pendingAllocationId === undefined &&
            status &&
            status >= 400 &&
            status < 500 &&
            status !== 408 &&
            status !== 429
          ) {
            this.clearPendingRequest();
          } else if (this.pendingAllocationId === undefined) {
            // A rejection of a retry cannot resolve an earlier request whose response was lost.
            this.createOutcomeUncertain = true;
          }
          this.errorMessage =
            this.extractErrorMessage(error) ||
            (this.pendingAllocationId === undefined ? 'cashAllocation.errors.create' : 'cashAllocation.errors.receipt');
        }
      });
  }

  private retrieveCreatedAllocation(allocationId: FineractId): void {
    if (this.destroyRef.destroyed || this.isPosting || !this.hasRecoveryScope()) {
      return;
    }
    this.isPosting = true;
    this.allocationForm.disable();
    this.errorMessage = '';
    this.baseTellerService
      .getCashAllocation(allocationId)
      .pipe(
        map((receipt) => this.completedReceipt(receipt, allocationId)),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isPosting = false;
          this.unlockForm();
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => {
          this.receipt = receipt;
          this.recoveryWarning = '';
          this.clearPendingRequest();
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error) || 'cashAllocation.errors.receipt';
        }
      });
  }

  private completedReceipt(receipt: CashAllocationReceipt, allocationId: FineractId): CashAllocationReceipt {
    if (receipt?.status !== 'COMPLETED' || String(receipt.id) !== String(allocationId)) {
      throw new Error('Completed allocation receipt required');
    }
    return receipt;
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
    const destinationId = this.allocationForm.controls.destinationCashierId.value;
    if (!this.destinationCashiers.some((cashier) => String(cashier.cashierId) === String(destinationId))) return false;
    return (
      this.operationType !== 'OPERATIONAL_TELLER_ALLOCATION' ||
      this.sourceCashiers.some(
        (cashier) => String(cashier.cashierId) === String(this.allocationForm.controls.sourceCashierId.value)
      )
    );
  }

  private unlockForm(): void {
    if (!this.isPreviewing && !this.isConfirming && !this.isPosting && !this.postAttempted)
      this.allocationForm.enable();
  }

  private get recoveryStorageKey(): string {
    const credentials = this.authenticationService.getCredentials();
    return `cash-allocation:${this.settingsService.baseServerUrl}:${this.settingsService.tenantIdentifier}:${credentials?.userId}:${credentials?.officeId}`;
  }

  private hasRecoveryScope(): boolean {
    if (!this.pendingRecoveryStorageKey || this.pendingRecoveryStorageKey === this.recoveryStorageKey) return true;
    this.errorMessage = extract('cashAllocation.recovery.scope');
    return false;
  }

  private ownsRecoveryRecord(stored: string): boolean {
    const record = JSON.parse(stored);
    return (
      record.signature === this.pendingSignature &&
      record.request?.idempotencyKey === this.pendingRequest?.idempotencyKey
    );
  }

  private savePendingRequest(): void {
    if (!this.pendingRequest || !this.pendingRecoveryStorageKey) return;
    const stored = sessionStorage.getItem(this.pendingRecoveryStorageKey);
    if (stored && !this.ownsRecoveryRecord(stored)) throw new Error('Recovery record belongs to another request');
    sessionStorage.setItem(
      this.pendingRecoveryStorageKey,
      JSON.stringify({
        request: this.pendingRequest,
        signature: this.pendingSignature,
        allocationId: this.pendingAllocationId
      })
    );
  }

  private restorePendingRequest(): void {
    const scope = this.recoveryStorageKey;
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem(scope);
      if (!stored) return;
      const { request, signature, allocationId } = JSON.parse(stored);
      const { idempotencyKey, ...unsigned } = request;
      if (
        String(request.officeId) !== String(this.authenticationService.getCredentials()?.officeId) ||
        typeof idempotencyKey !== 'string' ||
        !idempotencyKey ||
        JSON.stringify(unsigned) !== signature ||
        !this.operationTypes.includes(request.operationType) ||
        !Array.isArray(request.denominations) ||
        typeof request.currencyCode !== 'string' ||
        typeof request.businessDate !== 'string'
      )
        throw new Error('Invalid recovery record');
      this.pendingRequest = request;
      this.pendingRecoveryStorageKey = scope;
      this.pendingSignature = signature;
      this.pendingAllocationId = allocationId;
      this.postAttempted = true;
      this.createOutcomeUncertain = true;
      this.allocationForm.patchValue({ operationType: request.operationType, currencyCode: request.currencyCode });
      this.allocationForm.disable();
    } catch {
      this.recoveryWarning =
        stored === null ? extract('cashAllocation.recovery.storage') : extract('cashAllocation.recovery.invalid');
      if (stored !== null) this.unreadableRecoveryRecord = { key: scope, value: stored };
    }
  }

  private clearPendingRequest(): void {
    if (this.postAttempted && this.pendingRecoveryStorageKey) {
      try {
        const stored = sessionStorage.getItem(this.pendingRecoveryStorageKey);
        if (stored && this.ownsRecoveryRecord(stored)) sessionStorage.removeItem(this.pendingRecoveryStorageKey);
      } catch {
        /* Replaying a retained completed identity remains safe. */
      }
    }
    this.pendingRequest = undefined;
    this.pendingRecoveryStorageKey = undefined;
    this.pendingSignature = '';
    this.pendingAllocationId = undefined;
    this.postAttempted = false;
    this.createOutcomeUncertain = false;
  }

  private get totalUnits(): bigint {
    const precision = this.precision;
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
        userMessageGlobalisationCode?: string;
        errors?: Array<{ defaultUserMessage?: string; userMessageGlobalisationCode?: string }>;
      };
    };
    const codes = [
      response?.error?.userMessageGlobalisationCode,
      ...(Array.isArray(response?.error?.errors)
        ? response.error.errors.map((item) => item?.userMessageGlobalisationCode)
        : [])
    ];
    const errors: Record<string, string> = {
      'drawer.already.opened': extract('cashAllocation.errors.alreadyOpened'),
      'drawer.closed': extract('cashAllocation.errors.drawerClosed'),
      'source.insufficient': extract('cashAllocation.errors.insufficientSource'),
      'source.not.head.cashier': extract('cashAllocation.errors.sourceCashier'),
      'currency.unsupported': extract('cashAllocation.errors.configuration'),
      'denomination.unsupported': extract('cashAllocation.errors.configuration'),
      'denomination.configuration.invalid': extract('cashAllocation.errors.configuration'),
      'cashier.invalid': extract('cashAllocation.errors.cashier'),
      'business.date.invalid': extract('cashAllocation.errors.businessDate')
    };
    for (const code of codes) {
      if (code === 'error.msg.financialActivityAccount.not.found') return extract('cashAllocation.errors.accounting');
      const prefix = 'error.msg.base.teller.cash.allocation.';
      if (code?.startsWith(prefix) && errors[code.slice(prefix.length)]) return errors[code.slice(prefix.length)];
    }
    const messages = [
      ...(Array.isArray(response?.error?.errors) ? response.error.errors.map((item) => item?.defaultUserMessage) : []),
      response?.error?.defaultUserMessage
    ];
    // Retain actionable backend validation messages, but never developer details or SQL/stack traces.
    return (
      messages.find(
        (message) =>
          typeof message === 'string' &&
          message.trim() &&
          !/\b(?:SQL|SQLSTATE|SQLException|stack trace)\b|\b(?:SELECT .+ FROM|INSERT INTO|DELETE FROM|UPDATE .+ SET)\b|(?:java|org\.apache)\./i.test(
            message
          )
      ) ?? ''
    );
  }

  private quantityUnits(quantity: number | null): bigint {
    return Number.isSafeInteger(quantity) && quantity! >= 0 ? BigInt(quantity!) : 0n;
  }

  private toUnits(value: unknown, precision: number): bigint {
    const normalized = String(value ?? '0').trim();
    const match = normalized.match(/^(-?)(\d+)(?:\.(\d+))?$/);
    const fraction = (match?.[3] ?? '').replace(/0+$/, '');
    if (!Number.isInteger(precision) || precision < 0 || precision > 12 || !match || fraction.length > precision) {
      return 0n;
    }
    const scale = 10n ** BigInt(precision);
    const units = BigInt(match[2]) * scale + BigInt(fraction.padEnd(precision, '0') || '0');
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
    return (
      globalThis.crypto?.randomUUID?.() ?? `ca-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 15)}`
    );
  }
}
