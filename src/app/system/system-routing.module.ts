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
import { ManageHooksComponent } from './manage-hooks/manage-hooks.component';
import { RolesAndPermissionsComponent } from './roles-and-permissions/roles-and-permissions.component';
import { ManageSurveysComponent } from './manage-surveys/manage-surveys.component';
import { ManageSchedulerJobsComponent } from './manage-scheduler-jobs/manage-scheduler-jobs.component';
import { GlobalConfigurationsComponent } from './global-configurations/global-configurations.component';
import { EditConfigurationComponent } from './global-configurations/edit-configuration/edit-configuration.component';
import { ManageReportsComponent } from './manage-reports/manage-reports.component';

/** Custom Resolvers */
import { CodesResolver } from './codes/codes.resolver';
import { ManageDataTablesResolver } from './manage-data-tables/manage-data-tables.resolver';
import { ManageHooksResolver } from './manage-hooks/manage-hooks.resolver';
import { RolesAndPermissionsResolver } from './roles-and-permissions/roles-and-permissions.resolver';
import { ManageSurveysResolver } from './manage-surveys/manage-surveys.resolver';
import { ManageSchedulerJobsResolver } from './manage-scheduler-jobs/manage-scheduler-jobs.resolver';
import { GlobalConfigurationsResolver } from './global-configurations/global-configurations.resolver';
import { GlobalConfigurationResolver } from './global-configurations/global-configuration.resolver';
import { ManageReportsResolver } from './manage-reports/manage-reports.resolver';

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
      {
          path: 'roles-and-permissions',
          component: RolesAndPermissionsComponent,
          resolve: {
                roles: RolesAndPermissionsResolver
          },
          data: { title:  extract('Roles and Permissions'), breadcrumb: 'Roles and Permissions' },
      },
      {
        path: 'surveys',
        component: ManageSurveysComponent,
        resolve: {
              surveys: ManageSurveysResolver
        },
        data: { title:  extract('Manage Surveys'), breadcrumb: 'Manage Surveys' },
      },
      {
        path: 'scheduler-jobs',
        component: ManageSchedulerJobsComponent,
        resolve: {
              jobsScheduler: ManageSchedulerJobsResolver
        },
        data: { title:  extract('Manage Scheduler Jobs'), breadcrumb: 'Manage Scheduler Jobs' },
      },
      {
        path: 'reports',
        component: ManageReportsComponent,
        resolve: {
              reports: ManageReportsResolver
        },
        data: { title:  extract('Manage Reports'), breadcrumb: 'Manage Reports' },
      },
      {
        path: 'global-configurations',
        data: { title: extract('Global Configurations'), breadcrumb: 'Global Configurations' },
        children: [
          {
            path: '',
            component: GlobalConfigurationsComponent,
            resolve: {
              configurations: GlobalConfigurationsResolver
            }
          },
          {
            path: ':id/edit',
            component: EditConfigurationComponent,
            data: { title: extract('Edit Configuration'), breadcrumb: 'Edit' },
            resolve: {
              configuration: GlobalConfigurationResolver
            }
          }
        ],

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
    ManageHooksResolver,
    RolesAndPermissionsResolver,
    ManageSurveysResolver,
    ManageSchedulerJobsResolver,
    GlobalConfigurationsResolver,
    GlobalConfigurationResolver,
    ManageReportsResolver
  ]
})
export class SystemRoutingModule { }
