/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable @angular-eslint/prefer-inject -- Repository UI skill requires constructor injection of FormBuilder. */
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of, switchMap } from 'rxjs';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { InvestmentAccessService, confirmInvestmentDiscard } from './investment-access.service';
import {
  InvestmentProductService,
  investmentError,
  requiresInvestmentReload,
  validationDetails
} from './investment-product.service';
import {
  Decimal,
  InvestmentPolicy,
  InvestmentType,
  PolicyConfiguration,
  PolicyTemplate,
  PolicyWrite,
  TermRenewalLimit
} from './investment-product.models';
import { InvestmentCodePipe, InvestmentFeedbackComponent } from './investment-feedback.component';
import { policyIssues } from './investment-validation';
type RenewalLimitForm = FormGroup<{
  termDays: FormControl<number | null>;
  maximumReinvestments: FormControl<number | null>;
}>;

function termDays(value: number | null, unit: number | null): number | null {
  if (value == null) return null;
  return unit === 1 ? value * 7 : unit === 0 ? value : null;
}
@Component({
  selector: 'mifosx-investment-policy-editor',
  standalone: true,
  imports: [
    RouterModule,
    SharedModule,
    InvestmentCodePipe,
    InvestmentFeedbackComponent
  ],
  templateUrl: './investment-policy-editor.component.html',
  styleUrls: ['./investment-products.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvestmentPolicyEditorComponent implements OnInit {
  access = inject(InvestmentAccessService);
  private service = inject(InvestmentProductService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);
  conflict = signal(false);
  id = Number(inject(ActivatedRoute).snapshot.parent.paramMap.get('productId'));
  config = signal<PolicyConfiguration | null>(null);
  template = signal<PolicyTemplate | null>(null);
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  message = signal('');
  issues = signal<string[]>([]);
  blockers = signal<string[]>([]);
  details = signal<{ field: string; message: string }[]>([]);
  readonly form;
  private readonly defaults;
  booleanFields = [
    'capitalizationEligible',
    'capitalizationEnabled',
    'penaltyFreeNonRenewalSupported'
  ];
  termFields = [
    'minimumTermDays',
    'maximumTermDays',
    'termMultipleDays'
  ];
  amountFields = [
    'minimumInvestmentAmount',
    'maximumInvestmentAmount'
  ];
  constructor(private fb: FormBuilder) {
    this.form = fb.nonNullable.group({
      investmentType: fb.nonNullable.control<InvestmentType | ''>('', Validators.required),
      minimumTermDays: fb.control<number | null>(null, [
        Validators.required,
        Validators.min(1)
      ]),
      maximumTermDays: fb.control<number | null>(null, [
        Validators.required,
        Validators.min(1)
      ]),
      termMultipleDays: fb.control<number | null>(null, [
        Validators.required,
        Validators.min(1)
      ]),
      minimumInvestmentAmount: fb.control<Decimal | null>(''),
      maximumInvestmentAmount: fb.control<Decimal | null>(''),
      automaticReinvestmentEnabled: false,
      maximumReinvestments: fb.control<number | null>(null),
      maximumReinvestmentsByTerm: fb.array<RenewalLimitForm>([]),
      renewalRatePolicy: fb.control<InvestmentPolicy['renewalRatePolicy']>('RATE_EFFECTIVE_AT_RENEWAL'),
      capitalizationEligible: false,
      capitalizationEnabled: false,
      interestPayoutMode: fb.nonNullable.control<InvestmentPolicy['interestPayoutMode']>(
        'AT_MATURITY',
        Validators.required
      ),
      principalSettlementMode: fb.nonNullable.control<InvestmentPolicy['principalSettlementMode']>(
        'AT_MATURITY',
        Validators.required
      ),
      earlyCancellationAllowed: false,
      penaltyMode: fb.nonNullable.control<InvestmentPolicy['penaltyMode']>('NONE', Validators.required),
      policyCode: '',
      referenceRevision: fb.control<number | null>(null),
      penaltyFreeNonRenewalSupported: false
    });
    this.defaults = this.form.getRawValue();
    this.form.controls.automaticReinvestmentEnabled.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncReinvestmentLimits());
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.message.set('');
      this.issues.set([]);
    });
  }
  get limits() {
    return this.form.controls.maximumReinvestmentsByTerm;
  }
  get dirty() {
    return this.form.dirty;
  }
  get busy() {
    return this.saving();
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
        if (confirmed) {
          this.form.markAsPristine();
          this.load();
        }
      });
  }
  load() {
    if (this.dirty || this.busy) return;
    if (!this.access.has('READ_INVESTMENT_PRODUCT_POLICY') || !this.access.has('UPDATE_INVESTMENT_PRODUCT_POLICY')) {
      this.error.set('Investment.forbidden');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.config.set(null);
    this.message.set('');
    this.issues.set([]);
    this.details.set([]);
    forkJoin({
      config: this.service.getInvestmentConfiguration(this.id),
      template: this.service.getInvestmentTemplate()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ config, template }) => {
          this.config.set(config);
          this.template.set(template);
          this.blockers.set(config.validation.blockers);
          this.limits.clear({ emitEvent: false });
          this.form.reset(this.defaults, { emitEvent: false });
          if (config.policy) {
            this.form.patchValue(
              {
                ...config.policy,
                policyCode: config.policy.cancellationPolicyReference?.policyCode ?? '',
                referenceRevision: config.policy.cancellationPolicyReference?.revision ?? null
              },
              { emitEvent: false }
            );
            for (const limit of config.policy.maximumReinvestmentsByTerm ?? []) this.appendLimit(limit);
          } else {
            const native = config.nativeProduct;
            const terms = native.terms;
            this.form.patchValue(
              {
                minimumTermDays: termDays(terms.minimum, terms.minimumUnit) ?? template.promissoryNoteMinimumTermDays,
                maximumTermDays: termDays(terms.maximum, terms.maximumUnit) ?? template.promissoryNoteMaximumTermDays,
                termMultipleDays: (terms.multipleUnit === 1 ? termDays(terms.multiple, 1) : terms.multiple) ?? 1,
                minimumInvestmentAmount: native.minimumDepositAmount ?? '',
                maximumInvestmentAmount: native.maximumDepositAmount ?? ''
              },
              { emitEvent: false }
            );
          }
          this.setBusy(false);
          this.form.markAsPristine();
          this.conflict.set(false);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(investmentError(error));
          this.loading.set(false);
        }
      });
  }
  private appendLimit(limit?: TermRenewalLimit) {
    this.limits.push(
      this.fb.group({
        termDays: this.fb.control<number | null>(limit?.termDays ?? null, Validators.required),
        maximumReinvestments: this.fb.control<number | null>(limit?.maximumReinvestments ?? null, Validators.required)
      }),
      { emitEvent: false }
    );
  }
  get canEditLimits() {
    return this.form.enabled && !this.busy && !this.conflict() && this.form.controls.automaticReinvestmentEnabled.value;
  }
  addLimit() {
    if (!this.canEditLimits || this.limits.length >= 100) return;
    this.appendLimit();
    this.form.markAsDirty();
  }
  removeLimit(index: number) {
    if (!this.canEditLimits) return;
    this.limits.removeAt(index);
    this.form.markAsDirty();
  }
  payload(): PolicyWrite | null {
    const value = this.form.getRawValue();
    const { investmentType, minimumTermDays, maximumTermDays, termMultipleDays } = value;
    if (!investmentType || minimumTermDays == null || maximumTermDays == null || termMultipleDays == null) return null;
    const reinvest = value.automaticReinvestmentEnabled;
    const cancellation = value.earlyCancellationAllowed;
    const limits: TermRenewalLimit[] = [];
    if (reinvest) {
      for (const { termDays, maximumReinvestments } of value.maximumReinvestmentsByTerm) {
        if (termDays == null || maximumReinvestments == null) return null;
        limits.push({ termDays, maximumReinvestments });
      }
    }
    const policy: InvestmentPolicy = {
      investmentType,
      currencyCode: this.config().nativeProduct.currencyCode,
      minimumTermDays,
      maximumTermDays,
      termMultipleDays,
      minimumInvestmentAmount: value.minimumInvestmentAmount === '' ? null : value.minimumInvestmentAmount,
      maximumInvestmentAmount: value.maximumInvestmentAmount === '' ? null : value.maximumInvestmentAmount,
      automaticReinvestmentEnabled: reinvest,
      maximumReinvestments: reinvest ? value.maximumReinvestments : null,
      maximumReinvestmentsByTerm: limits,
      renewalRatePolicy: reinvest ? value.renewalRatePolicy : null,
      capitalizationEligible: value.capitalizationEligible,
      capitalizationEnabled: value.capitalizationEnabled,
      interestPayoutMode: value.interestPayoutMode,
      principalSettlementMode: value.principalSettlementMode,
      earlyCancellationAllowed: cancellation,
      penaltyMode: cancellation ? value.penaltyMode : 'NONE',
      cancellationPolicyReference:
        cancellation && value.penaltyMode === 'VERSIONED_REFERENCE' && value.referenceRevision != null
          ? { policyCode: value.policyCode, revision: value.referenceRevision }
          : null,
      penaltyFreeNonRenewalSupported: value.penaltyFreeNonRenewalSupported
    };
    return { expectedRevision: this.config().revision, policy };
  }
  private setBusy(value: boolean) {
    this.saving.set(value);
    if (value) this.form.disable({ emitEvent: false });
    else if (this.config()?.capabilities.configurationSupported) {
      this.form.enable({ emitEvent: false });
      this.syncReinvestmentLimits();
    } else {
      this.form.disable({ emitEvent: false });
    }
  }
  private syncReinvestmentLimits() {
    if (this.form.enabled && this.form.controls.automaticReinvestmentEnabled.value) {
      this.limits.enable({ emitEvent: false });
    } else {
      this.limits.disable({ emitEvent: false });
    }
  }
  submit(save: boolean) {
    if (
      this.busy ||
      this.conflict() ||
      !this.config()?.capabilities.configurationSupported ||
      !this.access.has('UPDATE_INVESTMENT_PRODUCT_POLICY')
    )
      return;
    this.form.markAllAsTouched();
    const payload = this.payload();
    if (!payload) {
      const { investmentType } = this.form.controls;
      this.issues.set([
        !investmentType.value
          ? 'Investment.typeRequired'
          : this.limits.invalid
            ? 'Investment.renewalRules'
            : 'Investment.termRules'
      ]);
      return;
    }
    this.issues.set(policyIssues(payload.policy, this.config().nativeProduct, this.template()));
    if (this.form.invalid || this.issues().length) return;
    this.setBusy(true);
    this.error.set('');
    this.details.set([]);
    this.message.set('');
    let writeStarted = false;
    this.service
      .validateInvestmentConfiguration(this.id, payload)
      .pipe(
        switchMap((result) => {
          this.blockers.set(result.validation.blockers);
          if (!result.validation.policyValidated) throw new Error('Investment.validationFailed');
          if (!save) return of(null);
          const request = this.service.saveInvestmentConfiguration(this.id, payload);
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
            this.config.set(result);
            this.form.markAsPristine();
            this.router.navigate([
              '/products/investment-products',
              this.id
            ]);
          }
        },
        error: (error) => {
          this.error.set(investmentError(error));
          this.details.set(validationDetails(error));
          if (requiresInvestmentReload(error, writeStarted)) this.conflict.set(true);
          this.setBusy(false);
        }
      });
  }
}
