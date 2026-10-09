/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ExchangeRate } from './exchange-rate.model';
import { ExchangeRatesService } from './exchange-rates.service';

@Injectable()
export class ExchangeRatesResolver {
  private exchangeRatesService = inject(ExchangeRatesService);

  resolve(): Observable<ExchangeRate[] | { pageItems?: ExchangeRate[] }> {
    return this.exchangeRatesService.getExchangeRates().pipe(catchError(() => of([])));
  }
}
