/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Reuse shared application labels; only ANPA-specific terms need new translations. */
export const ANPA_SHARED_LABELS: Record<string, string> = {
  details: 'labels.heading.Details',
  currency: 'labels.heading.Currency',
  category: 'labels.heading.Category',
  reversed: 'labels.inputs.Reversed',
  id: 'labels.inputs.ID',
  loanTransactionId: 'labels.inputs.Transaction ID',
  amount: 'labels.inputs.Amount',
  date: 'labels.inputs.Business Date',
  penalty: 'labels.inputs.Penalties',
  paid: 'labels.inputs.Paid',
  waivedAmount: 'labels.inputs.Waived',
  writtenOff: 'labels.inputs.Written Off',
  tax: 'labels.inputs.Tax Component'
};

export function anpaLabelKey(field: string): string {
  return ANPA_SHARED_LABELS[field] ?? `labels.anpa.${field}`;
}
