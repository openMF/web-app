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
import { TranslateService, _ as extract } from '@ngx-translate/core';
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
  CashOperationRequest,
  CashOperationType,
  CashierCheck,
  CashierClosingContext,
  CashierClosingReceipt,
  CashierClosingRequest,
  CashierClosingStatus,
  CashierOption,
  CurrencyOption,
  GlobalCashCount,
  TellerOption
} from './cash-management.models';

type ClosingIdentity = Pick<
  CashierClosingContext,
  'cashierId' | 'officeId' | 'tellerId' | 'currencyCode' | 'businessDate'
>;

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
  readonly registerStatusLabels = {
    NOT_OPENED: extract('web1232.closing.registerStatus.NOT_OPENED'),
    OPEN: extract('web1232.closing.registerStatus.OPEN'),
    COMPLETED: extract('web1232.closing.registerStatus.COMPLETED'),
    UNAVAILABLE: extract('web1232.closing.registerStatus.UNAVAILABLE')
  };
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
    businessDate: new FormControl<Date | string | null>(
      this.formatDate(this.settingsService.businessDate),
      Validators.required
    ),
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
    businessDate: new FormControl<Date | string | null>(this.formatDate(this.settingsService.businessDate)),
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
    businessDate: new FormControl<Date | string | null>(this.formatDate(this.settingsService.businessDate)),
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
  private unresolvedOperation?: CashOperationRequest;
  isConfirming = false;
  private confirmation?: { close: () => void };
  private pendingClosing?: { request: CashierClosingRequest; context: CashierClosingContext };

  get hasRetryAction(): boolean {
    return !!this.retryAction;
  }

  get hasClosingPermission(): boolean {
    return (
      this.hasPermission('READ_CASHIER_CLOSING') &&
      this.hasPermission('CREATE_CASHIER_CLOSING') &&
      this.hasPermission('AUTHORIZE_CASHIER_CLOSING')
    );
  }

  get registerStatus(): CashierClosingStatus | 'UNAVAILABLE' {
    if (this.completedReceiptMatches()) return 'COMPLETED';
    const context = this.closingContext;
    if (!this.hasLoaded || !context || !this.contextMatches(context) || !this.validPosition(context))
      return 'UNAVAILABLE';
    if (context.registerStatus === 'COMPLETED' && context.status === 'COMPLETED') return 'COMPLETED';
    if (context.status !== 'OPEN') return 'UNAVAILABLE';
    return context.registerStatus === 'OPEN' || context.registerStatus === 'NOT_OPENED'
      ? context.registerStatus
      : 'UNAVAILABLE';
  }

  get closingInputsDisabled(): boolean {
    return (
      this.view === 'closing' &&
      (this.registerStatus !== 'OPEN' ||
        this.isLoading ||
        this.isSubmitting ||
        this.isConfirming ||
        !!this.pendingClosing)
    );
  }

  get closingUnresolved(): boolean {
    return !!this.pendingClosing && !this.isSubmitting;
  }

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
    return (
      this.view === 'closing' &&
      this.hasClosingPermission &&
      this.registerStatus === 'OPEN' &&
      !this.isLoading &&
      !this.isSubmitting &&
      !this.isConfirming &&
      !this.hasUnresolvedSubmission &&
      this.validClosingInputs()
    );
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
      this.assetForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.confirmation?.close());
      if (this.view === 'closing') this.restorePendingClosing();
      this.addDenomination();
    }
    this.destroyRef.onDestroy(() => this.confirmation?.close());
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

  loadContext(preserveReceipt = false): void {
    if (this.isSubmitting || this.isConfirming) return;
    this.prepareRequest(this.hasUnresolvedSubmission);
    this.contextForm.markAllAsTouched();
    if (this.contextForm.invalid) {
      return;
    }
    const requestVersion = ++this.contextRequestVersion;
    this.closingContext = undefined;
    this.hasLoaded = false;
    if (!preserveReceipt && !this.completedReceiptMatches()) this.closingReceipt = undefined;
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
          if (!this.contextMatches(context) || !this.validPosition(context)) {
            this.errorMessage = extract('web1232.closing.statusUnavailable');
            this.retryAction = () => this.loadContext(true);
            return;
          }
          this.closingContext = context;
          if (!this.pendingClosing) this.assetForm.controls.checkIds.setValue([]);
          this.hasLoaded = true;
          if (!this.hasUnresolvedSubmission) {
            this.idempotencyKey = this.newIdempotencyKey();
          }
          if (this.view === 'closing' && context.registerStatus === 'COMPLETED' && context.closingId) {
            this.fetchCompletedReceipt(context.closingId, requestVersion);
          }
        },
        error: (error: unknown) => {
          if (requestVersion === this.contextRequestVersion) {
            this.errorMessage = this.completedReceiptMatches()
              ? extract('web1232.closing.refreshFailed')
              : extract('web1232.closing.statusUnavailable');
            this.retryAction = () => this.loadContext(true);
          }
        }
      });
  }

  addDenomination(): void {
    if (this.view === 'closing' && (this.pendingClosing || this.isSubmitting || this.isConfirming)) return;
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
    if (this.closingInputsDisabled) return;
    this.denominations.removeAt(index);
  }

  lineTotal(control: AbstractControl): number {
    return Number(control.get('value')?.value ?? 0) * Number(control.get('quantity')?.value ?? 0);
  }

  reviewAndSubmit(): void {
    this.prepareRequest();
    this.assetForm.markAllAsTouched();
    if (
      this.isSubmitting ||
      this.isConfirming ||
      this.assetForm.invalid ||
      !this.closingContext ||
      (this.view === 'closing' && !this.canFinalizeClosing) ||
      (this.isOperation && !this.canCreateDeposit)
    ) {
      return;
    }
    const snapshot = this.reviewSnapshot();
    const version = this.contextRequestVersion;
    this.isConfirming = true;
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
    this.confirmation = dialogRef;
    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: { confirm?: boolean } | undefined) => {
        this.isConfirming = false;
        this.confirmation = undefined;
        if (result?.confirm && version === this.contextRequestVersion && snapshot === this.reviewSnapshot()) {
          this.isOperation ? this.submitOperation() : this.submitClosing(snapshot);
        }
        this.cdr.markForCheck();
      });
  }

  /** Recheck the same authoritative position after confirmation and immediately before dispatch. */
  submitClosing(reviewed = this.reviewSnapshot()): void {
    const context = this.closingContext;
    if (!context || !this.canFinalizeClosing || reviewed !== this.reviewSnapshot()) return;
    const version = this.contextRequestVersion;
    this.prepareRequest();
    this.isSubmitting = true;
    this.service
      .getCashierClosingContext(context.cashierId, context.currencyCode, context.businessDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated: CashierClosingContext) => {
          if (version !== this.contextRequestVersion) {
            this.finishSubmitting();
            return;
          }
          this.closingContext = this.contextMatches(updated) && this.validPosition(updated) ? updated : undefined;
          this.hasLoaded = !!this.closingContext;
          if (
            !this.hasClosingPermission ||
            this.registerStatus !== 'OPEN' ||
            !this.validClosingInputs() ||
            reviewed !== this.reviewSnapshot()
          ) {
            this.errorMessage = extract('web1232.closing.contextChanged');
            this.finishSubmitting();
            return;
          }
          const request: CashierClosingRequest = {
            idempotencyKey: this.idempotencyKey,
            cashierId: updated.cashierId,
            businessDate: updated.businessDate,
            currencyCode: updated.currencyCode,
            denominations: this.denominationPayload(),
            checkIds: [...this.assetForm.controls.checkIds.value]
          };
          this.pendingClosing = {
            request,
            context: { ...updated, eligibleChecks: updated.eligibleChecks.map((check) => ({ ...check })) }
          };
          this.contextForm.disable({ emitEvent: false });
          this.assetForm.disable({ emitEvent: false });
          this.savePendingClosing();
          this.hasUnresolvedSubmission = true;
          this.service
            .closeCashier(request)
            .pipe(finalize(() => this.finishSubmitting()))
            .subscribe({
              next: (receipt: CashierClosingReceipt) => {
                if (version !== this.contextRequestVersion || !this.validCompletedReceipt(receipt, updated)) {
                  this.errorMessage = extract('web1232.closing.unresolved');
                  return;
                }
                this.acceptCompletedReceipt(receipt);
                this.finishSubmitting();
                this.loadContext(true);
              },
              error: (error: unknown) => {
                const code = (error as { error?: { errors?: Array<{ userMessageGlobalisationCode?: string }> } })?.error
                  ?.errors?.[0]?.userMessageGlobalisationCode;
                if (
                  code === 'error.msg.base.teller.closing.not.opened' ||
                  code === 'error.msg.base.teller.closing.already.completed'
                ) {
                  // These domain rejections happen before financial writes; their outcome is known.
                  this.clearPendingClosing();
                  this.finishSubmitting();
                  this.loadContext(true);
                  return;
                }
                // A timeout or an unverified error is not proof that the financial command failed.
                // Resolve with GETs; never silently resend or assign a new request identity.
                this.errorMessage = extract('web1232.closing.unresolved');
                this.retryAction = () => this.loadContext(true);
              }
            });
        },
        error: () => {
          if (version === this.contextRequestVersion) {
            this.closingContext = undefined;
            this.hasLoaded = false;
            this.errorMessage = extract('web1232.closing.statusUnavailable');
            this.retryAction = () => this.loadContext(true);
          }
          this.finishSubmitting();
        }
      });
  }

  submitOperation(): void {
    const context = this.closingContext;
    if (!context || !this.canCreateDeposit || this.isSubmitting || this.isConfirming) {
      return;
    }
    const request: CashOperationRequest = {
      idempotencyKey: this.idempotencyKey,
      transactionType: this.operationType,
      cashierId: context.cashierId,
      businessDate: context.businessDate,
      currencyCode: context.currencyCode,
      denominations: this.denominationPayload(),
      checkIds: [...this.assetForm.controls.checkIds.value],
      description: this.assetForm.controls.description.value || null
    };
    if (this.unresolvedOperation && JSON.stringify(request) !== JSON.stringify(this.unresolvedOperation)) {
      this.errorMessage = 'web1232.errors.notCompleted';
      return;
    }
    const version = this.contextRequestVersion;
    this.prepareRequest();
    this.unresolvedOperation = request;
    this.hasUnresolvedSubmission = true;
    this.isSubmitting = true;
    this.service
      .createCashOperation(request)
      .pipe(finalize(() => this.finishSubmitting()))
      .subscribe({
        next: (receipt: CashOperation) => {
          if (version === this.contextRequestVersion) this.operationReceipt = receipt;
          if (receipt.status !== 'COMPLETED') {
            this.errorMessage = 'web1232.errors.notCompleted';
            this.retryAction = () => this.reviewAndSubmit();
          } else {
            this.unresolvedOperation = undefined;
            this.hasUnresolvedSubmission = false;
            this.idempotencyKey = this.newIdempotencyKey();
          }
        },
        error: (error: unknown) => this.setError(error, 'web1232.errors.operation', () => this.reviewAndSubmit())
      });
  }

  loadReceipt(): void {
    if (!this.closingReceipt || this.isSubmitting) {
      return;
    }
    const expected = this.closingReceipt;
    const version = this.contextRequestVersion;
    this.prepareRequest();
    this.isLoading = true;
    this.service
      .getCashierClosing(expected.id)
      .pipe(finalize(() => this.finishLoading()))
      .subscribe({
        next: (receipt: CashierClosingReceipt) => {
          if (
            version === this.contextRequestVersion &&
            this.contextMatches(receipt) &&
            this.validCompletedReceipt(receipt, expected)
          )
            this.acceptCompletedReceipt(receipt);
        },
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
    if (this.closingInputsDisabled) return;
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
    if (!action || this.isSubmitting || this.isLoading || this.isConfirming) return;
    this.prepareRequest();
    action();
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

  private contextMatches(context: ClosingIdentity): boolean {
    const value = this.contextForm.getRawValue();
    return (
      String(context.cashierId) === String(value.cashierId) &&
      String(context.tellerId) === String(value.tellerId) &&
      context.businessDate === this.formatDate(value.businessDate) &&
      context.currencyCode === value.currencyCode
    );
  }

  private validPosition(context: CashierClosingContext): boolean {
    return !!context && !!context.officeId && !!context.tellerId && !!context.cashierId && [
        context.openingBalance,
        context.cashInflows,
        context.cashOutflows,
        context.previousSettlements,
        context.expectedAmount
      ].every(
        (value) => typeof value === 'number' && Number.isFinite(value)
      ) && Array.isArray(context.eligibleChecks) && context.eligibleChecks.every((check) => !!check.id && typeof check.amount === 'number' && Number.isFinite(check.amount) && check.amount >= 0);
  }

  private validClosingInputs(): boolean {
    const selected = this.assetForm.controls.checkIds.value.map(String);
    const values = this.denominations.controls.map((control) => Number(control.controls.value.value));
    return (
      this.contextForm.valid &&
      this.assetForm.valid &&
      this.formatDate(this.settingsService.businessDate) === this.closingContext?.businessDate &&
      Number.isFinite(this.cashPreview) &&
      new Set(values).size === values.length &&
      values.every((value) => Number.isFinite(value) && value > 0) &&
      new Set(selected).size === selected.length &&
      selected.length === this.selectedChecks.length
    );
  }

  /** Includes position, identity, check custody and declared assets, excluding labels and timestamps. */
  private reviewSnapshot(): string {
    const context = this.closingContext;
    return JSON.stringify({
      form: this.contextForm.getRawValue(),
      context: context && {
        businessDate: context.businessDate,
        officeId: String(context.officeId),
        tellerId: String(context.tellerId),
        cashierId: String(context.cashierId),
        currencyCode: context.currencyCode,
        status: context.status,
        registerStatus: context.registerStatus,
        closingId: context.closingId ?? null,
        openingBalance: context.openingBalance,
        cashInflows: context.cashInflows,
        cashOutflows: context.cashOutflows,
        previousSettlements: context.previousSettlements,
        expectedAmount: context.expectedAmount,
        checks: (Array.isArray(context.eligibleChecks) ? context.eligibleChecks : [])
          .map((check) => [
            String(check.id),
            check.amount
          ])
          .sort()
      },
      assets: this.assetForm.getRawValue()
    });
  }

  private validCompletedReceipt(receipt: CashierClosingReceipt, context: ClosingIdentity): boolean {
    return (
      !!receipt &&
      receipt.status === 'COMPLETED' &&
      !!receipt.id &&
      !!receipt.reference &&
      String(receipt.cashierId) === String(context.cashierId) &&
      String(receipt.officeId) === String(context.officeId) &&
      String(receipt.tellerId) === String(context.tellerId) &&
      receipt.businessDate === context.businessDate &&
      receipt.currencyCode === context.currencyCode &&
      [
        receipt.cashTotal,
        receipt.checkTotal,
        receipt.expectedAmount,
        receipt.actualAmount,
        receipt.difference
      ].every((value) => typeof value === 'number' && Number.isFinite(value))
    );
  }

  private completedReceiptMatches(): boolean {
    const receipt = this.closingReceipt;
    return !!receipt && this.contextMatches(receipt) && this.validCompletedReceipt(receipt, receipt);
  }

  private acceptCompletedReceipt(receipt: CashierClosingReceipt): void {
    this.closingReceipt = receipt;
    this.clearPendingClosing();
    this.errorMessage = '';
    this.retryAction = undefined;
  }

  private clearPendingClosing(): void {
    this.pendingClosing = undefined;
    this.hasUnresolvedSubmission = false;
    this.contextForm.enable({ emitEvent: false });
    this.assetForm.enable({ emitEvent: false });
    sessionStorage.removeItem(this.pendingStorageKey());
    this.idempotencyKey = this.newIdempotencyKey();
  }

  private fetchCompletedReceipt(id: FineractId, version: number): void {
    const context = this.closingContext;
    if (
      !context ||
      (this.closingReceipt && String(this.closingReceipt.id) === String(id) && this.completedReceiptMatches())
    )
      return;
    this.service
      .getCashierClosing(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (receipt) => {
          if (version !== this.contextRequestVersion) return;
          if (this.validCompletedReceipt(receipt, context)) this.acceptCompletedReceipt(receipt);
          else this.errorMessage = 'web1232.errors.receipt';
          this.cdr.markForCheck();
        },
        error: () => {
          if (version === this.contextRequestVersion) {
            this.errorMessage = 'web1232.errors.receipt';
            this.cdr.markForCheck();
          }
        }
      });
  }

  private pendingStorageKey(): string {
    return `cashier-closing:${this.settingsService.server}:${this.settingsService.tenantIdentifier}:${this.authenticationService.getCredentials()?.userId}`;
  }

  private savePendingClosing(): void {
    sessionStorage.setItem(this.pendingStorageKey(), JSON.stringify(this.pendingClosing));
  }

  /** Reloading must retain the original request identity while its outcome is unknown. */
  private restorePendingClosing(): void {
    const saved = sessionStorage.getItem(this.pendingStorageKey());
    if (!saved) return;
    try {
      this.pendingClosing = JSON.parse(saved);
      const context = this.pendingClosing!.context;
      this.idempotencyKey = this.pendingClosing!.request.idempotencyKey;
      this.hasUnresolvedSubmission = true;
      this.contextForm.setValue({
        businessDate: context.businessDate,
        tellerId: context.tellerId,
        cashierId: context.cashierId,
        currencyCode: context.currencyCode
      });
      this.contextForm.disable({ emitEvent: false });
      this.assetForm.disable({ emitEvent: false });
      this.errorMessage = extract('web1232.closing.unresolved');
    } catch {
      // Corrupt stored financial state cannot authorize another command.
      this.errorMessage = extract('web1232.closing.unresolved');
      this.hasUnresolvedSubmission = true;
    }
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
    this.confirmation?.close();
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
