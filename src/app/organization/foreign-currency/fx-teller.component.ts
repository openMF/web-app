/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom, Observable } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { WithdrawalMoneyPipe } from '../base-teller/withdrawals/withdrawal-money.pipe';
import { ForeignCurrencyService } from './foreign-currency.service';
import {
  FxCustomer,
  FxDenomination,
  FxOperation,
  FxTellerContext,
  FxTradePreview,
  FxTradeRequest,
  validFxDecimal
} from './foreign-currency.models';
import { hasFxPermission } from './foreign-currency.guard';
import { fxError } from './foreign-currency-error';
import { FxPolicyComponent } from './fx-policy.component';
@Component({
  selector: 'mifosx-fx-teller',
  templateUrl: './fx-teller.component.html',
  styleUrls: ['./foreign-currency.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon,
    MatProgressBar,
    MatTableModule,
    MatTabsModule,
    WithdrawalMoneyPipe,
    FxPolicyComponent
  ]
})
export class FxTellerComponent implements OnInit {
  private readonly api = inject(ForeignCurrencyService);
  private readonly auth = inject(AuthenticationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  context?: FxTellerContext;
  operation: FxOperation = 'PURCHASE';
  customers: FxCustomer[] = [];
  totalCustomers = 0;
  customerOffset = 0;
  customer?: FxCustomer;
  usd: FxDenomination[] = [];
  quote: FxDenomination[] = [];
  preview?: FxTradePreview;
  busy = false;
  error = '';
  searched = false;
  readonly form;
  readonly search;
  private readonly fb: FormBuilder;
  constructor() {
    const fb = inject(FormBuilder);
    this.fb = fb;
    this.search = fb.nonNullable.group({ field: [
        'clientNumber' as 'name' | 'clientNumber',
        Validators.pattern(/^clientNumber$/)
      ], value: [
        '',
        [
          Validators.required,
          Validators.pattern(/\S/),
          Validators.maxLength(100)
        ]
      ] });
    this.form = fb.nonNullable.group({ quoteCurrency: [
        '',
        Validators.required
      ], rateDraftId: [
        0,
        Validators.min(1)
      ], identifierId: [
        '',
        Validators.pattern(/^[1-9][0-9]*$/)
      ], reference: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[^\x00-\x1f\x7f]+$/)
        ]
      ], usdAmount: [
        '',
        (c: { value: string }) => (validFxDecimal(c.value, true, this.usdPrecision) ? null : { decimal: true })
      ], usdDenominations: fb.array<number>([]), quoteDenominations: fb.array<number>([]) });
    this.switchMode(0);
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.preview = undefined;
    });
    this.search.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.customers = [];
      this.customer = undefined;
      this.preview = undefined;
      this.searched = false;
    });
  }
  get usdPrecision() {
    return this.context?.currencies.find((c) => c.code === 'USD')?.decimalPlaces ?? 2;
  }
  get quotePrecision() {
    return this.context?.currencies.find((c) => c.code === this.form.controls.quoteCurrency.value)?.decimalPlaces ?? 12;
  }
  get canSearch() {
    const p = this.auth.getCredentials()?.permissions ?? [];
    return hasFxPermission(p, 'READ_CLIENT') || p.includes('ALL_FUNCTIONS_READ');
  }
  get canPreview() {
    return (
      hasFxPermission(this.auth.getCredentials()?.permissions ?? [], 'CREATE_BASE_TELLER_FX_' + this.operation) &&
      !!this.context?.permissions.includes('CREATE_BASE_TELLER_FX_' + this.operation) &&
      this.canSearch
    );
  }
  get candidate() {
    return this.context?.rateDrafts.find((d) => d.id === this.form.controls.rateDraftId.value);
  }
  ngOnInit() {
    void this.reload();
  }
  private read<T>(source: Observable<T>) {
    return firstValueFrom(source.pipe(takeUntilDestroyed(this.destroyRef)));
  }
  private async run(action: () => Promise<void>) {
    if (this.busy) return;
    this.busy = true;
    this.error = '';
    this.preview = undefined;
    try {
      await action();
    } catch (e) {
      this.error = fxError(e);
    } finally {
      this.busy = false;
      if (!this.destroyRef.destroyed) this.cdr.markForCheck();
    }
  }
  reload() {
    return this.run(async () => {
      this.context = undefined;
      this.customer = undefined;
      this.customers = [];
      this.searched = false;
      this.usd = [];
      this.quote = [];
      this.form.controls.usdDenominations.clear();
      this.form.controls.quoteDenominations.clear();
      this.context = await this.read(this.api.getTellerContext());
      this.form.patchValue({ rateDraftId: 0, quoteCurrency: '' });
      this.usd = await this.read(this.api.getDenominations('USD'));
      this.fill(this.form.controls.usdDenominations, this.usd);
      if (this.context.rateDrafts.length === 1) {
        const draft = this.context.rateDrafts[0];
        this.form.patchValue({ rateDraftId: draft.id, quoteCurrency: draft.quoteCurrency });
        this.quote = await this.read(this.api.getDenominations(draft.quoteCurrency));
        this.fill(this.form.controls.quoteDenominations, this.quote);
      }
    });
  }
  switchMode(index: number) {
    this.operation = index === 0 ? 'PURCHASE' : 'SALE';
    this.preview = undefined;
    this.form.controls.identifierId.setValidators(
      index === 0 ? [
            Validators.required,
            Validators.pattern(/^[1-9][0-9]*$/)
          ] : [Validators.pattern(/^[1-9][0-9]*$/)]
    );
    this.form.controls.identifierId.updateValueAndValidity();
  }
  searchCustomers(offset = 0) {
    return this.run(async () => {
      if (!this.canSearch || this.search.invalid) {
        this.search.markAllAsTouched();
        return;
      }
      this.customers = [];
      this.customer = undefined;
      this.searched = false;
      const v = this.search.getRawValue();
      const result = await this.read(this.api.searchCustomers(v.field, v.value.trim(), offset));
      if (JSON.stringify(v) !== JSON.stringify(this.search.getRawValue())) return;
      this.customers = result.pageItems;
      this.totalCustomers = result.totalFilteredRecords;
      this.customerOffset = offset;
      this.searched = true;
    });
  }
  selectCustomer(customer: FxCustomer) {
    this.customer = customer;
    this.form.controls.identifierId.setValue('');
    this.preview = undefined;
  }
  selectRate() {
    return this.run(async () => {
      this.quote = [];
      this.form.controls.quoteDenominations.clear();
      const draft = this.candidate;
      this.form.controls.quoteCurrency.setValue(draft?.quoteCurrency ?? '');
      if (!draft) return;
      this.quote = await this.read(this.api.getDenominations(draft.quoteCurrency));
      this.fill(this.form.controls.quoteDenominations, this.quote);
    });
  }
  private fill(array: FormArray, rows: FxDenomination[]) {
    array.clear();
    rows.forEach(() =>
      array.push(
        this.fb.nonNullable.control(0, [
          Validators.required,
          Validators.min(0),
          Validators.max(Number.MAX_SAFE_INTEGER),
          Validators.pattern(/^[0-9]+$/)
        ])
      )
    );
  }
  previewTrade() {
    return this.run(async () => {
      if (
        !this.canPreview ||
        !this.customer?.active ||
        this.form.invalid ||
        !this.candidate ||
        !this.usd.length ||
        !this.quote.length
      ) {
        this.form.markAllAsTouched();
        return;
      }
      const v = this.form.getRawValue(),
        candidate = this.candidate,
        customerId = this.customer.id,
        operation = this.operation;
      const identifier = v.identifierId ? Number(v.identifierId) : undefined;
      if (
        (this.operation === 'PURCHASE' && !identifier) ||
        (identifier !== undefined && !Number.isSafeInteger(identifier))
      ) {
        this.error = 'fx.identificationInvalid';
        return;
      }
      const request: FxTradeRequest = {
        clientId: customerId,
        reference: v.reference,
        quoteCurrency: v.quoteCurrency,
        usdAmount: v.usdAmount,
        rateDraftId: candidate.id,
        rateVersion: candidate.version,
        usdDenominations: this.usd.map((d, i) => ({ denominationId: d.id, quantity: Number(v.usdDenominations[i]) })),
        quoteDenominations: this.quote.map((d, i) => ({
          denominationId: d.id,
          quantity: Number(v.quoteDenominations[i])
        })),
        ...(identifier !== undefined ? { identifierId: identifier } : {})
      };
      const preview = await this.read(this.api.preview(operation, request));
      if (
        JSON.stringify(v) === JSON.stringify(this.form.getRawValue()) &&
        operation === this.operation &&
        customerId === this.customer?.id
      )
        this.preview = preview;
    });
  }
}
