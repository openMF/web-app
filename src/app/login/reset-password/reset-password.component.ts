import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { AuthenticationService } from '../../core';
import { finalize } from 'rxjs/operators';

const confirmPasswordValidator: ValidatorFn = (resetPasswordForm: FormGroup): ValidationErrors | null => {
  const password = resetPasswordForm.controls.password;
  const confirmPassword = resetPasswordForm.controls.repeatPassword;
  return password && confirmPassword && password.value !== confirmPassword.value ?  { 'passwordsDoNotMatch': true } : null;
};

@Component({
  selector: 'mifosx-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  loading = false;
  passwordInputType: string;

  constructor(private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService) {  }

  ngOnInit() {
    this.createResetPasswordForm();
    this.passwordInputType = 'password';
  }

  private createResetPasswordForm() {
    this.resetPasswordForm = this.formBuilder.group({
      'password': ['', Validators.required],
      'repeatPassword': ['', Validators.required]
    }, { validator: confirmPasswordValidator });
  }

  resetPassword() {
    this.loading = true;
    this.resetPasswordForm.disable();
    this.authenticationService.resetPassword(this.resetPasswordForm.value)
      .pipe(finalize(() => {
        this.resetPasswordForm.reset();
        this.resetPasswordForm.markAsPristine();
        // Bug: Validation errors won't get removed on reset
        this.resetPasswordForm.enable();
        this.loading = false;
      })).subscribe();
  }

}
