/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** rxjs Imports */
import { finalize } from 'rxjs/operators';

/** Custom Services */
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { MatPrefix } from '@angular/material/form-field';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

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
    MatProgressBar,
    MatProgressSpinner
  ]
})
export class LoginFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authenticationService = inject(AuthenticationService);

  /** Login form group. */
  loginForm: FormGroup;
  /** Password input field type. */
  passwordInputType: string = 'password';
  /** True if loading. */
  loading = false;
  /** Whether OAuth (OIDC or OAuth2) is enabled */
  oauthEnabled = environment.OIDC.oidcServerEnabled || environment.oauth.enabled;
  /** Whether remember me functionality is enabled */
  enableRememberMe = environment.enableRememberMe === true;

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
   * Initiates OAuth/OIDC login flow.
   * The unified AuthenticationService handles both Fineract OAuth2 and OIDC providers.
   */
  loginOAuth() {
    this.loading = true;
    this.authenticationService
      .login()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        error: () => {
          // Error handling is managed by the authentication service
        }
      });
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
          Validators.minLength(8)
        ]
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
