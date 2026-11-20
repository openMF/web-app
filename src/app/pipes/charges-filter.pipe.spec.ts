/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChargesFilterPipe } from './charges-filter.pipe';

describe('ChargesFilterPipe', () => {
  const pipe = new ChargesFilterPipe();
  const disbursementFee = { id: 1, currency: { code: 'USD' }, chargeTimeType: { id: 1 } };
  const downPaymentFee = { id: 2, currency: { code: 'USD' }, chargeTimeType: { id: 17 } };
  const charges = [
    disbursementFee,
    downPaymentFee
  ];

  it('keeps down payment fees when the caller does not restrict them', () => {
    expect(pipe.transform(charges, [], 'USD')).toEqual(charges);
  });

  it('hides down payment fees when the product does not support them', () => {
    expect(pipe.transform(charges, [], 'USD', false, false)).toEqual([disbursementFee]);
  });

  it('still hides charges that are already selected', () => {
    expect(pipe.transform(charges, [downPaymentFee], 'USD', false, true)).toEqual([disbursementFee]);
  });
});
