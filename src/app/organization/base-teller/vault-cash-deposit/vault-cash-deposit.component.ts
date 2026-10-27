/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { EMPTY, Subject, catchError, defer, finalize, merge, startWith, switchMap, tap } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { CashInventoryRow } from '../cash-inventory/cash-inventory.service';
import { canReadVault } from './vault-cash-deposit.guard';
import { VaultContext, VaultCurrency, VaultDenomination } from './vault-cash-deposit.models';
import { VaultCashDepositService } from './vault-cash-deposit.service';

@Component({
  selector: 'mifosx-vault-cash-deposit',
  templateUrl: './vault-cash-deposit.component.html',
  styleUrls: ['./vault-cash-deposit.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VaultCashDepositComponent implements OnInit {
  private readonly service = inject(VaultCashDepositService);
  private readonly authentication = inject(AuthenticationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly contextRequests = new Subject<void>();
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
    'currency'
  ];

  constructor() {
    const formBuilder = inject(FormBuilder);
    this.currencyControl = formBuilder.nonNullable.control({ value: '', disabled: true });
  }

  ngOnInit(): void {
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

  private errorKey(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) return 'vaultDeposit.errors.configuration';
    if (error.status === 401) return 'vaultDeposit.errors.unauthenticated';
    if (error.status === 403) return 'vaultDeposit.errors.forbidden';
    if (error.status === 404) return 'vaultDeposit.errors.notFound';
    if (error.status === 400) {
      const errors: unknown = error.error?.errors;
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
