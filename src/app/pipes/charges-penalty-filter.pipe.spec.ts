/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChargesPenaltyFilterPipe } from './charges-penalty-filter.pipe';

interface MockCharge {
  id: number;
  name: string;
  penalty?: boolean | null;
}

describe('ChargesPenaltyFilterPipe', () => {
  let pipe: ChargesPenaltyFilterPipe;

  beforeEach(() => {
    pipe = new ChargesPenaltyFilterPipe();
  });

  it('returns empty array when charges is null or undefined', () => {
    expect(pipe.transform(null, false)).toEqual([]);
    expect(pipe.transform(undefined, true)).toEqual([]);
  });

  it('returns empty array when charges is not an array', () => {
    expect(pipe.transform({} as any, false)).toEqual([]);
    expect(pipe.transform('invalid' as any, false)).toEqual([]);
    expect(pipe.transform(123 as any, true)).toEqual([]);
  });

  it('filters charges with penalty: true when penalty is true', () => {
    const regularCharge: MockCharge = { id: 1, name: 'Processing Fee', penalty: false };
    const penaltyCharge: MockCharge = { id: 2, name: 'Late Fee', penalty: true };
    const charges = [
      regularCharge,
      penaltyCharge
    ];

    const result = pipe.transform(charges, true);
    expect(result).toEqual([penaltyCharge]);
  });

  it('filters charges with penalty: false when penalty is false', () => {
    const regularCharge: MockCharge = { id: 1, name: 'Processing Fee', penalty: false };
    const penaltyCharge: MockCharge = { id: 2, name: 'Late Fee', penalty: true };
    const charges = [
      regularCharge,
      penaltyCharge
    ];

    const result = pipe.transform(charges, false);
    expect(result).toEqual([regularCharge]);
  });

  it('treats missing, null, or undefined penalty property as fee (penalty: false)', () => {
    const unflaggedCharge1: MockCharge = { id: 1, name: 'Unflagged Fee' };
    const unflaggedCharge2: MockCharge = { id: 2, name: 'Null Penalty Fee', penalty: null };
    const unflaggedCharge3: MockCharge = { id: 3, name: 'Undefined Penalty Fee', penalty: undefined };
    const penaltyCharge: MockCharge = { id: 4, name: 'Late Fee', penalty: true };
    const charges = [
      unflaggedCharge1,
      unflaggedCharge2,
      unflaggedCharge3,
      penaltyCharge
    ];

    // Under penalty: false, all unflagged charges should be retained as regular fees
    const fees = pipe.transform(charges, false);
    expect(fees).toEqual([
      unflaggedCharge1,
      unflaggedCharge2,
      unflaggedCharge3
    ]);

    // Under penalty: true, only actual penalties should be retained
    const penalties = pipe.transform(charges, true);
    expect(penalties).toEqual([penaltyCharge]);
  });

  it('defaults penalty argument to false when omitted', () => {
    const regularCharge: MockCharge = { id: 1, name: 'Processing Fee', penalty: false };
    const penaltyCharge: MockCharge = { id: 2, name: 'Late Fee', penalty: true };
    const charges = [
      regularCharge,
      penaltyCharge
    ];

    expect(pipe.transform(charges)).toEqual([regularCharge]);
  });

  it('safely ignores null or undefined items within the charges array', () => {
    const regularCharge: MockCharge = { id: 1, name: 'Processing Fee', penalty: false };
    const penaltyCharge: MockCharge = { id: 2, name: 'Late Fee', penalty: true };
    const charges = [
      null,
      regularCharge,
      undefined,
      penaltyCharge
    ];

    expect(pipe.transform(charges, false)).toEqual([regularCharge]);
    expect(pipe.transform(charges, true)).toEqual([penaltyCharge]);
  });

  it('does not mutate the original charges array', () => {
    const charges: MockCharge[] = [
      { id: 1, name: 'Fee', penalty: false },
      { id: 2, name: 'Penalty', penalty: true }
    ];
    const chargesCopy = [...charges];

    pipe.transform(charges, false);
    expect(charges).toEqual(chargesCopy);
  });
});
