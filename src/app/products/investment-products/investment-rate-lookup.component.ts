/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable @angular-eslint/prefer-inject -- Repository UI skill requires constructor injection of FormBuilder. */
import { ChangeDetectionStrategy, Component, DestroyRef, Input, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedModule } from 'app/shared/shared.module';
import { RateSelection, RateTemplate } from './investment-product.models';
import { InvestmentProductService, investmentError, validationDetails } from './investment-product.service';
import { InvestmentCodePipe, InvestmentFeedbackComponent } from './investment-feedback.component';
import { isDecimal } from './investment-json';
function isValidInstant(value: string): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) ||
    Number.isNaN(Date.parse(value))
  )
    return false;
  const day = value.slice(0, 10);
  return new Date(day).toISOString().slice(0, 10) === day;
}
@Component({
  selector: 'mifosx-investment-rate-lookup',
  standalone: true,
  imports: [
    SharedModule,
    InvestmentCodePipe,
    InvestmentFeedbackComponent
  ],
  templateUrl: './investment-rate-lookup.component.html',
  styleUrls: ['./investment-products.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvestmentRateLookupComponent {
  @Input({ required: true }) productId: number;
  @Input({ required: true }) template: RateTemplate;
  private service = inject(InvestmentProductService);
  private destroyRef = inject(DestroyRef);
  private request?: Subscription;
  form;
  loading = signal(false);
  error = signal('');
  details = signal<{ field: string; message: string }[]>([]);
  selection = signal<RateSelection | null>(null);
  constructor(fb: FormBuilder) {
    this.form = fb.nonNullable.group({ amount: [
        '',
        Validators.required
      ], termDays: [
        null as number | null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ], asOfInstant: [''] });
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.request?.unsubscribe();
      this.loading.set(false);
      this.selection.set(null);
      this.error.set('');
      this.details.set([]);
    });
  }
  lookup() {
    if (this.loading() || !this.template.capabilities.rateLookupSupported) return;
    const value = this.form.getRawValue();
    this.form.markAllAsTouched();
    this.selection.set(null);
    this.details.set([]);
    if (
      this.form.invalid ||
      !isDecimal(value.amount, this.template.currencyDigits) ||
      !Number.isSafeInteger(value.termDays) ||
      (value.asOfInstant && !isValidInstant(value.asOfInstant))
    ) {
      this.error.set('Investment.lookupRules');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.request = this.service
      .selectRate(this.productId, {
        amount: value.amount,
        termDays: value.termDays,
        ...(value.asOfInstant ? { asOfInstant: value.asOfInstant } : {})
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (selection) => {
          this.selection.set(selection);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(investmentError(error));
          this.details.set(validationDetails(error));
          this.loading.set(false);
        }
      });
  }
}
