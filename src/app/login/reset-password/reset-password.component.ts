/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** rxjs Imports */
import { finalize } from 'rxjs/operators';

/** Custom Services */
import { AuthenticationService } from '../../core/authentication/authentication.service';

/** Custom Validators */
import { confirmPasswordValidator } from './confirm-password.validator';

/**
 * Reset password component.
 */
@Component({
  selector: 'mifosx-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  /** Reset password form group. */
  resetPasswordForm: FormGroup;
  /** Password input field type. */
  passwordInputType: string;
  /** True if loading. */
  loading = false;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AuthenticationService} authenticationService Authentication Service.
   */
  constructor(private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService) {  }

  /**
   * Creates reset password form.
   *
   * Initializes password input field type.
   */
  ngOnInit() {
    this.createResetPasswordForm();
    this.passwordInputType = 'password';
  }

  /**
   * Resets the password of user.
   */
  resetPassword() {
    this.loading = true;
    this.resetPasswordForm.disable();
    this.authenticationService.resetPassword(this.resetPasswordForm.value)
      .pipe(finalize(() => {
        this.resetPasswordForm.reset();
        this.resetPasswordForm.markAsPristine();
        // Angular Material Bug: Validation errors won't get removed on reset.
        this.resetPasswordForm.enable();
        this.loading = false;
      })).subscribe();
  }

  /**
   * Creates reset password form.
   */
  private createResetPasswordForm() {
    this.resetPasswordForm = this.formBuilder.group({
      'password': ['', Validators.required],
      'repeatPassword': ['', Validators.required]
    }, { validator: confirmPasswordValidator });
  }

}
