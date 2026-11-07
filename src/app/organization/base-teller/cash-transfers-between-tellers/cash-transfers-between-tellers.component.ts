/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef, Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { _ as extract } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { fromUnits, toUnits } from '../cash-exchange/cash-exchange.models';
import {
  AvailableCurrency,
  CashTransferContext,
  CashTransferRecord,
  CashTransferRequest,
  isBalanced,
  isCompletedTransfer,
  PendingCashTransfer
} from './cash-transfer.models';
import { CashTransferService } from './cash-transfer.service';
import { cashTransferError, hasCashTransferError } from './cash-transfer-error';
import { CashTransferSummaryComponent } from './transfer-summary.component';
const integerQuantity = (control: AbstractControl) =>
  Number.isSafeInteger(control.value) && control.value >= 0 ? null : { quantity: true };
interface CurrencyRow extends AvailableCurrency {
  quantities: FormArray<FormControl<number>>;
}
@Component({
  selector: 'mifosx-cash-transfers-between-tellers',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTableModule,
    MatIconModule,
    CashTransferSummaryComponent
  ],
  templateUrl: './cash-transfers-between-tellers.component.html',
  styleUrls: ['./cash-transfers-between-tellers.component.scss']
})
export class CashTransfersBetweenTellersComponent implements OnInit {
  private readonly service = inject(CashTransferService);
  private readonly auth = inject(AuthenticationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  @ViewChild('heading') heading?: ElementRef<HTMLElement>;
  readonly form;
  readonly recoveryReviewed = new FormControl(false, { nonNullable: true });
  readonly columns = [
    'denomination',
    'type',
    'available',
    'quantity',
    'amount'
  ];
  readonly steps = [
    extract('cashTellerTransfer.details'),
    extract('cashTellerTransfer.breakdown'),
    extract('cashTellerTransfer.confirmation'),
    extract('cashTellerTransfer.completed')
  ];
  context?: CashTransferContext;
  rows: CurrencyRow[] = [];
  preview?: CashTransferRecord;
  result?: CashTransferRecord;
  receipt?: CashTransferRecord;
  pending?: PendingCashTransfer;
  step = 0;
  loading = false;
  busy = false;
  printing = false;
  error = '';
  inventoryError = '';
  private readonly fb: FormBuilder;
  constructor() {
    this.fb = inject(FormBuilder);
    this.form = this.fb.group({
      destinationCashierId: this.fb.control<number | null>(null, [
        Validators.required,
        (control) =>
          this.context && !this.destinations.some((d) => d.cashierId === control.value) ? { destination: true } : null
      ]),
      currencies: this.fb.array<FormArray<FormControl<number>>>([])
    });
  }
  ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.preview = undefined;
      this.error = '';
    });
    try {
      this.pending = this.service.pending;
    } catch {
      this.error = extract('cashTellerTransfer.storage');
      return;
    }
    if (this.pending) {
      this.preview = isBalanced(this.pending.preview) ? this.pending.preview : undefined;
      if (!this.preview) this.requireRecoveryReview();
      this.go(2);
    }
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (this.pending) return;
      const id = params.get('transferId');
      this.preview = undefined;
      this.result = undefined;
      this.receipt = undefined;
      this.error = '';
      this.inventoryError = '';
      if (id) {
        this.context = undefined;
        this.rows = [];
        this.loadTransfer(Number(id));
      } else {
        this.go(0);
        this.reload();
      }
    });
  }
  get destinations() {
    return (
      this.context?.destinations.filter(
        (d) =>
          d.cashierId !== this.context.source.cashierId &&
          d.staffId !== this.context.source.staffId &&
          d.officeId === this.context.source.officeId &&
          !d.closed
      ) ?? []
    );
  }
  get destination() {
    return this.destinations.find((d) => d.cashierId === this.form.controls.destinationCashierId.value);
  }
  get sourceSetupRequired(): boolean {
    return (
      this.inventoryError === 'cashTellerTransfer.sourceAssignmentRequired' ||
      this.inventoryError === 'cashTellerTransfer.staffAssignmentRequired'
    );
  }
  get canOpenSourceDrawer(): boolean {
    const permissions = this.auth.getCredentials()?.permissions ?? [];
    return this.inventoryError === 'cashTellerTransfer.sourceAssignmentRequired' && [
        'ALL_FUNCTIONS',
        'ALL_FUNCTIONS_READ',
        'READ_BASE_TELLER_CASH_ALLOCATION'
      ].some((permission) => permissions.includes(permission));
  }
  hasPermission(action: 'CREATE' | 'REPRINT'): boolean {
    const permission = action + '_BASE_TELLER_CASH_TRANSFER';
    const permissions = this.auth.getCredentials()?.permissions ?? [];
    return permissions.includes('ALL_FUNCTIONS') || permissions.includes(permission);
  }
  go(step: number): void {
    this.step = step;
    this.cdr.markForCheck();
    setTimeout(() => this.heading?.nativeElement.focus());
  }
  reload(): void {
    if (this.loading || this.busy || this.pending) return;
    this.loading = true;
    this.preview = undefined;
    this.inventoryError = '';
    this.service
      .context()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (context) => {
          this.context = context;
          this.preview = undefined;
          this.form.controls.destinationCashierId.reset(null, { emitEvent: false });
          this.rows = [];
          this.form.controls.currencies.clear({ emitEvent: false });
          try {
            this.rows = context.currencies.map((currency) => {
              currency.denominations.forEach((d) => {
                toUnits(d.denominationValue, currency.decimalPlaces);
                if (!Number.isSafeInteger(d.availableQuantity) || d.availableQuantity < 0)
                  throw new Error('Invalid inventory');
              });
              const quantities = this.fb.array(
                currency.denominations.map((d) =>
                  this.fb.nonNullable.control(0, [
                    integerQuantity,
                    Validators.max(d.availableQuantity)
                  ])
                )
              );
              this.form.controls.currencies.push(quantities, { emitEvent: false });
              return { ...currency, quantities };
            });
          } catch {
            this.rows = [];
            this.inventoryError = extract('cashTellerTransfer.configuration');
          }
        },
        error: (error) => {
          this.context = undefined;
          this.rows = [];
          this.inventoryError = cashTransferError(error);
        }
      });
  }
  amount(row: CurrencyRow, i: number): string {
    const quantity = row.quantities.at(i).value;
    return fromUnits(
      toUnits(row.denominations[i].denominationValue, row.decimalPlaces) *
        BigInt(Number.isSafeInteger(quantity) && quantity >= 0 ? quantity : 0),
      row.decimalPlaces
    );
  }
  total(row: CurrencyRow, type?: 'BILL' | 'COIN'): string {
    return fromUnits(
      row.denominations.reduce(
        (sum, d, i) =>
          !type || (d.denominationType === 'COIN') === (type === 'COIN')
            ? sum + toUnits(this.amount(row, i), row.decimalPlaces)
            : sum,
        0n
      ),
      row.decimalPlaces
    );
  }
  get canContinue(): boolean {
    return (
      !!this.context?.permissions.includes('CREATE_BASE_TELLER_CASH_TRANSFER') &&
      this.hasPermission('CREATE') &&
      !this.loading &&
      !this.busy &&
      !this.pending &&
      !this.inventoryError &&
      this.form.valid &&
      !!this.destination &&
      this.rows.some((row) => row.quantities.value.some((quantity) => quantity > 0))
    );
  }
  next(): void {
    if (this.destination && !this.loading) this.go(1);
  }
  back(): void {
    if (!this.busy && !this.pending) {
      this.preview = undefined;
      this.go(Math.max(0, this.step - 1));
    }
  }
  cancel(): void {
    if (!this.busy && !this.pending) {
      this.preview = undefined;
      this.result = undefined;
      this.receipt = undefined;
      this.error = '';
      this.go(0);
      if (this.route.snapshot.queryParamMap.get('transferId')) {
        void this.router.navigate(['/organization/base-teller/cash-transfers-between-tellers']);
      } else {
        this.reload();
      }
    }
  }
  private request(): CashTransferRequest {
    return {
      destinationCashierId: this.form.controls.destinationCashierId.value!,
      currencies: this.rows
        .map((row) => ({
          currencyCode: row.currencyCode,
          denominations: row.denominations
            .map((d, i) => ({ denominationId: d.denominationId, quantity: row.quantities.at(i).value }))
            .filter((d) => d.quantity > 0)
        }))
        .filter((c) => c.denominations.length > 0)
    };
  }
  continue(): void {
    if (!this.canContinue) return;
    this.busy = true;
    this.error = '';
    this.preview = undefined;
    const request = this.request();
    this.form.disable({ emitEvent: false });
    this.service
      .preview(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.unlock())
      )
      .subscribe({
        next: (preview) => {
          if (
            !isBalanced(preview) ||
            preview.status !== 'PREVIEW' ||
            preview.source.cashierId !== this.context?.source.cashierId ||
            preview.destination.cashierId !== request.destinationCashierId
          ) {
            this.error = extract('cashTellerTransfer.unbalanced');
            return;
          }
          this.preview = preview;
          this.go(2);
        },
        error: (error) => {
          this.error = cashTransferError(error);
        }
      });
  }
  get canConfirm(): boolean {
    return (
      !this.busy &&
      !this.pending?.requiresReview &&
      this.hasPermission('CREATE') &&
      !!this.preview &&
      isBalanced(this.preview) &&
      (!!this.pending || this.canContinue)
    );
  }
  confirm(): void {
    if (!this.canConfirm) return;
    if (!this.pending) {
      const pending = { request: { ...this.request(), idempotencyKey: crypto.randomUUID() }, preview: this.preview! };
      try {
        this.service.remember(pending);
        this.pending = pending;
      } catch {
        this.error = extract('cashTellerTransfer.storage');
        return;
      }
    }
    this.busy = true;
    this.error = '';
    this.form.disable({ emitEvent: false });
    this.service
      .create(this.pending.request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.unlock())
      )
      .subscribe({
        next: (result) => {
          if (
            !isCompletedTransfer(result) ||
            result.source.cashierId !== this.pending?.preview.source.cashierId ||
            result.destination.cashierId !== this.pending?.request.destinationCashierId
          ) {
            this.requireRecoveryReview();
            return;
          }
          this.result = result;
          this.service.clearPending();
          this.pending = undefined;
          this.preview = undefined;
          this.go(3);
          // Read the authoritative state after the create subscription has unlocked.
          this.unlock();
          this.reload();
        },
        error: (error) => {
          // An unresolved conflict needs reconciliation before another transfer can be started.
          if (error.status === 409 && !hasCashTransferError(error, 'idempotency.conflict')) {
            this.requireRecoveryReview();
            return;
          }
          const message = cashTransferError(error);
          const requiresRetry = error.status === 408 || error.status === 429;
          if (error.status >= 400 && error.status < 500 && !requiresRetry) {
            this.service.clearPending();
            this.pending = undefined;
            this.preview = undefined;
            this.error = message;
            this.go(1);
            this.unlock();
            this.reload();
          } else {
            this.error = extract('cashTellerTransfer.uncertain');
          }
        }
      });
  }
  private requireRecoveryReview(): void {
    if (!this.pending) return;
    this.pending = { ...this.pending, requiresReview: true };
    this.recoveryReviewed.reset(false);
    this.error = '';
    try {
      this.service.remember(this.pending);
    } catch {
      this.error = extract('cashTellerTransfer.storage');
    }
  }
  discardPending(): void {
    if (this.busy || !this.pending?.requiresReview || !this.recoveryReviewed.value) return;
    try {
      this.service.clearPending();
    } catch {
      this.error = extract('cashTellerTransfer.storage');
      return;
    }
    this.pending = undefined;
    this.recoveryReviewed.reset(false);
    this.form.enable({ emitEvent: false });
    this.cancel();
  }
  private unlock(): void {
    this.busy = false;
    if (!this.pending) this.form.enable({ emitEvent: false });
    this.cdr.markForCheck();
  }
  private loadTransfer(id: number): void {
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.error = extract('cashTellerTransfer.unavailable');
      return;
    }
    this.loading = true;
    this.service
      .retrieve(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (record) => {
          if (isCompletedTransfer(record, id)) {
            this.result = record;
            this.go(3);
          } else this.error = extract('cashTellerTransfer.unavailable');
        },
        error: (error) => (this.error = cashTransferError(error))
      });
  }
  printReceipt(): void {
    if (!this.result?.id || this.printing || !this.hasPermission('REPRINT')) return;
    const transferId = this.result.id;
    this.printing = true;
    this.receipt = undefined;
    this.error = '';
    this.service
      .receipt(transferId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.printing = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => {
          if (!isCompletedTransfer(receipt, transferId) || this.result?.id !== transferId) {
            this.error = extract('cashTellerTransfer.unavailable');
            return;
          }
          this.receipt = receipt;
          this.cdr.detectChanges();
          setTimeout(() => {
            if (this.receipt === receipt && this.result?.id === transferId) window.print();
          });
        },
        error: (error) => (this.error = cashTransferError(error))
      });
  }
}
