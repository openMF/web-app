/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { passwordValidator } from './password.validator';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PasswordsUtility {
  minPasswordLength: number = environment.minPasswordLength || 12;
  public static PASSWORD_REGEX =
    '^(?!.*(.)\\1)(?!.*\\s)(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\\w\\s]).{' +
    (environment.minPasswordLength || 12) +
    ',50}$';

  public getPasswordValidators(): ValidatorFn[] {
    return [
      Validators.required,
      Validators.minLength(this.minPasswordLength),
      Validators.maxLength(50),
      passwordValidator()
    ];
  }

  /**
   * Confirm Change Password of Users
   * @param controlNameToCompare Form Control Name to be compared.
   */
  public confirmPassword(controlNameToCompare: string): ValidatorFn {
    return (c: AbstractControl): ValidationErrors | null => {
      if (c.value == null || c.value.length === 0) {
        return null;
      }
      const controlToCompare = c.root.get(controlNameToCompare);
      if (controlToCompare) {
        const subscription: Subscription = controlToCompare.valueChanges.subscribe(() => {
          c.updateValueAndValidity();
          subscription.unsubscribe();
        });
      }
      return controlToCompare && controlToCompare.value !== c.value ? { notequal: true } : null;
    };
  }
}
