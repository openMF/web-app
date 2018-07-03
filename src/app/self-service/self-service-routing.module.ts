import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '../core';
import { UserManagementComponent } from './user-management/user-management.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { ViewUserComponent } from './view-user/view-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { AppConfigurationComponent } from './app-configuration/app-configuration.component';

const routes: Routes = [
  Route.withShell([
    {
      path: 'self-service/users',
      component: UserManagementComponent,
      data: { title: extract('Self Service Users'), breadcrumb: 'Self Service Users' }
    },
    {
      path: 'self-service/users/create',
      component: CreateUserComponent,
      data: { title: extract('Create Self Service User'), breadcrumb: 'Self Service Users  >  Create' }
    },
    {
      path: 'self-service/users/view',
      component: ViewUserComponent,
      data: { title: extract('View Self Service User'), breadcrumb: 'Self Service Users  >  View' },
    },
    {
      path: 'self-service/users/edit',
      component: EditUserComponent,
      data: { title: extract('Edit Self Service User'), breadcrumb: 'Self Service Users  >  Edit' },
    },
    {
      path: 'self-service/app-configuration',
      component: AppConfigurationComponent,
      data: { title: extract('App Configuration'), breadcrumb: 'App Configuration' },
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class SelfServiceRoutingModule { }
