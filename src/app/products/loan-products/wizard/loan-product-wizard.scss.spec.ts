/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * A source-level regression guard for C5: the reused Classic Charges and Accounting steps each ship
 * their own trailing Previous/Next row, and the wizard shell renders a second, unified one for every
 * step via `.step-actions` — so both would show two button pairs stacked unless the embedded row is
 * hidden.
 *
 * This has to check the SCSS text directly rather than the rendered DOM: jest-preset-angular does not
 * compile or inject component `styleUrls` into this project's Jest tests (verified — no `<style>` in
 * any spec run here ever carries a `.wizard-charges` or `.wizard-accounting` rule), so a
 * `getComputedStyle` assertion in a `.spec.ts` would pass whether or not the hide rule exists. The
 * companion check that the rule still has something to target —
 * `.wizard-accounting .layout-row.margin-t` present in the rendered DOM — lives in
 * `loan-product-wizard.render.spec.ts`; the two together are what pin the fix.
 */
describe('Loan product wizard stepper-nav hide rules (source)', () => {
  const scss = readFileSync(
    join(process.cwd(), 'src/app/products/loan-products/wizard/loan-product-wizard.component.scss'),
    'utf8'
  );

  it.each([
    // Charges: the rule this one is modelled on, kept here so a future edit that breaks the shared
    // shape (e.g. dropping `::ng-deep`, which is required to reach into a child component's template)
    // is caught for both steps at once, not just the one C5 added.
    '.wizard-charges',
    '.wizard-accounting'
  ])('hides the embedded Previous/Next row on the %s step', (scopeSelector) => {
    const scopedHideRule = new RegExp(
      `${scopeSelector.replace('.', '\\.')}\\s*::ng-deep\\s*\\.layout-row\\.margin-t\\s*{[^}]*display:\\s*none`
    );
    expect(scss).toMatch(scopedHideRule);
  });
});
