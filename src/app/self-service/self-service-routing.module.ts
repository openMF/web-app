import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '../../app/core';
import { UserManagementComponent } from './user-management/user-management.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { ViewUserComponent } from './view-user/view-user.component';

const routes: Routes = [
  Route.withShell([
    { path: 'self-service/users', component: UserManagementComponent, data: { title: extract('Self Service') } },
    { path: 'self-service/users/create', component: CreateUserComponent },
    { path: 'self-service/users/view', component: ViewUserComponent }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class SelfServiceRoutingModule { }
