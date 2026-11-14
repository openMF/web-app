/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { KeyboardShortcutsConfiguration } from './keyboards-shortcut-config';

describe('KeyboardShortcutsConfiguration', () => {
  let shortcuts: KeyboardShortcutsConfiguration['buttonsArray'];

  beforeEach(() => {
    shortcuts = new KeyboardShortcutsConfiguration().buttonCombinations;
  });

  it('uses Ctrl+Alt for every shortcut', () => {
    expect(shortcuts).not.toHaveLength(0);
    shortcuts.forEach((shortcut) => {
      expect(shortcut).toMatchObject({ ctrlKey: true, altKey: true, shiftKey: false });
    });
  });

  it('keeps every application shortcut', () => {
    expect(shortcuts.map((shortcut) => shortcut.title)).toEqual([
      'Navigation Page',
      'Run Report',
      'Checker Inbox & Pending Tasks',
      'Create Client',
      'Create Group',
      'Create Center',
      'Frequent Posting',
      'Closure Entries',
      'Journal Entry',
      'Reports',
      'Accounting',
      'Save/Submit Forms',
      'Cancel',
      'Help',
      'Logout'
    ]);
  });

  it('does not reuse a shortcut combination', () => {
    const combinations = shortcuts.map(
      ({ ctrlKey, shiftKey, altKey, key }) => `${ctrlKey}:${shiftKey}:${altKey}:${key}`
    );

    expect(new Set(combinations).size).toBe(combinations.length);
  });

  it('does not use the Ctrl+Alt combinations reserved by common Linux desktops', () => {
    const reservedKeys = [
      't',
      'l'
    ];

    expect(shortcuts.filter((shortcut) => reservedKeys.includes(shortcut.key))).toEqual([]);
  });

  it('keeps the Run Report and Logout actions on conflict-free keys', () => {
    expect(shortcuts).toContainEqual(expect.objectContaining({ id: 'runReport', key: 'p', route: '' }));
    expect(shortcuts).toContainEqual(expect.objectContaining({ id: 'logout', key: 'o', route: '' }));
  });

  it('keeps a route or an explicit action for every shortcut', () => {
    shortcuts.forEach((shortcut) => {
      expect(Boolean(shortcut.route) || Boolean(shortcut.id)).toBe(true);
    });
  });
});
