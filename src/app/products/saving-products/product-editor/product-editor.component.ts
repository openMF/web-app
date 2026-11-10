/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectorRef,
  AfterViewInit,
  Component,
  DestroyRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { forkJoin, of, switchMap, finalize } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Accounting } from 'app/core/utils/accounting';
import { SettingsService } from 'app/settings/settings.service';
import { ProductsService } from 'app/products/products.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { FinancialPolicySummaryComponent } from './financial-policy-summary.component';
import { FinancialCapabilitiesComponent } from './financial-capabilities.component';
import { MonthlyFeeDiagnosticsComponent } from './monthly-fee-diagnostics.component';
import { InterestConfigurationComponent } from './interest-configuration.component';
import { InterestMode } from './product-policy.model';
import { ProductPolicyService } from './product-policy.service';
import { PolicyWorkflowComponent, policyPermission, policyError, serverErrors } from './policy-workflow.component';
import {
  PolicyCapabilities,
  PolicyCharge,
  PolicyConfiguration,
  PolicyCoreContext,
  createPolicyForm,
  normalizedPolicy,
  policyValidator
} from './product-policy.model';
import { SavingProductDetailsStepComponent } from '../saving-product-stepper/saving-product-details-step/saving-product-details-step.component';
import { SavingProductCurrencyStepComponent } from '../saving-product-stepper/saving-product-currency-step/saving-product-currency-step.component';
import { SavingProductTermsStepComponent } from '../saving-product-stepper/saving-product-terms-step/saving-product-terms-step.component';
import { SavingProductSettingsStepComponent } from '../saving-product-stepper/saving-product-settings-step/saving-product-settings-step.component';
import { SavingProductChargesStepComponent } from '../saving-product-stepper/saving-product-charges-step/saving-product-charges-step.component';
import { SavingProductAccountingStepComponent } from '../saving-product-stepper/saving-product-accounting-step/saving-product-accounting-step.component';

export class PolicyFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if (!control || !(control.dirty || control.touched || form?.submitted)) return false;
    const parent = control.parent;
    const name = parent && Object.keys(parent.controls).find((key) => parent.get(key) === control);
    return control.invalid || !!(name && parent.errors?.[name]);
  }
}

