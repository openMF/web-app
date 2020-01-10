/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Not Found Component
import {NotFoundComponent} from './not-found/not-found.component';

/**
 * Fallback to this route when no prior route is matched.
 */
const routes: Routes = [
  {
    path: '',
    loadChildren: './home/home.module#HomeModule'
  },
  {
    path: 'login',
    loadChildren: './login/login.module#LoginModule'
  },
  {
    path: 'settings',
    loadChildren: './settings/settings.module#SettingsModule'
  },
  {
    path: 'navigation',
    loadChildren: './navigation/navigation.module#NavigationModule'
  },
  {
    path: 'clients',
    loadChildren: './clients/clients.module#ClientsModule'
  },
  {
    path: 'groups',
    loadChildren: './groups/groups.module#GroupsModule'
  },
  {
    path: 'centers',
    loadChildren: './centers/centers.module#CentersModule'
  },
  {
    path: 'accounting',
    loadChildren: './accounting/accounting.module#AccountingModule'
  },
  {
    path: 'self-service',
    loadChildren: './self-service/self-service.module#SelfServiceModule'
  },
  {
    path: 'system',
    loadChildren: './system/system.module#SystemModule'
  },
  {
    path: 'products',
    loadChildren: './products/products.module#ProductsModule'
  },
  {
    path: 'organization',
    loadChildren: './organization/organization.module#OrganizationModule'
  },
  {
    path: 'templates',
    loadChildren: './templates/templates.module#TemplatesModule'
  },
  {
    path: 'users',
    loadChildren: './users/users.module#UsersModule'
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

/**
 * App Routing Module.
 *
 * Configures the fallback route.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
