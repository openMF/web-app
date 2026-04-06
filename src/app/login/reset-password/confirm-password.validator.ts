/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { UntypedFormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';

/** Validates that the values of password and confirm password are same. */
export const confirmPasswordValidator: ValidatorFn = (resetPasswordForm: UntypedFormGroup): ValidationErrors | null => {
  const password = resetPasswordForm.get('password');
  const confirmPassword = resetPasswordForm.get('repeatPassword');
  return password && confirmPassword && password.value !== confirmPassword.value ? { passwordsDoNotMatch: true } : null;
};
