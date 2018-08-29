import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';
import { OrganisationComponent } from './organisation.component';
import { OfficesComponent } from './offices/offices.component';
import { CreateOfficeComponent } from './offices/create-office/create-office.component';
import { EditOfficeComponent } from './offices/edit-office/edit-office.component';
import { ViewOfficeComponent } from './offices/view-office/view-office.component';
import { ViewOfficeResolver } from './offices/view-office/view-office.resolver';
import { OfficesResolver } from '../accounting/common-resolvers/offices.resolver';

const routes: Routes = [
  Route.withShell([
    {
      path: 'organisation',
      data: { title: extract('Organisation'), breadcrumb: 'Organisation' },
      children: [
        {
          path: '',
          component: OrganisationComponent,
        },
        {
          path: 'manage-offices',
          data: { title: extract('Manage Offices'), breadcrumb: 'Manage Offices' },
          children: [
            {
              path: '',
              component: OfficesComponent,
            },
            {
              path: 'create',
              component: CreateOfficeComponent,
              data: { title: extract('Create office'), breadcrumb: 'Create Office' },
              resolve: {
                offices: OfficesResolver,
              },
            },
            {
              path: 'view/:id',
              data: { title: extract('View Office'), routeParamBreadcrumb: 'id' },
              resolve: {
                office: ViewOfficeResolver,
                offices: OfficesResolver
              },
              runGuardsAndResolvers: 'always',
              children: [
                {
                  path: '',
                  component: ViewOfficeComponent,
                },
                {
                  path: 'edit',
                  component: EditOfficeComponent,
                  data: {
                    title: extract('Edit Office'), breadcrumb: 'Edit', routeParamBreadcrumb: false
                  }
                }
              ]
            },
          ],
        }
      ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    ViewOfficeResolver
  ]
})
export class OrganisationRoutingModule { }
