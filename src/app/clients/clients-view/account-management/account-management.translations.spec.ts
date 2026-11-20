/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { ACCOUNT_STATUS_KEYS } from './account-status.component';

const directory = join(process.cwd(), 'src/assets/translations');
const english = JSON.parse(readFileSync(join(directory, 'en-US.json'), 'utf8'));
const reference: Record<string, string> = english.AccountManagement;

/** ngx-translate supports both nested keys and literal dotted reason-code keys. */
function translation(data: Record<string, unknown>, key: string): unknown {
  if (!data || typeof data !== 'object') return undefined;
  if (Object.hasOwn(data, key)) return data[key];
  const dot = key.indexOf('.');
  return dot < 0 ? undefined : translation(data[key.slice(0, dot)] as Record<string, unknown>, key.slice(dot + 1));
}

describe('Account management locale coverage', () => {
  it.each(readdirSync(directory).filter((name) => name.endsWith('.json')))(
    '%s resolves every label and backend code',
    (name) => {
      const locale = JSON.parse(readFileSync(join(directory, name), 'utf8'));
      const values: Record<string, string> = locale.AccountManagement;
      expect(Object.keys(values).sort()).toEqual(Object.keys(reference).sort());
      for (const [
        key,
        value
      ] of Object.entries(values)) {
        expect(value.trim()).not.toBe('');
        expect(value.match(/{{[^}]+}}/g) || []).toEqual(reference[key].match(/{{[^}]+}}/g) || []);
      }
      for (const key of Object.values(ACCOUNT_STATUS_KEYS)) {
        const label = translation(locale, key);
        if (name !== 'en-US.json' && key.startsWith('FinancialControls.Errors.') && label === undefined) continue;
        expect(typeof label).toBe('string');
        expect(String(label).trim()).not.toBe('');
      }
    }
  );
  it('preserves native restriction and unverified contribution meanings', () => {
    expect(translation(english, ACCOUNT_STATUS_KEYS.SUB_400)).toBe('Account blocked');
    expect(translation(english, ACCOUNT_STATUS_KEYS.OVERDUE_UNVERIFIED)).not.toContain('Missed');
    expect(translation(english, ACCOUNT_STATUS_KEYS.DUE_UNVERIFIED)).not.toContain('Paid');
  });
});
