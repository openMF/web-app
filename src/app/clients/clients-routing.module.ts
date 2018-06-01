import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/core';

import { ClientsComponent } from './clients.component';
import { CreateClientComponent} from './create-client/create-client.component';
import { ViewClientComponent } from './view-client/view-client.component';

const routes: Routes = [
  { path: 'clients', component: ClientsComponent},
  { path: 'clients/create', component: CreateClientComponent},
  { path: 'clients/view', component: ViewClientComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ClientsRoutingModule { }
