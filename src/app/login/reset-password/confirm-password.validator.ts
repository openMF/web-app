/** Angular Imports */
import { FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';

/** Validates that the values of password and confirm password are same. */
export const confirmPasswordValidator: ValidatorFn = (resetPasswordForm: FormGroup): ValidationErrors | null => {
  const password = resetPasswordForm.get('password');
  const confirmPassword = resetPasswordForm.get('repeatPassword');
  return password && confirmPassword && password.value !== confirmPassword.value ?  { 'passwordsDoNotMatch': true } : null;
};
