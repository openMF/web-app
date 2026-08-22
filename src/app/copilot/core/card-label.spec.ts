/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from '@jest/globals';
import { translateCardLabel } from './card-label';

/**
 * The gateway labels card rows from its tool manifest, which is written in English.
 * These labels are what an officer reads before approving money, so they have to arrive
 * in the officer's own language without the gateway needing to know thirteen of them.
 */
describe('translateCardLabel', () => {
  const FRENCH: Record<string, string> = {
    'copilot.cardLabels.client': 'Client',
    'copilot.cardLabels.loanAccount': 'Compte de prêt',
    'copilot.cardLabels.approvedAmount': 'Montant approuvé',
    'copilot.cardLabels.appliedFor': 'Montant demandé'
  };

  /** Stands in for TranslateService.instant, which echoes the key when it has no entry. */
  const translate = (key: string): string => FRENCH[key] ?? key;

  it('turns a manifest label into the officer language', () => {
    expect(translateCardLabel('Loan account', translate)).toBe('Compte de prêt');
    expect(translateCardLabel('Approved amount', translate)).toBe('Montant approuvé');
  });

  it('matches labels of one word as readily as several', () => {
    expect(translateCardLabel('Client', translate)).toBe('Client');
  });

  it('shows an unknown label exactly as the gateway sent it', () => {
    // A deployment can add its own tools to the manifest. An English row reads better
    // than the raw translation key leaking onto a confirmation card.
    expect(translateCardLabel('Collateral value', translate)).toBe('Collateral value');
  });

  it('is not thrown by spacing or casing the manifest happens to use', () => {
    expect(translateCardLabel('  loan   account  ', translate)).toBe('Compte de prêt');
    expect(translateCardLabel('Applied For', translate)).toBe('Montant demandé');
  });

  it('leaves an empty label alone rather than looking up a key for nothing', () => {
    expect(translateCardLabel('', translate)).toBe('');
    expect(translateCardLabel('   ', translate)).toBe('   ');
  });
});
