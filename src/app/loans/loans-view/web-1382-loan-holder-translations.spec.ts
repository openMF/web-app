/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const localeFiles = [
  'az-AZ.json',
  'cs-CS.json',
  'de-DE.json',
  'en-US.json',
  'es-CL.json',
  'es-MX.json',
  'fr-FR.json',
  'it-IT.json',
  'ko-KO.json',
  'lt-LT.json',
  'lv-LV.json',
  'ne-NE.json',
  'pt-PT.json',
  'sw-SW.json'
];

function readTextLabels(localeFile: string): Record<string, string> {
  const translations = JSON.parse(readFileSync(join(process.cwd(), 'src/assets/translations', localeFile), 'utf8'));
  return translations.labels.text;
}

describe('WEB-1382 loan holder translations', () => {
  it.each(localeFiles)('defines a distinct neutral holder label for %s', (localeFile: string) => {
    const labels = readTextLabels(localeFile);

    expect(labels['Account holder']).toBeTruthy();
    expect(labels['Account holder']).not.toBe(labels['undefined']);
    expect(labels['Account holder']).not.toBe(labels['Client']);
    expect(labels['Account holder']).not.toBe(labels['Group']);
  });

  it('defines the English fallback label', () => {
    expect(readTextLabels('en-US.json')['Account holder']).toBe('Account holder');
  });

  it('localizes the fallback label instead of leaving it in English', () => {
    expect(readTextLabels('es-MX.json')['Account holder']).toBe('Titular de la cuenta');
    expect(readTextLabels('fr-FR.json')['Account holder']).toBe('Titulaire du compte');
  });
});
