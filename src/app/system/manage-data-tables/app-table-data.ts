/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const appTableData: { displayValue: string; value: string }[] = [
  { displayValue: 'Client', value: 'm_client' },
  { displayValue: 'Group', value: 'm_group' },
  { displayValue: 'Center', value: 'm_center' },
  { displayValue: 'Office', value: 'm_office' },
  { displayValue: 'Loan Account', value: 'm_loan' },
  { displayValue: 'Saving Account', value: 'm_savings_account' },
  { displayValue: 'Loan Product', value: 'm_product_loan' },
  { displayValue: 'Saving Account Transaction', value: 'm_savings_account_transaction' },
  { displayValue: 'Savings Product', value: 'm_savings_product' },
  { displayValue: 'Share Product', value: 'm_share_product' }
];

export const entitySubTypeData: { displayValue: string; value: string }[] = [
  { displayValue: 'Person', value: 'Person' },
  { displayValue: 'Entity', value: 'Entity' }
];

export const savingsSubTypeData: { displayValue: string; value: string }[] = [
  { displayValue: 'Savings Product', value: 'Savings Product' },
  { displayValue: 'Fixed Deposit', value: 'Fixed Deposit' },
  { displayValue: 'Recurring Deposit', value: 'Recurring Deposit' }
];
