/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription, finalize } from 'rxjs';

import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import {
  ReversalCandidate,
  ReversalContext,
  ReversalDenomination,
  ReversalDetail,
  ReversalLine,
  ReversalQuantity,
  ReversalPreview,
  ReversalRequest,
  ReversalResult,
  TransactionReversalService
} from './transaction-reversal.service';

interface ReversalConfirmDialogData extends ReversalPreview {
  minorUnitFactor: number;
}

@Component({
  selector: 'mifosx-transaction-reversal',
  templateUrl: './transaction-reversal.component.html',
  styleUrls: ['./transaction-reversal.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule,
    MatPaginatorModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionReversalComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly service = inject(TransactionReversalService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private searchSubscription?: Subscription;
  private detailSubscription?: Subscription;
  private quantitySubscriptions = new Subscription();
  private idempotencyKey = '';

  readonly form = this.formBuilder.group({
    transactionDate: this.formBuilder.control('', { nonNullable: true, validators: Validators.required }),
    authorizationNumber: this.formBuilder.control('', { nonNullable: true, validators: Validators.required })
  });
  readonly columns = [
    'date',
    'user',
    'type',
    'operation',
    'amount',
    'currency',
    'status',
    'select'
  ];
  readonly quantities = new Map<string, FormControl<number>>();
  readonly returnedQuantities = new Map<string, FormControl<number>>();
  context?: ReversalContext;
  rows: ReversalCandidate[] = [];
  detail?: ReversalDetail;
  preview?: ReversalPreview;
  result?: ReversalResult;
  total = 0;
  pageIndex = 0;
  pageSize = 25;
  loading = false;
  searching = false;
  detailLoading = false;
  previewing = false;
  submitting = false;
  error = '';

  ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.resetAttempt());
    this.destroyRef.onDestroy(() => this.quantitySubscriptions.unsubscribe());
    this.loading = true;
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
          this.form.controls.transactionDate.setValue(context.businessDate);
        },
        error: (error: HttpErrorResponse) => (this.error = this.errorKey(error))
      });
  }

  search(resetPage = true): void {
    if (this.previewing || this.submitting) return;
    this.form.controls.transactionDate.markAsTouched();
    if (this.form.controls.transactionDate.invalid) return;
    if (resetPage) this.pageIndex = 0;
    this.searchSubscription?.unsubscribe();
    this.detailSubscription?.unsubscribe();
    this.detail = undefined;
    this.resetAttempt();
    this.result = undefined;
    this.rows = [];
    this.searching = true;
    this.error = '';
    this.searchSubscription = this.service
      .search(this.form.controls.transactionDate.value, this.pageIndex * this.pageSize, this.pageSize)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.searching = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          this.rows = response.items;
          this.total = response.totalFilteredRecords;
        },
        error: (error: HttpErrorResponse) => (this.error = this.errorKey(error))
      });
  }

  page(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.search(false);
  }

  select(row: ReversalCandidate): void {
    if (
      !row.eligibility.reversible ||
      !this.context?.canCreate ||
      this.detailLoading ||
      this.previewing ||
      this.submitting
    )
      return;
    this.detailSubscription?.unsubscribe();
    this.detail = undefined;
    this.resetAttempt();
    this.result = undefined;
    this.form.controls.authorizationNumber.reset('');
    this.detailLoading = true;
    this.error = '';
    this.detailSubscription = this.service
      .detail(row.original.historyId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.detailLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (detail) => {
          this.detail = detail;
          this.quantitySubscriptions.unsubscribe();
          this.quantitySubscriptions = new Subscription();
          this.quantities.clear();
          this.returnedQuantities.clear();
          if (detail.cashAmount > 0) {
            for (const denomination of detail.denominations) {
              const quantity = new FormControl(0, { nonNullable: true, validators: [
                  Validators.min(0),
                  Validators.pattern(/^[0-9]+$/)
                ] });
              this.quantities.set(denomination.id, quantity);
              this.quantitySubscriptions.add(quantity.valueChanges.subscribe(() => this.resetAttempt()));
              const returned = detail.returnedCashDenominations.find((line) => line.denominationId === denomination.id);
              const returnedQuantity = new FormControl(returned?.quantity ?? 0, { nonNullable: true, validators: [
                  Validators.min(0),
                  Validators.pattern(/^[0-9]+$/)
                ] });
              this.returnedQuantities.set(denomination.id, returnedQuantity);
              this.quantitySubscriptions.add(returnedQuantity.valueChanges.subscribe(() => this.resetAttempt()));
            }
          }
        },
        error: (error: HttpErrorResponse) => (this.error = this.errorKey(error))
      });
  }

  needsRemoval(): boolean {
    return !!this.detail && this.detail.cashAmount > 0 && this.detail.originalDirection !== 'OUT';
  }

  needsReturn(): boolean {
    return !!this.detail && this.detail.cashAmount > 0 && this.detail.originalDirection !== 'IN';
  }

  totalFor(returned: boolean): number {
    if (!this.detail) return 0;
    const controls = returned ? this.returnedQuantities : this.quantities;
    const factor = this.factor();
    return (
      this.detail.denominations.reduce(
        (sum, denomination) =>
          sum + Math.round(denomination.value * factor) * (controls.get(denomination.id)?.value ?? 0),
        0
      ) / factor
    );
  }

  difference(returned: boolean): number {
    const factor = this.factor();
    return (
      (Math.round((this.detail?.cashAmount ?? 0) * factor) - Math.round(this.totalFor(returned) * factor)) / factor
    );
  }

  amountFor(denomination: ReversalDenomination, returned: boolean): number {
    const factor = this.factor();
    const quantity = (returned ? this.returnedQuantities : this.quantities).get(denomination.id)?.value ?? 0;
    return (Math.round(denomination.value * factor) * quantity) / factor;
  }

  private factor(): number {
    const places =
      this.context?.currencies.find((currency) => currency.code === this.detail?.currencyCode)?.decimalPlaces ?? 0;
    return 10 ** places;
  }

  canPreview(): boolean {
    if (
      !this.detail?.eligibility.reversible ||
      !this.context?.canCreate ||
      this.previewing ||
      this.submitting ||
      this.form.controls.authorizationNumber.invalid ||
      !this.form.controls.authorizationNumber.value.trim()
    )
      return false;
    if (
      this.needsRemoval() &&
      (this.difference(false) !== 0 || [...this.quantities.values()].some((control) => control.invalid))
    )
      return false;
    if (
      this.needsReturn() &&
      (this.difference(true) !== 0 || [...this.returnedQuantities.values()].some((control) => control.invalid))
    )
      return false;
    return this.detail.checks.every((check) => check.eligible);
  }

  private lines(returned: boolean): ReversalQuantity[] {
    const controls = returned ? this.returnedQuantities : this.quantities;
    return [...controls.entries()]
      .filter(
        ([
          ,
          control
        ]) => control.value > 0
      )
      .map(
        ([
          denominationId,
          control
        ]) => ({
          denominationId,
          quantity: control.value
        })
      );
  }

  private request(): ReversalRequest {
    const detail = this.detail!;
    return {
      historyId: detail.historyId,
      idempotencyKey: this.idempotencyKey,
      authorizationNumber: this.form.controls.authorizationNumber.value.trim(),
      cashDenominations: this.needsRemoval() ? this.lines(false) : [],
      returnedCashDenominations: this.needsReturn() ? this.lines(true) : [],
      checks: detail.checks.map(({ id, bankId, checkNumber, amount }) => ({ id, bankId, checkNumber, amount }))
    };
  }

  showPreview(): void {
    this.form.controls.authorizationNumber.markAsTouched();
    if (!this.canPreview()) return;
    if (!this.idempotencyKey) {
      // Native reversal commands append WEB1259 and source suffixes to a 50-character key column.
      this.idempotencyKey = Array.from(crypto.getRandomValues(new Uint8Array(12)), (byte) =>
        byte.toString(16).padStart(2, '0')
      ).join('');
    }
    this.previewing = true;
    this.error = '';
    this.service
      .preview(this.request())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.previewing = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (preview) => {
          this.preview = preview;
          this.dialog
            .open(TransactionReversalConfirmDialogComponent, {
              data: { ...preview, minorUnitFactor: this.factor() } satisfies ReversalConfirmDialogData,
              width: '560px',
              maxWidth: '95vw',
              autoFocus: true
            })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((confirmed) => {
              if (confirmed) this.confirm();
            });
        },
        error: (error: HttpErrorResponse) => (this.error = this.errorKey(error))
      });
  }

  confirm(): void {
    if (!this.preview || !this.canPreview() || this.submitting) return;
    this.submitting = true;
    this.error = '';
    this.service
      .reverse(this.request())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.submitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (result) => {
          this.result = result;
          this.resetAttempt();
          this.detail = undefined;
          this.form.controls.authorizationNumber.reset('');
          this.refreshSearch();
        },
        error: (error: HttpErrorResponse) => {
          this.preview = undefined;
          this.error = this.errorKey(error);
          if (
            error.status === 409 ||
            String(error.error?.errors?.[0]?.userMessageGlobalisationCode ?? '').includes('source.ineligible')
          ) {
            this.resetAttempt();
            this.detail = undefined;
            this.form.controls.authorizationNumber.reset('');
            this.refreshSearch();
          }
        }
      });
  }

  private resetAttempt(): void {
    this.idempotencyKey = '';
    this.preview = undefined;
  }

  private refreshSearch(): void {
    const date = this.form.controls.transactionDate.value;
    this.service
      .search(date, this.pageIndex * this.pageSize, this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.rows = response.items;
          this.total = response.totalFilteredRecords;
          this.cdr.markForCheck();
        },
        error: () => this.cdr.markForCheck()
      });
  }

  private errorKey(error: HttpErrorResponse): string {
    if (error.status === 0) return 'transactionReversal.errors.network';
    const detail = error.error?.errors?.[0];
    const code = String(detail?.userMessageGlobalisationCode ?? '');
    const message = String(detail?.developerMessage ?? '').toLowerCase();
    if (code.includes('authorization.invalid') || code.includes('authorization.required'))
      return 'transactionReversal.errors.invalidAuthorization';
    if (code.includes('cash.insufficient')) return 'transactionReversal.errors.insufficientCash';
    if (
      code.includes('cash.total') ||
      code.includes('cash.required') ||
      code.includes('cash.invalid') ||
      code.includes('exchange.breakdown')
    )
      return 'transactionReversal.errors.cashTotal';
    if (code.includes('checks.')) return 'transactionReversal.errors.checks';
    if (code.includes('source.ineligible')) {
      if (message.includes('already reversed')) return 'transactionReversal.errors.alreadyReversed';
      if (message.includes('no complete reversal mechanism')) return 'transactionReversal.errors.unsupported';
      if (message.includes('closing') || message.includes('session')) return 'transactionReversal.errors.closedSession';
      return 'transactionReversal.errors.stale';
    }
    if (code.includes('source.unsupported')) return 'transactionReversal.errors.unsupported';
    if (code.includes('idempotency.conflict')) return 'transactionReversal.errors.duplicate';
    if (error.status === 409) return 'transactionReversal.errors.conflict';
    if (error.status === 403) return 'transactionReversal.errors.forbidden';
    return 'transactionReversal.errors.generic';
  }
}

