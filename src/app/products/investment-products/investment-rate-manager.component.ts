/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable @angular-eslint/prefer-inject -- Repository UI skill requires constructor injection of FormBuilder. */
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, catchError, forkJoin, of, switchMap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SharedModule } from 'app/shared/shared.module';
import { InvestmentAccessService, confirmInvestmentDiscard } from './investment-access.service';
import {
  InvestmentProductService,
  errorBlockers,
  investmentError,
  requiresInvestmentReload,
  validationDetails
} from './investment-product.service';
import {
  CampaignMetadata,
  EffectiveValidity,
  NativeProduct,
  InvestmentPolicy,
  RateConfiguration,
  RateTemplate,
  RateWrite
} from './investment-product.models';
import { InvestmentFeedbackComponent, InvestmentCodePipe } from './investment-feedback.component';
import {
  InvestmentRateMatrixComponent,
  RateMatrixForm,
  matrixForm,
  readMatrixForm
} from './investment-rate-matrix.component';
import { InvestmentMatrixViewComponent } from './investment-matrix-view.component';
import { InvestmentRateLookupComponent } from './investment-rate-lookup.component';
import { InvestmentPublishDialogComponent } from './investment-publish-dialog.component';
import { InvestmentHistoryComponent } from './investment-history.component';
import { matrixIssues } from './investment-validation';

