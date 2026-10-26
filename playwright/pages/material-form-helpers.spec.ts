/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { fillIfVisible, selectOption, selectFilteredOption, fillDateField } from './material-form-helpers';

// Pure-logic specs — they run under the `unit` Playwright project
// (testMatch includes /playwright\/pages\/.*\.spec\.ts/) with no
// browser and no app. The helpers only ever call methods on the
// `Page` / `Locator` objects they are handed, so a recording stub
// proves the interaction ORDER — which is the part that actually
// breaks when someone reimplements the overlay dance by hand.
test.use({ storageState: { cookies: [], origins: [] } });

/** Records every call made against the stubbed Playwright objects. */
interface CallLog {
  events: string[];
}

/**
 * Build a stub `Locator` that records its interactions.
 *
 * @param log - Shared call log.
 * @param name - Label used to prefix this locator's events.
 * @param visible - Value returned by `isVisible()`.
 */
function stubLocator(log: CallLog, name: string, visible = true): Locator {
  const locator = {
    click: async () => {
      log.events.push(`${name}.click`);
    },
    fill: async (value: string) => {
      log.events.push(`${name}.fill:${value}`);
    },
    press: async (key: string) => {
      log.events.push(`${name}.press:${key}`);
    },
    blur: async () => {
      log.events.push(`${name}.blur`);
    },
    isVisible: async () => visible,
    waitFor: async () => {
      log.events.push(`${name}.waitFor`);
    },
    first: () => locator
  };
  return locator as unknown as Locator;
}

/**
 * Build a stub `Page` whose `getByRole('option', ...)` returns a
 * recording locator, so tests can assert the overlay option was
 * awaited before it was clicked.
 */
function stubPage(log: CallLog): Page {
  return {
    getByRole: (role: string, options: { name: string }) => stubLocator(log, `option[${role}:${options.name}]`)
  } as unknown as Page;
}

test.describe('selectOption()', () => {
  test('opens the trigger, waits for the overlay, then clicks the option', async () => {
    const log: CallLog = { events: [] };
    const page = stubPage(log);
    const trigger = stubLocator(log, 'trigger');

    await selectOption(page, trigger, 'Head Office');

    // The waitFor MUST land between the trigger click and the option
    // click. Material animates the overlay in, so clicking without
    // the wait races the animation and silently lands on nothing.
    expect(log.events).toEqual([
      'trigger.click',
      'option[option:Head Office].waitFor',
      'option[option:Head Office].click'
    ]);
  });
});

test.describe('selectFilteredOption()', () => {
  test('types into the filter box before selecting', async () => {
    const log: CallLog = { events: [] };
    const page = stubPage(log);
    const trigger = stubLocator(log, 'trigger');
    const searchInput = stubLocator(log, 'search');

    await selectFilteredOption(page, trigger, searchInput, 'E2E Loan Product');

    // The filter must be populated before the option is awaited — the
    // loan-product dropdown does not render an option until its
    // search term matches.
    expect(log.events).toEqual([
      'trigger.click',
      'search.waitFor',
      'search.fill:E2E Loan Product',
      'option[option:E2E Loan Product].waitFor',
      'option[option:E2E Loan Product].click'
    ]);
  });
});

test.describe('fillDateField()', () => {
  test('fills then blurs so Material commits the value', async () => {
    const log: CallLog = { events: [] };
    const input = stubLocator(log, 'date');

    await fillDateField(input, '01 January 2024');

    // Blur fires dateChange so Angular form controls commit. In unit
    // stubs there is no page-level overlay to close, so the helper
    // falls back to Escape on the input itself.
    expect(log.events).toEqual([
      'date.fill:01 January 2024',
      'date.blur',
      'date.press:Escape'
    ]);
  });
});

test.describe('fillIfVisible()', () => {
  test('fills a visible field', async () => {
    const log: CallLog = { events: [] };
    await fillIfVisible(stubLocator(log, 'field', true), 'value');
    expect(log.events).toEqual(['field.fill:value']);
  });

  test('skips a hidden field without throwing', async () => {
    const log: CallLog = { events: [] };
    await fillIfVisible(stubLocator(log, 'field', false), 'value');
    expect(log.events).toEqual([]);
  });

  test('treats undefined as a no-op even when the field is visible', async () => {
    const log: CallLog = { events: [] };
    await fillIfVisible(stubLocator(log, 'field', true), undefined);
    expect(log.events).toEqual([]);
  });
});
