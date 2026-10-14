/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const translationsDirectory = join(process.cwd(), 'src/assets/translations');
const localeFiles = readdirSync(translationsDirectory).filter((file) => file.endsWith('.json'));

const homeEmptyStateKeys = [
  'labels.messages.No matching activities found',
  'labels.messages.Try a different search term'
];

function translationAtPath(translations: Record<string, any>, key: string): unknown {
  return key.split('.').reduce((value: any, segment: string) => value?.[segment], translations);
}

describe('Home search empty state translations', () => {
  const englishTranslations = JSON.parse(readFileSync(join(translationsDirectory, 'en-US.json'), 'utf8'));

  it.each(localeFiles)('defines every homepage search empty-state key in %s', (localeFile) => {
    const translations = JSON.parse(readFileSync(join(translationsDirectory, localeFile), 'utf8'));
    const isEnglish = localeFile === 'en-US.json';

    homeEmptyStateKeys.forEach((key) => {
      const translation = translationAtPath(translations, key);

      expect(typeof translation).toBe('string');
      const value = (translation as string).trim();
      expect(value).not.toBe('');

      if (!isEnglish) {
        // A real translation is neither the English source text nor a raw key that
        // was never translated. English is expected to match its own key segment.
        expect(value).not.toBe(key.split('.').pop());
        expect(value).not.toBe(translationAtPath(englishTranslations, key));
      }
    });
  });
});