function missing<T>(request: Observable<T>): Observable<T | null> {
  return request.pipe(
    catchError((error: HttpErrorResponse) => (error.status === 404 ? of(null) : throwError(() => error)))
  );
}
@Component({
  selector: 'mifosx-investment-rate-manager',
  standalone: true,
  imports: [
    SharedModule,
    InvestmentFeedbackComponent,
    InvestmentCodePipe,
    InvestmentRateMatrixComponent,
    InvestmentMatrixViewComponent,
    InvestmentRateLookupComponent,
    InvestmentHistoryComponent
  ],
  templateUrl: './investment-rate-manager.component.html',
  styleUrls: ['./investment-products.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvestmentRateManagerComponent implements OnInit {
  access = inject(InvestmentAccessService);
  private service = inject(InvestmentProductService);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);
  id = Number(inject(ActivatedRoute).snapshot.parent.paramMap.get('productId'));
  template = signal<RateTemplate | null>(null);
  draft = signal<RateConfiguration | null>(null);
  current = signal<RateConfiguration | null>(null);
  loading = signal(false);
  saving = signal(false);
  conflict = signal(false);
  private readonly validationRejected = signal(false);
  error = signal('');
  message = signal('');
  issues = signal<string[]>([]);
  blockers = signal<string[]>([]);
  details = signal<{ field: string; message: string }[]>([]);
  refreshKey = signal(0);
  policy: InvestmentPolicy | null = null;
  native: NativeProduct | null = null;
  matrix: RateMatrixForm;
  readonly form;
  constructor(private fb: FormBuilder) {
    this.form = fb.nonNullable.group({
      mode: fb.nonNullable.control<EffectiveValidity['mode']>('IMMEDIATE'),
      effectiveDate: '',
      campaignEnabled: false,
      campaignId: '',
      campaignName: '',
      campaignType: fb.nonNullable.control<CampaignMetadata['type'] | ''>(''),
      startDate: '',
      endDate: ''
    });
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.message.set('');
      this.issues.set([]);
    });
  }
  get dirty() {
    return this.form.dirty || !!this.matrix?.dirty;
  }
  get busy() {
    return this.saving();
  }
  get canManage() {
    return this.access.has('MANAGE_INVESTMENT_RATE') && !!this.template()?.capabilities.rateConfigurationSupported;
  }
  get independent() {
    return (
      !!this.template()?.capabilities.independentReviewRequired &&
      (this.access.userId == null || this.draft()?.makerId === this.access.userId)
    );
  }
  get canPublish() {
    return (
      !!this.draft() &&
      this.access.has('APPROVE_INVESTMENT_RATE') &&
      !!this.template()?.capabilities.ratePublicationSupported &&
      !this.independent &&
      !this.dirty &&
      !this.busy &&
      !this.conflict() &&
      !this.validationRejected() &&
      !this.blockers().length &&
      !this.draft().blockers.length &&
      !this.template().blockers.length &&
      !(this.draft().configuration.campaignMetadata && !this.template().capabilities.campaignPublicationSupported)
    );
  }
  @HostListener('window:beforeunload', ['$event']) beforeUnload(event: BeforeUnloadEvent) {
    if (this.dirty || this.busy) event.preventDefault();
  }
  ngOnInit() {
    this.load();
  }
  refresh() {
    if (this.busy || this.loading()) return;
    if (!this.dirty) {
      this.load();
      return;
    }
    confirmInvestmentDiscard(this.dialog, this.translate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) this.load();
      });
  }
  load() {
    if (!this.access.has('READ_INVESTMENT_RATE')) {
      this.error.set('Investment.forbidden');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.template.set(null);
    forkJoin({
      template: this.service.getRateTemplate(this.id),
      draft: missing(this.service.getRateDraft(this.id)),
      current: missing(this.service.getCurrentRate(this.id)),
      policy: this.access.has('READ_INVESTMENT_PRODUCT_POLICY')
        ? this.service.getInvestmentConfiguration(this.id)
        : of(null)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ template, draft, current, policy }) => {
          this.template.set(template);
          this.draft.set(draft);
          this.current.set(current);
          this.policy = policy?.policy ?? draft?.policySnapshot ?? current?.policySnapshot ?? null;
          this.native = policy?.nativeProduct ?? draft?.nativeSnapshot ?? current?.nativeSnapshot ?? null;
          this.blockers.set([
            ...template.blockers,
            ...(draft?.blockers ?? [])
          ]);
          this.initialize(draft);
          this.conflict.set(false);
          this.validationRejected.set(false);
          this.loading.set(false);
          this.refreshKey.update((value) => value + 1);
        },
        error: (error) => {
          this.error.set(investmentError(error));
          this.loading.set(false);
        }
      });
  }
  initialize(draft: RateConfiguration | null) {
    const configuration = draft?.configuration;
    this.form.reset(
      {
        mode: configuration?.effectiveValidity.mode ?? 'IMMEDIATE',
        effectiveDate: configuration?.effectiveValidity.effectiveDate ?? '',
        campaignEnabled: !!configuration?.campaignMetadata,
        campaignId: configuration?.campaignMetadata?.campaignId ?? '',
        campaignName: configuration?.campaignMetadata?.name ?? '',
        campaignType: configuration?.campaignMetadata?.type ?? '',
        startDate: configuration?.campaignMetadata?.startDate ?? '',
        endDate: configuration?.campaignMetadata?.endDate ?? ''
      },
      { emitEvent: false }
    );
    const initial =
      configuration?.matrix ??
      (this.policy && this.native
        ? {
            currencyCode: this.template().currencyCode,
            amountBands: [
              {
                lower: this.policy.minimumInvestmentAmount ?? this.native.minimumDepositAmount ?? '0',
                upper: this.policy.maximumInvestmentAmount ?? this.native.maximumDepositAmount,
                upperInclusive: (this.policy.maximumInvestmentAmount ?? this.native.maximumDepositAmount) != null
              }
            ],
            termBands: [{ minimumDays: this.policy.minimumTermDays, maximumDays: this.policy.maximumTermDays }],
            cells: []
          }
        : null);
    this.matrix = initial ? matrixForm(this.fb, initial) : null;
    if (this.canManage) this.form.enable({ emitEvent: false });
    if (!this.canManage) {
      this.form.disable({ emitEvent: false });
      this.matrix?.disable({ emitEvent: false });
    }
    this.form.markAsPristine();
    this.matrix?.markAsPristine();
  }
  payload(): RateWrite {
    const value = this.form.getRawValue();
    return {
      expectedRevision: this.draft()?.revision ?? 0,
      matrix: readMatrixForm(this.matrix, this.template().currencyCode),
      effectiveValidity: { mode: value.mode, effectiveDate: value.mode === 'SCHEDULED' ? value.effectiveDate : null },
      campaignMetadata:
        value.campaignEnabled && value.campaignType
          ? {
              campaignId: value.campaignId,
              name: value.campaignName,
              type: value.campaignType,
              startDate: value.startDate,
              endDate: value.endDate
            }
          : null
    };
  }
  submit(save: boolean) {
    if (!this.canManage || this.busy || this.conflict() || !this.matrix || !this.policy || !this.native) return;
    this.matrix.markAllAsTouched();
    const payload = this.payload();
    const issues = matrixIssues(payload.matrix, this.template(), this.policy, this.native);
    const validity = payload.effectiveValidity;
    if (
      !this.template().validityModes.includes(validity.mode) ||
      (validity.mode === 'SCHEDULED' &&
        (!this.template().capabilities.rateSchedulingSupported ||
          !/^\d{4}-\d{2}-\d{2}$/.test(validity.effectiveDate ?? '') ||
          !this.template().timezone))
    )
      issues.push('Investment.scheduleRules');
    const campaign = payload.campaignMetadata;
    if (
      this.form.controls.campaignEnabled.value &&
      (!campaign ||
        !/^[A-Za-z0-9_.-]{1,100}$/.test(campaign.campaignId) ||
        !campaign.name.trim() ||
        campaign.name.length > 200 ||
        !this.template().campaignTypes.includes(campaign.type) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(campaign.startDate) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(campaign.endDate) ||
        campaign.startDate > campaign.endDate)
    )
      issues.push('Investment.campaignRules');
    this.issues.set(issues);
    if (issues.length || this.matrix.invalid) return;
    this.setBusy(true);
    this.error.set('');
    this.details.set([]);
    this.message.set('');
    let writeStarted = false;
    this.service
      .validateRateDraft(this.id, payload)
      .pipe(
        switchMap((result) => {
          this.validationRejected.set(!result.valid);
          if (result.valid || result.blockers.length) this.blockers.set(result.blockers);
          if (!result.valid) throw new Error('Investment.validationFailed');
          if (!save) return of(null);
          const request = this.service.saveRateDraft(this.id, payload);
          writeStarted = true;
          return request;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (result) => {
          this.setBusy(false);
          this.message.set(save ? 'Investment.savedDraft' : 'Investment.validated');
          if (result) {
            this.draft.set(result);
            this.blockers.set(result.blockers);
            this.initialize(result);
            this.refreshKey.update((value) => value + 1);
          }
        },
        error: (error) => this.failed(error, writeStarted)
      });
  }
  publish() {
    if (!this.canPublish) return;
    // Lock the review snapshot while the modal is open; do not publish an edited form.
    const revision = this.draft().revision;
    this.setBusy(true);
    this.dialog
      .open<InvestmentPublishDialogComponent, RateConfiguration, boolean>(InvestmentPublishDialogComponent, {
        data: this.draft(),
        width: '960px',
        maxWidth: '96vw',
        disableClose: true
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed !== true) {
          this.setBusy(false);
          return;
        }
        this.error.set('');
        this.details.set([]);
        this.service
          .publishRate(this.id, revision)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.setBusy(false);
              this.message.set('Investment.published');
              this.load();
            },
            error: (error) => this.failed(error, true)
          });
      });
  }
  private setBusy(value: boolean) {
    this.saving.set(value);
    if (value) {
      this.form.disable({ emitEvent: false });
      this.matrix?.disable({ emitEvent: false });
    } else if (this.canManage) {
      this.form.enable({ emitEvent: false });
      this.matrix?.enable({ emitEvent: false });
    }
  }
  private failed(error: HttpErrorResponse, writeStarted: boolean) {
    this.setBusy(false);
    this.error.set(investmentError(error));
    this.details.set(validationDetails(error));
    if (requiresInvestmentReload(error, writeStarted)) this.conflict.set(true);
    const blockers = errorBlockers(error);
    if (blockers.length) this.blockers.set(blockers);
  }
}
