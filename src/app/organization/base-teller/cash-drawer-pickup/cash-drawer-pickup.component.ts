/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { _ as extract } from '@ngx-translate/core';
import { finalize, Subscription, take } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { InventoryLine, fromUnits, toUnits } from '../cash-exchange/cash-exchange.models';
import { CashDrawerPickupService } from './cash-drawer-pickup.service';
import { PickupCheck, PickupContext, PickupRecord, PickupRequest } from './cash-drawer-pickup.models';
import { PickupChecksDialogComponent } from './pickup-checks-dialog.component';
import { PickupConfirmDialogComponent } from './pickup-confirm-dialog.component';
import { PickupSummaryComponent } from './pickup-summary.component';
import { pickupError } from './pickup-error';

const integerQuantity = (control: AbstractControl) =>
  Number.isSafeInteger(control.value) && control.value >= 0 ? null : { quantity: true };

@Component({
  selector: 'mifosx-cash-drawer-pickup',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    PickupSummaryComponent,
    MatTableModule
  ],
  templateUrl: './cash-drawer-pickup.component.html',
  styleUrls: ['./cash-drawer-pickup.component.scss']
})
export class CashDrawerPickupComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly service = inject(CashDrawerPickupService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private checkSubscription?: Subscription;
  readonly columns = [
    'denomination',
    'type',
    'available',
    'quantity',
    'amount'
  ];
  readonly form;
  context?: PickupContext;
  rows: {
    currencyCode: string;
    decimalPlaces: number;
    denominations: InventoryLine[];
    quantities: FormArray<FormControl<number>>;
  }[] = [];
  checks: PickupCheck[] = [];
  selected: PickupCheck[] = [];
  result?: PickupRecord;
  receipt?: PickupRecord;
  loading = false;
  checksLoading = false;
  busy = false;
  printing = false;
  error = '';
  private readonly fb = inject(FormBuilder);
  constructor() {
    this.form = this.fb.group({
      cashierId: this.fb.control<number | null>(null, Validators.required),
      destinationCashierId: this.fb.control<number | null>(null, Validators.required)
    });
  }
  ngOnInit(): void {
    if (!this.pendingPickup) this.reload();
    this.form.controls.cashierId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.form.controls.destinationCashierId.reset(null, { emitEvent: false });
      this.resetSelection();
    });
  }
  get destinations() {
    const source = this.context?.sourceCashiers.find((s) => s.cashierId === this.form.controls.cashierId.value);
    return (
      this.context?.destinations.filter((d) => d.officeId === source?.officeId && d.cashierId !== source.cashierId) ??
      []
    );
  }
  get sourceName(): string {
    return (
      this.context?.sourceCashiers.find((s) => s.cashierId === this.form.controls.cashierId.value)?.cashierName ?? ''
    );
  }
  get pendingPickup() {
    return this.service.pendingPickup;
  }
  resume(): void {
    const pending = this.pendingPickup;
    if (!pending || this.busy) return;
    this.busy = true;
    this.error = '';
    this.openConfirmation(pending.request, pending.preview, true);
  }
  reload(): void {
    if (this.busy || this.loading || this.pendingPickup) return;
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
          const source =
            context.sourceCashiers.find((s) => s.cashierId === this.form.controls.cashierId.value) ??
            context.sourceCashiers[0];
          this.form.controls.cashierId.setValue(source?.cashierId ?? null, { emitEvent: false });
          if (!this.destinations.some((d) => d.cashierId === this.form.controls.destinationCashierId.value))
            this.form.controls.destinationCashierId.reset(null);
          if (this.destinations.length === 1)
            this.form.controls.destinationCashierId.setValue(this.destinations[0].cashierId);
          this.resetSelection();
        },
        error: (error) => (this.error = pickupError(error))
      });
  }
  private resetSelection(): void {
    this.checkSubscription?.unsubscribe();
    this.checks = [];
    this.selected = [];
    this.rows = [];
    try {
      this.rows = (this.context?.currencies ?? []).map((currency) => {
        const denominations =
          this.context!.sourceInventory.find(
            (s) => s.cashierId === this.form.controls.cashierId.value && s.currencyCode === currency.currencyCode
          )?.denominations ?? [];
        denominations.forEach((d) => {
          toUnits(d.value, currency.decimalPlaces);
          if (!Number.isSafeInteger(d.availableQuantity) || d.availableQuantity < 0)
            throw new Error('Invalid inventory');
        });
        return {
          ...currency,
          denominations,
          quantities: this.fb.array(
            denominations.map((d) =>
              this.fb.nonNullable.control(0, [
                integerQuantity,
                Validators.max(d.availableQuantity)
              ])
            )
          )
        };
      });
    } catch {
      this.rows = [];
      this.error = extract('cashPickup.unavailable');
    }
    const cashierId = this.form.controls.cashierId.value;
    if (!cashierId) return;
    this.checksLoading = true;
    this.checkSubscription = this.service
      .checks(cashierId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.checksLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (checks) => (this.checks = checks),
        error: (error) => (this.error = pickupError(error))
      });
  }
  amount(row: (typeof this.rows)[number], i: number): string {
    const quantity = row.quantities.at(i).value;
    return fromUnits(
      toUnits(row.denominations[i].value, row.decimalPlaces) *
        BigInt(Number.isSafeInteger(quantity) && quantity >= 0 ? quantity : 0),
      row.decimalPlaces
    );
  }
  total(row: (typeof this.rows)[number], type?: 'BILL' | 'COIN' | 'CHECK' | 'TOTAL'): string {
    let sum = 0n;
    if (type === 'TOTAL')
      return fromUnits(
        toUnits(this.total(row), row.decimalPlaces) + toUnits(this.total(row, 'CHECK'), row.decimalPlaces),
        row.decimalPlaces
      );
    if (type === 'CHECK') {
      sum = this.selected
        .filter((c) => c.currencyCode === row.currencyCode)
        .reduce((total, c) => total + toUnits(c.amount, row.decimalPlaces), 0n);
    } else {
      row.denominations.forEach((line, i) => {
        const isCoin = line.type === 'COIN';
        if (!type || (type === 'COIN' ? isCoin : !isCoin)) sum += toUnits(this.amount(row, i), row.decimalPlaces);
      });
    }
    return fromUnits(sum, row.decimalPlaces);
  }
  selectChecks(): void {
    if (this.busy || this.loading || this.checksLoading || this.pendingPickup) return;
    this.dialog
      .open(PickupChecksDialogComponent, {
        data: { checks: this.checks, selected: this.selected, sourceName: this.sourceName },
        width: '800px',
        maxWidth: '95vw'
      })
      .afterClosed()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((selected) => {
        if (selected) {
          this.selected = selected;
          this.cdr.markForCheck();
        }
      });
  }
  get canContinue(): boolean {
    return (
      !!this.context?.permissions.includes('CREATE') &&
      !this.loading &&
      !this.checksLoading &&
      !this.busy &&
      !this.pendingPickup &&
      this.form.valid &&
      this.rows.every((r) => r.quantities.valid) &&
      (this.selected.length > 0 || this.rows.some((r) => r.quantities.value.some((q: number) => q > 0)))
    );
  }
  finish(): void {
    if (!this.canContinue) return;
    this.busy = true;
    this.error = '';
    this.form.disable({ emitEvent: false });
    const input = this.form.getRawValue();
    const request: PickupRequest = {
      cashierId: input.cashierId!,
      destinationCashierId: input.destinationCashierId!,
      idempotencyKey:
        crypto.randomUUID?.() ??
        Array.from(crypto.getRandomValues(new Uint32Array(4)), (value) => value.toString(16)).join('-'),
      currencies: this.rows
        .map((row) => ({
          currencyCode: row.currencyCode,
          cashDenominations: row.denominations
            .map((d, i) => ({ denominationId: d.denominationId, quantity: row.quantities.at(i).value }))
            .filter((d) => d.quantity > 0),
          checks: this.selected
            .filter((c) => c.currencyCode === row.currencyCode)
            .map((c) => ({ source: c.source, id: c.id }))
        }))
        .filter((c) => c.cashDenominations.length || c.checks.length)
    };
    this.service
      .preview(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (preview) => {
          if (
            preview.status !== 'PREVIEW' ||
            preview.sourceCashierId !== request.cashierId ||
            preview.destinationCashierId !== request.destinationCashierId
          ) {
            this.error = extract('cashPickup.unavailable');
            this.unlock();
            return;
          }
          this.openConfirmation(request, preview);
        },
        error: (error) => {
          this.error = pickupError(error);
          this.unlock();
          this.reload();
        }
      });
  }
  private openConfirmation(request: PickupRequest, preview: PickupRecord, uncertain = false): void {
    this.dialog
      .open(PickupConfirmDialogComponent, {
        data: { request, preview, uncertain },
        width: '640px',
        maxWidth: '95vw',
        disableClose: true
      })
      .afterClosed()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((outcome?: PickupRecord | 'pending') => {
        if (outcome === 'pending') {
          this.service.pendingPickup = { request, preview };
          this.busy = false;
          this.cdr.markForCheck();
          return;
        }
        this.service.pendingPickup = undefined;
        this.unlock();
        if (outcome?.id) {
          this.result = outcome;
          this.receipt = undefined;
        }
        this.reload();
      });
  }
  private unlock(): void {
    this.busy = false;
    this.cdr.markForCheck();
    this.form.enable({ emitEvent: false });
  }
  printReceipt(): void {
    if (!this.result?.id || this.printing || !this.context?.permissions.includes('REPRINT')) return;
    this.printing = true;
    this.service
      .receipt(this.result.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.printing = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => {
          this.receipt = receipt;
          this.cdr.detectChanges();
          setTimeout(() => window.print());
        },
        error: (error) => (this.error = pickupError(error))
      });
  }
}