@Component({
  selector: 'mifosx-transaction-reversal-confirm',
  template: `
    <h2 mat-dialog-title>{{ 'transactionReversal.confirmTitle' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ data.original.historyId }} · {{ data.original.businessDate }} · {{ data.original.operation }}</p>
      <p>{{ data.original.amount }} {{ data.original.currencyCode }}</p>
      <p>{{ 'transactionReversal.requiredAmount' | translate }}: {{ data.original.cashAmount }}</p>
      <p>{{ 'transactionReversal.checkAmount' | translate }}: {{ data.original.checkAmount }}</p>
      @if (data.cashDenominations.length) {
        <p>{{ 'transactionReversal.cashToRemove' | translate }}: {{ total(data.cashDenominations) }}</p>
      }
      @if (data.returnedCashDenominations.length) {
        <p>{{ 'transactionReversal.cashToReturn' | translate }}: {{ total(data.returnedCashDenominations) }}</p>
      }
      <p>{{ 'transactionReversal.cashEffect' | translate }}: {{ data.cashEffect }}</p>
      <p>{{ 'transactionReversal.checkEffect' | translate }}: {{ data.checkEffect }}</p>
      <p>{{ 'transactionReversal.warning' | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'transactionReversal.cancel' | translate }}</button>
      <button mat-flat-button [mat-dialog-close]="true">{{ 'transactionReversal.confirm' | translate }}</button>
    </mat-dialog-actions>
  `,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionReversalConfirmDialogComponent {
  readonly data = inject<ReversalConfirmDialogData>(MAT_DIALOG_DATA);

  total(lines: ReversalLine[]): number {
    const factor = this.data.minorUnitFactor;
    return lines.reduce((sum, line) => sum + Math.round(line.value * factor) * line.quantity, 0) / factor;
  }
}
