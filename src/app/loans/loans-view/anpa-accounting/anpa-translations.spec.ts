/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { template } from './anpa.fixtures';
import { ANPA_SHARED_LABELS } from './anpa-labels';

type TranslationNode = { [key: string]: string | TranslationNode };
function flatten(node: TranslationNode, prefix = ''): Record<string, string> {
  return Object.fromEntries(
    Object.entries(node).flatMap(
      ([
        key,
        value
      ]) => (typeof value === 'string' ? [[
                prefix + key,
                value
              ]] : Object.entries(flatten(value, prefix + key + '.')))
    )
  );
}
describe('ANPA translation catalog integrity', () => {
  const directory = join(process.cwd(), 'src/assets/translations');
  const catalogs = readdirSync(directory)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const catalog = JSON.parse(readFileSync(join(directory, file), 'utf8')) as { labels: { anpa: TranslationNode } };
      return { file, values: flatten(catalog.labels.anpa), all: flatten(catalog) };
    });
  const base = catalogs.find((c) => c.file === 'en-US.json')!.values;
  it.each(catalogs)('$file includes all ANPA labels and every backend blocker', ({ values, all }) => {
    expect(values.latestClosedThrough).not.toBe(values.effectiveThrough);
    expect(values['errors.offline']).not.toMatch(/localhost|8443/i);
    expect(Object.keys(values).sort()).toEqual(Object.keys(base).sort());
    expect(Object.values(values).every((value) => value.trim().length > 0)).toBe(true);
    for (const key of Object.values(ANPA_SHARED_LABELS)) expect(all[key]).toBeTruthy();
    for (const state of [
      'ADJUSTMENT_BLOCKED',
      'REVERSED_WRITE_OFF',
      'MISSING_HISTORICAL_EVIDENCE'
    ]) expect(values['codes.' + state]).toBeTruthy();
    for (const reason of template.blockerCodes) expect(values['blockers.' + reason]).toBeTruthy();
  });
});
