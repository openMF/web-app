/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { SelfServiceComponent } from './self-service.component';
import { UsersComponent } from './users/users.component';
import { CreateUserComponent } from './users/create-user/create-user.component';
import { ViewUserComponent } from './users/view-user/view-user.component';
import { EditUserComponent } from './users/edit-user/edit-user.component';
import { AppConfigurationComponent } from './app-configuration/app-configuration.component';
import { TaskManagementComponent } from './task-management/task-management.component';

/** Custom Resolvers */
import { UsersResolver } from './users/users.resolver';
import { ViewUserResolver } from './users/view-user/view-user.resolver';

/** Self Service Admin Portal Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'self-service',
      component: SelfServiceComponent,
      data: { title: extract('Self Service'), breadcrumb: 'Self Service', addBreadcrumbLink: false },
      children: [
        {
          path: 'users',
          data: { title: extract('Self Service Users'), breadcrumb: 'Users' },
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
              data: { title: extract('Create Self Service User'), breadcrumb: 'Create' }
            },
            {
              path: 'view/:id',
              data: { title: extract('View Self Service User'), routeResolveBreadcrumb: ['user', 'username'] },
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
                  data: { title: extract('Edit Self Service User'), breadcrumb: 'Edit', routeResolveBreadcrumb: false }
                }
              ]
            }
          ]
        },
        {
          path: 'app-configuration',
          component: AppConfigurationComponent,
          data: { title: extract('Self Service App Configuration'), breadcrumb: 'App Configuration' }
        },
        {
          path: 'task-management',
          component: TaskManagementComponent,
          data: { title: extract('Self Service Task Management'), breadcrumb: 'Task Management' }
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
    UsersResolver,
    ViewUserResolver
  ]
})
export class SelfServiceRoutingModule { }
