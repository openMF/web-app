import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementComponent } from './user-management/user-management.component';
import { SelfServiceRoutingModule } from './self-service-routing.module';
import { CoreModule } from '../../app/core';
import { CreateUserComponent } from './create-user/create-user.component';
import { ViewUserComponent } from './view-user/view-user.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    SelfServiceRoutingModule
  ],
  declarations: [
    UserManagementComponent,
    CreateUserComponent,
    ViewUserComponent
  ],
  schemas: [
   CUSTOM_ELEMENTS_SCHEMA
 ],
})
export class SelfServiceModule { }
