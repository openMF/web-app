import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '../core';
import { UsersComponent } from './users/users.component';
import { CreateUserComponent } from './users/create-user/create-user.component';
import { ViewUserComponent } from './users/view-user/view-user.component';
import { EditUserComponent } from './users/edit-user/edit-user.component';
import { AppConfigurationComponent } from './app-configuration/app-configuration.component';
import { SelfServiceComponent } from './self-service.component';
import { ViewUserResolver } from './users/view-user/view-user.resolver';

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
              component: UsersComponent
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
          data: { title: extract('App Configuration'), breadcrumb: 'App Configuration' },
        }
      ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ViewUserResolver]
})
export class SelfServiceRoutingModule { }
