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

type Translations = Record<string, unknown>;

const expectedPlaceholders: Record<string, string[]> = {
  'checkerInbox.status.processing': ['count'],
  'checkerInbox.status.processedSummary': [
    'failed',
    'processed',
    'succeeded'
  ],
  'checkerInbox.status.loading': [],
  'checkerInbox.error.failedIds': [],
  'checkerInbox.error.load': [],
  'checkerInbox.error.permission': []
};

const englishMessages: Record<string, string> = {
  'checkerInbox.status.processing': 'Processing {{count}} checker item(s)…',
  'checkerInbox.status.processedSummary': '{{processed}} tasks processed: {{succeeded}} succeeded, {{failed}} failed.',
  'checkerInbox.status.loading': 'Loading checker inbox…',
  'checkerInbox.error.failedIds': 'Failed record IDs:',
  'checkerInbox.error.load': 'Unable to load checker inbox. Please try your search again.',
  'checkerInbox.error.permission': 'You do not have permission to action the checker items in this list.'
};

const frenchMessages: Record<string, string> = {
  'checkerInbox.status.processing': 'Traitement de {{count}} élément(s) de vérification…',
  'checkerInbox.status.processedSummary':
    '{{processed}} tâches traitées : {{succeeded}} réussies, {{failed}} échouées.',
  'checkerInbox.error.failedIds': 'ID des enregistrements en échec :',
  'checkerInbox.status.loading': 'Chargement de la boîte de réception du vérificateur…',
  'checkerInbox.error.load':
    'Impossible de charger la boîte de réception du vérificateur. Veuillez relancer votre recherche.',
  'checkerInbox.error.permission':
    'Vous n’avez pas l’autorisation d’agir sur les éléments de vérification de cette liste.'
};

function readTranslations(localeFile: string): Translations {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/assets/translations', localeFile), 'utf8'));
}

function translationValue(translations: Translations, key: string): string {
  return key.split('.').reduce<unknown>((value, segment) => (value as Translations)?.[segment], translations) as string;
}

function placeholders(value: string): string[] {
  return [...value.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((match) => match[1]).sort();
}

describe('WEB-1380 Checker Inbox operational message translations', () => {
  it.each(localeFiles)('defines all six keys for %s', (localeFile: string) => {
    const translations = readTranslations(localeFile);

    Object.keys(expectedPlaceholders).forEach((key) => {
      const value = translationValue(translations, key);
      expect(typeof value).toBe('string');
      expect(value.trim()).not.toBe('');
    });
  });

  it.each(localeFiles)('uses the implementation placeholders for %s', (localeFile: string) => {
    const translations = readTranslations(localeFile);

    Object.keys(expectedPlaceholders).forEach((key) => {
      expect(placeholders(translationValue(translations, key))).toEqual(expectedPlaceholders[key]);
    });
  });

  it('keeps the original English wording', () => {
    const translations = readTranslations('en-US.json');

    Object.entries(englishMessages).forEach(
      ([
        key,
        expected
      ]) => {
        expect(translationValue(translations, key)).toBe(expected);
      }
    );
  });

  it('ships French translations for the reproduced failure scenario', () => {
    const translations = readTranslations('fr-FR.json');

    Object.entries(frenchMessages).forEach(
      ([
        key,
        expected
      ]) => {
        expect(translationValue(translations, key)).toBe(expected);
      }
    );
  });

  it.each(localeFiles.filter((localeFile) => localeFile !== 'en-US.json'))(
    'does not fall back to English strings for %s',
    (localeFile: string) => {
      const translations = readTranslations(localeFile);

      Object.entries(englishMessages).forEach(
        ([
          key,
          english
        ]) => {
          expect(translationValue(translations, key)).not.toBe(english);
        }
      );
    }
  );
});
