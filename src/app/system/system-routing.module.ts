import { NgModule } from '@angular/core';

/** Routing Imports */
import { Routes, RouterModule } from '@angular/router';
import { Route } from '../core/route/route.service';
import { extract } from '../core/i18n/i18n.service';

/** Component Imports */
import { SystemComponent } from './system.component';
import { CodesComponent } from './codes/codes.component';
import { CreateCodeComponent } from './codes/create-code/create-code.component';

/** Custom Resolvers */
import { CodesResolver } from './codes/codes.resolver';
import { RoleComponent } from './role/role.component';
import { CreateroleComponent } from './role/createrole/createrole.component';
import { RolesesResolver } from './common-resolvers/roles.resolver';

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
        path: 'roles',
        data: { title: extract('View Roles'), breadcrumb: 'Roles' },
        children: [
          {
            path: '',
            component: RoleComponent,
            resolve: {
              roles: RolesesResolver
            }
          },
          {
            path: 'add',
            component: CreateroleComponent,
            data: { title: extract('Add Roles'), breadcrumb: 'Add Roles' }
          }
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
    CodesResolver,
    RolesesResolver
  ]
})
export class SystemRoutingModule { }
