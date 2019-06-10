import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { ClientsComponent } from './clients.component';
import { ClientsViewComponent } from './clients-view/clients-view.component';
import { GeneralTabComponent } from './clients-view/general-tab/general-tab.component';

/** Custom Resolvers */
import { ClientsResolver } from './common-resolvers/clients.resolver';
import { ClientViewResolver } from './common-resolvers/client-view.resolver';
import { ClientAccountsResolver } from './common-resolvers/client-accounts.resolver';
import { ClientChargesResolver } from './common-resolvers/client-charges.resolver';
import { ClientSummaryResolver } from './common-resolvers/client-summary.resolver';

const routes: Routes = [
  Route.withShell([{
    path: 'clients',
    data: { title: extract('Clients'), breadcrumb: 'Clients', routeParamBreadcrumb: false },
    children: [
      {
        path: '',
        component: ClientsComponent,
        resolve: {
          clientsData: ClientsResolver
        }
      },
      {
        path: ':clientId',
        component: ClientsViewComponent,
        data: { title: extract('Clients View'), routeParamBreadcrumb: 'clientId' },
        resolve: {
          clientViewData: ClientViewResolver
        },
        children: [
          {
            path: 'general',
            component: GeneralTabComponent,
            resolve: {
              clientAccountsData: ClientAccountsResolver,
              clientChargesData: ClientChargesResolver,
              clientSummary: ClientSummaryResolver
            },

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
    ClientsResolver,
    ClientViewResolver,
    ClientAccountsResolver,
    ClientChargesResolver,
    ClientSummaryResolver
  ]
})
export class ClientsRoutingModule { }
