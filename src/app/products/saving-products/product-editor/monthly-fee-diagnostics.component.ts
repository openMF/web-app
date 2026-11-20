/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef, Component, DestroyRef, DoCheck, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, finalize, catchError, of, Observable, Subject, takeUntil } from 'rxjs';
import { SettingsService } from 'app/settings/settings.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { policyPermission } from './policy-workflow.component';
import { ProductPolicyService } from './product-policy.service';
import { MonthlyFeeService } from './monthly-fee.service';
import {
  diagnosticPeriod,
  MONTHLY_FEE_CAPABILITIES,
  MonthlyFeeAssessmentPage,
  MonthlyFeeCapabilities,
  MonthlyFeeReconciliation,
  MonthlyFeeRun,
  MonthlyFeeRunHistory
} from './monthly-fee.model';
import { financialCodeLabel } from './financial-controls.messages';

@Component({
  selector: 'mifosx-monthly-fee-diagnostics',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatExpansionModule,
    MatTableModule
  ],
  templateUrl: './monthly-fee-diagnostics.component.html',
  styleUrls: ['./product-editor.component.scss']
})
export class MonthlyFeeDiagnosticsComponent implements DoCheck {
  private settings = inject(SettingsService);
  private scope = this.currentScope();
  private scopeChanged = new Subject<void>();
  private currentScope() {
    return this.settings.serverUrl + '|' + this.settings.tenantIdentifier;
  }
  ngDoCheck() {
    if (this.scope === this.currentScope()) return;
    this.scope = this.currentScope();
    this.scopeChanged.next();
    this.capabilities = null;
    this.history = null;
    this.businessDate = null;
    this.clearRun();
    this.form.reset({ period: '', limit: 20 });
    this.opened = false;
    this.writeUncertain = false;
    this.error = '';
  }
  private api = inject(MonthlyFeeService);
  private policies = inject(ProductPolicyService);
  private auth = inject(AuthenticationService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);
  private builder = inject(FormBuilder);
  form = this.builder.group({ period: [
      '',
      Validators.required
    ], limit: [
      20,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(100),
        Validators.pattern(/^\d+$/)
      ]
    ] });
  capabilities: MonthlyFeeCapabilities | null = null;
  history: MonthlyFeeRunHistory | null = null;
  run: MonthlyFeeRun | null = null;
  page: MonthlyFeeAssessmentPage | null = null;
  reconciliation: MonthlyFeeReconciliation | null = null;
  businessDate: string | null = null;
  historyBusy = false;
  detailBusy = false;
  pageBusy = false;
  writing = false;
  writeUncertain = false;
  opened = false;
  error = '';
  readonly fields = MONTHLY_FEE_CAPABILITIES;
  readonly label = financialCodeLabel;
  get canRead() {
    return policyPermission(this.auth, 'READ_SAVINGS_MONTHLY_FEE');
  }
  get canAssess() {
    return this.canRead && policyPermission(this.auth, 'ASSESS_SAVINGS_MONTHLY_FEE');
  }
  get busy() {
    return this.historyBusy || this.detailBusy || this.pageBusy || this.writing;
  }
  get permittedPeriod() {
    return diagnosticPeriod(this.businessDate);
  }
  get canCreate() {
    return (
      this.canAssess &&
      !this.busy &&
      !this.writeUncertain &&
      this.capabilities?.diagnosticAssessmentSupported === true &&
      !!this.permittedPeriod &&
      this.form.controls.period.value === this.permittedPeriod
    );
  }
  get canProcess() {
    return (
      this.canAssess &&
      !this.busy &&
      !this.writeUncertain &&
      this.capabilities?.diagnosticAssessmentSupported === true &&
      this.capabilities?.diagnosticBatchAdapterSupported === true &&
      !!this.run &&
      this.run.unknown === 0 &&
      [
        'READY',
        'IN_PROGRESS'
      ].includes(this.run.status) &&
      this.form.controls.limit.valid
    );
  }
  open() {
    if (this.opened || !this.canRead) return;
    this.opened = true;
    this.load();
  }
  load() {
    if (!this.canRead || this.busy) return;
    this.historyBusy = true;
    this.error = '';
    this.capabilities = null;
    this.history = null;
    this.clearRun();
    forkJoin({
      capabilities: this.api.capabilities(),
      history: this.api.runs(),
      businessDate: this.policies.businessDate().pipe(catchError(() => of(null)))
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.scopeChanged),
        finalize(() => {
          this.historyBusy = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (data) => {
          this.capabilities = data.capabilities;
          this.history = data.history;
          this.businessDate = data.businessDate;
          this.writeUncertain = false;
        },
        error: (error) => this.failed(error)
      });
  }
  moreRuns() {
    if (!this.canRead || this.busy || !this.history?.hasMore) return;
    const cursor = this.history.nextBeforePeriod;
    this.historyBusy = true;
    this.error = '';
    this.api
      .runs(cursor)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.scopeChanged),
        finalize(() => {
          this.historyBusy = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (history) => {
          if (history.items.some((run) => run.period >= cursor)) {
            this.failed(new Error('Invalid history cursor'));
            return;
          }
          this.history = history;
        },
        error: (error) => this.failed(error)
      });
  }
  private clearRun() {
    this.run = null;
    this.page = null;
    this.reconciliation = null;
  }
  select(id: string) {
    if (!this.canRead || this.busy) return;
    this.detailBusy = true;
    this.error = '';
    this.clearRun();
    forkJoin({ run: this.api.run(id), page: this.api.assessments(id), reconciliation: this.api.reconciliation(id) })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.scopeChanged),
        finalize(() => {
          this.detailBusy = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (data) => {
          if (
            data.run.id !== id ||
            data.reconciliation.runId !== id ||
            data.page.items.some((item) => item.period !== data.run.period)
          ) {
            this.failed(new Error('Mismatched diagnostic response'));
            return;
          }
          this.run = data.run;
          this.page = data.page;
          this.reconciliation = data.reconciliation;
          this.writeUncertain = false;
        },
        error: (error) => this.failed(error)
      });
  }
  assessments(first = false) {
    if (!this.canRead || this.busy || !this.run || (!first && !this.page?.hasMore)) return;
    const run = this.run;
    const cursor = first ? '0' : this.page.nextAfterId;
    this.pageBusy = true;
    this.error = '';
    this.api
      .assessments(run.id, cursor)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.scopeChanged),
        finalize(() => {
          this.pageBusy = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (page) => {
          if (
            page.items.some((item) => item.period !== run.period || BigInt(item.accountId) <= BigInt(cursor)) ||
            (page.hasMore && BigInt(page.nextAfterId) <= BigInt(cursor))
          ) {
            this.failed(new Error('Invalid assessment cursor'));
            return;
          }
          this.page = page;
        },
        error: (error) => this.failed(error)
      });
  }
  create() {
    if (!this.canCreate || !window.confirm(this.translate.instant('FinancialControls.ConfirmCreate'))) return;
    this.write(() => this.api.createDiagnosticRun(this.form.controls.period.value));
  }
  process() {
    if (!this.canProcess || !window.confirm(this.translate.instant('FinancialControls.ConfirmProcess'))) return;
    const id = this.run.id;
    this.write(() => this.api.assessDiagnosticChunk(id, this.form.controls.limit.value), id);
  }
  private write(request: () => Observable<MonthlyFeeRun>, expectedId?: string) {
    this.writing = true;
    this.error = '';
    let resultId: string | null = null;
    request()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.scopeChanged),
        finalize(() => {
          this.writing = false;
          if (resultId && !this.destroyRef.destroyed) this.select(resultId);
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (run) => {
          if (expectedId && run.id !== expectedId) {
            this.writeUncertain = true;
            this.failed(new Error('Mismatched run'));
            return;
          }
          resultId = run.id;
        },
        error: (error) => {
          // A timeout or malformed response is not proof that a durable diagnostic write failed.
          this.writeUncertain = true;
          this.failed(error);
        }
      });
  }
  private failed(error: unknown) {
    this.error =
      error instanceof HttpErrorResponse
        ? error.status === 401 || error.status === 403
          ? 'SavingsEditor.Denied'
          : error.status === 404
            ? 'FinancialControls.NotFound'
            : error.status === 409
              ? 'SavingsEditor.Conflict'
              : 'FinancialControls.RequestFailed'
        : 'FinancialControls.InvalidResponse';
  }
}
