import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function minLessThanOrEqualMaxValidator(minKey: string, maxKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const min = group.get(minKey)?.value;
    const max = group.get(maxKey)?.value;

    if (min != null && max != null) {
      if (max * 1 < min * 1) {
        return { minGreaterThanMax: true };
      }
    }

    return null;
  };
}
