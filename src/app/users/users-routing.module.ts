/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { UsersComponent } from './users.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { ViewUserComponent } from './view-user/view-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';

/** Custom Resolvers */
import { UsersResolver } from './users.resolver';
import { UsersTemplateResolver } from './users-template.resolver';
import { UserResolver } from './user.resolver';

/** Users Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'users',
      data: { title: extract('Users'), breadcrumb: 'Users' },
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
          data: { title: extract('Create User'), breadcrumb: 'Create User' },
          resolve: {
            usersTemplate: UsersTemplateResolver
          }
        },
        {
          path: ':id',
          data: { title: extract('View User'), routeParamBreadcrumb: 'id' },
          children: [
            {
              path: '',
              component: ViewUserComponent,
              resolve: {
                user: UserResolver
              }
            },
            {
              path: 'edit',
              component: EditUserComponent,
              data: { title: extract('Edit User'), breadcrumb: 'Edit', routeResolveBreadcrumb: false },
              resolve: {
                user: UserResolver,
                usersTemplate: UsersTemplateResolver
              }
            }
          ]
        }
      ]
    }
  ])
];

/**
 * Users Routing Module
 *
 * Configures the users routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    UsersResolver,
    UsersTemplateResolver,
    UserResolver
  ]
})
export class UsersRoutingModule { }
