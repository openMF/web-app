/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { ExchangeRatesRoutingModule } from './exchange-rates-routing.module';

/** Custom Components */
import { CreateExchangeRateComponent } from './create-exchange-rate/create-exchange-rate.component';
import { CurrencyConversionComponent } from './currency-conversion/currency-conversion.component';
import { EditExchangeRateComponent } from './edit-exchange-rate/edit-exchange-rate.component';
import { ExchangeRatesComponent } from './exchange-rates.component';
import { ViewExchangeRateComponent } from './view-exchange-rate/view-exchange-rate.component';

/**
 * Exchange Rates Module
 *
 * Lazy-loaded exchange-rate management routes.
 */
@NgModule({
  imports: [
    ExchangeRatesRoutingModule,
    ExchangeRatesComponent,
    CreateExchangeRateComponent,
    EditExchangeRateComponent,
    ViewExchangeRateComponent,
    CurrencyConversionComponent
  ]
})
export class ExchangeRatesModule {}
