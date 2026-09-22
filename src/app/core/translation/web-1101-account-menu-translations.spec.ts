/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { CustomMissingTranslationHandler } from './missing-translation.handler';

/**
 * WEB-1101: the savings, fixed deposit, recurring deposit and shares account menus render every
 * entry as `labels.menus.<option name>` — the savings and recurring deposit templates concatenate
 * the prefix, the fixed deposit and shares ones go through `translateKey: 'menus'`, which builds
 * the same key. The option name is therefore an implicit translation key, and a name with no entry
 * under `labels.menus` reaches the operator as the raw key: `labels.menus.Disable Withhold Tax`.
 *
 * Nothing catches that at build time, and no locale falls back to English — the app only ever calls
 * `TranslateService.use()`, never `setDefaultLang` — so a missing key is visible in all 13 locales.
 */

const locales = [
  'cs-CS',
  'de-DE',
  'en-US',
  'es-CL',
  'es-MX',
  'fr-FR',
  'it-IT',
  'ko-KO',
  'lt-LT',
  'lv-LV',
  'ne-NE',
  'pt-PT',
  'sw-SW'
];

/** The menu names WEB-1101 added. Kept explicit so a locale dropping one is a named failure. */
const web1101MenuNames = [
  'Apply Annual Fees',
  'Disable Withhold Tax',
  'Enable Withhold Tax'
];

/** Every file that names an entry of those four account menus. */
const menuSources = [
  'src/app/savings/savings-account-view/savings-buttons.config.ts',
  'src/app/savings/savings-account-view/savings-account-view.component.ts',
  'src/app/deposits/recurring-deposits/recurring-deposits-account-view/recurring-deposits-buttons.config.ts',
  'src/app/deposits/recurring-deposits/recurring-deposits-account-view/recurring-deposits-account-view.component.ts',
  'src/app/deposits/fixed-deposits/fixed-deposit-account-view/fixed-deposits-buttons.config.ts',
  'src/app/deposits/fixed-deposits/fixed-deposit-account-view/fixed-deposit-account-view.component.ts',
  'src/app/shares/shares-account-view/shares-buttons.config.ts',
  'src/app/shares/shares-account-view/shares-account-view.component.ts'
];

/** The two menu entries whose click opens a confirmation titled by `labels.heading.<same name>`. */
const withholdTaxNames = [
  'Disable Withhold Tax',
  'Enable Withhold Tax'
];

function labelsFor(locale: string): Record<string, Record<string, string>> {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/assets/translations', `${locale}.json`), 'utf8')).labels;
}

function menusSection(locale: string): Record<string, string> {
  return labelsFor(locale).menus;
}

/**
 * Reads the option names out of the source text rather than instantiating the configurations: the
 * two names this ticket is about are not in a configuration class at all, the account view
 * components add them behind a `taxGroup` / `charges` condition, so only the source carries the
 * full set.
 */
function declaredMenuNames(): string[] {
  const names = menuSources.flatMap((source) =>
    Array.from(readFileSync(join(process.cwd(), source), 'utf8').matchAll(/name:\s*'([^']+)'/g)).map(
      (match) => match[1]
    )
  );
  return Array.from(new Set(names)).sort();
}

describe('WEB-1101 account menu translations', () => {
  it.each(locales)('defines every WEB-1101 menu label for %s', (locale: string) => {
    const menus = menusSection(locale);

    web1101MenuNames.forEach((name) => {
      expect(menus[name]).toBeTruthy();
    });
  });

  /**
   * The withhold tax entries open a confirmation dialog whose title comes from `labels.heading`
   * under the same name (`recurring-deposits-account-view.component.ts:315,339`). Wording that
   * drifts between the two reads as a different action in the dialog than the one clicked, so the
   * menu label and the dialog title are pinned to each other rather than to a fixed string.
   */
  it.each(locales)('titles the confirmation the way the menu item reads for %s', (locale: string) => {
    const labels = labelsFor(locale);

    withholdTaxNames.forEach((name) => {
      expect(labels.menus[name]).toBe(labels.heading[name]);
    });
  });

  it('gives every account menu option an English label', () => {
    const menus = menusSection('en-US');

    expect(declaredMenuNames().filter((name) => !menus[name])).toEqual([]);
  });

  /**
   * Why a missing key is user-visible rather than degrading to the bare name: the handler unwraps
   * `labels.catalogs.` only, because that namespace is keyed by Fineract's own enum values. Every
   * other namespace, `labels.menus` included, surfaces the key itself.
   */
  it('shows a missing menu key to the operator verbatim', () => {
    const handler = new CustomMissingTranslationHandler();

    expect(handler.handle({ key: 'labels.menus.Disable Withhold Tax' } as any)).toBe(
      'labels.menus.Disable Withhold Tax'
    );
  });
});
