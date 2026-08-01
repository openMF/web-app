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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatProgressBar } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AlertService } from 'app/core/alert/alert.service';
import { CreditBureauService } from 'app/credit-bureau/credit-bureau.service';
import { DisputeCase, CbildRole, CBILD_ROLE_LABELS } from 'app/credit-bureau/credit-bureau.models';

/**
 * CB-ILD Dispute Management — MX-279 Tab 4.
 * Raise disputes and manage OPEN→UNDER_REVIEW→RESOLVED workflow.
 * Route: /clients/{id}/dispute-management
 * Roles: All roles can raise + move to UNDER_REVIEW. COMPLIANCE only can RESOLVE.
 * @author Satyam Mishra — MSOC 2026
 */
@Component({
  selector: 'mifosx-dispute-management',
  templateUrl: './dispute-management.component.html',
  styleUrls: ['./dispute-management.component.scss'],
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
export class DisputeManagementComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private creditBureauService = inject(CreditBureauService);
  private alertService = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);
  private fb = inject(FormBuilder);

  clientId: number;
  selectedRole: CbildRole = 'CREDIT_ANALYST';

  roles: { value: CbildRole; label: string }[] = [
    { value: 'KYC_OFFICER', label: CBILD_ROLE_LABELS.KYC_OFFICER },
    { value: 'CREDIT_ANALYST', label: CBILD_ROLE_LABELS.CREDIT_ANALYST },
    { value: 'COMPLIANCE', label: CBILD_ROLE_LABELS.COMPLIANCE }
  ];

  // Raise dispute form
  raiseForm: FormGroup;
  isRaising = false;
  raisedDispute: DisputeCase | null = null;

  // Look up dispute
  lookupDisputeId: number | null = null;
  isLooking = false;
  lookedUpDispute: DisputeCase | null = null;

  // Update status
  isUpdating = false;
  resolutionNotesMap = new Map<number, string>();

  get isCompliance(): boolean {
    return this.selectedRole === 'COMPLIANCE';
  }

  private destroy$ = new Subject<void>();

  constructor() {
    const rawId = this.route.parent?.snapshot.params['clientId'];
    this.clientId = rawId ? +rawId : 0;
  }

  ngOnInit(): void {
    const saved = this.creditBureauService.getRole();
    this.selectedRole = saved;
    this.creditBureauService.setRole(this.selectedRole);

    this.raiseForm = this.fb.group({
      submissionRecordId: [
        null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      disputeDetails: [
        '',
        [
          Validators.required,
          Validators.minLength(10)
        ]
      ]
    });
  }

  onRoleChange(role: CbildRole): void {
    this.selectedRole = role;
    this.creditBureauService.setRole(role);
    this.raisedDispute = null;
    this.lookedUpDispute = null;
    this.cdr.markForCheck();
  }

  raiseDispute(): void {
    if (this.raiseForm.invalid) {
      this.raiseForm.markAllAsTouched();
      return;
    }
    this.isRaising = true;
    this.cdr.markForCheck();

    const { submissionRecordId, disputeDetails } = this.raiseForm.value;

    this.creditBureauService
      .createDispute(+submissionRecordId, disputeDetails)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dispute: DisputeCase) => {
          this.raisedDispute = dispute;
          this.isRaising = false;
          this.raiseForm.reset();
          this.alertService.alert({
            type: 'success',
            message: this.translateService.instant('labels.cbild.dispute.raised', { id: dispute.id })
          });
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isRaising = false;
          this.alertService.alert({ type: 'error', message: this.getErrorMessage(err) });
          this.cdr.markForCheck();
        }
      });
  }

  lookupDispute(): void {
    if (!this.lookupDisputeId) return;
    this.isLooking = true;
    this.lookedUpDispute = null;
    this.cdr.markForCheck();

    this.creditBureauService
      .getDispute(this.lookupDisputeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dispute: DisputeCase) => {
          this.lookedUpDispute = dispute;
          this.isLooking = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isLooking = false;
          this.alertService.alert({ type: 'error', message: this.getErrorMessage(err) });
          this.cdr.markForCheck();
        }
      });
  }

  updateStatus(dispute: DisputeCase, newStatus: string): void {
    this.isUpdating = true;
    this.cdr.markForCheck();

    const notes = newStatus === 'RESOLVED' ? this.resolutionNotesMap.get(dispute.id) || '' : undefined;

    this.creditBureauService
      .updateDisputeStatus(dispute.id, newStatus, notes)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated: DisputeCase) => {
          if (this.raisedDispute?.id === dispute.id) this.raisedDispute = updated;
          if (this.lookedUpDispute?.id === dispute.id) this.lookedUpDispute = updated;
          this.isUpdating = false;
          this.resolutionNotesMap.delete(dispute.id);
          this.alertService.alert({
            type: 'success',
            message: this.translateService.instant('labels.cbild.dispute.statusUpdated', { status: newStatus })
          });
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isUpdating = false;
          this.alertService.alert({ type: 'error', message: this.getErrorMessage(err) });
          this.cdr.markForCheck();
        }
      });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'cbild-status-open';
      case 'UNDER_REVIEW':
        return 'cbild-status-pending';
      case 'RESOLVED':
        return 'cbild-status-accepted';
      default:
        return '';
    }
  }

  canMoveToUnderReview(dispute: DisputeCase): boolean {
    return dispute.status === 'OPEN';
  }

  canResolve(dispute: DisputeCase): boolean {
    return this.isCompliance && dispute.status === 'UNDER_REVIEW';
  }

  private getErrorMessage(err: HttpErrorResponse): string {
    const t = (key: string) => this.translateService.instant(key);
    switch (err?.status) {
      case 400:
        return err?.error?.message || t('labels.cbild.errors.badRequest');
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
