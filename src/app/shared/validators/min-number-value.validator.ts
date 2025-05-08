import { AbstractControl, ValidatorFn } from '@angular/forms';

export function minNumberValueValidator(minControlName: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const minControl = control.parent?.get(minControlName);
    if (!minControl || !control.value) {
      return null;
    }

    let minValue = minControl.value;
    if (typeof minValue === 'undefined') {
      return null;
    }
    if (typeof minValue !== 'number') {
      minValue = minValue * 1;
    }
    let controlValue = control.value;
    if (typeof controlValue !== 'number') {
      controlValue = controlValue * 1;
    }
    if (controlValue < minValue) {
      return { minValue: { requiredMin: minValue, actual: controlValue } };
    }
    return null;
  };
}
