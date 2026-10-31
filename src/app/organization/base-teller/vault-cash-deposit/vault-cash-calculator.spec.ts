/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FormControl } from '@angular/forms';
import { calculateVaultCash, vaultQuantity } from './vault-cash-calculator';
import { VaultDenomination } from './vault-cash-deposit.models';

const note: VaultDenomination = {
  id: 1,
  denominationId: 'n',
  currencyCode: 'USD',
  type: 'BANKNOTE',
  active: true,
  value: '100.000000'
};
const coin: VaultDenomination = { ...note, id: 2, denominationId: 'c', type: 'COIN', value: '0.010000' };

describe('Vault cash exact arithmetic and quantity validation', () => {
  it('keeps banknotes and coins separate and computes precise overall cash', () => {
    expect(
      calculateVaultCash(
        [
          note,
          coin
        ],
        [
          '2',
          '3'
        ],
        2
      )
    ).toEqual({
      subtotals: [
        '200.00',
        '0.03'
      ],
      banknotesTotal: '200.00',
      coinsTotal: '0.03',
      totalCash: '200.03',
      positive: true,
      inRange: true
    });
  });

  it('adds 0.1 and 0.2 without binary rounding', () => {
    const result = calculateVaultCash(
      [
        { ...note, value: '0.1' },
        { ...coin, value: '0.2' }
      ],
      [
        '1',
        '1'
      ],
      2
    );
    expect(result.totalCash).toBe('0.30');
  });

  it('retains sub-cent precision and amounts beyond the safe integer minor-unit range', () => {
    expect(calculateVaultCash([{ ...note, value: '9999999.999999' }], ['999999'], 6).totalCash).toBe(
      '9999989999999.000001'
    );
  });

  it('supports integer currency precision without inventing decimals', () => {
    expect(calculateVaultCash([{ ...note, currencyCode: 'JPY', value: '1000.000000' }], ['3'], 0).totalCash).toBe(
      '3000'
    );
  });

  it.each([
    '-1',
    '1.1',
    '',
    ' ',
    '1e3',
    'NaN',
    'Infinity',
    '1000000001',
    '12345678901234567890',
    '1x'
  ])('rejects quantity %s', (quantity) => {
    expect(vaultQuantity(new FormControl(quantity))).toEqual({ quantity: true });
  });

  it.each([
    '0',
    '1',
    '1000000000'
  ])('accepts whole quantity %s', (quantity) => {
    expect(vaultQuantity(new FormControl(quantity))).toBeNull();
  });

  it('does not silently round a denomination with excess currency precision', () => {
    expect(() => calculateVaultCash([{ ...coin, value: '0.001' }], ['1'], 2)).toThrow();
  });

  it('rejects duplicate identifiers case-insensitively', () => {
    expect(() =>
      calculateVaultCash(
        [
          note,
          { ...coin, denominationId: 'N' }
        ],
        [
          '1',
          '1'
        ],
        2
      )
    ).toThrow();
  });

  it('disables zero totals and the backend exclusive upper monetary boundary', () => {
    expect(calculateVaultCash([note], ['0'], 2).positive).toBe(false);
    expect(calculateVaultCash([{ ...note, value: '10000' }], ['1000000000'], 2).inRange).toBe(false);
  });
});
