/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, finalize, catchError, of } from 'rxjs';
import { MatExpansionModule } from '@angular/material/expansion';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { isoDate } from './interest-rate.model';
import { ProductPolicyService } from './product-policy.service';
import { PolicyAudit, PolicyConfiguration, PolicyReview, PolicyVersion } from './product-policy.model';

export function policyPermission(auth: AuthenticationService, permission: string): boolean {
  const permissions = auth.getCredentials()?.permissions || [];
  return (
    permissions.includes('ALL_FUNCTIONS') ||
    permissions.includes(permission) ||
    (permission.startsWith('READ_') && permissions.includes('ALL_FUNCTIONS_READ'))
  );
}
export function policyError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 409) return 'SavingsEditor.Conflict';
    if (error.status === 401 || error.status === 403) return 'SavingsEditor.Denied';
  }
  return 'SavingsEditor.RequestFailed';
}
export function serverErrors(error: unknown): string[] {
  if (!(error instanceof HttpErrorResponse)) return [];
  let body = error.error;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return [];
    }
  }
  return (
    body?.errors?.length
      ? body.errors.map((e: { parameterName?: string; defaultUserMessage?: string }) =>
          [
            e.parameterName,
            e.defaultUserMessage
          ]
            .filter(Boolean)
            .join(': ')
        )
      : [body?.defaultUserMessage]
  ).filter(Boolean);
}
@Component({
  selector: 'mifosx-policy-workflow',
  templateUrl: './policy-workflow.component.html',
  styleUrls: ['./product-editor.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatExpansionModule
  ]
})
export class PolicyWorkflowComponent implements OnChanges {
  @Input() configuration: PolicyConfiguration | null = null;
  @Input() unsaved = false;
  @Output() refreshed = new EventEmitter<void>();
  @Output() conflicted = new EventEmitter<void>();
  private api = inject(ProductPolicyService);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthenticationService);
  private destroyRef = inject(DestroyRef);
  busy = false;
  loaded = false;
  error = '';
  details: string[] = [];
  versions: PolicyVersion[] = [];
  active: PolicyVersion | null = null;
  audit: PolicyAudit[] = [];
  review: PolicyReview | null = null;
  form = inject(FormBuilder).group({ effectiveDate: [
      '',
      Validators.required
    ], reason: [
      '',
      [
        Validators.maxLength(1000),
        Validators.pattern(/^[^\x00-\x1f\x7f-\x9f]*$/)
      ]
    ] });
  businessDate: string | null = null;
  get pending() {
    return this.versions.some((v) => v.status === 'PENDING_APPROVAL');
  }
  get canSubmit() {
    return (
      this.loaded &&
      !this.busy &&
      !this.unsaved &&
      !this.pending &&
      !!this.configuration?.revision &&
      this.configuration.capabilities.activation &&
      !this.versions.some((v) => v.version === this.configuration.revision) &&
      policyPermission(this.auth, 'SUBMIT_SAVINGS_PRODUCT_POLICY') &&
      isoDate(this.form.controls.effectiveDate.value || '') &&
      (!this.businessDate || this.form.controls.effectiveDate.value >= this.businessDate)
    );
  }
  canCheck(version: PolicyVersion) {
    return (
      !this.unsaved &&
      !this.busy &&
      version.status === 'PENDING_APPROVAL' &&
      version.makerId !== this.auth.getCredentials()?.userId &&
      policyPermission(this.auth, 'CHECK_SAVINGS_PRODUCT_POLICY')
    );
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['configuration'] && this.configuration) this.load();
  }
  load() {
    if (!this.configuration || this.busy) return;
    this.busy = true;
    this.loaded = false;
    this.error = '';
    this.details = [];
    this.review = null;
    const id = this.configuration.savingsProductId;
    forkJoin({
      versions: this.api.versions(id),
      active: this.api.active(id),
      audit: this.api.audit(id),
      businessDate: this.api.businessDate().pipe(catchError(() => of(null)))
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (data) => {
          this.businessDate = data.businessDate;
          this.versions = data.versions;
          this.active = data.active;
          this.audit = data.audit;
          this.loaded = true;
        },
        error: (error) => this.failed(error)
      });
  }
  submit() {
    if (!this.canSubmit) return;
    this.busy = true;
    this.error = '';
    this.details = [];
    let reload = false;
    this.api
      .submit(this.configuration.savingsProductId, this.configuration.revision, this.form.controls.effectiveDate.value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy = false;
          if (reload && !this.destroyRef.destroyed) this.load();
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          reload = true;
          this.refreshed.emit();
        },
        error: (error) => this.failed(error)
      });
  }
  inspect(version: PolicyVersion) {
    if (this.busy) return;
    this.busy = true;
    this.error = '';
    this.details = [];
    this.review = null;
    this.api
      .review(version.savingsProductId, version.version)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({ next: (data) => (this.review = data), error: (error) => this.failed(error) });
  }
  decide(approve: boolean) {
    if (this.busy || !this.review || !this.canCheck(this.review.proposed)) return;
    const control = this.form.controls.reason;
    // Re-evaluate shared validators so rejection-only errors do not block approval.
    control.updateValueAndValidity({ emitEvent: false });
    const reason = (control.value || '').trim();
    if (!approve && !reason) {
      control.setErrors({ ...control.errors, required: true });
      control.markAsTouched();
      return;
    }
    if (control.invalid) {
      control.markAsTouched();
      return;
    }
    this.busy = true;
    this.error = '';
    this.details = [];
    const v = this.review.proposed;
    let reload = false;
    this.api
      .decide(v.savingsProductId, v.version, approve, reason)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy = false;
          if (reload && !this.destroyRef.destroyed) this.load();
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          reload = true;
          this.refreshed.emit();
        },
        error: (error) => this.failed(error)
      });
  }
  failed(error: unknown) {
    this.error = policyError(error);
    if (this.error === 'SavingsEditor.Conflict') this.conflicted.emit();
    this.details = serverErrors(error);
  }
}
