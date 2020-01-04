/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';

/** Custom Components */
import { UsersComponent } from './users.component';
import { CreateUserComponent } from './create-user/create-user.component';

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
    CreateUserComponent
  ]
})
export class UsersModule { }
