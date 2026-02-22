/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route } from '../core/route/route.service';
import { ProcessRemittanceComponent } from './process-remittance/process-remittance.component';
import { remittanceEnabledGuard } from './remittance-enabled.guard';

const routes: Routes = [
  Route.withShell([
    {
      path: 'remittances',
      canActivate: [remittanceEnabledGuard],
      data: { title: 'Remittances', breadcrumb: 'Remittances' },
      children: [
        {
          path: '',
          redirectTo: 'process',
          pathMatch: 'full'
        },
        {
          path: 'process',
          component: ProcessRemittanceComponent,
          data: { title: 'Process Remittance', breadcrumb: 'Process' }
        }
      ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RemittancesRoutingModule {}
