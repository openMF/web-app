import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

import { ClientsComponent } from './clients.component';
import { CreateClientComponent} from './create-client/create-client.component';
import { ViewClientComponent } from './view-client/view-client.component';
import { ViewLoanComponent } from './view-loan/view-loan.component';
import { CreateAddressComponent } from './create-address/create-address.component';
import { CreateIdentityComponent } from './create-identity/create-identity.component';
import { UploadDocumentComponent } from './upload-document/upload-document.component';
import { EditAddressComponent } from './edit-address/edit-address.component';
import { AssignLoanOfficerComponent } from './assign-loan-officer/assign-loan-officer.component';

/** Custom Resolvers */
import { LoanOfficersResolver } from './assign-loan-officer/loan-officers.resolver';

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
      path: 'clients/address/:id',
      component: CreateAddressComponent,
      data: { title: extract('Create Address') }
    },
    {
      path: 'clients/editaddress/:id/:addressTypeId/:addressId',
      component: EditAddressComponent,
      data: { title: extract('Edit Address') }
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
    {
      path: 'clients/viewloan',
      data: { title: extract('View Loan'), breadcrumb: 'View Loan', addBreadcrumbLink: false },
      children: [
        {
          path: '',
          component: ViewLoanComponent,
        },
        {
          path: 'assignloanofficer/:loanId',
          component: AssignLoanOfficerComponent,
          data: { title: extract('Assign Loan Officer'), breadcrumb: 'Assign Loan Officer' },
          resolve: {
            loanOfficers: LoanOfficersResolver
          }
        }
      ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    LoanOfficersResolver
  ]
})
export class ClientsRoutingModule { }
