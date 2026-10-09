/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/** Custom Resolvers */
import { CurrenciesResolver } from '../currencies/currencies.resolver';
import { ExchangeRateResolver } from './exchange-rate.resolver';
import { ExchangeRatesResolver } from './exchange-rates.resolver';

/** Custom Components */
import { CreateExchangeRateComponent } from './create-exchange-rate/create-exchange-rate.component';
import { CurrencyConversionComponent } from './currency-conversion/currency-conversion.component';
import { EditExchangeRateComponent } from './edit-exchange-rate/edit-exchange-rate.component';
import { ExchangeRatesComponent } from './exchange-rates.component';
import { ViewExchangeRateComponent } from './view-exchange-rate/view-exchange-rate.component';

const routes: Routes = [
  {
    path: '',
    component: ExchangeRatesComponent,
    resolve: {
      exchangeRates: ExchangeRatesResolver,
      currencies: CurrenciesResolver
    }
  },
  {
    path: 'create',
    component: CreateExchangeRateComponent,
    data: { title: 'Create Exchange Rate', breadcrumb: 'Create Exchange Rate' },
    resolve: {
      currencies: CurrenciesResolver
    }
  },
  {
    path: 'convert',
    component: CurrencyConversionComponent,
    data: { title: 'Currency Conversion', breadcrumb: 'Currency Conversion' },
    resolve: {
      currencies: CurrenciesResolver
    }
  },
  {
    path: ':id',
    data: { title: 'View Exchange Rate', routeParamBreadcrumb: 'id' },
    children: [
      {
        path: '',
        component: ViewExchangeRateComponent,
        resolve: {
          exchangeRate: ExchangeRateResolver
        }
      },
      {
        path: 'edit',
        component: EditExchangeRateComponent,
        data: { title: 'Edit Exchange Rate', breadcrumb: 'Edit', routeParamBreadcrumb: false },
        resolve: {
          exchangeRate: ExchangeRateResolver,
          currencies: CurrenciesResolver
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    ExchangeRatesResolver,
    ExchangeRateResolver
  ]
})
export class ExchangeRatesRoutingModule {}
