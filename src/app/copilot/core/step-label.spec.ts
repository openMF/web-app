/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from '@jest/globals';
import { translateStepLabel } from './step-label';

/** Stands in for TranslateService.instant: known keys resolve, unknown ones echo back. */
function translator(known: Record<string, string>): (key: string) => string {
  return (key: string) => known[key] ?? key;
}

describe('translateStepLabel', () => {
  const dictionary = translator({
    'copilot.trail.steps.loanDetails': 'Prêt consulté',
    'copilot.trail.steps.clientSearch': 'Client recherché'
  });

  it('names a step from its machine name, dropping the vendor prefix', () => {
    expect(translateStepLabel('mifos_loan_details', 'Reading the loan account', dictionary)).toBe('Prêt consulté');
  });

  it('falls back to the English label when the machine name is unknown', () => {
    const known = translator({ 'copilot.trail.steps.clientSearch': 'Client recherché' });
    expect(translateStepLabel('acme_lookup', 'Client search', known)).toBe('Client recherché');
  });

  /**
   * A deployment can add its own tools to the manifest. An English row reads better than a
   * missing-translation placeholder, so an unknown step keeps the gateway's own wording.
   */
  it("shows an unknown deployment's own label unchanged", () => {
    expect(translateStepLabel('acme_credit_bureau', 'Checking the credit bureau', dictionary)).toBe(
      'Checking the credit bureau'
    );
  });

  it('still names a step when only the machine name arrives', () => {
    expect(translateStepLabel('mifos_loan_details', undefined, dictionary)).toBe('Prêt consulté');
  });

  it('still names a step when only the label arrives', () => {
    expect(translateStepLabel(undefined, 'Loan details', dictionary)).toBe('Prêt consulté');
  });

  it('is empty when the gateway named the step neither way', () => {
    expect(translateStepLabel(undefined, undefined, dictionary)).toBe('');
    expect(translateStepLabel('', '   ', dictionary)).toBe('');
  });

  it('prefers the machine name, which does not get reworded between releases', () => {
    const both = translator({
      'copilot.trail.steps.loanDetails': 'From the machine name',
      'copilot.trail.steps.readingTheLoanAccount': 'From the English label'
    });
    expect(translateStepLabel('mifos_loan_details', 'Reading the loan account', both)).toBe('From the machine name');
  });
});
