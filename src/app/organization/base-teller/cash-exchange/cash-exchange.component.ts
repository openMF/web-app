/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { _ as extract } from '@ngx-translate/core';
import { Subscription, finalize, take } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { environment } from 'environments/environment';
import { CashExchangeService } from './cash-exchange.service';
import {
  ExchangeContext,
  ExchangeInventory,
  ExchangeRecord,
  ExchangeRequest,
  fromUnits,
  toUnits
} from './cash-exchange.models';
import { CashExchangeConfirmDialogComponent } from './cash-exchange-confirm-dialog.component';

const quantityValidator = (control: AbstractControl) =>
  Number.isSafeInteger(control.value) && control.value >= 0 ? null : { quantity: true };

@Component({
  selector: 'mifosx-cash-exchange',
  templateUrl: './cash-exchange.component.html',
  styleUrls: ['./cash-exchange.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashExchangeComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly service = inject(CashExchangeService);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthenticationService);
  private readonly destroyRef = inject(DestroyRef);
  private inventorySubscription?: Subscription;
  readonly form;
  context?: ExchangeContext;
  inventory?: ExchangeInventory;
  result?: ExchangeRecord;
  receipt?: ExchangeRecord;
  loading = false;
  busy = false;
  printing = false;
  error = '';
  pendingRequest?: ExchangeRequest;
  readonly sides = [
    'received',
    'delivered'
  ] as const;

  readonly labels = {
    receivedTotal: extract('cashExchange.receivedTotal'),
    deliveredTotal: extract('cashExchange.deliveredTotal'),
    balanced: extract('cashExchange.balanced'),
    print: extract('cashExchange.print'),
    reprint: extract('cashExchange.reprint'),
    invalidQuantity: extract('cashExchange.invalidQuantity')
  };

  private readonly fb: FormBuilder;

  constructor() {
    this.fb = inject(FormBuilder);
    this.form = this.fb.group({
      cashierId: this.fb.control<number | null>(null, Validators.required),
      currencyCode: this.fb.nonNullable.control('', Validators.required),
      received: this.fb.array<ReturnType<typeof this.quantityControl>>([]),
      delivered: this.fb.array<ReturnType<typeof this.quantityControl>>([])
    });
  }

  ngOnInit(): void {
    this.loadContext();
    this.form.controls.cashierId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadInventory());
    this.form.controls.currencyCode.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadInventory());
  }

  hasPermission(action: 'CREATE' | 'REPRINT'): boolean {
    const permissions = this.auth.getCredentials()?.permissions ?? [];
    return (
      !environment.productionModeEnableRBAC ||
      permissions.includes('ALL_FUNCTIONS') ||
      permissions.includes(`${action}_BASE_TELLER_CASH_EXCHANGE`)
    );
  }

  loadContext(): void {
    if (this.busy || this.pendingRequest) return;
    this.loading = true;
    this.error = '';
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
        },
        error: (error) => this.showError(error)
      });
  }

  loadInventory(): void {
    if (this.busy || this.pendingRequest) return;
    this.inventorySubscription?.unsubscribe();
    this.inventory = undefined;
    this.form.controls.received.clear();
    this.form.controls.delivered.clear();
    this.error = '';
    const { cashierId, currencyCode } = this.form.getRawValue();
    if (!cashierId || !currencyCode) return;
    this.loading = true;
    this.inventorySubscription = this.service
      .denominations(cashierId, currencyCode)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (inventory) => {
          if (inventory.cashierId !== cashierId || inventory.currencyCode !== currencyCode) {
            this.error = extract('cashExchange.unavailable');
            return;
          }
          try {
            inventory.denominations.forEach((line) => {
              toUnits(line.value, inventory.decimalPlaces);
              if (!Number.isSafeInteger(line.availableQuantity) || line.availableQuantity < 0)
                throw new Error('Invalid inventory');
            });
          } catch {
            this.error = extract('cashExchange.unavailable');
            return;
          }
          this.inventory = inventory;
          inventory.denominations.forEach((line) => {
            this.form.controls.received.push(this.quantityControl());
            this.form.controls.delivered.push(this.quantityControl(line.availableQuantity));
          });
        },
        error: (error) => this.showError(error)
      });
  }

  private quantityControl(max = Number.MAX_SAFE_INTEGER) {
    return this.fb.nonNullable.control(0, [
      quantityValidator,
      Validators.max(max)
    ]);
  }

  totalUnits(side: 'received' | 'delivered'): bigint {
    return (this.inventory?.denominations ?? []).reduce((sum, line, i) => {
      const quantity = this.form.controls[side].at(i)?.value;
      return (
        sum +
        (Number.isSafeInteger(quantity) && quantity >= 0
          ? toUnits(line.value, this.inventory!.decimalPlaces) * BigInt(quantity)
          : 0n)
      );
    }, 0n);
  }
  displayValue(value: number | string): string {
    const precision = this.inventory?.decimalPlaces ?? 0;
    return fromUnits(toUnits(value, precision), precision);
  }

  total(side: 'received' | 'delivered'): string {
    return fromUnits(this.totalUnits(side), this.inventory?.decimalPlaces ?? 0);
  }
  amount(side: 'received' | 'delivered', index: number): string {
    const quantity = this.form.controls[side].at(index).value;
    return fromUnits(
      toUnits(this.inventory!.denominations[index].value, this.inventory!.decimalPlaces) *
        BigInt(Number.isSafeInteger(quantity) && quantity >= 0 ? quantity : 0),
      this.inventory!.decimalPlaces
    );
  }
  get balanced(): boolean {
    return this.totalUnits('received') > 0n && this.totalUnits('received') === this.totalUnits('delivered');
  }
  get canFinish(): boolean {
    return (
      this.hasPermission('CREATE') &&
      !this.busy &&
      !this.loading &&
      !this.pendingRequest &&
      !!this.inventory &&
      this.form.valid &&
      this.balanced
    );
  }
  get tellerName(): string {
    return this.context?.tellers.find((teller) => teller.id === this.form.controls.cashierId.value)?.name ?? '';
  }

  finish(): void {
    if (!this.canFinish) return;
    const { cashierId, currencyCode } = this.form.getRawValue();
    const lines = (side: 'received' | 'delivered') =>
      this.inventory!.denominations.map((line, i) => ({
        denominationId: line.denominationId,
        quantity: this.form.controls[side].at(i).value
      })).filter((line) => line.quantity > 0);
    const request: ExchangeRequest = {
      cashierId: cashierId!,
      currencyCode,
      receivedDenominations: lines('received'),
      deliveredDenominations: lines('delivered'),
      idempotencyKey:
        globalThis.crypto?.randomUUID?.() ??
        `cash-exchange-${Array.from(crypto.getRandomValues(new Uint32Array(4)), (value) => value.toString(16)).join('-')}`
    };
    this.busy = true;
    this.error = '';
    this.form.disable({ emitEvent: false });
    this.service
      .preview(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (preview) => {
          let valid = false;
          try {
            valid =
              preview.balanced &&
              preview.cashierId === request.cashierId &&
              preview.currencyCode === request.currencyCode &&
              toUnits(preview.netMonetaryEffect, this.inventory!.decimalPlaces) === 0n &&
              toUnits(preview.receivedAmount, this.inventory!.decimalPlaces) === this.totalUnits('received') &&
              toUnits(preview.deliveredAmount, this.inventory!.decimalPlaces) === this.totalUnits('delivered');
          } catch {
            valid = false;
          }
          if (!valid) {
            this.error = extract('cashExchange.unavailable');
            this.unlock();
            return;
          }
          this.dialog
            .open(CashExchangeConfirmDialogComponent, {
              data: { tellerName: this.tellerName, preview },
              width: '560px',
              maxWidth: '95vw',
              disableClose: true
            })
            .afterClosed()
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe((confirmed) => {
              if (confirmed === true) {
                this.pendingRequest = request;
                this.post();
              } else {
                this.unlock();
              }
            });
        },
        error: (error) => {
          this.showError(error);
          this.unlock();
        }
      });
  }

  retry(): void {
    if (this.busy || !this.pendingRequest || !this.hasPermission('CREATE')) return;
    this.busy = true;
    this.post();
  }

  private post(): void {
    this.error = '';
    this.service
      .create(this.pendingRequest!)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (result) => {
          this.result = result;
          this.receipt = undefined;
          this.pendingRequest = undefined;
          this.unlock();
          this.loadInventory();
        },
        error: (error) => {
          this.showError(error);
          // Unknown outcomes keep the exact request/key and lock editing until an idempotent retry resolves it.
          if (error.status >= 400 && error.status < 500 && ![
              408,
              409,
              429
            ].includes(error.status)) {
            this.pendingRequest = undefined;
            this.unlock();
          }
        }
      });
  }

  private unlock(): void {
    this.busy = false;
    this.cdr.markForCheck();
    this.form.enable({ emitEvent: false });
  }

  printReceipt(): void {
    if (!this.result || this.printing || !this.hasPermission('REPRINT')) return;
    this.printing = true;
    this.error = '';
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
        error: (error) => this.showError(error)
      });
  }

  private showError(error: { status?: number; error?: unknown }): void {
    let body = error.error;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = undefined;
      }
    }
    const codes = body as
      { errors?: { userMessageGlobalisationCode?: string }[]; userMessageGlobalisationCode?: string } | undefined;
    const code = [
      codes?.userMessageGlobalisationCode ?? '',
      ...(codes?.errors ?? []).map((item) => item.userMessageGlobalisationCode ?? '')
    ].join(' ');
    this.error = code.includes('inventory.insufficient')
      ? extract('cashExchange.insufficient')
      : code.includes('cashier.')
        ? extract('cashExchange.invalidTeller')
        : code.includes('currency.')
          ? extract('cashExchange.invalidCurrency')
          : code.includes('idempotency.')
            ? extract('cashExchange.duplicate')
            : code.includes('amount.mismatch')
              ? extract('cashExchange.notBalanced')
              : error.status === 409
                ? extract('cashExchange.conflict')
                : code.includes('error.msg.base.teller.cash.exchange.')
                  ? extract('cashExchange.unavailable')
                  : error.status === 403
                    ? extract('cashExchange.forbidden')
                    : extract('cashExchange.unavailable');
  }
}
