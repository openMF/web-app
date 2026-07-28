/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { take } from 'rxjs';

import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { Currency } from 'app/shared/models/general.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

import { CurrencyConversionPayload, CurrencyConversionResult } from '../exchange-rate.model';
import { resolveCurrencyOptions } from '../exchange-rate-form.util';
import { differentCurrenciesValidator } from '../exchange-rate-validators';
import { ExchangeRatesService } from '../exchange-rates.service';

@Component({
  selector: 'mifosx-currency-conversion',
  templateUrl: './currency-conversion.component.html',
  styleUrls: ['./currency-conversion.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyConversionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private exchangeRatesService = inject(ExchangeRatesService);
  private settingsService = inject(SettingsService);
  private dateUtils = inject(Dates);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  currencyOptions: Currency[] = [];
  conversionForm: FormGroup;
  conversionResult: CurrencyConversionResult;
  loading = false;
  apiError = '';

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.currencyOptions = resolveCurrencyOptions(data.currencies);
    });
  }

  ngOnInit() {
    this.createConversionForm();
  }

  createConversionForm() {
    this.conversionForm = this.formBuilder.group(
      {
        sourceCurrencyCode: [
          '',
          Validators.required
        ],
        targetCurrencyCode: [
          '',
          Validators.required
        ],
        amount: [
          '',
          [
            Validators.required,
            Validators.min(0.0000001)
          ]
        ],
        conversionDate: [
          '',
          Validators.required
        ]
      },
      { validators: differentCurrenciesValidator }
    );
  }

  submit() {
    this.loading = true;
    this.apiError = '';
    this.conversionResult = undefined;
    this.exchangeRatesService
      .convertCurrency(this.buildPayload())
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.conversionResult = result;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.apiError =
            error.error?.errors?.[0]?.defaultUserMessage ||
            error.error?.defaultUserMessage ||
            'Currency conversion failed. Please try again.';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  get exchangeRateUsed(): number {
    return this.conversionResult?.exchangeRateUsed ?? this.conversionResult?.exchangeRate;
  }

  get effectiveDate(): string | number[] {
    return this.conversionResult?.effectiveDate ?? this.conversionResult?.effectiveFromDate;
  }

  get rateSourceDisplay(): string {
    const rateSource = this.conversionResult?.rateSource;
    if (!rateSource) {
      return '';
    }

    const normalizedRateSource = rateSource.toLowerCase().replace(/[_-]/g, ' ');
    if (normalizedRateSource.includes('cross')) {
      return this.conversionResult?.baseCurrency
        ? `Cross Rate (via ${this.conversionResult.baseCurrency})`
        : 'Cross Rate';
    }
    if (
      normalizedRateSource.includes('admin') ||
      normalizedRateSource.includes('manual') ||
      normalizedRateSource.includes('direct')
    ) {
      return 'Administrator';
    }
    if (normalizedRateSource.includes('provider')) {
      return 'Provider';
    }
    return rateSource;
  }

  private buildPayload(): CurrencyConversionPayload {
    const formValue = this.conversionForm.value;
    return {
      sourceCurrencyCode: formValue.sourceCurrencyCode,
      targetCurrencyCode: formValue.targetCurrencyCode,
      amount: formValue.amount,
      conversionDate: this.dateUtils.formatDate(formValue.conversionDate, 'yyyy-MM-dd'),
      dateFormat: this.settingsService.dateFormat,
      locale: this.settingsService.language.code
    };
  }
}
