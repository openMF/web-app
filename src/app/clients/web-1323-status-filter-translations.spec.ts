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

const statusFilterKeys = ['labels.buttons.Clear status filter'];

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

describe('WEB-1323 status filter translations', () => {
  it.each(localeFiles)('defines the Clear status filter label for %s', (localeFile: string) => {
    const translations = readTranslations(localeFile);

    statusFilterKeys.forEach((key) => {
      const value = translationValue(translations, key);
      expect(value).toBeTruthy();
      // The clear-status-filter label must be independent of the generic Clear label.
      expect(value).not.toBe(translationValue(translations, 'labels.buttons.Clear'));
    });
  });

  it('defines the English label as a complete action', () => {
    const translations = readTranslations('en-US.json');

    expect(translationValue(translations, 'labels.buttons.Clear status filter')).toBe('Clear status filter');
  });

  it('defines the Spanish labels independently from the generic Clear label', () => {
    const translations = readTranslations('es-MX.json');

    expect(translationValue(translations, 'labels.buttons.Clear status filter')).toBe('Limpiar filtro de estado');
    expect(translationValue(translations, 'labels.buttons.Clear status filter')).not.toBe(
      translationValue(translations, 'labels.buttons.Clear')
    );
  });
});
