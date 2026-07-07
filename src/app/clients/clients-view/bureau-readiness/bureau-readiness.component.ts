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
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatList, MatListItem, MatListItemIcon, MatListItemTitle } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AlertService } from 'app/core/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { CreditBureauService } from 'app/credit-bureau/credit-bureau.service';
import { KycReadinessResult, CbildRole, CBILD_ROLE_LABELS } from 'app/credit-bureau/credit-bureau.models';

@Component({
  selector: 'mifosx-bureau-readiness',
  templateUrl: './bureau-readiness.component.html',
  styleUrls: ['./bureau-readiness.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressBar,
    MatChipsModule,
    MatList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatIcon,
    MatDivider,
    FormsModule
  ]
})
export class BureauReadinessComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private creditBureauService = inject(CreditBureauService);
  private alertService = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);

  clientId: number;
  isLoading = false;
  hasError = false;
  result: KycReadinessResult | null = null;
  selectedRole: CbildRole = 'CREDIT_ANALYST';

  roles: { value: CbildRole; label: string }[] = [
    { value: 'KYC_OFFICER', label: CBILD_ROLE_LABELS.KYC_OFFICER },
    { value: 'CREDIT_ANALYST', label: CBILD_ROLE_LABELS.CREDIT_ANALYST },
    { value: 'COMPLIANCE', label: CBILD_ROLE_LABELS.COMPLIANCE }
  ];

  private destroy$ = new Subject<void>();

  constructor() {
    const rawId = this.route.parent?.snapshot.params['clientId'];
    this.clientId = rawId ? +rawId : 0;
    if (!this.clientId || isNaN(this.clientId)) {
      console.error('CB-ILD: Invalid clientId from route');
    }
  }

  ngOnInit(): void {
    this.selectedRole = this.creditBureauService.getRole();
    this.loadReadiness();
  }

  onRoleChange(role: CbildRole): void {
    this.selectedRole = role;
    this.creditBureauService.setRole(role);
    this.result = null;
    this.loadReadiness();
  }

  loadReadiness(): void {
    this.isLoading = true;
    this.hasError = false;
    this.cdr.markForCheck();

    this.creditBureauService
      .getBureauReadiness(this.clientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.result = data;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.hasError = true;
          this.alertService.alert({ type: 'error', message: this.getErrorMessage(err) });
          this.cdr.markForCheck();
        }
      });
  }

  getScoreColor(): 'primary' | 'accent' | 'warn' {
    if (!this.result) return 'primary';
    if (this.result.score >= 70) return 'primary';
    if (this.result.score >= 40) return 'accent';
    return 'warn';
  }

  formatFieldName(field: string): string {
    const key = `labels.cbild.fields.${field}`;
    const translated = this.translateService.instant(key);
    return translated !== key ? translated : field;
  }

  isRfcHardVeto(): boolean {
    return !!this.result && this.result.score === 0 && this.result.missingFields.includes('nationalId');
  }

  private getErrorMessage(err: HttpErrorResponse): string {
    const t = (key: string, params?: object) => this.translateService.instant(key, params);
    switch (err?.status) {
      case 401:
        return t('labels.cbild.errors.unauthorized');
      case 403:
        return t('labels.cbild.errors.forbidden');
      case 404:
        return t('labels.cbild.errors.clientNotFound', { clientId: this.clientId });
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
