/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { EMPTY, Subject, catchError, defer, finalize, merge, startWith, switchMap, tap, takeUntil } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { CashInventoryRow } from '../cash-inventory/cash-inventory.service';
import { canReadVault } from './vault-cash-deposit.guard';
import { VaultContext, VaultCurrency, VaultDenomination, VaultDepositPreview } from './vault-cash-deposit.models';
import { WithdrawalMoneyPipe } from '../withdrawals/withdrawal-money.pipe';
import { toUnits } from '../cash-exchange/cash-exchange.models';
import { calculateVaultCash, VaultCashEstimate, vaultQuantity } from './vault-cash-calculator';
import { VaultTransactionPreviewDialogComponent } from './vault-transaction-preview-dialog.component';
import { VaultCashDepositService } from './vault-cash-deposit.service';

@Component({
  selector: 'mifosx-vault-cash-deposit',
  templateUrl: './vault-cash-deposit.component.html',
  styleUrls: ['./vault-cash-deposit.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressSpinnerModule,
    MatTableModule,
    WithdrawalMoneyPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VaultCashDepositComponent implements OnInit {
  private readonly service = inject(VaultCashDepositService);
  private readonly authentication = inject(AuthenticationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly contextRequests = new Subject<void>();
  private readonly dialog = inject(MatDialog);
  private readonly previewInvalidated = new Subject<void>();
  private previewDialog: MatDialogRef<VaultTransactionPreviewDialogComponent> | null = null;
  private readonly formBuilder: FormBuilder;
  readonly quantities = new FormArray<FormControl<string>>([]);
  readonly estimate = signal<VaultCashEstimate | null>(null);
  readonly previewLoading = signal(false);
  readonly previewError = signal('');
  readonly catalogValid = signal(false);
  readonly currencyControl: FormControl<string>;
  readonly context = signal<VaultContext | null>(null);
  readonly currencies = signal<VaultCurrency[]>([]);
  readonly selectedCurrency = signal<VaultCurrency | null>(null);
  readonly banknotes = signal<VaultDenomination[]>([]);
  readonly coins = signal<VaultDenomination[]>([]);
  readonly balances = signal<CashInventoryRow[]>([]);
  readonly contextLoading = signal(false);
  readonly denominationsLoading = signal(false);
  readonly inventoryLoading = signal(false);
  readonly contextError = signal('');
  readonly denominationsError = signal('');
  readonly inventoryError = signal('');
  readonly columns = [
    'value',
    'quantity',
    'subtotal'
  ];

  constructor() {
    this.formBuilder = inject(FormBuilder);
    this.currencyControl = this.formBuilder.nonNullable.control({ value: '', disabled: true });
  }

  ngOnInit(): void {
    this.quantities.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.invalidatePreview();
      this.recalculate();
    });
    this.destroyRef.onDestroy(() => this.previewDialog?.close());
    this.currencyControl.valueChanges
      .pipe(
        switchMap((code) => defer(() => this.loadCurrency(code))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.contextRequests
      .pipe(
        startWith(undefined),
        switchMap(() =>
          defer(() => {
            this.context.set(null);
            this.currencies.set([]);
            this.currencyControl.reset('', { emitEvent: true });
            this.currencyControl.disable({ emitEvent: false });
            this.contextError.set('');
            if (!this.authentication.isAuthenticated()) {
              this.contextError.set('vaultDeposit.errors.unauthenticated');
              return EMPTY;
            }
            if (!canReadVault(this.authentication.getCredentials()?.permissions ?? [])) {
              this.contextError.set('vaultDeposit.errors.forbidden');
              return EMPTY;
            }
            this.contextLoading.set(true);
            return this.service.getVaultContext().pipe(
              switchMap((context) => {
                if (!context.capabilities.viewContext || !context.capabilities.viewCurrencies) {
                  this.contextError.set('vaultDeposit.errors.forbidden');
                  return EMPTY;
                }
                this.context.set(context);
                return this.service.getSupportedCurrencies().pipe(
                  tap((response) => {
                    if (response.vaultKey !== context.vault.key) {
                      this.contextError.set('vaultDeposit.errors.configuration');
                      return;
                    }
                    const currencies = response.status === 'AVAILABLE' ? response.currencies : [];
                    this.currencies.set(currencies);
                    if (currencies.length) {
                      this.currencyControl.enable({ emitEvent: false });
                      this.currencyControl.setValue(currencies[0].code);
                    }
                  })
                );
              }),
              catchError((error: unknown) => {
                this.context.set(null);
                this.contextError.set(this.errorKey(error));
                return EMPTY;
              }),
              finalize(() => this.contextLoading.set(false))
            );
          })
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  reload(): void {
    this.contextRequests.next();
  }

  private loadCurrency(code: string) {
    this.invalidatePreview();
    this.quantities.clear({ emitEvent: false });
    this.estimate.set(null);
    this.catalogValid.set(false);
    this.banknotes.set([]);
    this.coins.set([]);
    this.balances.set([]);
    this.denominationsError.set('');
    this.inventoryError.set('');
    const currency = this.currencies().find((item) => item.code === code) ?? null;
    this.selectedCurrency.set(currency);
    const context = this.context();
    if (!context || !code) return EMPTY;
    if (!currency) {
      this.denominationsError.set('vaultDeposit.errors.unsupportedCurrency');
      return EMPTY;
    }
    const matches = (response: { vaultKey: string; currencyCode: string }) =>
      response.vaultKey === context.vault.key && response.currencyCode === code;
    const denominations = context.capabilities.viewDenominations
      ? defer(() => {
          this.denominationsLoading.set(true);
          return this.service.getDenominations(code).pipe(
            tap((response) => {
              if (!matches(response)) {
                this.denominationsError.set('vaultDeposit.errors.configuration');
                return;
              }
              const rows = response.status === 'AVAILABLE' ? response.denominations : [];
              this.banknotes.set(rows.filter((d) => d.active && d.currencyCode === code && d.type === 'BANKNOTE'));
              this.coins.set(rows.filter((d) => d.active && d.currencyCode === code && d.type === 'COIN'));
              const selected = this.rows;
              try {
                calculateVaultCash(
                  selected,
                  selected.map(() => '0'),
                  currency.decimalPlaces
                );
                if (selected.length > 1000) throw new Error('Invalid catalog size');
                for (const row of selected) {
                  this.quantities.push(this.formBuilder.nonNullable.control('0', vaultQuantity), { emitEvent: false });
                }
                this.catalogValid.set(selected.length > 0);
                this.recalculate();
              } catch {
                this.denominationsError.set('vaultDeposit.errors.configuration');
                this.banknotes.set([]);
                this.coins.set([]);
              }
            }),
            catchError((error: unknown) => {
              this.denominationsError.set(this.errorKey(error));
              return EMPTY;
            }),
            finalize(() => this.denominationsLoading.set(false))
          );
        })
      : EMPTY;
    if (!context.capabilities.viewDenominations) this.denominationsError.set('vaultDeposit.errors.forbidden');
    const inventory = context.capabilities.viewInventory
      ? defer(() => {
          this.inventoryLoading.set(true);
          return this.service.getVaultInventory(code).pipe(
            tap((response) => {
              if (!matches(response)) {
                this.inventoryError.set('vaultDeposit.errors.configuration');
                return;
              }
              if (response.status === 'AVAILABLE') {
                this.balances.set(
                  response.balances.filter(
                    (row) =>
                      row.custodianKey === context.vault.key &&
                      row.currencyCode === code &&
                      row.inventoryType === 'CASH'
                  )
                );
              }
            }),
            catchError((error: unknown) => {
              this.inventoryError.set(this.errorKey(error));
              return EMPTY;
            }),
            finalize(() => this.inventoryLoading.set(false))
          );
        })
      : EMPTY;
    return merge(denominations, inventory);
  }

  get rows(): VaultDenomination[] {
    return [
      ...this.banknotes(),
      ...this.coins()
    ];
  }

  quantityControl(row: VaultDenomination): FormControl<string> {
    return this.quantities.at(this.rows.indexOf(row));
  }

  subtotal(row: VaultDenomination): string | null {
    return this.estimate()?.subtotals[this.rows.indexOf(row)] ?? null;
  }

  get canPreview(): boolean {
    return (
      !!this.context()?.capabilities.previewDeposit &&
      this.catalogValid() &&
      this.quantities.valid &&
      !!this.estimate()?.positive &&
      !!this.estimate()?.inRange &&
      !this.contextLoading() &&
      !this.contextError() &&
      !this.denominationsLoading() &&
      !this.previewLoading()
    );
  }

  get previewNeedsRefresh(): boolean {
    return [
      'vaultDeposit.preview.conflict',
      'vaultDeposit.preview.businessDateChanged',
      'vaultDeposit.preview.catalogChanged'
    ].includes(this.previewError());
  }

  private recalculate(): void {
    try {
      this.estimate.set(
        this.quantities.valid && this.selectedCurrency() && this.catalogValid()
          ? calculateVaultCash(this.rows, this.quantities.getRawValue(), this.selectedCurrency()!.decimalPlaces)
          : null
      );
    } catch {
      this.estimate.set(null);
    }
  }

  private invalidatePreview(): void {
    this.previewInvalidated.next();
    this.previewDialog?.close();
    this.previewDialog = null;
    this.previewError.set('');
    for (const control of this.quantities.controls) {
      if (control.hasError('backend')) control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
    this.quantities.updateValueAndValidity({ emitEvent: false });
  }

  previewTransaction(event?: Event): void {
    const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    this.quantities.markAllAsTouched();
    if (!this.canPreview) return;
    const context = this.context()!;
    const currency = this.selectedCurrency()!;
    const estimate = this.estimate()!;
    const rows = this.rows;
    const entries = rows.map((row, i) => ({
      denominationId: row.denominationId,
      quantity: Number(this.quantities.at(i).value)
    }));
    this.previewError.set('');
    this.previewLoading.set(true);
    this.service
      .previewVaultCashDeposit({
        businessDate: context.businessDate,
        currencies: [{ currencyCode: currency.code, denominations: entries }]
      })
      .pipe(
        takeUntil(this.previewInvalidated),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.previewLoading.set(false))
      )
      .subscribe({
        next: (preview) => {
          if (
            preview.vault?.key !== context.vault.key ||
            preview.branch?.id !== context.branch.id ||
            preview.businessDate !== context.businessDate ||
            preview.operationType !== 'VAULT_CASH_DEPOSIT' ||
            preview.validationStatus !== 'VALID_PREVIEW' ||
            preview.movementStatus !== 'PROPOSED' ||
            preview.currencies?.length !== 1 ||
            preview.currencies[0].currencyCode !== currency.code ||
            preview.currencies[0].decimalPlaces !== currency.decimalPlaces
          ) {
            this.previewError.set('vaultDeposit.errors.configuration');
            return;
          }
          const mismatch = !this.matchesEstimate(
            preview,
            estimate,
            rows,
            entries.map((e) => e.quantity)
          );
          this.previewDialog = this.dialog.open(VaultTransactionPreviewDialogComponent, {
            data: { preview, mismatch },
            width: '800px',
            maxWidth: '96vw',
            ariaLabelledBy: 'vault-preview-title',
            autoFocus: 'first-tabbable',
            restoreFocus: true
          });
          // Loading disables the trigger and can blur it before the dialog captures focus.
          this.previewDialog
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              if (trigger?.isConnected) trigger.focus();
            });
        },
        error: (error: unknown) => {
          this.previewError.set(this.previewErrorKey(error));
          if (error instanceof HttpErrorResponse && [
              400,
              422
            ].includes(error.status) && this.apiErrors(error).length > 0) {
            for (const field of this.apiErrors(error)) {
              const match = /^currencies\[0\]\.denominations\[(\d+)\]\.(quantity|denominationId)$/.exec(
                field?.parameterName ?? ''
              );
              if (match) {
                const control = this.quantities.at(Number(match[1]));
                control?.setErrors({ ...control.errors, backend: true });
              }
            }
            this.recalculate();
          }
        }
      });
  }

  private matchesEstimate(
    preview: VaultDepositPreview,
    estimate: VaultCashEstimate,
    rows: VaultDenomination[],
    quantities: number[]
  ): boolean {
    try {
      const server = preview.currencies[0];
      const precision = server.decimalPlaces;
      if (
        toUnits(server.banknotesTotal, precision) !== toUnits(estimate.banknotesTotal, precision) ||
        toUnits(server.coinsTotal, precision) !== toUnits(estimate.coinsTotal, precision) ||
        toUnits(server.totalCash, precision) !== toUnits(estimate.totalCash, precision)
      )
        return false;
      const lines = [
        ...server.banknotes,
        ...server.coins
      ];
      const positive = rows.filter((_, index) => quantities[index] > 0);
      return (
        lines.length === positive.length &&
        new Set(lines.map((line) => line.denominationId)).size === lines.length &&
        positive.every((row) => {
          const line = (row.type === 'BANKNOTE' ? server.banknotes : server.coins).find(
            (item) => item.denominationId === row.denominationId
          );
          const index = rows.indexOf(row);
          return (
            !!line &&
            line.quantity === quantities[index] &&
            toUnits(line.value, precision) === toUnits(row.value, precision) &&
            toUnits(line.subtotal, precision) === toUnits(estimate.subtotals[index], precision)
          );
        })
      );
    } catch {
      return false;
    }
  }

  private previewErrorKey(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) return 'vaultDeposit.preview.failed';
    if (error.status === 409) return 'vaultDeposit.preview.conflict';
    if ([
        400,
        422
      ].includes(error.status)) {
      const errors = this.apiErrors(error);
      const codes = errors.map(
        (field: { userMessageGlobalisationCode?: string }) => field.userMessageGlobalisationCode ?? ''
      );
      if (codes.some((code: string) => code.endsWith('currency.unsupported')))
        return 'vaultDeposit.errors.unsupportedCurrency';
      if (codes.some((code: string) => code.endsWith('business.date.invalid')))
        return 'vaultDeposit.preview.businessDateChanged';
      if (codes.some((code: string) => code.endsWith('denomination.unsupported')))
        return 'vaultDeposit.preview.catalogChanged';
      if (codes.some((code: string) => code.endsWith('amount.out.of.range'))) return 'vaultDeposit.preview.amountRange';
      return 'vaultDeposit.preview.invalidInput';
    }
    return this.errorKey(error);
  }

  private apiErrors(error: HttpErrorResponse): { parameterName?: string; userMessageGlobalisationCode?: string }[] {
    try {
      const body = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
      return Array.isArray(body?.errors)
        ? body.errors.filter((field: unknown) => !!field && typeof field === 'object')
        : [];
    } catch {
      return [];
    }
  }

  private errorKey(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) return 'vaultDeposit.errors.configuration';
    if (error.status === 401) return 'vaultDeposit.errors.unauthenticated';
    if (error.status === 403) return 'vaultDeposit.errors.forbidden';
    if (error.status === 404) return 'vaultDeposit.errors.notFound';
    if (error.status === 400) {
      const errors = this.apiErrors(error);
      const currencyError =
        Array.isArray(errors) &&
        errors.some((item) => [
            'error.msg.base.teller.vault.currency.unsupported',
            'error.msg.base.teller.vault.currency.invalid'
          ].includes(item?.userMessageGlobalisationCode));
      return currencyError ? 'vaultDeposit.errors.unsupportedCurrency' : 'vaultDeposit.errors.configuration';
    }
    return 'vaultDeposit.errors.unavailable';
  }
}
