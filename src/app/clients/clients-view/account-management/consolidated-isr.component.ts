/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { Observable, Subject, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AccountManagementAccess } from './account-management-access.service';
import { ClientSection, Resource, errorKey, positiveId, resource } from './account-management.state';
import { AccountMoneyPipe } from './account-money.pipe';
import { AccountStatusComponent } from './account-status.component';
import { ResourceStateComponent } from './resource-state.component';
import { ConsolidatedIsrService, validIsrPeriod } from './consolidated-isr.service';
import {
  ISR_CAPABILITIES,
  IsrCapabilities,
  IsrEligibility,
  IsrSources,
  IsrPreview,
  IsrPeriod,
  IsrHistoryEntry,
  IsrCalculation,
  IsrAuditEntry,
  IsrReconciliation,
  IsrContractError,
  isrCodeKey,
  isrIsoDate
} from './consolidated-isr.model';

@Component({
  selector: 'mifosx-consolidated-isr',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatExpansionModule,
    AccountMoneyPipe,
    AccountStatusComponent,
    ResourceStateComponent
  ],
  templateUrl: './consolidated-isr.component.html',
  styleUrls: [
    './account-management.component.scss',
    './consolidated-isr.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsolidatedIsrComponent extends ClientSection {
  readonly access = inject(AccountManagementAccess);
  private readonly api = inject(ConsolidatedIsrService);
  readonly capabilityNames = ISR_CAPABILITIES;
  readonly capabilities = resource<IsrCapabilities>();
  readonly eligibility = resource<IsrEligibility>();
  readonly sources = resource<IsrSources>();
  readonly preview = resource<IsrPreview>();
  readonly history = resource<IsrHistoryEntry[]>();
  readonly detail = resource<IsrCalculation>();
  readonly audit = resource<IsrAuditEntry[]>();
  readonly reconciliation = resource<IsrReconciliation>();
  readonly selectedId = signal<string | null>(null);
  readonly loadedPeriod = signal<IsrPeriod | null>(null);
  readonly maxDate = new Date();
  readonly minDate = new Date(1900, 0, 1);
  readonly form;
  readonly codeKey = isrCodeKey;
  private readonly periodChanged$ = new Subject<void>();
  private readonly detailChanged$ = new Subject<void>();

  constructor() {
    super();
    const fb = inject(FormBuilder);
    this.form = fb.group(
      {
        from: fb.control<Date | null>(null, Validators.required),
        through: fb.control<Date | null>(null, Validators.required)
      },
      {
        validators: (control) => {
          const from = isrIsoDate(control.value.from);
          const through = isrIsoDate(control.value.through);
          return from && through && validIsrPeriod({ from, through }, isrIsoDate(this.maxDate))
            ? null
            : { period: true };
        }
      }
    );
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.clearPeriod());
  }
  private clearPeriod(): void {
    this.periodChanged$.next();
    this.loadedPeriod.set(null);
    for (const state of [
      this.eligibility,
      this.sources,
      this.preview
    ]) state.set({ data: null, loading: false, error: null });
  }
  private clearDetail(): void {
    this.detailChanged$.next();
    this.selectedId.set(null);
    for (const state of [
      this.detail,
      this.audit,
      this.reconciliation
    ]) state.set({ data: null, loading: false, error: null });
  }
  protected reset(): void {
    this.clearPeriod();
    this.clearDetail();
    this.capabilities.set({ data: null, loading: false, error: null });
    this.history.set({ data: null, loading: false, error: null });
    if (!positiveId(this.clientId) || !this.access.has('READ_CONSOLIDATED_ISR_ELIGIBILITY')) return;
    this.capabilities.set({ data: null, loading: true, error: null });
    this.scoped(this.api.template()).subscribe({
      next: (data) => {
        this.capabilities.set({ data, loading: false, error: null });
        this.loadHistory();
      },
      error: (error) => this.capabilities.set({ data: null, loading: false, error: this.failure(error, true) })
    });
  }
  reload(): void {
    this.ngOnChanges();
  }
  private failure(error: unknown, template = false): string {
    return error instanceof IsrContractError ? 'ConsolidatedIsr.IncompatibleBackend' : errorKey(error, template);
  }
  private fetch<T>(target: WritableSignal<Resource<T>>, source: Observable<T>, cancel: Subject<void>): void {
    target.set({ data: null, loading: true, error: null });
    this.scoped(source)
      .pipe(takeUntil(cancel))
      .subscribe({
        next: (data) => target.set({ data, loading: false, error: null }),
        error: (error) => target.set({ data: null, loading: false, error: this.failure(error) })
      });
  }
  get canInspectPeriod(): boolean {
    return (
      positiveId(this.clientId) &&
      this.access.has('READ_CONSOLIDATED_ISR_ELIGIBILITY') &&
      this.capabilities().data?.eligibilityDiagnostics === true
    );
  }
  inspectPeriod(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.canInspectPeriod) return;
    this.clearPeriod();
    const period = { from: isrIsoDate(this.form.value.from), through: isrIsoDate(this.form.value.through) };
    this.loadedPeriod.set(period);
    this.fetch(this.eligibility, this.api.eligibility(this.clientId, period), this.periodChanged$);
    if (this.capabilities().data.nativeBalanceObservations === true && this.access.has('READ_CONSOLIDATED_ISR'))
      this.fetch(this.sources, this.api.accounts(this.clientId, period), this.periodChanged$);
    if (this.access.has('PREVIEW_CONSOLIDATED_ISR'))
      this.fetch(this.preview, this.api.preview(this.clientId, period), this.periodChanged$);
  }
  get eligibleCount(): number | null {
    const data = this.eligibility().data;
    return data?.populationComplete === true ? data.accounts.filter((row) => row.eligible === true).length : null;
  }
  loadHistory(): void {
    if (
      this.history().loading ||
      this.capabilities().data?.historicalSnapshots !== true ||
      !this.access.has('READ_CONSOLIDATED_ISR')
    )
      return;
    const after = this.history().data?.at(-1)?.sequence || 0;
    this.append(this.history, this.api.history(this.clientId, after));
  }
  private append<T>(target: WritableSignal<Resource<T[]>>, source: Observable<T[]>, cancel?: Subject<void>): void {
    target.update((state) => ({ ...state, loading: true, error: null }));
    this.scoped(source)
      .pipe(takeUntil(cancel || this.changed$))
      .subscribe({
        next: (data) =>
          target.update((state) => ({ data: [
              ...(state.data || []),
              ...data
            ], loading: false, error: null, more: data.length === 25 })),
        error: (error) => target.update((state) => ({ ...state, loading: false, error: this.failure(error) }))
      });
  }
  select(id: string): void {
    if (!this.access.has('READ_CONSOLIDATED_ISR') || this.capabilities().data?.historicalSnapshots !== true) return;
    this.clearDetail();
    this.selectedId.set(id);
    this.fetch(this.detail, this.api.calculation(this.clientId, id), this.detailChanged$);
  }
  loadAudit(): void {
    const id = this.detail().data?.calculationId;
    if (!id || this.audit().loading || !this.access.has('READ_CONSOLIDATED_ISR_AUDIT')) return;
    this.append(this.audit, this.api.audit(this.clientId, id, this.audit().data?.at(-1)?.id || 0), this.detailChanged$);
  }
  inspectReconciliation(): void {
    const id = this.detail().data?.calculationId;
    if (
      !id ||
      !this.access.has('RECONCILE_CONSOLIDATED_ISR') ||
      this.capabilities().data?.historicalReconciliation !== true
    )
      return;
    this.fetch(this.reconciliation, this.api.reconciliation(this.clientId, id), this.detailChanged$);
  }
  booleanKey(value: boolean | undefined): string {
    return value === true
      ? 'labels.commons.Yes'
      : value === false
        ? 'labels.commons.No'
        : 'ConsolidatedIsr.NotReported';
  }
}
