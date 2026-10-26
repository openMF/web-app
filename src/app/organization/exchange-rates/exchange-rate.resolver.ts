/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';

import { ExchangeRate } from './exchange-rate.model';
import { ExchangeRatesService } from './exchange-rates.service';

@Injectable()
export class ExchangeRateResolver {
  private exchangeRatesService = inject(ExchangeRatesService);

  resolve(route: ActivatedRouteSnapshot): Observable<ExchangeRate> {
    const exchangeRateId = route.paramMap.get('id');
    if (!exchangeRateId) {
      return throwError(() => new Error('Exchange rate id is missing.'));
    }

    return this.exchangeRatesService.getExchangeRate(exchangeRateId);
  }
}
