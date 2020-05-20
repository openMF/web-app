import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

import { CentersComponent } from './centers.component';
import { CreateCenterComponent } from './create-center/create-center.component';
import { OfficesResolver } from 'app/accounting/common-resolvers/offices.resolver';
import { CentersViewComponent } from './centers-view/centers-view.component';
import { GeneralTabComponent } from './centers-view/general-tab/general-tab.component';
import { CenterViewResolver } from './common-resolvers/center-view.resolver';
import { SavingsAccountResolver } from './common-resolvers/savings-account.resolver';
import { CenterResourceResolver } from './common-resolvers/center-resource.resolver';
import { CenterSummaryResolver } from './common-resolvers/center-summary.resolver';

const routes: Routes = [
  Route.withShell([

    {
      path: 'centers',
      data: { title: extract('Centers'), breadcrumb: 'Centers' },
      children: [
        {
          path: '',
          component: CentersComponent
        },
        {
          path: 'create',
          component: CreateCenterComponent,
          data: { title: extract('Create Center'), breadcrumb: 'Create' },
          resolve: {
            offices: OfficesResolver,
          }
        },
        {
          path: ':centerId',
          component: CentersViewComponent,
          data: { title: extract('Centers View'), routeParamBreadcrumb: 'centerId' },
          resolve: {
            centerViewData: CenterViewResolver
          },
          children: [
            {
              path: 'general',
              component: GeneralTabComponent,
              data: { title: extract('General'), breadcrumb: 'General', routeParamBreadcrumb: false },
              resolve: {
                centerSummaryData: CenterSummaryResolver,
                centerViewData: CenterResourceResolver,
                savingsAccountData: SavingsAccountResolver
              }
            }
          ]
        }
      ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    OfficesResolver,
    CenterViewResolver,
    SavingsAccountResolver,
    CenterResourceResolver,
    CenterSummaryResolver
  ]
})
export class CentersRoutingModule { }
