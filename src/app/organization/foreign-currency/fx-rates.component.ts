/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MatTableModule } from '@angular/material/table';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom, Observable } from 'rxjs';
import { _ as extract } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { WithdrawalMoneyPipe } from '../base-teller/withdrawals/withdrawal-money.pipe';
import { ForeignCurrencyService } from './foreign-currency.service';
import {
  FxAudit,
  FxDraft,
  FxRateContext,
  FxRatePreview,
  FxRateRequest,
  validFxDecimal
} from './foreign-currency.models';
import { hasFxPermission } from './foreign-currency.guard';
import { fxError } from './foreign-currency-error';
import { FxPolicyComponent } from './fx-policy.component';

@Component({
  selector: 'mifosx-fx-rates',
  templateUrl: './fx-rates.component.html',
  styleUrls: ['./foreign-currency.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon,
    MatProgressBar,
    WithdrawalMoneyPipe,
    FxPolicyComponent,
    MatTableModule
  ]
})
export class FxRatesComponent implements OnInit {
  private readonly api = inject(ForeignCurrencyService);
  private readonly auth = inject(AuthenticationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly form;
  context?: FxRateContext;
  drafts: FxDraft[] = [];
  selected?: FxDraft;
  audit: FxAudit[] = [];
  preview?: FxRatePreview;
  private confirmedRequest?: FxRateRequest;
  busy = false;
  error = '';
  saved = false;
  offset = 0;
  constructor() {
    const fb = inject(FormBuilder);
    const decimal = (positive: boolean) => (c: { value: string }) =>
      validFxDecimal(c.value, positive) ? null : { decimal: true };
    this.form = fb.nonNullable.group({ officeId: [
        0,
        Validators.min(1)
      ], effectiveDate: [
        '',
        Validators.required
      ], quoteCurrency: [
        '',
        Validators.required
      ], dailyBaseRate: [
        '',
        decimal(true)
      ], buyPoints: [
        '0',
        decimal(false)
      ], sellPoints: [
        '0',
        decimal(false)
      ] });
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.preview = undefined;
      this.confirmedRequest = undefined;
      this.saved = false;
    });
  }
  get branchName() {
    return this.context?.branches.find((branch) => branch.id === this.form.controls.officeId.value)?.name ?? '—';
  }
  get canManage() {
    return hasFxPermission(this.auth.getCredentials()?.permissions ?? [], 'CREATE_BASE_TELLER_FX_RATE');
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
    try {
      await action();
    } catch (e) {
      this.error = fxError(e);
      this.preview = undefined;
      this.confirmedRequest = undefined;
    } finally {
      this.busy = false;
      if (!this.destroyRef.destroyed) this.cdr.markForCheck();
    }
  }
  reload() {
    return this.run(async () => {
      this.context = await this.read(this.api.getAdminContext());
      this.form.patchValue({ effectiveDate: this.context.businessDate, officeId: this.context.branches[0]?.id ?? 0 });
      await this.loadPage(0);
      const latest = this.drafts[0];
      if (latest) {
        this.form.patchValue({
          quoteCurrency: latest.quoteCurrency,
          dailyBaseRate: String(latest.dailyBaseRate),
          buyPoints: String(latest.buyPoints),
          sellPoints: String(latest.sellPoints)
        });
        this.selected = await this.read(this.api.getRateDraft(latest.id));
        this.audit = await this.read(this.api.getRateAudit(latest.id));
      }
    });
  }
  private async loadPage(offset: number) {
    this.drafts = [];
    this.selected = undefined;
    this.audit = [];
    this.preview = undefined;
    this.confirmedRequest = undefined;
    const v = this.form.getRawValue();
    if (!v.officeId || !v.effectiveDate) return;
    this.drafts = await this.read(this.api.getRateDrafts(v.officeId, v.effectiveDate, offset));
    this.offset = offset;
  }
  load(offset = 0) {
    return this.run(() => this.loadPage(offset));
  }
  inspect(draft: FxDraft) {
    return this.run(async () => {
      this.selected = undefined;
      this.audit = [];
      this.selected = await this.read(this.api.getRateDraft(draft.id));
      this.audit = await this.read(this.api.getRateAudit(draft.id));
    });
  }
  previewDraft() {
    return this.run(async () => {
      if (!this.canManage || this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }
      const v = this.form.getRawValue();
      let latest: FxDraft | undefined;
      // Search pages until the latest revision for this exact pair is found.
      for (let offset = 0; !latest; offset += 100) {
        const page = await this.read(this.api.getRateDrafts(v.officeId, v.effectiveDate, offset));
        latest = page.find((d) => d.quoteCurrency === v.quoteCurrency);
        if (page.length < 100) break;
      }
      const request: FxRateRequest = {
        effectiveDate: v.effectiveDate,
        baseCurrency: 'USD',
        quoteCurrency: v.quoteCurrency,
        dailyBaseRate: v.dailyBaseRate,
        branches: [
          {
            officeId: v.officeId,
            expectedVersion: latest?.version ?? 0,
            buyPoints: v.buyPoints,
            sellPoints: v.sellPoints
          }
        ]
      };
      const preview = await this.read(this.api.previewRateDraft(request));
      // Do not attach a response to fields edited during the request.
      if (JSON.stringify(v) !== JSON.stringify(this.form.getRawValue())) return;
      this.preview = preview;
      this.confirmedRequest = { ...request, previewToken: preview.previewToken };
    });
  }
  confirmDraft() {
    return this.run(async () => {
      if (!this.canManage || !this.preview || !this.confirmedRequest) return;
      const result = await this.read(this.api.createRateDraft(this.confirmedRequest));
      // The write has succeeded even if a subsequent read is unavailable.
      this.saved = true;
      this.preview = undefined;
      this.confirmedRequest = undefined;
      try {
        await this.loadPage(0);
        const created = result[0];
        if (!created) {
          this.error = extract('fx.draftRefreshFailed');
          return;
        }
        this.selected = await this.read(this.api.getRateDraft(created.id));
        this.audit = await this.read(this.api.getRateAudit(created.id));
      } catch {
        this.error = extract('fx.draftRefreshFailed');
      }
    });
  }
  auditValue(row: FxAudit, field: string, previous = false) {
    const draft = previous ? row.previous : row.proposed;
    return draft ? draft[field as 'dailyBaseRate' | 'buyPoints' | 'sellPoints'] : null;
  }
  changedFields(row: FxAudit): string[] {
    return [
      'dailyBaseRate',
      'buyPoints',
      'sellPoints'
    ].filter(
      (key) =>
        !row.previous || String(row.previous[key as keyof FxDraft]) !== String(row.proposed[key as keyof FxDraft])
    );
  }
}
