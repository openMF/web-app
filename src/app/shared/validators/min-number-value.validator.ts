import { AbstractControl, ValidatorFn } from '@angular/forms';

export function minNumberValueValidator(minControlName: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const minControl = control.parent?.get(minControlName);
    if (!minControl || !control.value) {
      return null;
    }

    const minValue = minControl.value;
    if (control.value < minValue) {
      return { minValue: { requiredMin: minValue, actual: control.value } };
    }
    return null;
  };
}
