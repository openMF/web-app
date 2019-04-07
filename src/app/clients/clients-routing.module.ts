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
import { CreateSurveyComponent} from './create-survey/create-survey.component';



import {SurveysResolver} from './common-resolvers/surveys.resolver';

const routes: Routes = [
  Route.withShell([
    {
      path: 'clients',
      
      data: { title: extract('Clients'),breadcrumb:'Clients' },
      children:[
      {
        path:'',
        component: ClientsComponent
      },
    
      {
        path: 'create',
        component: CreateClientComponent,
        data: { title: extract('Create Client'),breadcrumb:'Create Client'}
      },
      {
        path: 'view/:id',
        
        data: { title: extract('View Client'),breadcrumb:'View Client' },
        children:[
          {
            path:'',
            component:ViewClientComponent            
          },
          {
            path:'survey',
            component:CreateSurveyComponent,

            data:{title: extract('Create Survey'),breadcrumb:'Survey'},
            resolve:{
              surveys:SurveysResolver
            },
          },
        ]
      },
      {
        path: 'viewloan',
        component: ViewLoanComponent,
        data: { title: extract('View Loan'),breadcrumb:'View Loan' }
      },
      {
        path: 'address/:id',
        component: CreateAddressComponent,
        data: { title: extract('Create Address'),breadcrumb:'Create Address' }
      },
      {
        path: 'editaddress/:id/:addressTypeId/:addressId',
        component: EditAddressComponent,
        data: { title: extract('Edit Address'),breadcrumb:'Edit Address' }
      },
      {
        path: 'addclientidentifier/:id',
        component: CreateIdentityComponent,
        data: { title: extract('Create Identity'),breadcrumb:'Create Identity' }
      },
      {
        path: 'addclientdocument/:id',
        component: UploadDocumentComponent,
        data: { title: extract('Upload Document'),breadcrumb:'Upload Document' }
      },
      {
        path:'createsurvey',
        component:CreateSurveyComponent,
        data:{title:extract('Create Survey'),breadcrumb:'Create Survey'}
      }
    
    ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    SurveysResolver
    ]
})
export class ClientsRoutingModule { }
