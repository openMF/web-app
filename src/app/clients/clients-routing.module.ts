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
import { AddFamilyMemberComponent } from './family-members/add-family-members/add-family-members.component';
import { FamilyMemberResolver } from './resolver/family-member.resolver';

const routes: Routes = [
  Route.withShell([
    {
      path: 'clients',
      data: { title: extract('Clients'), breadcrumb: 'Client' },
      children: [
        {
          path: '',
          component: ClientsComponent
        },
        {
          path: 'create',
          component: CreateClientComponent,
          data: { title: extract('Create Client'), breadcrumb: 'client' }
        },
        {
          path: 'view/:id',
          data: { title: extract('View Clients'), breadcrumb: 'view' },
          children: [
            {
              path: '',
              component: ViewClientComponent,
            },
            {
              path: 'family-members/add',
              component: AddFamilyMemberComponent,
              resolve: {
                familyMember: FamilyMemberResolver,
              },
              data: { title: extract('Add Client Family Member'), breadcrumb: 'add' }
            }
          ]
        },
        {
          path: 'address/:id',
          component: CreateAddressComponent,
          data: { title: extract('Create Address'), breadcrumb: 'create' }
        },
        {
          path: 'editaddress/:id/:addressTypeId/:addressId',
          component: EditAddressComponent,
          data: { title: extract('Edit Address'), breadcrumb: 'edit' }
        },
        {
          path: 'viewloan',
          component: ViewLoanComponent,
          data: { title: extract('View Loan'), breadcrumb: 'loan' }
        },
        {
          path: 'addclientidentifier/:id',
          component: CreateIdentityComponent,
          data: { title: extract('Create Identity'), breadcrumb: 'create' }
        },
        {
          path: 'addclientdocument/:id',
          component: UploadDocumentComponent,
          data: { title: extract('Create Identity'), breadcrumb: 'create' }
        }
      ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    FamilyMemberResolver
  ]
})
export class ClientsRoutingModule { }
