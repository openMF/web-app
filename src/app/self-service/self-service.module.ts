/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { SelfServiceRoutingModule } from './self-service-routing.module';

/** Custom Components */
import { SelfServiceComponent } from './self-service.component';
import { UsersComponent } from './users/users.component';
import { CreateUserComponent } from './users/create-user/create-user.component';
import { ViewUserComponent } from './users/view-user/view-user.component';
import { EditUserComponent } from './users/edit-user/edit-user.component';
import { AppConfigurationComponent } from './app-configuration/app-configuration.component';
import { TaskManagementComponent } from './task-management/task-management.component';

/**
 * Self Service Module
 *
 * All components related to self service admin portal functions should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    SelfServiceRoutingModule
  ],
  declarations: [
    SelfServiceComponent,
    UsersComponent,
    CreateUserComponent,
    ViewUserComponent,
    EditUserComponent,
    AppConfigurationComponent,
    TaskManagementComponent
  ]
})
export class SelfServiceModule { }
