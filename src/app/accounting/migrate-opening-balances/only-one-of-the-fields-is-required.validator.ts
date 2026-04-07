/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { UntypedFormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';

/** Validates that atleast one of the fields debit or credit is filled (but not both) for a given gl account. */
export const onlyOneOfTheFieldsIsRequiredValidator: ValidatorFn = (
  glAccountEntriesForm: UntypedFormGroup
): ValidationErrors | null => {
  const debit = glAccountEntriesForm.controls.debit.value;
  const credit = glAccountEntriesForm.controls.credit.value;
  if (debit && credit) {
    if (debit > 0 && credit > 0) {
      return { error: true };
    }
  }
  return null;
};
