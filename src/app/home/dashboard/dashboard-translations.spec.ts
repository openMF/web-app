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

const dashboardKeys = [
  'labels.heading.Dashboard',
  'labels.heading.Onboarding Board',
  'labels.inputs.Task',
  'labels.inputs.Client',
  'labels.inputs.Account Number',
  'labels.inputs.Office',
  'labels.inputs.Status',
  'labels.inputs.Action',
  'labels.inputs.Aging',
  'labels.inputs.Client Approval',
  'labels.inputs.Loan Approval',
  'labels.inputs.No records match the selected filter',
  'labels.inputs.Submitted date unavailable',
  'labels.inputs.Unavailable',
  'labels.inputs.Future submitted date',
  'labels.buttons.View',
  'labels.buttons.Retry',
  'labels.text.Filter by name',
  'labels.text.Loading data',
  'labels.text.Failed to load',
  'labels.text.No data found',
  'labels.text.Today',
  'labels.text.Aging day',
  'labels.text.Aging days',
  'labels.inputs.Yellow',
  'labels.inputs.Orange',
  'labels.inputs.Red',
  'labels.inputs.day',
  'labels.inputs.days',
  'labels.text.Savings'
];

function translationAtPath(translations: Record<string, any>, key: string): unknown {
  return key.split('.').reduce((value: any, segment: string) => value?.[segment], translations);
}

describe('Dashboard translations', () => {
  it.each(localeFiles)('defines every Dashboard and Onboarding Board key in %s', (localeFile) => {
    const translations = JSON.parse(readFileSync(join(translationsDirectory, localeFile), 'utf8'));

    dashboardKeys.forEach((key) => {
      const translation = translationAtPath(translations, key);
      expect(typeof translation).toBe('string');
      expect((translation as string).trim()).not.toBe('');
      expect(translation).not.toBe(key);
    });
  });
});
