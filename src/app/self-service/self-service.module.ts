import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CoreModule } from '../core/core.module';
import { SelfServiceRoutingModule } from './self-service-routing.module';
import { CreateUserComponent } from './users/create-user/create-user.component';
import { ViewUserComponent } from './users/view-user/view-user.component';
import { EditUserComponent } from './users/edit-user/edit-user.component';
import { AppConfigurationComponent } from './app-configuration/app-configuration.component';
import { SharedModule } from '../shared/shared.module';
import { SelfServiceComponent } from './self-service.component';
import { UsersComponent } from './users/users.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    SharedModule,
    SelfServiceRoutingModule
  ],
  declarations: [
    SelfServiceComponent,
    UsersComponent,
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
