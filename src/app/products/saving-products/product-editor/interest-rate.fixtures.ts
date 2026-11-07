/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { InterestMatrix, ReferenceFormula } from './interest-rate.model';

/** Test-only administrative metadata, never a market observation. */
export const matrix: InterestMatrix = {
  calculationMethod: 'UNAPPROVED',
  brackets: [
    { lowerBalance: '0.00', upperBalance: '1000.00', annualRatePercent: '1.123456' },
    { lowerBalance: '1000.01', upperBalance: '10000.00', annualRatePercent: '2.000000' }
  ]
};
export const formula: ReferenceFormula = {
  referenceId: 'CETES_TEST',
  referenceType: 'CETES',
  tenor: 'D28',
  formulaMode: 'ADDITIVE_SPREAD',
  spreadPercentagePoints: '-0.123456789012',
  multiplier: null,
  reviewFrequency: 'END_OF_MONTH'
};
