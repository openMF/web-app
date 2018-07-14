import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { CoreModule } from '../core/core.module';
import { LoginFormComponent } from './login-form/login-form.component';
import { TwoFactorAuthenticationComponent } from './two-factor-authentication/two-factor-authentication.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    LoginRoutingModule
  ],
  declarations: [
    LoginComponent,
    LoginFormComponent,
    TwoFactorAuthenticationComponent,
    ResetPasswordComponent
  ]
})
export class LoginModule { }
