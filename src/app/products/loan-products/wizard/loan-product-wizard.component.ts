/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  HIDDEN_DEFAULTS,
  FORM_STEPS,
  INITIAL_FORM_STATE,
  buildPayload,
  LABEL_MAP,
  REVIEW_SECTIONS,
  VALUE_MAP
} from './loan-product.config';
import { ProductsService } from '../../products.service';
import { LoanProducts } from '../loan-products';
import { LoanProductService } from '../services/loan-product.service';
import { Router } from '@angular/router';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'mifosx-loan-product-wizard',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepperModule,
    MatButtonModule
  ],
  templateUrl: './loan-product-wizard.component.html',
  styleUrls: ['./loan-product-wizard.component.scss']
})
export class LoanProductWizardComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly loanProducts = inject(LoanProducts);
  private readonly loanProductService = inject(LoanProductService);
  private readonly router = inject(Router);
  private readonly hiddenFieldKeys = new Set(Object.keys(HIDDEN_DEFAULTS));

  @Input() loanProductsTemplate: any;
  @Input() itemsByDefault: any[] = [];

  steps = FORM_STEPS;
  reviewSections = REVIEW_SECTIONS;
  labelMap = LABEL_MAP;
  valueMap = VALUE_MAP;
  form: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
    this.syncTemplateDefaults();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loanProductsTemplate'] && this.form) {
      this.syncTemplateDefaults();
    }
  }

  get visibleSteps(): (typeof FORM_STEPS)[number][] {
    return this.steps.filter((step) => step.id === 7 || this.visibleFields(step).length > 0);
  }

  visibleFields(step: (typeof FORM_STEPS)[number]) {
    return step.fields.filter((field) => field.visible !== false && !this.hiddenFieldKeys.has(field.key));
  }

  buildPayloadForSubmit(): any {
    const merged = buildPayload(this.form.getRawValue());
    return this.loanProducts.buildPayload(merged, this.itemsByDefault || []);
  }

  get reviewPayload(): Record<string, unknown> {
    return buildPayload(this.form.getRawValue());
  }

  formatValue(key: string, val: unknown): string {
    if (val === '' || val === null || val === undefined) {
      return '—';
    }

    const map = this.valueMap[key];
    if (map) {
      const result = map[String(val)];
      if (result !== undefined) {
        return result;
      }
    }

    if (typeof val === 'boolean') {
      return val ? 'Yes' : 'No';
    }

    return String(val);
  }

  sectionRows(section: (typeof REVIEW_SECTIONS)[number]): Array<{ label: string; display: string }> {
    return section.keys
      .filter((key) => !this.hiddenFieldKeys.has(key))
      .map((key) => ({
        label: this.labelMap[key] || key,
        display: this.formatValue(key, this.reviewPayload[key])
      }))
      .filter((row) => !(section.optional && row.display === '—'));
  }

  get currencySymbol(): string {
    const currency = this.reviewPayload['currencyCode'] as string;
    return { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[currency] || '';
  }

  get formattedPrincipal(): string {
    const principal = this.reviewPayload['principal'];
    if (!principal && principal !== 0) {
      return '—';
    }
    return `${this.currencySymbol}${Number(principal).toLocaleString('en-IN')}`;
  }

  get scheduleLabel(): string {
    const repaymentCount = this.reviewPayload['numberOfRepayments'];
    const repaymentPeriod = this.formatValue('repaymentFrequencyType', this.reviewPayload['repaymentFrequencyType']);
    return `${repaymentCount || '—'} × ${repaymentPeriod}`;
  }

  get interestLabel(): string {
    const rate = this.reviewPayload['interestRatePerPeriod'];
    const period = this.formatValue('interestRateFrequencyType', this.reviewPayload['interestRateFrequencyType']);
    return rate ? `${rate}% ${period.toLowerCase()}` : '—';
  }

  submit(): void {
    const final = this.buildPayloadForSubmit();
    this.productsService
      .createLoanProduct(this.loanProductService.loanProductPath, final)
      .subscribe((response: any) => {
        this.router.navigate(
          [
            '/',
            'products',
            'loan-products',
            response.resourceId
          ],
          {
            queryParams: { productType: this.loanProductService.productType.value }
          }
        );
      });
  }

  private initializeForm(): void {
    const controls: Record<string, any> = {};
    const state = this.getInitialFormState();
    Object.keys(state).forEach((key) => {
      controls[key] = [state[key as keyof typeof state]];
    });
    this.form = this.fb.group(controls);
  }

  private syncTemplateDefaults(): void {
    if (!this.form || !this.loanProductsTemplate) {
      return;
    }

    this.form.patchValue(
      {
        currencyCode: this.getDefaultCurrencyCode(),
        principal: this.loanProductsTemplate.principal ?? '',
        numberOfRepayments: this.loanProductsTemplate.numberOfRepayments ?? INITIAL_FORM_STATE.numberOfRepayments,
        interestRatePerPeriod: this.loanProductsTemplate.interestRatePerPeriod ?? '',
        interestRateFrequencyType: this.loanProductsTemplate.interestRateFrequencyType?.id ?? 2,
        repaymentEvery: this.loanProductsTemplate.repaymentEvery ?? INITIAL_FORM_STATE.repaymentEvery,
        repaymentFrequencyType: this.loanProductsTemplate.repaymentFrequencyType?.id ?? 2,
        amortizationType: this.loanProductsTemplate.amortizationType?.id ?? INITIAL_FORM_STATE.amortizationType,
        interestType: this.loanProductsTemplate.interestType?.id ?? INITIAL_FORM_STATE.interestType,
        calculateInterestForExactDays:
          this.loanProductsTemplate.calculateInterestForExactDays ?? INITIAL_FORM_STATE.calculateInterestForExactDays,
        isEqualAmortization: this.loanProductsTemplate.isEqualAmortization ?? INITIAL_FORM_STATE.isEqualAmortization,
        interestCalculationPeriodType:
          this.loanProductsTemplate.interestCalculationPeriodType?.id ??
          INITIAL_FORM_STATE.interestCalculationPeriodType,
        loanScheduleType: this.loanProductsTemplate.loanScheduleType?.value ?? INITIAL_FORM_STATE.loanScheduleType,
        transactionProcessingStrategyCode:
          this.loanProductsTemplate.transactionProcessingStrategyCode ??
          INITIAL_FORM_STATE.transactionProcessingStrategyCode,
        loanScheduleProcessingType:
          this.loanProductsTemplate.loanScheduleProcessingType?.value ?? INITIAL_FORM_STATE.loanScheduleProcessingType,
        graceOnPrincipalPayment:
          this.loanProductsTemplate.graceOnPrincipalPayment ?? INITIAL_FORM_STATE.graceOnPrincipalPayment,
        graceOnInterestPayment:
          this.loanProductsTemplate.graceOnInterestPayment ?? INITIAL_FORM_STATE.graceOnInterestPayment,
        interestFreePeriod: this.loanProductsTemplate.interestFreePeriod ?? INITIAL_FORM_STATE.interestFreePeriod,
        daysInYearType: this.loanProductsTemplate.daysInYearType?.value ?? INITIAL_FORM_STATE.daysInYearType,
        daysInYearCustomStrategy:
          this.loanProductsTemplate.daysInYearCustomStrategy?.value ?? INITIAL_FORM_STATE.daysInYearCustomStrategy,
        daysInMonthType: this.loanProductsTemplate.daysInMonthType?.value ?? INITIAL_FORM_STATE.daysInMonthType,
        principalThresholdForLastInstallment:
          this.loanProductsTemplate.principalThresholdForLastInstallment ??
          INITIAL_FORM_STATE.principalThresholdForLastInstallment,
        canUseForTopup: this.loanProductsTemplate.canUseForTopup ?? INITIAL_FORM_STATE.canUseForTopup,
        isInterestRecalculationEnabled:
          this.loanProductsTemplate.isInterestRecalculationEnabled ?? INITIAL_FORM_STATE.isInterestRecalculationEnabled,
        delinquencyBucketId: this.loanProductsTemplate.delinquencyBucketId ?? INITIAL_FORM_STATE.delinquencyBucketId,
        chargeName: this.loanProductsTemplate.chargeName ?? INITIAL_FORM_STATE.chargeName,
        overdueCharge: this.loanProductsTemplate.overdueCharge ?? INITIAL_FORM_STATE.overdueCharge,
        accountingRule: this.loanProductsTemplate.accountingRule ?? INITIAL_FORM_STATE.accountingRule
      },
      { emitEvent: false }
    );
  }

  private getInitialFormState(): typeof INITIAL_FORM_STATE {
    return {
      ...INITIAL_FORM_STATE,
      currencyCode: this.getDefaultCurrencyCode(),
      principal: this.loanProductsTemplate?.principal ?? INITIAL_FORM_STATE.principal
    };
  }

  private getDefaultCurrencyCode(): string {
    return this.loanProductsTemplate?.currencyOptions?.[0]?.code || INITIAL_FORM_STATE.currencyCode;
  }
}
