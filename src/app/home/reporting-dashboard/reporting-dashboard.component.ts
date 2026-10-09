/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AlertService } from 'app/core/alert/alert.service';
import { CreditBureauService } from 'app/credit-bureau/credit-bureau.service';
import { SubmissionRecord, PagedResult, CbildRole, CBILD_ROLE_LABELS } from 'app/credit-bureau/credit-bureau.models';

@Component({
  selector: 'mifosx-reporting-dashboard',
  templateUrl: './reporting-dashboard.component.html',
  styleUrls: ['./reporting-dashboard.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTableModule,
    MatPaginatorModule,
    MatProgressBar,
    MatIcon,
    FormsModule
  ]
})
export class ReportingDashboardComponent implements OnInit, OnDestroy {
  private creditBureauService = inject(CreditBureauService);
  private alertService = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  isLoading = false;
  hasError = false;
  isBatchRunning = false;
  dataSource = new MatTableDataSource<SubmissionRecord>([]);
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  selectedRole: CbildRole = 'CREDIT_ANALYST';

  roles: { value: CbildRole; label: string }[] = [
    { value: 'CREDIT_ANALYST', label: CBILD_ROLE_LABELS.CREDIT_ANALYST },
    { value: 'COMPLIANCE', label: CBILD_ROLE_LABELS.COMPLIANCE }
  ];

  displayedColumns = [
    'clientId',
    'triggerType',
    'status',
    'cdcReferenceId',
    'expiryDate',
    'submittedAt'
  ];

  get acceptedCount(): number {
    return this.dataSource.data.filter((s) => s.status === 'ACCEPTED').length;
  }

  get pendingRetryCount(): number {
    return this.dataSource.data.filter((s) => s.status === 'PENDING_RETRY').length;
  }

  get permanentlyFailedCount(): number {
    return this.dataSource.data.filter((s) => s.status === 'PERMANENTLY_FAILED').length;
  }

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    const savedRole = this.creditBureauService.getRole();
    this.selectedRole = savedRole === 'KYC_OFFICER' ? 'CREDIT_ANALYST' : savedRole;
    this.creditBureauService.setRole(this.selectedRole);
    this.loadHistory();
  }

  onRoleChange(role: CbildRole): void {
    this.selectedRole = role;
    this.creditBureauService.setRole(role);
    this.pageIndex = 0;
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.hasError = false;
    this.cdr.markForCheck();

    this.creditBureauService
      .getSubmissionHistory(this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: PagedResult<SubmissionRecord>) => {
          const key = Object.keys(data._embedded || {})[0];
          this.dataSource.data = key ? (data._embedded[key] as SubmissionRecord[]) : [];
          this.totalElements = data.page?.totalElements || 0;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.hasError = true;
          this.alertService.alert({
            type: 'error',
            message: this.getErrorMessage(err)
          });
          this.cdr.markForCheck();
        }
      });
  }

  onPageChange(pageIndex: number, pageSize: number): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.loadHistory();
  }

  runBatch(): void {
    this.isBatchRunning = true;
    this.cdr.markForCheck();

    this.creditBureauService
      .runSubmissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isBatchRunning = false;
          this.alertService.alert({
            type: 'success',
            message: this.translateService.instant('labels.cbild.dashboard.batchStarted')
          });
          timer(3000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.loadHistory());
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isBatchRunning = false;
          this.alertService.alert({
            type: 'error',
            message: this.getErrorMessage(err)
          });
          this.cdr.markForCheck();
        }
      });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'cbild-status-accepted';
      case 'REJECTED':
        return 'cbild-status-rejected';
      case 'PENDING_RETRY':
        return 'cbild-status-pending';
      case 'PERMANENTLY_FAILED':
        return 'cbild-status-failed';
      default:
        return '';
    }
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
