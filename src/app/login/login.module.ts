/** Angular Imports */
import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { LoginRoutingModule } from './login-routing.module';

/** Custom Components */
import { LoginComponent } from './login.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TwoFactorAuthenticationComponent } from './two-factor-authentication/two-factor-authentication.component';

/** Translation Imports */
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

/**
 * Login Module
 *
 * All components related to user authentication should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    LoginRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http, `${ window.location.protocol }//${ window.location.host }/assets/translations/`, '.json');
        },
        deps: [HttpClient]
      }
    }),
  ],
  declarations: [
    LoginComponent,
    LoginFormComponent,
    ResetPasswordComponent,
    TwoFactorAuthenticationComponent
  ]
})
export class LoginModule { }
