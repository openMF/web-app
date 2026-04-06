/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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

/** Custom Components of Zitadel */
import { ViewUserComponent as ViewUserZitadelComponent } from '../zitadel/users/view-user/view-user.component';
import { EditUserComponent as EditUserZitadelComponent } from '../zitadel/users/edit-user/edit-user.component';
import { CreateUserComponent as CreateUserZitadelComponent } from '../zitadel/users/create-user/create-user.component';
import { UsersComponent as UserZitadelComponent } from '../zitadel/users/users.component';

/**
 * Users Module
 *
 * Users components should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    UsersRoutingModule,
    UsersComponent,
    CreateUserComponent,
    ViewUserComponent,
    EditUserComponent,
    // Users Zitadel
    UserZitadelComponent,
    ViewUserZitadelComponent,
    EditUserZitadelComponent,
    CreateUserZitadelComponent
  ]
})
export class UsersModule {}
