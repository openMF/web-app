/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, it, expect } from '@jest/globals';

const translationsDir = join(process.cwd(), 'src/assets/translations');
const localeFiles = readdirSync(translationsDir).filter((file) => file.endsWith('.json'));

type Translations = Record<string, unknown>;

function readTranslations(localeFile: string): Translations {
  return JSON.parse(readFileSync(join(translationsDir, localeFile), 'utf8'));
}

function translationValue(translations: Translations, key: string): string {
  return key.split('.').reduce<unknown>((value, segment) => (value as Translations)?.[segment], translations) as string;
}

describe('Clipboard Feedback Translations', () => {
  it('discovers supported translation files dynamically', () => {
    expect(localeFiles.length).toBeGreaterThan(0);
    expect(localeFiles).toContain('en-US.json');
  });

  it('defines all required clipboard keys across all discovered locales', () => {
    for (const locale of localeFiles) {
      const translations = readTranslations(locale);

      const type = translationValue(translations, 'errors.clipboard.type');
      const copied = translationValue(translations, 'errors.clipboard.copied');
      const copyFailed = translationValue(translations, 'errors.clipboard.copyFailed');
      const failed = translationValue(translations, 'errors.clipboard.failed');

      expect(typeof type).toBe('string');
      expect(type.trim().length).toBeGreaterThan(0);

      expect(typeof copied).toBe('string');
      expect(copied.trim().length).toBeGreaterThan(0);
      expect(copied).toContain('{{value}}');

      expect(typeof copyFailed).toBe('string');
      expect(copyFailed.trim().length).toBeGreaterThan(0);

      expect(typeof failed).toBe('string');
      expect(failed.trim().length).toBeGreaterThan(0);
    }
  });

  it('does not leave errors.clipboard.failed empty or untranslated in non-English locales', () => {
    const en = readTranslations('en-US.json');
    const englishFailed = translationValue(en, 'errors.clipboard.failed');
    expect(typeof englishFailed).toBe('string');
    expect(englishFailed.trim().length).toBeGreaterThan(0);

    for (const locale of localeFiles) {
      if (locale === 'en-US.json') continue;
      const translations = readTranslations(locale);
      const failed = translationValue(translations, 'errors.clipboard.failed');
      expect(typeof failed).toBe('string');
      expect(failed.trim().length).toBeGreaterThan(0);
      expect(failed).not.toBe(englishFailed);
    }
  });
});
