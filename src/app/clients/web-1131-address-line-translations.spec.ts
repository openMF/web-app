/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const localeFiles = [
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

const addressLineKeys = [
  'labels.inputs.Address Line 1',
  'labels.inputs.Address Line 2',
  'labels.inputs.Address Line 3'
];

function readTranslations(localeFile: string): Record<string, Record<string, Record<string, string>>> {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/assets/translations', localeFile), 'utf8'));
}

function translationValue(translations: Record<string, Record<string, Record<string, string>>>, key: string): string {
  const [
    root,
    section,
    ...leafParts
  ] = key.split('.');
  return translations[root]?.[section]?.[leafParts.join('.')];
}

describe('WEB-1131 address line translations', () => {
  it.each(localeFiles)('defines independent address line labels for %s', (localeFile: string) => {
    const translations = readTranslations(localeFile);

    addressLineKeys.forEach((key) => {
      expect(translationValue(translations, key)).toBeTruthy();
      expect(translationValue(translations, key)).not.toBe(
        translationValue(translations, 'labels.inputs.Address Line')
      );
    });
  });

  it('defines English labels as complete field names', () => {
    const translations = readTranslations('en-US.json');

    expect(translationValue(translations, 'labels.inputs.Address Line 1')).toBe('Address Line 1');
    expect(translationValue(translations, 'labels.inputs.Address Line 2')).toBe('Address Line 2');
    expect(translationValue(translations, 'labels.inputs.Address Line 3')).toBe('Address Line 3');
  });

  it('defines Spanish labels independently from the shared address line label', () => {
    const translations = readTranslations('es-MX.json');

    expect(translationValue(translations, 'labels.inputs.Address Line 1')).toBe('Dirección 1');
    expect(translationValue(translations, 'labels.inputs.Address Line 2')).toBe('Dirección 2');
    expect(translationValue(translations, 'labels.inputs.Address Line 3')).toBe('Dirección 3');
  });
});
