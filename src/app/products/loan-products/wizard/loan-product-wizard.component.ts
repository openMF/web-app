/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input, OnInit, inject } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  FORM_STEPS,
  INITIAL_FORM_STATE,
  buildPayload,
  LABEL_MAP,
  PRODUCT_CARDS,
  REVIEW_SECTIONS,
  VALUE_MAP
} from './loan-product.config';
import { ProductsService } from '../../products.service';
import { LoanProducts } from '../loan-products';
import { LoanProductService } from '../services/loan-product.service';
import { Router, ActivatedRoute } from '@angular/router';
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
export class LoanProductWizardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly loanProducts = inject(LoanProducts);
  private readonly loanProductService = inject(LoanProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  @Input() loanProductsTemplate: any;
  @Input() itemsByDefault: any[] = [];

  @ViewChild('loanFormSection') loanFormSection: ElementRef<HTMLElement>;

  productCards = PRODUCT_CARDS;
  steps = FORM_STEPS;
  reviewSections = REVIEW_SECTIONS;
  labelMap = LABEL_MAP;
  valueMap = VALUE_MAP;
  form: FormGroup;

  scrollToForm(): void {
    this.loanFormSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  ngOnInit(): void {
    const controls: any = {};
    const s = INITIAL_FORM_STATE as any;
    Object.keys(s).forEach((k) => (controls[k] = [s[k]]));
    this.form = this.fb.group(controls);
  }

  visibleFields(step: (typeof FORM_STEPS)[number]) {
    return step.fields.filter((field) => field.visible !== false);
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
            '../',
            response.resourceId
          ],
          {
            queryParams: { productType: this.loanProductService.productType.value },
            relativeTo: this.route
          }
        );
      });
  }
}
