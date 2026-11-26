/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const directory = join(process.cwd(), 'src/assets/translations');
const locales = readdirSync(directory).filter((name) => name.endsWith('.json'));
function flatten(value: Record<string, unknown>, prefix = ''): Record<string, string> {
  return Object.assign(
    {},
    ...Object.entries(value).map(
      ([
        key,
        item
      ]) =>
        typeof item === 'string'
          ? { [`${prefix}${key}`]: item }
          : flatten(item as Record<string, unknown>, `${prefix}${key}.`)
    )
  );
}
const english = flatten(JSON.parse(readFileSync(join(directory, 'en-US.json'), 'utf8')));
const componentDirectory = join(process.cwd(), 'src/app/home/dashboard/onboarding-board');
const source = [
  'onboarding-board.component.ts',
  'onboarding-board.component.html'
]
  .map((name) => readFileSync(join(componentDirectory, name), 'utf8'))
  .join('\n');
const keys = [...new Set(source.match(/onboardingPipeline\.[A-Za-z]+(?:\.[A-Za-z]+)*/g))];

describe('Onboarding pipeline localization', () => {
  it.each(locales)('defines all static and dynamic keys with matching placeholders in %s', (locale) => {
    const translations = flatten(JSON.parse(readFileSync(join(directory, locale), 'utf8')));
    for (const key of keys) {
      expect(typeof translations[key]).toBe('string');
      expect(translations[key].trim()).not.toBe('');
      expect(translations[key]).not.toBe(key);
      expect(translations[key].match(/{{\w+}}/g)?.sort()).toEqual(english[key].match(/{{\w+}}/g)?.sort());
    }
  });
});
