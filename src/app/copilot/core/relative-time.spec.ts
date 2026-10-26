/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect, afterEach } from '@jest/globals';
import moment from 'moment';
import 'moment/locale/cs';
import 'moment/locale/fr';
import { relativeTime } from './relative-time';

/**
 * Timestamps in the Copilot were rendering in Czech for an officer working in English.
 * The cause was not the Copilot: date-format.pipe and datetime-format.pipe both call
 * moment.locale() as a side effect of rendering, which sets the language process-wide,
 * and anything calling fromNow() afterwards inherits it.
 */
describe('relativeTime', () => {
  const FIVE_MINUTES_AGO = Date.now() - 5 * 60_000;

  afterEach(() => {
    moment.locale('en');
  });

  it('answers in the language it was asked for', () => {
    expect(relativeTime(FIVE_MINUTES_AGO, 'en')).toBe('5 minutes ago');
    expect(relativeTime(FIVE_MINUTES_AGO, 'fr')).toContain('minutes');
  });

  it('ignores a global locale another part of the app has set', () => {
    // This is the actual bug. A date pipe rendered somewhere else in the page, moment's
    // global locale became Czech, and Recent Chats started saying "před 5 minutami".
    moment.locale('cs');

    expect(relativeTime(FIVE_MINUTES_AGO, 'en')).toBe('5 minutes ago');
  });

  it('leaves the global locale exactly as it found it', () => {
    moment.locale('cs');

    relativeTime(FIVE_MINUTES_AGO, 'en');

    expect(moment.locale()).toBe('cs');
  });

  it('falls back to English rather than to whatever was set last', () => {
    moment.locale('cs');

    expect(relativeTime(FIVE_MINUTES_AGO, '')).toBe('5 minutes ago');
  });
});
