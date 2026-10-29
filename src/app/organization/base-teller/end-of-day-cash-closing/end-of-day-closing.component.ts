/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, DestroyRef, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { fromUnits, toUnits } from '../cash-exchange/cash-exchange.models';
import {
  ClosingCheck,
  ClosingContext,
  ClosingCurrency,
  ClosingRecord,
  ClosingRequest,
  Denomination
} from './end-of-day-closing.models';
import { EndOfDayClosingService } from './end-of-day-closing.service';
import { ClosingSummaryComponent } from './closing-summary.component';
import { ClosingConfirmDialogComponent } from './closing-confirm-dialog.component';
import { ClosingChecksDialogComponent } from './closing-checks-dialog.component';
import { closingError } from './end-of-day-closing-error';
interface CurrencyForm {
  currency: ClosingCurrency;
  quantities: FormControl<number>[];
  vouchers: FormControl<string>;
}
@Component({ selector: 'mifosx-end-of-day-closing', imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ClosingSummaryComponent
  ], templateUrl: './end-of-day-closing.component.html', styleUrls: ['./end-of-day-closing.component.scss'] })
export class EndOfDayClosingComponent implements OnInit {
  private readonly service = inject(EndOfDayClosingService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(AuthenticationService);
  private readonly cdr = inject(ChangeDetectorRef);
  context?: ClosingContext;
  readonly cashier;
  rows: CurrencyForm[] = [];
  selected: ClosingCheck[] = [];
  result?: ClosingRecord;
  report?: ClosingRecord;
  error = '';
  pending = false;
  printed = false;
  confirming = false;
  private request?: ClosingRequest;
  readonly kinds = [
    'BILL',
    'COIN'
  ];
  private readonly fb: FormBuilder;
  constructor() {
    this.fb = inject(FormBuilder);
    this.cashier = this.fb.control<number | null>(null, Validators.required);
  }
  ngOnInit(): void {
    this.load();
  }
  hasPermission(action: string): boolean {
    if (!environment.productionModeEnableRBAC) return true;
    const permissions = this.auth.getCredentials()?.permissions ?? [];
    return (
      permissions.includes('ALL_FUNCTIONS') ||
      permissions.includes(action + '_BASE_TELLER_END_OF_DAY_CLOSING') ||
      (action === 'READ' && permissions.includes('ALL_FUNCTIONS_READ'))
    );
  }
  load(): void {
    if (this.pending || this.confirming) return;
    this.pending = true;
    this.error = '';
    this.service
      .context()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.pending = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (context) => {
          this.context = context;
          this.rows = context.currencies.map((currency) => ({
            currency,
            quantities: currency.denominations.map(() =>
              this.fb.nonNullable.control(0, [
                Validators.required,
                Validators.min(0),
                Validators.max(Number.MAX_SAFE_INTEGER),
                Validators.pattern(/^\d+$/)
              ])
            ),
            vouchers: this.fb.nonNullable.control('0', [
              Validators.required,
              Validators.pattern(/^\d+(\.\d+)?$/)
            ])
          }));
          this.cashier.setValue(context.cashiers.find((c) => !c.closed)?.cashierId ?? null);
          this.changedCashier();
        },
        error: (error) => (this.error = closingError(error))
      });
  }
  changedCashier(): void {
    this.selected = [];
    this.request = undefined;
    this.result = undefined;
    this.report = undefined;
    this.printed = false;
    this.rows.forEach((row) => {
      row.quantities.forEach((q) => q.setValue(0));
      row.vouchers.setValue('0');
    });
  }
  lines(row: CurrencyForm, kind: string): Denomination[] {
    return row.currency.denominations.filter((d) => (kind === 'COIN' ? d.type === 'COIN' : d.type !== 'COIN'));
  }
  quantity(row: CurrencyForm, denomination: Denomination): FormControl<number> {
    return row.quantities[row.currency.denominations.indexOf(denomination)];
  }
  displayDenomination(value: number | string): string {
    const text = String(value);
    return text.includes('.') ? text.replace(/\.?0+$/, '') : text;
  }
  amount(row: CurrencyForm, denomination: Denomination): string {
    const control = this.quantity(row, denomination);
    return fromUnits(
      toUnits(denomination.value, row.currency.decimalPlaces) * BigInt(control.valid ? control.value : 0),
      row.currency.decimalPlaces
    );
  }
  cashTotal(row: CurrencyForm, kind?: string): string {
    const lines = kind ? this.lines(row, kind) : row.currency.denominations;
    return fromUnits(
      lines.reduce((total, d) => total + toUnits(this.amount(row, d), row.currency.decimalPlaces), 0n),
      row.currency.decimalPlaces
    );
  }
  checkTotal(row: CurrencyForm): string {
    return fromUnits(
      this.selected
        .filter((c) => c.currencyCode === row.currency.currencyCode)
        .reduce((total, c) => total + toUnits(c.amount, row.currency.decimalPlaces), 0n),
      row.currency.decimalPlaces
    );
  }
  get valid(): boolean {
    if (
      !this.context ||
      this.cashier.invalid ||
      !this.rows.length ||
      this.context.cashiers.find((c) => c.cashierId === this.cashier.value)?.closed
    )
      return false;
    return this.rows.every((row) => {
      try {
        return (
          row.quantities.every((q) => q.valid) &&
          row.vouchers.valid &&
          toUnits(row.vouchers.value, row.currency.decimalPlaces) >= 0n
        );
      } catch {
        return false;
      }
    });
  }
  selectChecks(): void {
    if (this.pending || this.confirming || !this.cashier.value) return;
    this.pending = true;
    this.error = '';
    this.service
      .checks(this.cashier.value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.pending = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (checks) => {
          this.dialog
            .open(ClosingChecksDialogComponent, {
              width: '960px',
              maxWidth: '96vw',
              data: {
                checks,
                selected: this.selected.filter((c) => checks.some((e) => e.id === c.id && e.source === c.source))
              }
            })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((selected) => {
              if (selected) {
                this.selected = selected;
                this.cdr.markForCheck();
              }
            });
        },
        error: (error) => (this.error = closingError(error))
      });
  }
  preview(): void {
    if (this.pending || this.confirming || !this.valid || !this.hasPermission('CREATE')) return;
    const declaration: ClosingRequest = {
      cashierId: this.cashier.value!,
      businessDate: this.context!.businessDate,
      idempotencyKey: this.request?.idempotencyKey ?? crypto.randomUUID(),
      currencies: this.rows.map((row) => ({
        currencyCode: row.currency.currencyCode,
        denominations: row.currency.denominations.map((d, i) => ({
          denominationId: d.denominationId,
          quantity: row.quantities[i].value
        })),
        vouchers: row.vouchers.value,
        checks: this.selected
          .filter((c) => c.currencyCode === row.currency.currencyCode)
          .map((c) => ({ source: c.source, id: c.id }))
      }))
    };
    if (
      this.request &&
      JSON.stringify({ ...this.request, idempotencyKey: '' }) !== JSON.stringify({ ...declaration, idempotencyKey: '' })
    )
      declaration.idempotencyKey = crypto.randomUUID();
    this.request = declaration;
    this.pending = true;
    this.error = '';
    this.service
      .preview(declaration)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.pending = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (preview) => {
          this.confirming = true;
          this.dialog
            .open(ClosingConfirmDialogComponent, {
              width: '720px',
              maxWidth: '96vw',
              data: { request: declaration, preview }
            })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((result) => {
              this.confirming = false;
              this.cdr.markForCheck();
              if (result) {
                this.result = result;
                this.report = undefined;
                this.printed = false;
              }
            });
        },
        error: (error) => (this.error = closingError(error))
      });
  }
  retrieve(id: number): void {
    if (this.pending || this.confirming) return;
    this.pending = true;
    this.error = '';
    this.report = undefined;
    this.service
      .retrieve(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.pending = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (result) => {
          this.result = result;
          this.printed = false;
        },
        error: (error) => (this.error = closingError(error))
      });
  }
  printReport(): void {
    if (!this.result?.id || this.pending || !this.hasPermission('REPRINT')) return;
    this.pending = true;
    this.error = '';
    this.report = undefined;
    this.service
      .report(this.result.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.pending = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (report) => {
          this.report = report;
          this.printed = true;
          this.cdr.detectChanges();
          setTimeout(() => window.print());
        },
        error: (error) => (this.error = closingError(error))
      });
  }
}
