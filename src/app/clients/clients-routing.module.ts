import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '../../app/core';
import { ClientsComponent } from './clients.component';
import { CreateClientComponent} from './create-client/create-client.component';
import { ViewClientComponent } from './view-client/view-client.component';
import { ViewLoanComponent } from './view-loan/view-loan.component';

const routes: Routes = [
  Route.withShell([
    { path: 'clients', component: ClientsComponent},
    { path: 'clients/create', component: CreateClientComponent},
    { path: 'clients/view', component: ViewClientComponent},
    { path: 'clients/viewloan', component: ViewLoanComponent}
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ClientsRoutingModule { }
