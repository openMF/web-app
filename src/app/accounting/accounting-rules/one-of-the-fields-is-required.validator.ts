/** Angular Imports */
import { FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';

/** Validates that one of the fields for debit or credit is filled for a given accounting rule type. */
export const oneOfTheFieldsIsRequiredValidator: ValidatorFn = (accountingRuleForm: FormGroup): ValidationErrors | null => {
  const accountToDebit = accountingRuleForm.controls.accountToDebit.value;
  const debitTags = accountingRuleForm.controls.debitTags.value;
  const accountToCredit = accountingRuleForm.controls.accountToCredit.value;
  const creditTags = accountingRuleForm.controls.creditTags.value;
  return ((accountToDebit || debitTags) && (accountToCredit || creditTags)) ? null : { 'error': true };
};
