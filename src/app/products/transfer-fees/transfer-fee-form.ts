/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

/** Custom Imports */
import { amountValueValidator } from 'app/shared/validators/amount-value.validator';
import { TransferFee, TransferFeePayload } from './models/transfer-fee.model';

export function createTransferFeeForm(
  formBuilder: UntypedFormBuilder,
  transferFee?: TransferFee | null
): UntypedFormGroup {
  return formBuilder.group({
    transferType: [
      transferFee?.transferType || '',
      [
        Validators.required,
        Validators.maxLength(50)
      ]
    ],
    currencyCode: [
      transferFee?.currencyCode || '',
      [
        Validators.required,
        Validators.maxLength(3)
      ]
    ],
    transferMode: [
      transferFee?.transferMode || '',
      [Validators.maxLength(50)]
    ],
    feeType: [
      transferFee?.feeType || '',
      [
        Validators.required,
        Validators.maxLength(20)
      ]
    ],
    feeValue: [
      transferFee?.feeValue ?? '',
      [
        Validators.required,
        amountValueValidator()
      ]
    ],
    feeCurrency: [
      transferFee?.feeCurrency || '',
      [Validators.maxLength(3)]
    ],
    thresholdAmount: [
      transferFee?.thresholdAmount ?? '',
      [amountValueValidator()]
    ],
    thresholdFeeValue: [
      transferFee?.thresholdFeeValue ?? '',
      [amountValueValidator()]
    ],
    description: [
      transferFee?.description || '',
      [Validators.maxLength(255)]
    ],
    isActive: [transferFee?.isActive ?? true],
    exchangeRateRequired: [transferFee?.exchangeRateRequired === true]
  });
}

export function buildTransferFeePayload(transferFeeForm: UntypedFormGroup): TransferFeePayload {
  const formValue = transferFeeForm.getRawValue();
  return {
    transferType: formValue.transferType,
    currencyCode: formValue.currencyCode,
    transferMode: nullIfBlank(formValue.transferMode),
    feeType: formValue.feeType,
    feeValue: formValue.feeValue,
    feeCurrency: nullIfBlank(formValue.feeCurrency),
    thresholdAmount: nullIfBlank(formValue.thresholdAmount),
    thresholdFeeValue: nullIfBlank(formValue.thresholdFeeValue),
    description: nullIfBlank(formValue.description),
    isActive: formValue.isActive === true,
    exchangeRateRequired: formValue.exchangeRateRequired === true
  };
}

function nullIfBlank(value: any): any {
  return value === '' || value === undefined ? null : value;
}
