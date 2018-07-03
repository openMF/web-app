import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CoreModule } from '../core/core.module';
import { SelfServiceRoutingModule } from './self-service-routing.module';
import { UserManagementComponent } from './user-management/user-management.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { ViewUserComponent } from './view-user/view-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { AppConfigurationComponent } from './app-configuration/app-configuration.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    SharedModule,
    SelfServiceRoutingModule
  ],
  declarations: [
    UserManagementComponent,
    CreateUserComponent,
    ViewUserComponent,
    EditUserComponent,
    AppConfigurationComponent
  ],
  schemas: [
   CUSTOM_ELEMENTS_SCHEMA
 ],
})
export class SelfServiceModule { }
