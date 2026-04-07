/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

/** rxjs Imports */
import { finalize } from 'rxjs/operators';

/** Custom Services */
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { MatFormField, MatPrefix, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Service Zitadel */
import { AuthService } from '../../zitadel/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Login form component.
 */
@Component({
  selector: 'mifosx-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatPrefix,
    FaIconComponent,
    MatIconButton,
    MatProgressBar,
    MatProgressSpinner
  ]
})
export class LoginFormComponent implements OnInit {
  /** Login form group. */
  loginForm: FormGroup;
  /** Password input field type. */
  passwordInputType: string = 'password';
  /** True if loading. */
  loading = false;
  oidcServerEnabled = environment.OIDC.oidcServerEnabled;
  /** Whether remember me functionality is enabled */
  enableRememberMe = environment.enableRememberMe === true;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AuthenticationService} authenticationService Authentication Service.
   */
  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private authService: AuthService
  ) {}

  /**
   * Creates login form.
   *
   * Initializes password input field type.
   */
  ngOnInit() {
    this.createLoginForm();
  }

  /**
   * Authenticates the user if the credentials are valid.
   */
  login() {
    this.loading = true;
    this.loginForm.disable();
    this.authenticationService
      .login(this.loginForm.value)
      .pipe(
        finalize(() => {
          this.loginForm.reset();
          this.loginForm.markAsPristine();
          // Angular Material Bug: Validation errors won't get removed on reset.
          this.loginForm.enable();
          this.loading = false;
        })
      )
      .subscribe();
  }

  /**
   * Authenticates the user if the credentials are valid to Zitadel.
   */

  loginOIDC() {
    this.authService.login();
  }

  getUsers() {
    this.authService.getUsers();
  }

  logout() {
    this.authService.logout();
  }

  /**
   * Toggles the visibility of the password input field.
   *
   * Changes the input type between 'password' and 'text'.
   */

  togglePasswordVisibility() {
    this.passwordInputType = this.passwordInputType === 'password' ? 'text' : 'password';
  }

  /**
   * TODO: Decision to be taken on providing this feature.
   */
  forgotPassword() {
    console.log('Forgot Password feature currently unavailable.');
  }

  /**
   * Creates login form with validation rules.
   */

  private createLoginForm() {
    this.loginForm = this.formBuilder.group({
      username: [
        '',
        Validators.required
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)]
      ],
      remember: false
    });
  }

  /**
   * Returns the appropriate error message for the specified form control.
   *
   * @param {string} controlName - The name of the form control.
   * @returns {string} - The error message.
   */

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    } else if (control?.hasError('minlength')) {
      return `Minimum length is ${control.errors?.minlength.requiredLength}`;
    }
    return '';
  }
}
