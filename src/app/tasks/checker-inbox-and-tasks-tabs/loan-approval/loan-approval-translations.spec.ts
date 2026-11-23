/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const directory = join(process.cwd(), 'src/assets/translations');
const english = JSON.parse(readFileSync(join(directory, 'en-US.json'), 'utf8')).loanApproval;
const placeholders = (text: string) => [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map((match) => match[1]).sort();
describe('WEB-1474 translation coverage', () => {
  it.each(readdirSync(directory).filter((name) => name.endsWith('.json')))(
    'provides every new key and preserves interpolation in %s',
    (name) => {
      const strings = JSON.parse(readFileSync(join(directory, name), 'utf8')).loanApproval;
      expect(Object.keys(strings).sort()).toEqual(Object.keys(english).sort());
      for (const key of Object.keys(english)) {
        expect(typeof strings[key]).toBe('string');
        expect(strings[key].trim()).not.toBe('');
        expect(placeholders(strings[key])).toEqual(placeholders(english[key]));
      }
    }
  );
});
