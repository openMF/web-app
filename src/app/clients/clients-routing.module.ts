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
import { FamilyMembersTabComponent } from './clients-view/family-members-tab/family-members-tab.component';
import { AddFamilyMemberComponent } from './clients-view/family-members-tab/add-family-member/add-family-member.component';
import { EditFamilyMemberComponent } from './clients-view/family-members-tab/edit-family-member/edit-family-member.component';
import { IdentitiesTabComponent } from './clients-view/identities-tab/identities-tab.component';
import { NotesTabComponent } from './clients-view/notes-tab/notes-tab.component';
import { DocumentsTabComponent } from './clients-view/documents-tab/documents-tab.component';
import { DatatableTabComponent } from './clients-view/datatable-tab/datatable-tab.component';
import { AddressTabComponent } from './clients-view/address-tab/address-tab.component';

/** Custom Resolvers */
import { ClientViewResolver } from './common-resolvers/client-view.resolver';
import { ClientAccountsResolver } from './common-resolvers/client-accounts.resolver';
import { ClientAddressResolver } from './common-resolvers/client-address.resolver';
import { ClientChargesResolver } from './common-resolvers/client-charges.resolver';
import { ClientSummaryResolver } from './common-resolvers/client-summary.resolver';
import { ClientFamilyMembersResolver } from './common-resolvers/client-family-members.resolver';
import { ClientFamilyMemberResolver } from './common-resolvers/client-family-member.resolver';
import { ClientTemplateResolver } from './common-resolvers/client-template.resolver';
import { ClientIdentitiesResolver } from './common-resolvers/client-identities.resolver';
import { ClientNotesResolver } from './common-resolvers/client-notes.resolver';
import { ClientDocumentsResolver } from './common-resolvers/client-document.resolver';
import { ClientDatatablesResolver } from './common-resolvers/client-datatables.resolver';
import { ClientDatatableResolver } from './common-resolvers/client-datatable.resolver';
import { ClientIdentifierTemplateResolver } from './common-resolvers/client-identifier-template.resolver';
import { ClientAddressFieldConfigurationResolver } from './common-resolvers/client-address-fieldconfiguration.resolver';
import { ClientAddressTemplateResolver } from './common-resolvers/client-address-template.resolver';
import { ChargesOverviewComponent } from './clients-view/charges-overview/charges-overview.component';
import { ClientChargeOverviewResolver } from './clients-view/charges-overview/charge-overview.resolver';

const routes: Routes = [
  Route.withShell([{
    path: 'clients',
    data: { title: extract('Clients'), breadcrumb: 'Clients', routeParamBreadcrumb: false },
    children: [
      {
        path: '',
        component: ClientsComponent,
      },
      {
        path: ':clientId',
        component: ClientsViewComponent,
        data: { title: extract('Clients View'), routeParamBreadcrumb: 'clientId' },
        resolve: {
          clientViewData: ClientViewResolver,
          clientTemplateData: ClientTemplateResolver,
          clientDatatables: ClientDatatablesResolver
        },
        children: [
          {
            path: 'general',
            component: GeneralTabComponent,
            data: { title: extract('General'), breadcrumb: 'General', routeParamBreadcrumb: false },
            resolve: {
              clientAccountsData: ClientAccountsResolver,
              clientChargesData: ClientChargesResolver,
              clientSummary: ClientSummaryResolver
            }
          },
          {
            path: 'address',
            component: AddressTabComponent,
            data: { title: extract('Address'), breadcrumb: 'Address', routeParamBreadcrumb: false },
            resolve: {
              clientAddressFieldConfig: ClientAddressFieldConfigurationResolver,
              clientAddressTemplateData: ClientAddressTemplateResolver,
              clientAddressData: ClientAddressResolver
            }
          },
          {
            path: 'family-members',
            data: { title: extract('Family Members'), breadcrumb: 'Family Members', routeParamBreadcrumb: false },
            children: [
              {
                path: '',
                component: FamilyMembersTabComponent,
                resolve: {
                  clientFamilyMembers: ClientFamilyMembersResolver
                }
              },
              {
                path: 'add',
                component: AddFamilyMemberComponent,
                data: { title: extract('Add'), breadcrumb: 'Add', routeParamBreadcrumb: false },
                resolve: {
                  clientTemplate: ClientTemplateResolver
                }
              },
              {
                path: ':familyMemberId',
                children: [{
                  path: 'edit',
                  component: EditFamilyMemberComponent,
                  data: { title: extract('Family Member View'), routeParamBreadcrumb: 'familyMemberId' },
                  resolve: {
                    clientTemplate: ClientTemplateResolver,
                    editFamilyMember: ClientFamilyMemberResolver
                  }
                }]
              }
            ]
          },
          {
            path: 'identities',
            component: IdentitiesTabComponent,
            data: { title: extract('Identities'), breadcrumb: 'Identities', routeParamBreadcrumb: false },
            resolve: {
              clientIdentities: ClientIdentitiesResolver,
              clientIdentifierTemplate: ClientIdentifierTemplateResolver
            }
          },
          {
            path: 'documents',
            component: DocumentsTabComponent,
            data: { title: extract('Documents'), breadcrumb: 'Documents', routeParamBreadcrumb: false },
            resolve: {
              clientDocuments: ClientDocumentsResolver
            }
          },
          {
            path: 'notes',
            component: NotesTabComponent,
            data: { title: extract('Notes'), breadcrumb: 'Notes', routeParamBreadcrumb: false },
            resolve: {
              clientNotes: ClientNotesResolver
            }
          },
          {
            path: 'datatables',
            children: [{
              path: ':datatableName',
              component: DatatableTabComponent,
              data: { title: extract('Data Table View'), routeParamBreadcrumb: 'datatableName' },
              resolve: {
                clientDatatable: ClientDatatableResolver
              }
            }]
          },
          {
            path: 'chargeoverview',
            data: { title: extract('Charges Overview'), breadcrumb: 'Charges Overview', routeParamBreadcrumb: 'chargeId' },
            component: ChargesOverviewComponent,
            resolve: {
              clientChargesData: ClientChargeOverviewResolver,
            }
          }
        ]
      },
    ]
  },
  {
    path: 'clients',
    data: { title: extract('Clients'), breadcrumb: 'Clients', routeParamBreadcrumb: false },
    children: [
      {
        path: ':clientId',
        data: { title: extract('Clients View'), routeParamBreadcrumb: 'clientId' },
        children: [
          {
            path: 'loans',
            data: { title: extract('Loans'), breadcrumb: 'loans', routeParamBreadcrumb: false },
            loadChildren: '../loans/loans.module#LoansModule'
          },
          {
            path: 'savingsaccounts',
            loadChildren: '../savings/savings.module#SavingsModule'
          },
          {
            path: 'sharesaccounts',
            loadChildren: '../shares/shares.module#SharesModule'
          },
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
    ClientViewResolver,
    ClientAccountsResolver,
    ClientAddressResolver,
    ClientChargesResolver,
    ClientSummaryResolver,
    ClientFamilyMembersResolver,
    ClientFamilyMemberResolver,
    ClientTemplateResolver,
    ClientIdentitiesResolver,
    ClientNotesResolver,
    ClientDocumentsResolver,
    ClientDatatablesResolver,
    ClientDatatableResolver,
    ClientIdentifierTemplateResolver,
    ClientAddressFieldConfigurationResolver,
    ClientAddressTemplateResolver,
    ClientChargeOverviewResolver
  ]
})
export class ClientsRoutingModule { }
