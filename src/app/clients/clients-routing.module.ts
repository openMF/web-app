import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { ClientsComponent } from './clients.component';

/** Custom Resolvers */
import { ClientsResolver } from './common-resolvers/clients.resolver';

const routes: Routes = [
  Route.withShell([
    {
      path: 'clients',
      component: ClientsComponent,
      data: { title: extract('Clients'), breadcrumb: 'Clients', routeParamBreadcrumb: false },
      resolve: {
        clientsData: ClientsResolver
      }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    ClientsResolver
  ]
})
export class ClientsRoutingModule { }
