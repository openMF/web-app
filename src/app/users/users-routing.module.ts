/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Custom Components */
import { UsersComponent } from './users.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { ViewUserComponent } from './view-user/view-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';

/** Custom Resolvers */
import { UsersResolver } from './users.resolver';
import { UsersTemplateResolver } from './users-template.resolver';
import { UserResolver } from './user.resolver';

/** Custom Resolvers for Zitadel */
import { UsersZitadelResolver } from '../zitadel/users/usersZitadel.resolver';
import { UsersZitadelTemplateResolver } from '../zitadel/users/usersZitadel-template.resolver';
import { UserZitadelResolver } from '../zitadel/users/userZitadel.resolver';

/** Custom Components for Zitadel */
import { UsersComponent as UserZitadelComponent } from '../zitadel/users/users.component';
import { ViewUserComponent as ViewUserZitadelComponent } from '../zitadel/users/view-user/view-user.component';
import { CreateUserComponent as CreateUserZitadelComponent } from '../zitadel/users/create-user/create-user.component';
import { EditUserComponent as EditUserZitadelComponent } from '../zitadel/users/edit-user/edit-user.component';

/** Environment */
import { environment } from '../../environments/environment';

/** Users Routes for Mifos */
const mifosRoutes: Routes = [
  {
    path: '',
    component: UsersComponent,
    resolve: { users: UsersResolver }
  },
  {
    path: 'create',
    component: CreateUserComponent,
    data: { title: 'Create User', breadcrumb: 'Create User' },
    resolve: { usersTemplate: UsersTemplateResolver }
  },
  {
    path: ':id',
    data: { title: 'View User', routeParamBreadcrumb: 'id' },
    children: [
      {
        path: '',
        component: ViewUserComponent,
        resolve: { user: UserResolver }
      },
      {
        path: 'edit',
        component: EditUserComponent,
        data: { title: 'Edit User', breadcrumb: 'Edit', routeResolveBreadcrumb: false },
        resolve: {
          user: UserResolver,
          usersTemplate: UsersTemplateResolver
        }
      }
    ]
  }
];

/**
 * Route definition for Zitadel
 */
const zitadelRoutes: Routes = [
  {
    path: '',
    component: UserZitadelComponent,
    resolve: { users: UsersZitadelResolver }
  },
  {
    path: 'create',
    component: CreateUserZitadelComponent,
    data: { title: 'Create User', breadcrumb: 'Create User' },
    resolve: { usersTemplate: UsersTemplateResolver }
  },
  {
    path: ':id',
    data: { title: 'View User', routeParamBreadcrumb: 'id' },
    children: [
      {
        path: '',
        component: ViewUserZitadelComponent,
        resolve: { user: UserZitadelResolver }
      },
      {
        path: 'edit',
        component: EditUserZitadelComponent,
        data: { title: 'Edit User', breadcrumb: 'Edit', routeResolveBreadcrumb: false },
        resolve: {
          user: UserZitadelResolver,
          usersTemplate: UsersZitadelTemplateResolver
        }
      }
    ]
  }
];

/**
 * Choose the correct route set according to the environment
 */
const selectedRoutes = !environment.OIDC.oidcServerEnabled ? mifosRoutes : zitadelRoutes;

/**
 * Final routes with the shell
 */
const routes: Routes = [
  Route.withShell([
    {
      path: 'appusers',
      data: { title: 'Users', breadcrumb: 'Users' },
      children: selectedRoutes
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
    UserResolver,
    UsersZitadelResolver,
    UserZitadelResolver,
    UsersZitadelTemplateResolver
  ]
})
export class UsersRoutingModule {}
