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

const signatureToolKeys = [
  'labels.buttons.Drawing Tool',
  'labels.buttons.Eraser'
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

describe('WEB-1366 signature tool translations', () => {
  it.each(localeFiles)('defines the Drawing Tool and Eraser labels for %s', (localeFile: string) => {
    const translations = readTranslations(localeFile);

    signatureToolKeys.forEach((key) => {
      expect(translationValue(translations, key)).toBeTruthy();
    });
  });

  it('defines the English labels for the signature tools', () => {
    const translations = readTranslations('en-US.json');

    expect(translationValue(translations, 'labels.buttons.Drawing Tool')).toBe('Drawing Tool');
    expect(translationValue(translations, 'labels.buttons.Eraser')).toBe('Eraser');
  });
});
