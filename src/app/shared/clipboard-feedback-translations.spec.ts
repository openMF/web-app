/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, it, expect } from '@jest/globals';

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

type Translations = Record<string, unknown>;

function readTranslations(localeFile: string): Translations {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/assets/translations', localeFile), 'utf8'));
}

function translationValue(translations: Translations, key: string): string {
  return key.split('.').reduce<unknown>((value, segment) => (value as Translations)?.[segment], translations) as string;
}

describe('Clipboard Feedback Translations', () => {
  it('defines all required clipboard keys across all 14 supported locales', () => {
    for (const locale of localeFiles) {
      const translations = readTranslations(locale);

      const type = translationValue(translations, 'errors.clipboard.type');
      const copied = translationValue(translations, 'errors.clipboard.copied');
      const failed = translationValue(translations, 'errors.clipboard.failed');

      expect(typeof type).toBe('string');
      expect(type.length).toBeGreaterThan(0);

      expect(typeof copied).toBe('string');
      expect(copied).toContain('{{value}}');

      expect(typeof failed).toBe('string');
      expect(failed.length).toBeGreaterThan(0);
    }
  });

  it('provides the correct English translation', () => {
    const en = readTranslations('en-US.json');
    expect(translationValue(en, 'errors.clipboard.type')).toBe('Clipboard');
    expect(translationValue(en, 'errors.clipboard.copied')).toBe('Copied: {{value}}');
    expect(translationValue(en, 'errors.clipboard.failed')).toBe('Failed to copy to clipboard');
  });

  it('provides the correct French translation', () => {
    const fr = readTranslations('fr-FR.json');
    expect(translationValue(fr, 'errors.clipboard.type')).toBe('Presse-papiers');
    expect(translationValue(fr, 'errors.clipboard.copied')).toBe('Copié : {{value}}');
    expect(translationValue(fr, 'errors.clipboard.failed')).toBe('Échec de la copie dans le presse-papiers');
  });

  it('does not contain English placeholder fallback in non-English locales', () => {
    const englishFailed = 'Failed to copy to clipboard';
    for (const locale of localeFiles) {
      if (locale === 'en-US.json') continue;
      const translations = readTranslations(locale);
      const failed = translationValue(translations, 'errors.clipboard.failed');
      expect(failed).not.toBe(englishFailed);
    }
  });
});

