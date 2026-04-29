import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { environment } from '../../../environments/environment';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null; // No validation if the field is empty

    const errors: ValidationErrors = {};

    if (value.length < environment.minPasswordLength) {
      errors['minLength'] = 'Password must be at least ' + environment.minPasswordLength + ' characters long';
    }
    if (value.length > 50) {
      errors['maxLength'] = 'Password must be maximum 50 characters long';
    }
    if (!/[A-Z]/.test(value)) {
      errors['uppercase'] = 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(value)) {
      errors['lowercase'] = 'Password must contain at least one lowercase letter';
    }
    if (!/\d/.test(value)) {
      errors['number'] = 'Password must contain at least one number';
    }
    if (!/^(?:(.)(?!\1))+$/.test(value)) {
      errors['repeated'] = 'Password must have not consecutive repeating characters';
    }
    if (!/[@$!%*?&]/.test(value)) {
      errors['specialChar'] = 'Password must contain at least one special character (@$!%*?&)';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}
