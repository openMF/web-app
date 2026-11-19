/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from '@jest/globals';
import { templatesForProduct } from './loan-screen-reports.component';

describe('templatesForProduct', () => {
  const templates = [
    { id: 1, name: 'अनुसूची १(क) – ऋण माग पत्र [SL, fd]' },
    { id: 2, name: 'अनुसूची २(क) – ऋण माग फाराम [PROP]' },
    { id: 3, name: 'अनुसूची १० – ऋण भुक्तानी तालिका' }
  ];

  it("keeps the product's templates and the untagged ones, without the tag", () => {
    expect(
      templatesForProduct(templates, 'fd').map((t) => [
        t.id,
        t.name
      ])
    ).toEqual([
      [
        1,
        'अनुसूची १(क) – ऋण माग पत्र'
      ],
      [
        3,
        'अनुसूची १० – ऋण भुक्तानी तालिका'
      ]
    ]);
  });

  it('hides nothing until the product is known', () => {
    expect(templatesForProduct(templates).map((t) => t.id)).toEqual([
      1,
      2,
      3
    ]);
  });
});
