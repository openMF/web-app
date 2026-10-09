/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AlertService } from 'app/core/alert/alert.service';
import { CreditBureauService } from 'app/credit-bureau/credit-bureau.service';
import { AuditEntryDTO } from 'app/credit-bureau/credit-bureau.models';

/**
 * CB-ILD Audit Trail — MX-380 Tab 5.
 * Compliance only. Paginated. Date range filter.
 * Route: /clients/{id}/audit-trail
 * Role: COMPLIANCE only — enforced by @PreAuthorize on backend.
 * @author Satyam Mishra — MSOC 2026
 */
@Component({
  selector: 'mifosx-audit-trail',
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon,
    MatDivider,
    MatProgressBar,
    MatPaginator,
    FormsModule
  ]
})
export class AuditTrailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private creditBureauService = inject(CreditBureauService);
  private alertService = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);

  clientId: number;

  entries: AuditEntryDTO[] = [];
  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;

  isLoading = false;

  startDate = '';
  endDate = '';

  private destroy$ = new Subject<void>();
  private load$ = new Subject<void>();

  constructor() {
    const rawId = this.route.parent?.snapshot.params['clientId'];
    this.clientId = rawId ? +rawId : 0;
  }

  ngOnInit(): void {
    this.initLoadPipeline();
    this.load$.next();
  }

  private initLoadPipeline(): void {
    this.load$
      .pipe(
        switchMap(() => {
          this.isLoading = true;
          this.cdr.markForCheck();

          const params: { page: number; size: number; startDate?: string; endDate?: string } = {
            page: this.pageIndex,
            size: this.pageSize
          };

          if (this.startDate && this.endDate) {
            params.startDate = this.startDate;
            params.endDate = this.endDate;
          }

          return this.creditBureauService.getAuditTrail(this.clientId, params);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          this.entries = data?._embedded?.auditEntryDTOList ?? [];
          this.totalElements = data?.page?.totalElements ?? 0;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.alertService.alert({ type: 'error', message: this.getErrorMessage(err) });
          this.cdr.markForCheck();
        }
      });
  }

  applyFilter(): void {
    if (this.startDate && this.endDate && this.startDate >= this.endDate) {
      this.alertService.alert({
        type: 'error',
        message: this.translateService.instant('labels.cbild.auditTrail.invalidDateRange')
      });
      return;
    }
    this.pageIndex = 0;
    this.load$.next();
  }

  clearFilter(): void {
    this.startDate = '';
    this.endDate = '';
    this.pageIndex = 0;
    this.load$.next();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load$.next();
  }

  getResultClass(result: string): string {
    return result === 'SUCCESS' ? 'cbild-result-success' : 'cbild-result-failure';
  }

  private getErrorMessage(err: HttpErrorResponse): string {
    const t = (key: string) => this.translateService.instant(key);
    switch (err?.status) {
      case 401:
        return t('labels.cbild.errors.unauthorized');
      case 403:
        return t('labels.cbild.errors.forbidden');
      case 503:
        return t('labels.cbild.errors.serviceUnavailable');
      default:
        return err?.error?.message || t('labels.cbild.errors.unexpected');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
