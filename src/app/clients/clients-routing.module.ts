import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { ClientsComponent } from './clients.component';
import { CreateClientComponent} from './create-client/create-client.component';

const routes: Routes = [
  { path: 'clients', component: ClientsComponent},
  { path: 'clients/create', component: CreateClientComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ClientsRoutingModule { }
