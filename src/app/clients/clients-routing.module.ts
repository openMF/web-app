import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '../core';
import { ClientsComponent } from './clients.component';
import { CreateClientComponent} from './create-client/create-client.component';
import { ViewClientComponent } from './view-client/view-client.component';
import { ViewLoanComponent } from './view-loan/view-loan.component';
import { CreateAddressComponent } from './create-address/create-address.component';
import { CreateIdentityComponent } from './create-identity/create-identity.component';
import { UploadDocumentComponent } from './upload-document/upload-document.component';

const routes: Routes = [
  Route.withShell([
    {
      path: 'clients',
      component: ClientsComponent,
      data: { title: extract('Clients') }
    },
    {
      path: 'clients/create',
      component: CreateClientComponent,
      data: { title: extract('Create Client') }
    },
    {
      path: 'clients/view/:id',
      component: ViewClientComponent,
      data: { title: extract('View Client') }
    },
    {
      path: 'clients/viewloan',
      component: ViewLoanComponent,
      data: { title: extract('View Loan') }
    },
    {
      path: 'clients/address/:id',
      component: CreateAddressComponent,
      data: { title: extract('Create Address') }
    },
    {
      path: 'clients/addclientidentifier/:id',
      component: CreateIdentityComponent,
      data: { title: extract('Create Identity') }
    },
    {
      path: 'clients/addclientdocument/:id',
      component: UploadDocumentComponent,
      data: { title: extract('Create Identity') }
    },
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ClientsRoutingModule { }
