import { NgModule } from '@angular/core';

/** Routing Imports */
import { Routes, RouterModule } from '@angular/router';
import { Route } from '../core/route/route.service';
import { extract } from '../core/i18n/i18n.service';

/** Component Imports */
import { SystemComponent } from './system.component';
import { CodesComponent } from './codes/codes.component';
import { CreateCodeComponent } from './codes/create-code/create-code.component';
import { ExternalServicesComponent } from './external-services/external-services.component';
import { ManageDataTablesComponent } from './manage-data-tables/manage-data-tables.component';
import { SurveysComponent } from './surveys/surveys.component';
import { ManageHooksComponent } from './manage-hooks/manage-hooks.component';

/** Custom Resolvers */
import { CodesResolver } from './codes/codes.resolver';
import { ManageDataTablesResolver } from './manage-data-tables/manage-data-tables.resolver';
import { SurveysResolver } from './surveys/surveys.resolver';
import { ManageHooksResolver } from './manage-hooks/manage-hooks.resolver';

const routes: Routes = [
  Route.withShell([
    {
      path: 'system',
      data: { title: extract('System'), breadcrumb: 'System' },
      children: [
      {
        path: '',
        component: SystemComponent
      },
      {
        path: 'codes',
        data: { title: extract('View Codes'), breadcrumb: 'Codes' },
        children: [
          {
            path: '',
            component: CodesComponent,
            resolve: {
              codes: CodesResolver
            }
          },
          {
            path: 'create',
            component: CreateCodeComponent,
            data: { title: extract('Create Code'), breadcrumb: 'Create' }
          }
        ],

      },
      {
        path: 'surveys',
        data: { title: extract('Manage Surveys'), breadcrumb: 'Manage Surveys' },
        children: [
          {
            path: '',
            component: SurveysComponent,
            resolve: {
              surveys: SurveysResolver
            }
          },
        ]
      },
      {
          path: 'external-services',
          component: ExternalServicesComponent,
          data: { title:  extract('External Services'), breadcrumb: 'External Services' },
      },
      {
          path: 'data-tables',
          component: ManageDataTablesComponent,
          resolve: {
                dataTables: ManageDataTablesResolver
          },
          data: { title:  extract('Manage Data Tables'), breadcrumb: 'Manage Data Tables' },
      },
      {
          path: 'hooks',
          component: ManageHooksComponent,
          resolve: {
                hooks: ManageHooksResolver
          },
          data: { title:  extract('Manage Hooks'), breadcrumb: 'Manage Hooks' },
      },
    ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    CodesResolver,
    ManageDataTablesResolver,
    SurveysResolver,
    ManageHooksResolver,
  ]
})
export class SystemRoutingModule { }
