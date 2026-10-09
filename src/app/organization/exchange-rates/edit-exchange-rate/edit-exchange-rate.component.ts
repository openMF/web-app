/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';

import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { Currency } from 'app/shared/models/general.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

import { ExchangeRate, ExchangeRatePayload } from '../exchange-rate.model';
import {
  resolveCurrencyOptions,
  resolveSourceCurrencyCode,
  resolveTargetCurrencyCode
} from '../exchange-rate-form.util';
import { differentCurrenciesValidator } from '../exchange-rate-validators';
import { ExchangeRatesService } from '../exchange-rates.service';

@Component({
  selector: 'mifosx-edit-exchange-rate',
  templateUrl: './edit-exchange-rate.component.html',
  styleUrls: ['./edit-exchange-rate.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditExchangeRateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private exchangeRatesService = inject(ExchangeRatesService);
  private alertService = inject(AlertService);
  private dateUtils = inject(Dates);
  private destroyRef = inject(DestroyRef);

  currencyOptions: Currency[] = [];
  exchangeRateData: ExchangeRate;
  exchangeRateForm: FormGroup;
  submitting = false;

  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { exchangeRate: ExchangeRate; currencies: any }) => {
        this.exchangeRateData = data.exchangeRate;
        this.currencyOptions = resolveCurrencyOptions(data.currencies);
      });
  }

  ngOnInit() {
    this.createExchangeRateForm();
  }

  createExchangeRateForm() {
    this.exchangeRateForm = this.formBuilder.group(
      {
        sourceCurrency: [
          resolveSourceCurrencyCode(this.exchangeRateData),
          Validators.required
        ],
        targetCurrency: [
          resolveTargetCurrencyCode(this.exchangeRateData),
          Validators.required
        ],
        buyIndicatorCode: [
          this.exchangeRateData.buyIndicatorCode,
          Validators.required
        ],
        sellIndicatorCode: [
          this.exchangeRateData.sellIndicatorCode,
          Validators.required
        ],
        buyRate: [
          this.exchangeRateData.buyRate,
          [
            Validators.required,
            Validators.min(0.0000001)
          ]
        ],
        sellRate: [
          this.exchangeRateData.sellRate,
          [
            Validators.required,
            Validators.min(0.0000001)
          ]
        ],
        referenceRate: [
          this.exchangeRateData.referenceRate,
          [
            Validators.required,
            Validators.min(0.0000001)
          ]
        ],
        rateDate: [
          this.exchangeRateData.rateDate ? this.dateUtils.parseDate(this.exchangeRateData.rateDate) : '',
          Validators.required
        ],
        latest: [this.exchangeRateData.latest]
      },
      { validators: [differentCurrenciesValidator] }
    );
  }

  submit() {
    if (this.exchangeRateForm.invalid || this.submitting) {
      return;
    }

    this.submitting = true;
    const payload = this.buildPayload();
    this.exchangeRatesService
      .updateExchangeRate(this.exchangeRateData.id, payload)
      .pipe(
        take(1),
        finalize(() => {
          this.submitting = false;
        })
      )
      .subscribe({
        next: () => this.router.navigate(['../../'], { relativeTo: this.route }),
        error: (error) => {
          this.alertService.alert({
            type: 'Error',
            message: this.getErrorMessage(error, 'Failed to update exchange rate.')
          });
        }
      });
  }

  private buildPayload(): ExchangeRatePayload {
    const formValue = this.exchangeRateForm.value;
    return {
      rateDate: this.dateUtils.formatDate(formValue.rateDate, 'yyyy-MM-dd'),
      buyIndicatorCode: formValue.buyIndicatorCode,
      sellIndicatorCode: formValue.sellIndicatorCode,
      buyRate: formValue.buyRate,
      sellRate: formValue.sellRate,
      referenceRate: formValue.referenceRate,
      sourceCurrency: formValue.sourceCurrency,
      targetCurrency: formValue.targetCurrency,
      latest: formValue.latest
    };
  }

  private getErrorMessage(error: any, fallbackMessage: string): string {
    return error?.error?.defaultUserMessage || error?.error?.developerMessage || error?.message || fallbackMessage;
  }
}
