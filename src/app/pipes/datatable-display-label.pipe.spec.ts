/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatatableDisplayLabelPipe, formatDatatableDisplayLabel } from './datatable-display-label.pipe';

describe('DatatableDisplayLabelPipe', () => {
  const pipe = new DatatableDisplayLabelPipe();

  it.each([
    [
      'PAYMENT_DETAILS',
      'Payment details'
    ],
    [
      'PAYMENT_REFERENCE',
      'Payment reference'
    ],
    [
      'CUSTOMER_ACCOUNT_NUMBER',
      'Customer account number'
    ],
    [
      'm_savings_account_transaction_1',
      'M savings account transaction 1'
    ],
    [
      'VALIDA_DEBITO',
      'Valida debito'
    ],
    [
      'REMITTANCE_INFORMATION',
      'Remittance information'
    ],
    [
      'CODIGO_MONEDA',
      'Codigo moneda'
    ]
  ])('formats %s as %s', (rawLabel: string, displayLabel: string) => {
    expect(formatDatatableDisplayLabel(rawLabel)).toBe(displayLabel);
    expect(pipe.transform(rawLabel)).toBe(displayLabel);
  });

  it('returns an empty string for nullish labels', () => {
    expect(formatDatatableDisplayLabel(null)).toBe('');
    expect(formatDatatableDisplayLabel(undefined)).toBe('');
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
