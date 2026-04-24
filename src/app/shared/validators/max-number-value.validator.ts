import { AbstractControl, ValidatorFn } from '@angular/forms';

export function maxNumberValueValidator(maxControlName: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const maxControl = control.parent?.get(maxControlName);
    if (!maxControl || !control.value) {
      return null;
    }

    let maxValue = maxControl.value;
    if (maxValue == null) {
      return null;
    }
    if (typeof maxValue === 'undefined') {
      return null;
    }
    if (typeof maxValue !== 'number') {
      maxValue = maxValue * 1;
    }
    let controlValue = control.value;
    if (typeof controlValue !== 'number') {
      controlValue = controlValue * 1;
    }
    if (controlValue > maxValue) {
      return { maxValue: { requiredMax: maxValue, actual: controlValue } };
    }
    return null;
  };
}
