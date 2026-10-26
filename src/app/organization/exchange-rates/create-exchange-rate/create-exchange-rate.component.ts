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

import { ExchangeRatePayload } from '../exchange-rate.model';
import { resolveCurrencyOptions } from '../exchange-rate-form.util';
import { differentCurrenciesValidator } from '../exchange-rate-validators';
import { ExchangeRatesService } from '../exchange-rates.service';

@Component({
  selector: 'mifosx-create-exchange-rate',
  templateUrl: './create-exchange-rate.component.html',
  styleUrls: ['./create-exchange-rate.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateExchangeRateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private exchangeRatesService = inject(ExchangeRatesService);
  private alertService = inject(AlertService);
  private dateUtils = inject(Dates);
  private destroyRef = inject(DestroyRef);

  currencyOptions: Currency[] = [];
  exchangeRateForm: FormGroup;
  submitting = false;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
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
          '',
          Validators.required
        ],
        targetCurrency: [
          '',
          Validators.required
        ],
        buyIndicatorCode: [
          '',
          Validators.required
        ],
        sellIndicatorCode: [
          '',
          Validators.required
        ],
        buyRate: [
          '',
          [
            Validators.required,
            Validators.min(0.0000001)
          ]
        ],
        sellRate: [
          '',
          [
            Validators.required,
            Validators.min(0.0000001)
          ]
        ],
        referenceRate: [
          '',
          [
            Validators.required,
            Validators.min(0.0000001)
          ]
        ],
        rateDate: [
          '',
          Validators.required
        ],
        latest: [true]
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
      .createExchangeRate(payload)
      .pipe(
        take(1),
        finalize(() => {
          this.submitting = false;
        })
      )
      .subscribe({
        next: () => this.router.navigate(['../'], { relativeTo: this.route }),
        error: (error) => {
          this.alertService.alert({
            type: 'Error',
            message: this.getErrorMessage(error, 'Failed to create exchange rate.')
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
