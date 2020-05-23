/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';

/** Custom Components */
import { UsersComponent } from './users.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { ViewUserComponent } from './view-user/view-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';

/**
 * Users Module
 *
 * Users components should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    UsersRoutingModule
  ],
  declarations: [
    UsersComponent,
    CreateUserComponent,
    ViewUserComponent,
    EditUserComponent
  ]
})
export class UsersModule { }
