/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from '@jest/globals';

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

const expectedInvalidJsonMessages: Record<string, string> = {
  'cs-CS': 'Zadejte platný JSON.',
  'de-DE': 'Geben Sie gültiges JSON ein.',
  'en-US': 'Enter valid JSON.',
  'es-CL': 'Ingrese un JSON válido.',
  'es-MX': 'Ingrese un JSON válido.',
  'fr-FR': 'Saisissez un JSON valide.',
  'it-IT': 'Inserisci JSON valido.',
  'ko-KO': '유효한 JSON을 입력하세요.',
  'lt-LT': 'Įveskite galiojantį JSON.',
  'lv-LV': 'Ievadiet derīgu JSON.',
  'ne-NE': 'मान्य JSON प्रविष्ट गर्नुहोस्।',
  'pt-PT': 'Introduza um JSON válido.',
  'sw-SW': 'Weka JSON halali.'
};

describe('translation completeness', () => {
  it.each(locales)('%s includes JSON datatable labels and parses successfully', (locale) => {
    const translations = JSON.parse(
      readFileSync(join(process.cwd(), 'src/assets/translations', `${locale}.json`), 'utf8')
    );

    expect(translations.labels.inputs.JSON).toBe('JSON');
    expect(translations.labels.inputs['Invalid JSON']).toBe(expectedInvalidJsonMessages[locale]);
  });
});
