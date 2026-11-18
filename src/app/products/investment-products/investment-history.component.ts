/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable @angular-eslint/prefer-inject -- Repository UI skill requires constructor injection of FormBuilder. */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Input,
  OnChanges,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';
import { Observable, Subscription, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedModule } from 'app/shared/shared.module';
import { InvestmentAccessService } from './investment-access.service';
import { InvestmentProductService, investmentError } from './investment-product.service';
import { PolicyAudit, RateAudit, RateConfiguration } from './investment-product.models';
import { InvestmentCodePipe, InvestmentFeedbackComponent } from './investment-feedback.component';
import { InvestmentMatrixViewComponent } from './investment-matrix-view.component';
@Component({
  selector: 'mifosx-investment-history',
  standalone: true,
  imports: [
    SharedModule,
    InvestmentCodePipe,
    InvestmentFeedbackComponent,
    InvestmentMatrixViewComponent
  ],
  templateUrl: './investment-history.component.html',
  styleUrls: ['./investment-products.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvestmentHistoryComponent implements OnInit, OnChanges {
  @Input() productId: number;
  @Input() refreshKey = 0;
  access = inject(InvestmentAccessService);
  private service = inject(InvestmentProductService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  loading = signal(false);
  error = signal('');
  versions = signal<RateConfiguration[]>([]);
  rates = signal<RateAudit[]>([]);
  policies = signal<PolicyAudit[]>([]);
  selected = signal<RateConfiguration | null>(null);
  count = computed(() => this.versions().length + this.rates().length + this.policies().length);
  private request?: Subscription;
  offset = 0;
  limit = 25;
  initialized = false;
  filter;
  constructor(fb: FormBuilder) {
    this.filter = fb.nonNullable.control(this.access.has('READ_INVESTMENT_RATE') ? 'versions' : 'policy');
    this.filter.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.offset = 0;
      this.load();
    });
  }
  ngOnInit() {
    this.productId ??= Number(this.route.snapshot.parent.paramMap.get('productId'));
    this.initialized = true;
    this.load();
  }
  ngOnChanges() {
    if (this.initialized) {
      this.offset = 0;
      this.load();
    }
  }
  load() {
    this.request?.unsubscribe();
    const policy = this.filter.value === 'policy';
    this.selected.set(null);
    this.versions.set([]);
    this.rates.set([]);
    this.policies.set([]);
    if (!this.access.has(policy ? 'READ_INVESTMENT_PRODUCT_POLICY' : 'READ_INVESTMENT_RATE')) {
      this.loading.set(false);
      this.error.set('Investment.forbidden');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const request: Observable<unknown[]> = policy
      ? this.service
          .getInvestmentHistory(this.productId, this.offset, this.limit)
          .pipe(tap((rows: PolicyAudit[]) => this.policies.set(rows)))
      : this.filter.value === 'audit'
        ? this.service
            .getRateHistory(this.productId, this.offset, this.limit)
            .pipe(tap((rows: RateAudit[]) => this.rates.set(rows)))
        : (this.filter.value === 'schedule'
            ? this.service.getRateSchedule(this.productId, this.offset, this.limit)
            : this.service.getRateVersions(this.productId, this.offset, this.limit)
          ).pipe(tap((rows: RateConfiguration[]) => this.versions.set(rows)));
    this.request = request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.loading.set(false),
      error: (error) => {
        this.error.set(investmentError(error));
        this.loading.set(false);
      }
    });
  }

  page(direction: number) {
    if (this.loading()) return;
    this.offset = Math.max(0, this.offset + direction * this.limit);
    this.load();
  }
  inspect(version: number | null) {
    if (version == null || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.request = this.service
      .getRateVersion(this.productId, version)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.selected.set(data);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(investmentError(error));
          this.loading.set(false);
        }
      });
  }
}
