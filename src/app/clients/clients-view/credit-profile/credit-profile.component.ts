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
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatProgressBar } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AlertService } from 'app/core/alert/alert.service';
import { CreditBureauService } from 'app/credit-bureau/credit-bureau.service';
import { BureauResponseDTO, CbildRole, CBILD_ROLE_LABELS } from 'app/credit-bureau/credit-bureau.models';

interface Tradeline {
  creditorName?: string;
  name?: string;
  balance?: number | null;
  latePayments?: number;
}

/**
 * CB-ILD Credit Profile — MX-378 Tab 3.
 * Shows stored CDC credit report for a client.
 * Route: /clients/{id}/credit-profile
 * Roles: CREDIT_ANALYST, COMPLIANCE (KYC_OFFICER gets 403)
 * Does NOT make a new CDC call — reads from database only.
 * @author Satyam Mishra — MSOC 2026
 */
@Component({
  selector: 'mifosx-credit-profile',
  templateUrl: './credit-profile.component.html',
  styleUrls: ['./credit-profile.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon,
    MatDivider,
    MatProgressBar,
    FormsModule
  ]
})
export class CreditProfileComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private creditBureauService = inject(CreditBureauService);
  private alertService = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);

  clientId: number;
  isLoading = false;
  hasError = false;
  isEmpty = false;
  result: BureauResponseDTO | null = null;
  tradelines: Tradeline[] = [];
  selectedRole: CbildRole = 'CREDIT_ANALYST';

  roles: { value: CbildRole; label: string }[] = [
    { value: 'CREDIT_ANALYST', label: CBILD_ROLE_LABELS.CREDIT_ANALYST },
    { value: 'COMPLIANCE', label: CBILD_ROLE_LABELS.COMPLIANCE }
  ];

  private destroy$ = new Subject<void>();

  constructor() {
    const rawId = this.route.parent?.snapshot.params['clientId'];
    this.clientId = rawId ? +rawId : 0;
  }

  ngOnInit(): void {
    const saved = this.creditBureauService.getRole();
    this.selectedRole = saved === 'KYC_OFFICER' ? 'CREDIT_ANALYST' : saved;
    this.creditBureauService.setRole(this.selectedRole);
    this.loadProfile();
  }

  onRoleChange(role: CbildRole): void {
    this.selectedRole = role;
    this.creditBureauService.setRole(role);
    this.result = null;
    this.isEmpty = false;
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.hasError = false;
    this.isEmpty = false;
    this.cdr.markForCheck();

    this.creditBureauService
      .getBureauResponse(this.clientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: BureauResponseDTO) => {
          if (!data || !data.ficoScore) {
            this.isEmpty = true;
            this.result = null;
          } else {
            this.result = data;
            this.isEmpty = false;
            this.tradelines = this.parseTradelinesOnce(data.tradelines);
          }
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

  getFicoClass(): string {
    if (!this.result?.ficoScore) return 'cbild-fico-unknown';
    if (this.result.ficoScore >= 700) return 'cbild-fico-good';
    if (this.result.ficoScore >= 500) return 'cbild-fico-medium';
    return 'cbild-fico-poor';
  }

  getRiskClass(): string {
    switch (this.result?.riskBand) {
      case 'LOW':
        return 'cbild-risk-low';
      case 'MEDIUM':
        return 'cbild-risk-medium';
      case 'HIGH':
        return 'cbild-risk-high';
      case 'VERY_HIGH':
        return 'cbild-risk-very-high';
      default:
        return '';
    }
  }

  private parseTradelinesOnce(raw: string | null): Tradeline[] {
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Tradeline[];
    } catch {
      return [];
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
