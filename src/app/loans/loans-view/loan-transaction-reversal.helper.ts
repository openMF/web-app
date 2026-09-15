/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';

/**
 * Dialog collected before reversing a loan transaction, shared by the
 * transaction list and the transaction detail view so both entry points offer
 * the same fields and post the same body.
 *
 * Both fields are optional. The note is attached to the new transaction in
 * adjust mode and to the original one in reverse mode; the reversal external id
 * is stamped on the reversal itself and is never auto-generated.
 */

/**
 * Caution shown when the loan is closed or overpaid: the command is accepted,
 * but the backend re-runs the loan lifecycle state machine and reopens the
 * account.
 */
export const REOPEN_LOAN_WARNING_KEY = 'labels.dialogContext.This will reopen the loan account';

/** Maximum lengths enforced by the backend transaction validator. */
const NOTE_MAX_LENGTH = 1000;
const REVERSAL_EXTERNAL_ID_MAX_LENGTH = 100;

/**
 * Builds the `MatDialog` configuration for the reversal dialog.
 * @param translateService Translate service used to resolve the labels
 * @param titleKey Translation key of the dialog title
 * @param confirmButtonKey Translation key of the confirm button
 * @param warningKey Translation key of an optional caution shown above the fields
 */
export function buildReversalDialogConfig(
  translateService: TranslateService,
  titleKey: string,
  confirmButtonKey: string,
  warningKey?: string
): { data: any; width: string } {
  const formfields: FormfieldBase[] = [
    new InputBase({
      controlName: 'note',
      label: translateService.instant('labels.inputs.Note'),
      value: '',
      type: 'text',
      required: false,
      validators: [Validators.maxLength(NOTE_MAX_LENGTH)],
      order: 1
    }),
    new InputBase({
      controlName: 'reversalExternalId',
      label: translateService.instant('labels.inputs.Reversal External Id'),
      value: '',
      type: 'text',
      required: false,
      validators: [Validators.maxLength(REVERSAL_EXTERNAL_ID_MAX_LENGTH)],
      order: 2
    })
  ];
  return {
    data: {
      title: translateService.instant(titleKey),
      warning: warningKey ? translateService.instant(warningKey) : undefined,
      layout: { addButtonText: confirmButtonKey },
      formfields: formfields,
      // The dialog is submittable with both fields left empty.
      pristine: false
    },
    width: '50rem'
  };
}

/**
 * Copies the filled-in dialog fields onto the request body. Empty values are
 * dropped rather than sent as blank strings, because the backend parses every
 * parameter present in the body.
 * @param payload Request body being assembled
 * @param dialogValue Value of the reversal dialog form
 */
export function appendReversalFields(payload: { [key: string]: any }, dialogValue: any): void {
  const note = dialogValue?.note?.trim();
  const reversalExternalId = dialogValue?.reversalExternalId?.trim();
  if (note) {
    payload.note = note;
  }
  if (reversalExternalId) {
    payload.reversalExternalId = reversalExternalId;
  }
}
