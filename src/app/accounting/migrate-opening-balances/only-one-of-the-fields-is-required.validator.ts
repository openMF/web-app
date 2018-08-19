/** Angular Imports */
import { FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';

/** Validates that atleast one of the fields debit or credit is filled (but not both) for a given gl account. */
export const onlyOneOfTheFieldsIsRequiredValidator: ValidatorFn = (glAccountEntriesForm: FormGroup): ValidationErrors | null => {
  const debit = glAccountEntriesForm.controls.debit.value;
  const credit = glAccountEntriesForm.controls.credit.value;
  return ((debit || credit) && !(debit && credit)) ? null : { 'error': true };
};
