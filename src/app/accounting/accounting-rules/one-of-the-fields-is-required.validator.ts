/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { UntypedFormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';

/** Validates that one of the fields for debit or credit is filled for a given accounting rule type. */
export const oneOfTheFieldsIsRequiredValidator: ValidatorFn = (
  accountingRuleForm: UntypedFormGroup
): ValidationErrors | null => {
  const accountToDebit = accountingRuleForm.controls.accountToDebit.value;
  const debitTags = accountingRuleForm.controls.debitTags.value;
  const accountToCredit = accountingRuleForm.controls.accountToCredit.value;
  const creditTags = accountingRuleForm.controls.creditTags.value;
  return (accountToDebit || debitTags) && (accountToCredit || creditTags) ? null : { error: true };
};
