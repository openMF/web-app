/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Transalation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { LoginComponent } from './login.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';

/** Login Routes */
const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    data: { title: extract('Login') }
  }
  ,
  {
    path: 'forgot-password',
    component : ForgotPasswordComponent,
  }
];

/**
 * Login Routing Module
 *
 * Configures the login routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class LoginRoutingModule { }
