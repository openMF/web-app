/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { finalize, forkJoin } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { environment } from 'environments/environment';
import { BaseTellerService, FineractId } from '../base-teller.service';
import {
  CashHolding,
  CashManagementStatus,
  CashOperation,
  CashOperationType,
  CashierCheck,
  CashierClosingContext,
  CashierClosingReceipt,
  CashierOption,
  CurrencyOption,
  GlobalCashCount,
  TellerOption
} from './cash-management.models';

type CashManagementView = 'closing' | 'global' | 'deposit-in-transit' | 'bank-deposit' | 'history' | 'holdings';
type DenominationGroup = FormGroup<{
  value: FormControl<number | null>;
  quantity: FormControl<number | null>;
}>;

@Component({
  selector: 'mifosx-cash-management',
  templateUrl: './cash-management.component.html',
  styleUrls: ['./cash-management.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTabsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashManagementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(BaseTellerService);
  private authenticationService = inject(AuthenticationService);
  private settingsService = inject(SettingsService);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  readonly view = (this.route.snapshot.data['view'] ?? 'closing') as CashManagementView;
  readonly closingColumns = [
    'cashier',
    'expected',
    'cash',
    'checks',
    'actual',
    'difference',
    'status'
  ];
  readonly historyColumns = [
    'reference',
    'businessDate',
    'cashier',
    'type',
    'currency',
    'amount',
    'status'
  ];
  readonly holdingColumns = [
    'cashier',
    'currency',
    'opening',
    'inflows',
    'outflows',
    'settlements',
    'balance',
    'status'
  ];
  readonly pageSize = 25;

  contextForm = new FormGroup({
    businessDate: new FormControl<Date | string | null>(this.settingsService.businessDate, Validators.required),
    tellerId: new FormControl<FineractId | null>(null, Validators.required),
    cashierId: new FormControl<FineractId | null>(null, Validators.required),
    currencyCode: new FormControl<string>('', { nonNullable: true, validators: Validators.required })
  });
  assetForm = new FormGroup({
    denominations: new FormArray<DenominationGroup>([]),
    checkIds: new FormControl<FineractId[]>([], { nonNullable: true }),
    description: new FormControl<string>('', { nonNullable: true })
  });
  globalForm = new FormGroup({
    businessDate: new FormControl<Date | string | null>(this.settingsService.businessDate),
    currencyCode: new FormControl<string>('', { nonNullable: true })
  });
  historyForm = new FormGroup({
    fromDate: new FormControl<Date | string | null>(null),
    toDate: new FormControl<Date | string | null>(null),
    cashierId: new FormControl<FineractId | null>(null),
    currencyCode: new FormControl<string>('', { nonNullable: true }),
    status: new FormControl<CashManagementStatus | ''>('', { nonNullable: true }),
    transactionType: new FormControl<CashOperationType | ''>('', { nonNullable: true }),
    q: new FormControl<string>('', { nonNullable: true })
  });
  holdingsForm = new FormGroup({
    businessDate: new FormControl<Date | string | null>(this.settingsService.businessDate),
    cashierId: new FormControl<FineractId | null>(null),
    currencyCode: new FormControl<string>('', { nonNullable: true })
  });

  tellers: TellerOption[] = [];
  cashiers: CashierOption[] = [];
  currencies: CurrencyOption[] = [];
  closingContext?: CashierClosingContext;
  closingReceipt?: CashierClosingReceipt;
  operationReceipt?: CashOperation;
  globalCount?: GlobalCashCount;
  history: CashOperation[] = [];
  historyTotal = 0;
  historyOffset = 0;
  holdings: CashHolding[] = [];
  errorMessage = '';
  isLoading = false;
  isSubmitting = false;
  hasLoaded = false;
  private idempotencyKey = this.newIdempotencyKey();
  private retryAction?: () => void;
  private contextRequestVersion = 0;
  private hasUnresolvedSubmission = false;

  get denominations(): FormArray<DenominationGroup> {
    return this.assetForm.controls.denominations;
  }

  get isOperation(): boolean {
    return this.view === 'deposit-in-transit' || this.view === 'bank-deposit';
  }

  get operationType(): CashOperationType {
    return this.view === 'bank-deposit' ? 'BANK_DEPOSIT' : 'DEPOSIT_IN_TRANSIT';
  }

  get canFinalizeClosing(): boolean {
    return this.hasPermission('CREATE_CASHIER_CLOSING') && this.hasPermission('AUTHORIZE_CASHIER_CLOSING');
  }

  get canCreateDeposit(): boolean {
    return this.hasPermission('CREATE_CASH_DEPOSIT');
  }

  get cashPreview(): number {
    return this.denominations.controls.reduce(
      (sum: number, control: DenominationGroup) =>
        sum + Number(control.controls.value.value ?? 0) * Number(control.controls.quantity.value ?? 0),
      0
    );
  }

  get selectedChecks(): CashierCheck[] {
    const selected = new Set(this.assetForm.controls.checkIds.value.map(String));
    return (this.closingContext?.eligibleChecks ?? []).filter((check: CashierCheck) => selected.has(String(check.id)));
  }

  get checkPreview(): number {
    return this.selectedChecks.reduce((sum: number, check: CashierCheck) => sum + Number(check.amount), 0);
  }

  ngOnInit(): void {
    if (this.view === 'closing' || this.isOperation) {
      this.contextForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.invalidateContext());
      this.addDenomination();
    }
    this.loadOptions();
    if (this.view === 'global') {
      this.loadGlobalCount();
    } else if (this.view === 'history') {
      this.loadHistory();
    } else if (this.view === 'holdings') {
      this.loadHoldings();
    }
  }

  loadOptions(): void {
    this.prepareRequest();
    this.isLoading = true;
    forkJoin({
      tellers: this.service.getCashManagementTellers(),
      currencies: this.service.getCashManagementCurrencies()
    })
      .pipe(finalize(() => this.finishLoading()))
      .subscribe({
        next: ({ tellers, currencies }) => {
          this.tellers = Array.isArray(tellers) ? tellers : (tellers.pageItems ?? []);
          this.currencies = currencies.selectedCurrencyOptions ?? [];
        },
        error: (error: unknown) => this.setError(error, 'web1232.errors.options', () => this.loadOptions())
      });
  }

  tellerChanged(tellerId: FineractId | null): void {
    this.prepareRequest();
    this.cashiers = [];
    this.contextForm.controls.cashierId.reset();
    if (tellerId === null) {
      return;
    }
    this.isLoading = true;
    this.service
      .getCashManagementCashiers(tellerId)
      .pipe(finalize(() => this.finishLoading()))
      .subscribe({
        next: (response) => (this.cashiers = Array.isArray(response) ? response : (response.cashiers ?? [])),
        error: (error: unknown) => this.setError(error, 'web1232.errors.cashiers', () => this.tellerChanged(tellerId))
      });
  }

  loadContext(): void {
    this.prepareRequest(this.hasUnresolvedSubmission);
    this.contextForm.markAllAsTouched();
    if (this.contextForm.invalid) {
      return;
    }
    const requestVersion = this.invalidateContext();
    const value = this.contextForm.getRawValue();
    this.isLoading = true;
    this.service
      .getCashierClosingContext(value.cashierId as FineractId, value.currencyCode, this.formatDate(value.businessDate))
      .pipe(
        finalize(() => {
          if (requestVersion === this.contextRequestVersion) {
            this.finishLoading();
          }
        })
      )
      .subscribe({
        next: (context: CashierClosingContext) => {
          if (requestVersion !== this.contextRequestVersion) {
            return;
          }
          this.closingContext = context;
          this.assetForm.controls.checkIds.setValue([]);
          this.hasLoaded = true;
          if (!this.hasUnresolvedSubmission) {
            this.idempotencyKey = this.newIdempotencyKey();
          }
        },
        error: (error: unknown) => {
          if (requestVersion === this.contextRequestVersion) {
            this.setError(error, 'web1232.errors.context', () => this.loadContext());
          }
        }
      });
  }

  addDenomination(): void {
    this.denominations.push(
      new FormGroup({
        value: new FormControl<number | null>(null, [
          Validators.required,
          Validators.min(0.000001)
        ]),
        quantity: new FormControl<number | null>(0, [
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
    return Number(control.get('value')?.value ?? 0) * Number(control.get('quantity')?.value ?? 0);
  }

  reviewAndSubmit(): void {
    this.prepareRequest();
    this.assetForm.markAllAsTouched();
    if (this.isSubmitting || this.assetForm.invalid || !this.closingContext) {
      return;
    }
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translate.instant(
          this.isOperation ? `web1232.views.${this.view}` : 'web1232.closing.confirmTitle'
        ),
        dialogContext: this.translate.instant(
          this.isOperation ? 'web1232.operation.confirmText' : 'web1232.closing.confirmText',
          {
            cashier: this.closingContext.cashierName,
            date: this.closingContext.businessDate,
            currency: this.closingContext.currencyCode,
            expected: this.closingContext.expectedAmount,
            cash: this.cashPreview,
            checks: this.checkPreview,
            difference: this.cashPreview + this.checkPreview - this.closingContext.expectedAmount
          }
        ),
        type: 'warn'
      }
    });
    dialogRef.afterClosed().subscribe((result: { confirm?: boolean } | undefined) => {
      if (result?.confirm) {
        this.isOperation ? this.submitOperation() : this.submitClosing();
      }
    });
  }

  submitClosing(): void {
    const context = this.closingContext;
    if (!context || !this.canFinalizeClosing) {
      return;
    }
    this.prepareRequest();
    this.hasUnresolvedSubmission = true;
    this.isSubmitting = true;
    this.service
      .closeCashier({
        idempotencyKey: this.idempotencyKey,
        cashierId: context.cashierId,
        businessDate: context.businessDate,
        currencyCode: context.currencyCode,
        denominations: this.denominationPayload(),
        checkIds: this.assetForm.controls.checkIds.value
      })
      .pipe(finalize(() => this.finishSubmitting()))
      .subscribe({
        next: (receipt: CashierClosingReceipt) => {
          this.closingReceipt = receipt;
          if (receipt.status !== 'COMPLETED') {
            this.errorMessage = 'web1232.errors.notCompleted';
            this.retryAction = () => this.reviewAndSubmit();
          } else {
            this.hasUnresolvedSubmission = false;
            this.idempotencyKey = this.newIdempotencyKey();
          }
        },
        error: (error: unknown) => this.setError(error, 'web1232.errors.closing', () => this.reviewAndSubmit())
      });
  }

  submitOperation(): void {
    const context = this.closingContext;
    if (!context || !this.canCreateDeposit) {
      return;
    }
    this.prepareRequest();
    this.hasUnresolvedSubmission = true;
    this.isSubmitting = true;
    this.service
      .createCashOperation({
        idempotencyKey: this.idempotencyKey,
        transactionType: this.operationType,
        cashierId: context.cashierId,
        businessDate: context.businessDate,
        currencyCode: context.currencyCode,
        denominations: this.denominationPayload(),
        checkIds: this.assetForm.controls.checkIds.value,
        description: this.assetForm.controls.description.value || null
      })
      .pipe(finalize(() => this.finishSubmitting()))
      .subscribe({
        next: (receipt: CashOperation) => {
          this.operationReceipt = receipt;
          if (receipt.status !== 'COMPLETED') {
            this.errorMessage = 'web1232.errors.notCompleted';
            this.retryAction = () => this.reviewAndSubmit();
          } else {
            this.hasUnresolvedSubmission = false;
            this.idempotencyKey = this.newIdempotencyKey();
          }
        },
        error: (error: unknown) => this.setError(error, 'web1232.errors.operation', () => this.reviewAndSubmit())
      });
  }

  loadReceipt(): void {
    if (!this.closingReceipt) {
      return;
    }
    this.prepareRequest();
    this.isLoading = true;
    this.service
      .getCashierClosing(this.closingReceipt.id)
      .pipe(finalize(() => this.finishLoading()))
      .subscribe({
        next: (receipt: CashierClosingReceipt) => (this.closingReceipt = receipt),
        error: (error: unknown) => this.setError(error, 'web1232.errors.receipt', () => this.loadReceipt())
      });
  }

  loadGlobalCount(): void {
    this.prepareRequest();
    const value = this.globalForm.getRawValue();
    this.isLoading = true;
    this.hasLoaded = false;
    this.service
      .getGlobalCashCount(this.formatDate(value.businessDate), value.currencyCode || undefined)
      .pipe(finalize(() => this.finishLoading()))
      .subscribe({
        next: (result: GlobalCashCount) => {
          this.globalCount = result;
          this.hasLoaded = true;
        },
        error: (error: unknown) => this.setError(error, 'web1232.errors.global', () => this.loadGlobalCount())
      });
  }

  loadHistory(event?: PageEvent): void {
    this.prepareRequest();
    if (event) {
      this.historyOffset = event.pageIndex * event.pageSize;
    }
    const value = this.historyForm.getRawValue();
    this.isLoading = true;
    this.hasLoaded = false;
    this.service
      .getCashOperationHistory({
        fromDate: this.formatDate(value.fromDate) || undefined,
        toDate: this.formatDate(value.toDate) || undefined,
        cashierId: value.cashierId ?? undefined,
        currencyCode: value.currencyCode || undefined,
        status: value.status || undefined,
        transactionType: value.transactionType || undefined,
        q: value.q.trim() || undefined,
        offset: this.historyOffset,
        limit: this.pageSize
      })
      .pipe(finalize(() => this.finishLoading()))
      .subscribe({
        next: (result) => {
          this.history = result.pageItems ?? [];
          this.historyTotal = result.totalFilteredRecords ?? 0;
          this.hasLoaded = true;
        },
        error: (error: unknown) => this.setError(error, 'web1232.errors.history', () => this.loadHistory())
      });
  }

  resetHistory(): void {
    this.historyOffset = 0;
    this.loadHistory();
  }

  loadHoldings(): void {
    this.prepareRequest();
    const value = this.holdingsForm.getRawValue();
    this.isLoading = true;
    this.hasLoaded = false;
    this.service
      .getCashHoldings({
        businessDate: this.formatDate(value.businessDate) || undefined,
        cashierId: value.cashierId ?? undefined,
        currencyCode: value.currencyCode || undefined
      })
      .pipe(finalize(() => this.finishLoading()))
      .subscribe({
        next: (result: CashHolding[]) => {
          this.holdings = result;
          this.hasLoaded = true;
        },
        error: (error: unknown) => this.setError(error, 'web1232.errors.holdings', () => this.loadHoldings())
      });
  }

  toggleCheck(checkId: FineractId, selected: boolean): void {
    const values = this.assetForm.controls.checkIds.value.filter((id: FineractId) => String(id) !== String(checkId));
    this.assetForm.controls.checkIds.setValue(
      selected ? [
            ...values,
            checkId
          ] : values
    );
  }

  isCheckSelected(checkId: FineractId): boolean {
    return this.assetForm.controls.checkIds.value.some((id: FineractId) => String(id) === String(checkId));
  }

  printReceipt(): void {
    window.print();
  }

  retry(): void {
    const action = this.retryAction;
    this.prepareRequest();
    action?.();
  }

  statusKey(status: string): string {
    return `web1232.status.${status}`;
  }

  operationKey(type: string): string {
    return `web1232.operationType.${type}`;
  }

  differenceKey(type: string): string {
    return `web1232.differenceType.${type}`;
  }

  private denominationPayload() {
    return this.denominations.controls
      .map((control: DenominationGroup) => ({
        denominationId: String(control.controls.value.value),
        value: Number(control.controls.value.value),
        quantity: Number(control.controls.quantity.value)
      }))
      .filter((item) => item.quantity > 0);
  }

  private hasPermission(permission: string): boolean {
    if (!environment.productionModeEnableRBAC) {
      return true;
    }
    const permissions = this.authenticationService.getCredentials()?.permissions ?? [];
    return permissions.includes('ALL_FUNCTIONS') || permissions.includes(permission);
  }

  private formatDate(value: Date | string | null): string {
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      return value.slice(0, 10);
    }
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private newIdempotencyKey(): string {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  /** Invalidates loaded context and any older in-flight context response. */
  private invalidateContext(): number {
    this.contextRequestVersion += 1;
    this.isLoading = false;
    this.closingContext = undefined;
    this.closingReceipt = undefined;
    this.operationReceipt = undefined;
    this.hasLoaded = false;
    this.assetForm.controls.checkIds.setValue([]);
    return this.contextRequestVersion;
  }

  private prepareRequest(preserveRetry = false): void {
    this.errorMessage = '';
    if (!preserveRetry) {
      this.retryAction = undefined;
    }
  }

  private finishLoading(): void {
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private finishSubmitting(): void {
    this.isSubmitting = false;
    this.cdr.markForCheck();
  }

  private setError(error: unknown, fallback: string, retryAction: () => void): void {
    const response = error as {
      error?: {
        defaultUserMessage?: string;
        developerMessage?: string;
        message?: string;
        errors?: Array<{ defaultUserMessage?: string; developerMessage?: string }>;
      };
    };
    this.errorMessage =
      response.error?.errors?.[0]?.defaultUserMessage ||
      response.error?.errors?.[0]?.developerMessage ||
      response.error?.defaultUserMessage ||
      response.error?.developerMessage ||
      response.error?.message ||
      fallback;
    this.retryAction = retryAction;
  }
}
