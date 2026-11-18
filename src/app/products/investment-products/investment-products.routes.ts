/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Routes } from '@angular/router';
import { investmentUnsavedGuard } from './investment-access.service';
import { InvestmentProductsComponent } from './investment-products.component';
import { InvestmentProductDetailsComponent } from './investment-product-details.component';
import { InvestmentOverviewComponent } from './investment-overview.component';
import { InvestmentPolicyEditorComponent } from './investment-policy-editor.component';
import { InvestmentRateManagerComponent } from './investment-rate-manager.component';
import { InvestmentHistoryComponent } from './investment-history.component';
export const INVESTMENT_PRODUCT_ROUTES: Routes = [
  { path: '', component: InvestmentProductsComponent, pathMatch: 'full' },
  {
    path: ':productId',
    component: InvestmentProductDetailsComponent,
    data: {
      title: 'Investment.overview',
      breadcrumb: 'productId',
      routeParamBreadcrumb: 'productId',
      reuseByParam: 'productId'
    },
    children: [
      {
        path: 'edit',
        component: InvestmentPolicyEditorComponent,
        runGuardsAndResolvers: 'paramsChange',
        canDeactivate: [investmentUnsavedGuard],
        data: { title: 'Investment.configure', breadcrumb: 'Investment.configure' }
      },
      {
        path: 'rates',
        component: InvestmentRateManagerComponent,
        runGuardsAndResolvers: 'paramsChange',
        canDeactivate: [investmentUnsavedGuard],
        data: { title: 'Investment.matrix', breadcrumb: 'Investment.matrix' }
      },
      {
        path: 'history',
        component: InvestmentHistoryComponent,
        data: { title: 'Investment.history', breadcrumb: 'Investment.history' }
      },
      { path: '', component: InvestmentOverviewComponent, pathMatch: 'full' }
    ]
  }
];
