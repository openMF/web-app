/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef, Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { finalize, map } from 'rxjs';
import { MatExpansionModule } from '@angular/material/expansion';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { isoDate, parseExactJson } from './interest-rate.model';
import { policyPermission, policyError, serverErrors } from './policy-workflow.component';

interface PropagationCapabilities {
  planningSupported: boolean;
  authorizationSupported: boolean;
  financialExecutionSupported: boolean;
  tieredFinancialExecutionSupported: boolean;
  referenceRateFinancialExecutionSupported: boolean;
  blockers: string[];
}
interface PropagationBatch {
  id: string;
  savingsProductId: number;
  policyVersion: number;
  effectiveDate: string;
  status: string;
  revision: number;
  planningComplete: boolean;
  completionMeaning: string;
  counters: Record<string, number | Record<string, number>>;
  capabilities: PropagationCapabilities;
}
@Component({
  selector: 'mifosx-rate-propagation',
  templateUrl: './rate-propagation.component.html',
  styleUrls: ['./interest-management.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatExpansionModule
  ]
})
export class RatePropagationComponent implements OnInit {
  @Input() productId: number;
  private http = inject(HttpClient);
  private auth = inject(AuthenticationService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private root = '/savingsproducts/policy/rate-propagation';
  form = inject(FormBuilder).group({ batchId: [''], policyVersion: [''], effectiveDate: [''] });
  capabilities: PropagationCapabilities | null = null;
  batch: PropagationBatch | null = null;
  preview: {
    effectiveDate: string;
    snapshotStatus: string;
    population: Record<string, unknown>;
    capabilities: PropagationCapabilities;
  } | null = null;
  readonly populationKeys = [
    'totalMatching',
    'totalEligible',
    'totalExcluded',
    'totalBlocked'
  ];
  readonly counterKeys = [
    'totalDiscovered',
    'totalEligible',
    'totalExcluded',
    'populationBlocked',
    'totalPending',
    'totalProcessed',
    'totalApplied',
    'totalUnchanged',
    'totalSkipped',
    'totalBlocked',
    'totalFailed',
    'totalUnknownOutcome'
  ];
  busy = false;
  error = '';
  details: string[] = [];
  get canRead() {
    return policyPermission(this.auth, 'READ_SAVINGS_RATE_PROPAGATION');
  }
  ngOnInit() {
    if (this.canRead) this.loadCapabilities();
  }
  loadCapabilities() {
    if (this.busy || !this.canRead) return;
    this.busy = true;
    this.error = '';
    this.http
      .get<PropagationCapabilities>(this.root + '/template')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({ next: (data) => (this.capabilities = data), error: (e) => this.failed(e) });
  }
  inspect() {
    const id = this.form.controls.batchId.value;
    if (!this.canRead || this.busy || !/^[a-zA-Z0-9-]{1,100}$/.test(id)) return;
    this.busy = true;
    this.error = '';
    this.batch = null;
    this.http
      .get(this.root + '/batches/' + encodeURIComponent(id), { responseType: 'text' })
      .pipe(
        map((text) => parseExactJson<PropagationBatch>(text)),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (batch) => {
          if (batch.savingsProductId !== this.productId) {
            this.error = 'InterestManagement.WrongProduct';
            return;
          }
          this.batch = batch;
        },
        error: (e) => this.failed(e)
      });
  }
  planPreview() {
    const f = this.form.getRawValue();
    if (
      !this.canRead ||
      this.busy ||
      !this.capabilities?.planningSupported ||
      !/^[1-9][0-9]{0,14}$/.test(f.policyVersion) ||
      !Number.isSafeInteger(Number(f.policyVersion)) ||
      !isoDate(f.effectiveDate)
    )
      return;
    this.busy = true;
    this.error = '';
    this.preview = null;
    this.http
      .post(
        this.root + '/' + this.productId + '/preview',
        { policyVersion: Number(f.policyVersion), effectiveDate: f.effectiveDate },
        { responseType: 'text' }
      )
      .pipe(
        map((text) => parseExactJson<RatePropagationComponent['preview']>(text)),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({ next: (data) => (this.preview = data), error: (e) => this.failed(e) });
  }
  private failed(error: unknown) {
    this.error =
      error instanceof HttpErrorResponse && error.status === 404
        ? 'InterestManagement.PropagationUnavailable'
        : policyError(error);
    this.details = serverErrors(error);
  }
}
