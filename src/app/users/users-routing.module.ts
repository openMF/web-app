/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { UsersComponent } from './users.component';

/** Custom Resolvers */
import { UsersResolver } from './users.resolver';

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
    UsersResolver
  ]
})
export class UsersRoutingModule { }