@Component({
  selector: 'mifosx-product-editor',
  providers: [{ provide: ErrorStateMatcher, useClass: PolicyFieldErrorMatcher }],
  templateUrl: './product-editor.component.html',
  styleUrls: ['./product-editor.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTabsModule,
    MatExpansionModule,
    MatProgressBarModule,
    PolicyWorkflowComponent,
    FinancialPolicySummaryComponent,
    FinancialCapabilitiesComponent,
    MonthlyFeeDiagnosticsComponent,
    InterestConfigurationComponent,
    SavingProductDetailsStepComponent,
    SavingProductCurrencyStepComponent,
    SavingProductTermsStepComponent,
    SavingProductSettingsStepComponent,
    SavingProductChargesStepComponent,
    SavingProductAccountingStepComponent
  ]
})
export class ProductEditorComponent implements OnInit, AfterViewInit {
  @Input() template: any;
  @ViewChild(SavingProductDetailsStepComponent, { static: true }) details: SavingProductDetailsStepComponent;
  @ViewChild(SavingProductCurrencyStepComponent, { static: true }) currency: SavingProductCurrencyStepComponent;
  @ViewChild(SavingProductTermsStepComponent, { static: true }) terms: SavingProductTermsStepComponent;
  @ViewChild(SavingProductSettingsStepComponent, { static: true }) settings: SavingProductSettingsStepComponent;
  @ViewChild(SavingProductChargesStepComponent, { static: true }) charges: SavingProductChargesStepComponent;
  @ViewChild(SavingProductAccountingStepComponent, { static: true }) accounting: SavingProductAccountingStepComponent;
  private builder = inject(FormBuilder);
  private api = inject(ProductPolicyService);
  private cdr = inject(ChangeDetectorRef);
  private products = inject(ProductsService);
  private auth = inject(AuthenticationService);
  private settingsService = inject(SettingsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  accountingRules = inject(Accounting).getAccountingRulesForSavings();
  policy = createPolicyForm(this.builder);
  capabilities: PolicyCapabilities | null = null;
  configuration: PolicyConfiguration | null = null;
  fees: PolicyCharge[] = [];
  busy = false;
  loaded = false;
  conflict = false;
  coreCreationUnresolved = false;
  coreCommandId: number | null = null;
  error = '';
  errorDetails: string[] = [];
  notice = '';
  createdId: number | null = null;
  tab = 0;
  private previousMode: InterestMode | null = null;
  @ViewChild(InterestConfigurationComponent) interest?: InterestConfigurationComponent;
  private saved = false;
  private ready = false;
  get productId(): number | null {
    return this.template.id || this.createdId;
  }
  get editing() {
    return !!this.template.id;
  }
  get canWrite() {
    return policyPermission(this.auth, 'UPDATE_SAVINGS_PRODUCT_POLICY');
  }
  get canCreate() {
    return policyPermission(this.auth, 'CREATE_SAVINGSPRODUCT');
  }
  get pending() {
    return this.workflow?.pending || false;
  }
  @ViewChild(PolicyWorkflowComponent) workflow?: PolicyWorkflowComponent;
  get immutable() {
    return this.pending || !!this.createdId || this.editing;
  }
  get coreForms(): UntypedFormGroup[] {
    return [
      this.details.savingProductDetailsForm,
      this.currency.savingProductCurrencyForm,
      this.terms.savingProductTermsForm,
      this.settings.savingProductSettingsForm,
      this.accounting.savingProductAccountingForm
    ];
  }
  get dirty() {
    return (
      this.busy ||
      this.interest?.dirty ||
      this.interest?.saving ||
      this.policy.dirty ||
      (!this.editing &&
        !this.saved &&
        this.ready &&
        (this.coreForms.some((form) => form.dirty) || !this.charges.pristine))
    );
  }
  get context(): PolicyCoreContext {
    if (this.editing)
      return {
        currency: this.template.currency?.code,
        digits: this.template.currency?.decimalPlaces,
        opening: String(this.template.minRequiredOpeningBalance ?? 0),
        rate: String(this.template.nominalAnnualInterestRate ?? 0)
      };
    return {
      currency: this.currency?.savingProductCurrencyForm.get('currencyCode').value,
      digits: Number(this.currency?.savingProductCurrencyForm.get('digitsAfterDecimal').value),
      opening: String(this.settings?.savingProductSettingsForm.get('minRequiredOpeningBalance').value || '0'),
      rate: String(this.terms?.savingProductTermsForm.get('nominalAnnualInterestRate').value ?? '')
    };
  }
  ngOnInit() {
    this.policy.setValidators(
      policyValidator(
        () => this.context,
        () => this.fees,
        () => this.capabilities
      )
    );
    this.policy.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (!value.feeApplicable) this.policy.controls.feeChargeId.setValue(null, { emitEvent: false });
      if (value.freezing !== 'TERM') this.policy.controls.freezingTermDays.setValue(null, { emitEvent: false });
      if (!value.additionalPaymentReference)
        this.policy.controls.paymentReferencePartner.setValue(null, { emitEvent: false });
    });
    this.load();
  }
  ngAfterViewInit() {
    this.ready = true;
    this.coreForms.forEach((form) =>
      form.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.policy.updateValueAndValidity({ emitEvent: false }))
    );
    if (this.editing) this.coreForms.forEach((form) => form.disable({ emitEvent: false }));
    this.policy.updateValueAndValidity({ emitEvent: false });
  }
  load() {
    if (this.busy) return;
    if (this.dirty && !window.confirm(this.translate.instant('SavingsEditor.Discard'))) return;
    this.busy = true;
    this.loaded = false;
    this.error = '';
    this.errorDetails = [];
    forkJoin({
      capabilities: this.api.template(),
      fees: this.api.fees(),
      configuration: this.productId ? this.api.configuration(this.productId) : of(null)
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
          this.capabilities = data.capabilities;
          this.fees = data.fees;
          this.configuration = data.configuration;
          if (this.configuration?.policy) this.policy.reset(this.configuration.policy);
          else this.policy.markAsPristine();
          this.previousMode = this.policy.controls.interestMode.value;
          this.loaded = true;
          this.conflict = false;
          if (!this.canWrite || !this.capabilities.draftConfiguration) this.policy.disable({ emitEvent: false });
          this.policy.updateValueAndValidity({ emitEvent: false });
        },
        error: (error) => this.failed(error)
      });
  }
  get saveDisabled() {
    return (
      this.busy ||
      this.interest?.dirty ||
      this.interest?.saving ||
      !this.loaded ||
      this.conflict ||
      this.coreCreationUnresolved ||
      !this.canWrite ||
      !this.capabilities?.draftConfiguration ||
      this.policy.invalid ||
      this.pending ||
      (!!this.productId && !this.workflow?.loaded) ||
      (this.productId
        ? !this.policy.dirty && !!this.configuration?.revision
        : !this.canCreate || !this.ready || this.coreForms.some((form) => form.invalid))
    );
  }
  get coreProduct() {
    return {
      ...this.details.savingProductDetails,
      ...this.currency.savingProductCurrency,
      ...this.terms.savingProductTerms,
      ...this.settings.savingProductSettings,
      ...this.charges.savingProductCharges,
      ...this.accounting.savingProductAccounting
    };
  }
  save() {
    this.policy.markAllAsTouched();
    if (this.saveDisabled) return;
    this.busy = true;
    this.error = '';
    this.errorDetails = [];
    this.notice = '';
    const policy = normalizedPolicy(this.policy);
    const ensureProduct = this.productId
      ? of(this.productId)
      : this.products.createSavingProduct(this.creationPayload()).pipe(
          switchMap((response: { resourceId?: number; commandId?: number }) => {
            if (!Number.isSafeInteger(response.resourceId) || response.resourceId <= 0) {
              // Core maker-checker may stage a command without creating a product. Never invent a product ID.
              this.conflict = true;
              this.coreCreationUnresolved = true;
              this.coreCommandId = response.commandId ?? null;
              this.notice = 'SavingsEditor.CoreAuthorizationRequired';
              throw new Error(
                'Core creation did not return an authoritative product ID; inspect native checker inbox.'
              );
            }
            this.createdId = response.resourceId;
            this.coreForms.forEach((form) => form.disable({ emitEvent: false }));
            this.notice = 'SavingsEditor.CoreCreated';
            return of(this.createdId);
          })
        );
    ensureProduct
      .pipe(
        switchMap((id) => (this.configuration ? of(this.configuration) : this.api.configuration(id))),
        switchMap((config) => {
          this.configuration = config;
          const revision = config.status === 'UNCONFIGURED' && config.revision == null ? 0 : config.revision;
          if (!Number.isSafeInteger(revision) || revision < 0) throw new Error('Invalid server revision');
          return this.api
            .save(config.savingsProductId, revision, policy)
            .pipe(switchMap(() => this.api.configuration(config.savingsProductId)));
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (config) => {
          this.configuration = config;
          this.policy.reset(config.policy);
          this.previousMode = config.policy.interestMode;
          this.saved = true;
          this.notice = 'SavingsEditor.DraftSaved';
          if (this.createdId) {
            this.busy = false;
            this.router.navigate([
              '/products/saving-products',
              this.createdId,
              'edit'
            ]);
          }
        },
        error: (error) => {
          this.failed(error);
          if (this.createdId) this.notice = 'SavingsEditor.PartialFailure';
        }
      });
  }
  creationPayload() {
    const product = {
      ...this.coreProduct,
      charges: this.coreProduct.charges.map((charge: { id: number }) => ({ id: charge.id })),
      locale: this.settingsService.language.code
    };
    delete product.advancedAccountingRules;
    return product;
  }
  changeInterestMode(mode: InterestMode) {
    const matrix = this.policy.controls.interestMatrix;
    const formula = this.policy.controls.referenceRate;
    if ((matrix.value && mode !== 'TIERED') || (formula.value && mode !== 'REFERENCE_RATE') || this.interest?.dirty) {
      if (!window.confirm(this.translate.instant('InterestManagement.ConfirmModeChange'))) {
        this.policy.controls.interestMode.setValue(this.previousMode);
        return;
      }
      if (matrix.value && mode !== 'TIERED') matrix.setValue(null);
      if (formula.value && mode !== 'REFERENCE_RATE') formula.setValue(null);
    }
    this.previousMode = mode;
    this.policy.markAsDirty();
  }
  advancedSaved(config: PolicyConfiguration) {
    this.configuration = config;
    this.policy.reset(config.policy);
    this.previousMode = config.policy.interestMode;
  }
  get advancedBlocked() {
    return (
      this.busy ||
      this.policy.dirty ||
      this.policy.invalid ||
      this.conflict ||
      !this.canWrite ||
      !this.loaded ||
      !this.capabilities?.draftConfiguration ||
      !this.workflow?.loaded ||
      this.pending
    );
  }
  zeroInterest() {
    if (this.immutable) return;
    this.policy.controls.interestMode.setValue('NONE');
    this.policy.markAsDirty();
    this.terms.savingProductTermsForm.get('nominalAnnualInterestRate').setValue(0);
    this.terms.savingProductTermsForm.markAsDirty();
  }
  fieldError(name: string): string {
    return this.policy.errors?.[name] || (this.policy.get(name)?.invalid ? 'SavingsEditor.RequiredLabel' : '');
  }
  get validationErrors(): string[] {
    return [...new Set(Object.values(this.policy.errors || {}) as string[])];
  }
  failed(error: unknown) {
    this.error = policyError(error);
    this.errorDetails = serverErrors(error);
    this.conflict = this.error === 'SavingsEditor.Conflict' || this.conflict;
  }
  workflowConflict() {
    this.conflict = true;
    this.error = 'SavingsEditor.Conflict';
  }
  refresh() {
    if (this.policy.dirty || this.interest?.dirty || this.interest?.saving || !this.productId) return;
    this.api
      .configuration(this.productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (config) => (this.configuration = config), error: (error) => this.failed(error) });
  }
  @HostListener('window:beforeunload', ['$event']) beforeUnload(event: BeforeUnloadEvent) {
    if (this.dirty) {
      event.preventDefault();
      event.returnValue = '';
    }
  }
}
