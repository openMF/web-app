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

const profileNavigationKeys = [
  'labels.heading.Details',
  'labels.heading.Loan Accounts',
  'labels.heading.Savings Accounts',
  'labels.heading.Share Accounts',
  'labels.heading.Group Members'
];

function translationAtPath(translations: Record<string, any>, key: string): unknown {
  return key.split('.').reduce((value: any, segment: string) => value?.[segment], translations);
}

describe('Profile navigation translations', () => {
  it.each(localeFiles)('defines every profile navigation tab key in %s', (localeFile) => {
    const translations = JSON.parse(readFileSync(join(translationsDirectory, localeFile), 'utf8'));
    const isEnglish = localeFile === 'en-US.json';

    profileNavigationKeys.forEach((key) => {
      const translation = translationAtPath(translations, key);

      expect(typeof translation).toBe('string');
      expect((translation as string).trim()).not.toBe('');

      if (!isEnglish) {
        expect(translation).not.toBe(key);
      }
    });
  });
});
