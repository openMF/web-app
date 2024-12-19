/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Custom Components */
import { SelfServiceComponent } from './self-service.component';
import { UsersComponent } from './users/users.component';
import { CreateUserComponent } from './users/create-user/create-user.component';
import { ViewUserComponent } from './users/view-user/view-user.component';
import { EditUserComponent } from './users/edit-user/edit-user.component';
import { AppConfigurationComponent } from './app-configuration/app-configuration.component';
import { TaskManagementComponent } from './task-management/task-management.component';

/** Custom Resolvers */
import { ViewUserResolver } from './users/view-user/view-user.resolver';
import { OfficesResolver } from 'app/organization/offices/common-resolvers/offices.resolver';
import { UsersResolver } from 'app/users/users.resolver';

/** Self Service Admin Portal Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'self-service',
      component: SelfServiceComponent,
      data: { title: 'Self Service', breadcrumb: 'Self Service', addBreadcrumbLink: false },
      children: [
        {
          path: 'users',
          data: { title: 'Self Service Users', breadcrumb: 'Users' },
          children: [
            {
              path: '',
              component: UsersComponent,
              resolve: {
                users: UsersResolver
              }
            },
            {
              path: 'create',
              component: CreateUserComponent,
              data: { title: 'Create Self Service User', breadcrumb: 'Create' },
              resolve: {
                offices: OfficesResolver
              }
            },
            {
              path: 'view/:id',
              data: { title: 'View Self Service User', routeResolveBreadcrumb: [
                  'user',
                  'username'
                ] },
              resolve: {
                user: ViewUserResolver
              },
              children: [
                {
                  path: '',
                  component: ViewUserComponent
                },
                {
                  path: 'edit',
                  component: EditUserComponent,
                  data: { title: 'Edit Self Service User', breadcrumb: 'Edit', routeResolveBreadcrumb: false }
                }
              ]
            }
          ]
        },
        {
          path: 'app-configuration',
          component: AppConfigurationComponent,
          data: { title: 'Self Service App Configuration', breadcrumb: 'App Configuration' }
        },
        {
          path: 'task-management',
          component: TaskManagementComponent,
          data: { title: 'Self Service Task Management', breadcrumb: 'Task Management' }
        }
      ]
    }
  ])

];

/**
 * Self Service Routing Module
 *
 * Configures the self service admin portal routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    ViewUserResolver
  ]
})
export class SelfServiceRoutingModule {}
