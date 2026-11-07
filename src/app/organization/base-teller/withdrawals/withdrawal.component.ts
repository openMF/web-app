/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { WithdrawalMoneyPipe } from './withdrawal-money.pipe';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Observable, Subject, finalize, forkJoin, of, takeUntil } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { fromUnits, toUnits } from '../cash-exchange/cash-exchange.models';
import { WithdrawalService } from './withdrawal.service';
import {
  WithdrawalAccount,
  WithdrawalContext,
  WithdrawalCustomer,
  WithdrawalDenomination,
  WithdrawalRecord,
  WithdrawalRequest,
  validWithdrawalAmount
} from './withdrawal.models';
import { withdrawalError } from './withdrawal-error';
import { WithdrawalSummaryComponent } from './withdrawal-summary.component';
import { WithdrawalContinueDialogComponent } from './withdrawal-continue-dialog.component';

@Component({ selector: 'mifosx-withdrawals', imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressBar,
    MatIcon,
    MatPrefix,
    MatExpansionModule,
    WithdrawalMoneyPipe,
    MatPaginatorModule,
    WithdrawalSummaryComponent
  ], templateUrl: './withdrawal.component.html', styleUrls: ['./withdrawal.component.scss'] })
export class WithdrawalComponent implements OnInit, OnDestroy {
  private readonly api = inject(WithdrawalService);
  private readonly auth = inject(AuthenticationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(MatDialog);
  private readonly destroyed = new Subject<void>();
  private disposed = false;
  private snapshot: WithdrawalRequest | null = null;
  private pending: WithdrawalRequest | null = null;
  private revision = 0;
  context: WithdrawalContext | null = null;
  customer: WithdrawalCustomer | null = null;
  customers: WithdrawalCustomer[] = [];
  accounts: WithdrawalAccount[] = [];
  account: WithdrawalAccount | null = null;
  denominations: WithdrawalDenomination[] = [];
  preview: WithdrawalRecord | null = null;
  completed: WithdrawalRecord | null = null;
  printedReceipt: WithdrawalRecord | null = null;
  receiptLookupOpen = false;
  busy = false;
  error = '';
  uncertain = false;
  searched = false;
  accountsLoaded = false;
  totalCustomers = 0;
  offset = 0;
  readonly pageSize = 10;
  readonly search;
  readonly form;
  readonly receiptId;
  readonly recoveryIdentity;
  readonly recoveryReviewed;
  constructor() {
    const fb = inject(FormBuilder);
    this.search = fb.nonNullable.group({ field: ['name' as 'name' | 'clientNumber'], value: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/.*\S.*/)
        ]
      ] });
    this.form = fb.nonNullable.group({
      method: [
        '',
        Validators.required
      ],
      amount: [
        '',
        [
          (c: AbstractControl): ValidationErrors | null =>
            validWithdrawalAmount(String(c.value), this.account?.decimalPlaces ?? 6) ? null : { amount: true }
        ]
      ],
      paymentTypeId: [
        0,
        Validators.min(1)
      ],
      identificationTypeId: [
        0,
        Validators.min(1)
      ],
      identificationReference: [
        '',
        [
          Validators.required,
          Validators.maxLength(1000),
          Validators.pattern(/^[^\x00-\x1f\x7f]+$/),
          Validators.pattern(/.*\S.*/)
        ]
      ],
      quantities: fb.array<FormControl<number>>([])
    });
    this.receiptId = fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^[1-9]\d{0,14}$/)
    ]);
    this.recoveryIdentity = fb.nonNullable.control('', Validators.required);
    this.recoveryReviewed = fb.nonNullable.control(false);
    this.form.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(() => this.invalidate());
  }
  ngOnInit() {
    try {
      this.uncertain = !!this.api.pending;
    } catch {
      this.uncertain = true;
      this.error = 'withdrawal.recoveryUnavailable';
    }
    this.loadContext();
  }
  ngOnDestroy() {
    this.disposed = true;
    this.destroyed.next();
    this.destroyed.complete();
  }
  get quantities(): FormArray {
    return this.form.controls.quantities;
  }
  get canCreate() {
    return (
      !!this.context?.permissions.includes('CREATE_BASE_TELLER_WITHDRAWAL') &&
      this.context.permissions.includes('WITHDRAWAL_SAVINGSACCOUNT')
    );
  }
  get canReprint() {
    const permissions = this.auth.getCredentials()?.permissions ?? [];
    return permissions.includes('ALL_FUNCTIONS') || permissions.includes('REPRINT_BASE_TELLER_WITHDRAWAL');
  }
  get step() {
    return this.completed
      ? 5
      : this.preview
        ? 4
        : this.account
          ? this.form.controls.method.value === 'CASH'
            ? 3
            : 2
          : this.customer
            ? 1
            : 0;
  }
  private invalidate() {
    this.revision++;
    this.preview = null;
    this.snapshot = null;
  }
  private setBusy(value: boolean) {
    this.busy = value;
    if (value) {
      this.form.disable({ emitEvent: false });
      this.search.disable({ emitEvent: false });
      this.recoveryReviewed.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
      this.search.enable({ emitEvent: false });
      this.recoveryReviewed.enable({ emitEvent: false });
    }
  }
  private request<T>(source: Observable<T>, next: (value: T) => void) {
    this.setBusy(true);
    this.error = '';
    source
      .pipe(
        takeUntil(this.destroyed),
        finalize(() => {
          this.setBusy(false);
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next,
        error: (e) => {
          this.error = withdrawalError(e);
        }
      });
  }
  loadContext() {
    if (this.busy) return;
    this.context = null;
    this.request(
      forkJoin({ context: this.api.context(), banks: this.api.banks(), types: this.api.checkTypes() }),
      (result) => {
        this.context = result.context;
      }
    );
  }
  searchCustomers(offset = 0) {
    if (this.busy || this.search.invalid || this.uncertain) return;
    this.customers = [];
    this.searched = false;
    this.offset = offset;
    const { field, value } = this.search.getRawValue();
    this.request(this.api.customers(field, value.trim(), offset, this.pageSize), (result) => {
      this.customers = result.pageItems;
      this.totalCustomers = result.totalFilteredRecords;
      this.searched = true;
    });
  }
  page(event: PageEvent) {
    this.searchCustomers(event.pageIndex * this.pageSize);
  }
  selectCustomer(customer: WithdrawalCustomer) {
    if (this.busy || this.uncertain || !customer.eligible) return;
    this.clearDetails();
    this.customer = customer;
    this.accounts = [];
    this.accountsLoaded = false;
    this.request(this.api.accounts(customer.clientId), (accounts) => {
      this.accounts = accounts;
      this.accountsLoaded = true;
    });
  }
  selectAccount(id: number) {
    if (this.busy || this.uncertain || !this.customer || !this.accounts.some((a) => a.accountId === id)) return;
    this.clearDetails();
    this.request(this.api.account(id), (account) => {
      this.account = account;
      this.denominations = this.context?.denominations.filter((d) => d.currencyCode === account.currencyCode) ?? [];
      for (const d of this.denominations)
        this.quantities.push(
          new FormControl(0, {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.min(0),
              Validators.max(d.availableQuantity),
              (c) => (Number.isSafeInteger(c.value) ? null : { integer: true })
            ]
          }),
          { emitEvent: false }
        );
      this.form.patchValue(
        {
          method: '',
          paymentTypeId: this.context?.cashPaymentTypes.length === 1 ? this.context.cashPaymentTypes[0].id : 0
        },
        { emitEvent: false }
      );
    });
  }
  switchMethod() {
    if (this.busy || this.uncertain) return;
    this.quantities.controls.forEach((c) => c.setValue(0));
    this.invalidate();
  }
  total(type?: 'BANKNOTE' | 'COIN'): string {
    const precision = this.account?.decimalPlaces ?? 0;
    try {
      return fromUnits(
        this.denominations.reduce(
          (sum, d, i) =>
            sum +
            (!type || d.denominationType === type
              ? toUnits(d.denominationValue, precision) * BigInt(this.quantities.at(i).value || 0)
              : 0n),
          0n
        ),
        precision
      );
    } catch {
      return fromUnits(0n, precision);
    }
  }
  lineAmount(index: number): string {
    try {
      return fromUnits(
        toUnits(this.denominations[index].denominationValue, this.account!.decimalPlaces) *
          BigInt(this.quantities.at(index).value || 0),
        this.account!.decimalPlaces
      );
    } catch {
      return '';
    }
  }
  get balanced(): boolean {
    try {
      return (
        this.quantities.valid &&
        toUnits(this.total(), this.account!.decimalPlaces) ===
          toUnits(this.form.controls.amount.value, this.account!.decimalPlaces)
      );
    } catch {
      return false;
    }
  }
  get ready() {
    return (
      !this.busy &&
      !this.uncertain &&
      this.canCreate &&
      this.account?.withdrawalEligible &&
      this.customer?.eligible &&
      this.form.valid &&
      this.form.controls.method.value === 'CASH' &&
      this.context?.supportedMethods.includes('CASH') &&
      this.balanced &&
      this.denominations.length > 0
    );
  }
  previewWithdrawal() {
    if (!this.ready || !this.customer || !this.account) return;
    this.invalidate();
    const f = this.form.getRawValue();
    const request: WithdrawalRequest = {
      clientId: this.customer.clientId,
      accountId: this.account.accountId,
      method: 'CASH',
      amount: f.amount,
      paymentTypeId: f.paymentTypeId,
      identificationTypeId: f.identificationTypeId,
      identificationReference: f.identificationReference,
      denominations: this.denominations
        .map((d, i) => ({ denominationId: d.denominationId, quantity: this.quantities.at(i).value }))
        .filter((d) => d.quantity > 0)
    };
    const revision = this.revision;
    this.request(this.api.preview(request), (preview) => {
      if (revision !== this.revision || preview.status !== 'PREVIEW') return;
      this.snapshot = request;
      this.preview = preview;
    });
  }
  async confirmWithdrawal() {
    if (this.busy || this.uncertain || !this.canCreate || !this.preview || !this.snapshot || this.completed) return;
    this.setBusy(true);
    this.error = '';
    this.pending = { ...this.snapshot, idempotencyKey: crypto.randomUUID() };
    try {
      await this.api.remember(this.pending);
    } catch {
      this.pending = null;
      this.setBusy(false);
      this.error = 'withdrawal.recoveryUnavailable';
      return;
    }
    if (!this.disposed) this.submit(false);
  }
  private submit(alreadyUncertain: boolean) {
    if (!this.pending) return;
    this.setBusy(true);
    this.api
      .create(this.pending)
      .pipe(
        takeUntil(this.destroyed),
        finalize(() => {
          this.setBusy(false);
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (record) => {
          if (record.status !== 'COMPLETED' || !record.id) {
            this.uncertain = true;
            this.error = 'withdrawal.uncertain';
            return;
          }
          this.completed = record;
          this.uncertain = false;
          this.pending = null;
          this.snapshot = null;
          this.preview = null;
          this.form.reset({}, { emitEvent: false });
          this.recoveryIdentity.reset();
          this.recoveryReviewed.reset();
          try {
            this.api.clearPending();
          } catch {
            this.error = 'withdrawal.recoveryUnavailable';
          }
        },
        error: (e) => {
          // A later rejection cannot establish whether an earlier ambiguous attempt posted.
          this.uncertain = alreadyUncertain || !e.status || e.status === 408 || e.status >= 500;
          this.error = this.uncertain ? 'withdrawal.uncertain' : withdrawalError(e);
          if (!this.uncertain) {
            this.pending = null;
            this.invalidate();
            try {
              this.api.clearPending();
            } catch {
              this.error = 'withdrawal.recoveryUnavailable';
            }
          }
        }
      });
  }
  async retryWithdrawal() {
    if (this.busy || !this.uncertain) return;
    this.recoveryReviewed.reset();
    this.setBusy(true);
    this.error = '';
    try {
      if (!this.pending) this.pending = await this.api.recover(this.recoveryIdentity.value);
      if (!this.pending) {
        this.error = 'withdrawal.identityMismatch';
        this.setBusy(false);
        return;
      }
    } catch {
      this.error = 'withdrawal.recoveryUnavailable';
      this.setBusy(false);
      return;
    }
    if (!this.disposed) this.submit(true);
  }
  discardRecovery() {
    if (this.busy || !this.uncertain || !this.recoveryReviewed.value) return;
    try {
      this.api.clearPending();
    } catch {
      this.error = 'withdrawal.recoveryUnavailable';
      return;
    }
    this.pending = null;
    this.uncertain = false;
    this.reset();
  }
  back() {
    if (!this.busy && !this.uncertain) this.invalidate();
  }
  private clearDetails() {
    this.invalidate();
    this.account = null;
    this.denominations = [];
    this.quantities.clear({ emitEvent: false });
    this.form.reset({}, { emitEvent: false });
  }
  reset(sameCustomer = false) {
    if (this.busy || this.uncertain) return;
    const retained = sameCustomer ? (this.customer ?? this.completed?.customer ?? null) : null;
    this.clearDetails();
    this.completed = null;
    this.printedReceipt = null;
    this.customer = null;
    this.accounts = [];
    this.accountsLoaded = false;
    this.customers = [];
    this.totalCustomers = 0;
    this.searched = false;
    this.search.reset();
    this.receiptId.reset();
    this.recoveryIdentity.reset();
    this.recoveryReviewed.reset();
    this.setBusy(true);
    this.context = null;
    this.error = '';
    forkJoin({
      context: this.api.context(),
      accounts: retained ? this.api.accounts(retained.clientId) : of([] as WithdrawalAccount[])
    })
      .pipe(
        takeUntil(this.destroyed),
        finalize(() => {
          this.setBusy(false);
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (result) => {
          this.context = result.context;
          this.customer = retained;
          this.accounts = result.accounts;
          this.accountsLoaded = !!retained;
        },
        error: (e) => {
          this.error = withdrawalError(e);
        }
      });
  }

  continueWithCustomer() {
    if (this.busy || !this.completed || this.uncertain) return;
    this.dialog
      .open(WithdrawalContinueDialogComponent)
      .afterClosed()
      .pipe(takeUntil(this.destroyed))
      .subscribe((result) => {
        if (result !== undefined) this.reset(result);
      });
  }
  retrieve() {
    if (this.busy || this.uncertain || this.receiptId.invalid) return;
    this.request(this.api.retrieve(Number(this.receiptId.value)), (record) => {
      this.clearDetails();
      this.customer = null;
      this.completed = record;
      this.printedReceipt = null;
    });
  }
  printReceipt() {
    if (this.busy || !this.completed?.id || !this.canReprint) return;
    this.printedReceipt = null;
    this.request(this.api.receipt(this.completed.id), (receipt) => {
      this.printedReceipt = receipt;
      this.cdr.detectChanges();
      window.print();
    });
  }
}
