/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const directory = join(process.cwd(), 'src/assets/translations');
const read = (file: string): Record<string, string> =>
  JSON.parse(readFileSync(join(directory, file), 'utf8')).checkerInbox.review;
const english = read('en-US.json');
const placeholders = (value: string): string[] =>
  [...value.matchAll(/{{\s*(\w+)\s*}}/g)].map((match) => match[1]).sort();

describe('Checker inbox review translations', () => {
  it('ships every required English workspace key', () => {
    const requiredKeys = [
      'description',
      'search',
      'filters',
      'madeBy',
      'all',
      'refresh',
      'dateError',
      'bulkActions',
      'selected',
      'more',
      'unknown',
      'requests',
      'resource',
      'unavailable',
      'reviewRequest',
      'ownRequest',
      'ineligible',
      'pending',
      'newest',
      'oldest',
      'details',
      'close',
      'loadingDetail',
      'detailError',
      'openClient',
      'submitted',
      'requestedChanges',
      'fieldCount',
      'malformed',
      'noChanges',
      'notSet',
      'viewJson',
      'comment',
      'commentDependency',
      'deleteRequest',
      'select',
      'deselect',
      'selectAll',
      'deselectAll',
      'confirmApprove',
      'confirmReject',
      'confirmDelete',
      'dateFormat',
      'locale',
      'noLongerPending'
    ];
    for (const key of requiredKeys) expect(english[key]).toEqual(expect.stringMatching(/\S/));
  });

  it.each(readdirSync(directory).filter((file) => file.endsWith('.json')))(
    'ships all review messages and matching placeholders in %s',
    (file) => {
      const messages = read(file);
      expect(Object.keys(messages).sort()).toEqual(Object.keys(english).sort());
      for (const [
        key,
        value
      ] of Object.entries(messages)) {
        expect(typeof value).toBe('string');
        expect(value.trim()).not.toBe('');
        expect(placeholders(value)).toEqual(placeholders(english[key]));
      }
    }
  );
});
