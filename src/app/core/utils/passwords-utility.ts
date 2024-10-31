import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';


@Injectable({
    providedIn: 'root'
})

export class PasswordsUtility {
    // password regex pattern
    public static PASSWORD_REGEX = '^(?!.*(.)\\1)(?!.*\\s)(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\\w\\s]).{12,50}$';

    public getPasswordValidators(): ValidatorFn[] {
        return [Validators.required, Validators.pattern(PasswordsUtility.PASSWORD_REGEX), Validators.maxLength(50), Validators.minLength(8)];
    }

    /**
     * Confirm Change Password of Users
     * @param controlNameToCompare Form Control Name to be compared.
     */
    public confirmPassword(controlNameToCompare: string): ValidatorFn {
        return (c: AbstractControl): ValidationErrors|null => {
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
            return controlToCompare && controlToCompare.value !== c.value ? {'notequal': true} : null;
        };
    }
}
