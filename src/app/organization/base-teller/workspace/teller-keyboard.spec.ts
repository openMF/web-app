/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { afterEach, describe, expect, it } from '@jest/globals';

import { frequentShortcutOf, hasOpenOverlay, isEditableTarget, isSearchShortcut } from './teller-keyboard';

const key = (init: Partial<KeyboardEventInit> & { key: string }): KeyboardEvent => new KeyboardEvent('keydown', init);

describe('teller keyboard helpers', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Ctrl+K / Cmd+K', () => {
    it('accepts Ctrl+K on Windows and Linux only', () => {
      expect(isSearchShortcut(key({ key: 'k', ctrlKey: true }), false)).toBe(true);
      expect(isSearchShortcut(key({ key: 'K', ctrlKey: true }), false)).toBe(true);
      expect(isSearchShortcut(key({ key: 'k', metaKey: true }), false)).toBe(false);
    });

    it('accepts Cmd+K on macOS only', () => {
      expect(isSearchShortcut(key({ key: 'k', metaKey: true }), true)).toBe(true);
      expect(isSearchShortcut(key({ key: 'k', ctrlKey: true }), true)).toBe(false);
    });

    it.each([
      { key: 'k' },
      { key: 'k', ctrlKey: true, shiftKey: true },
      { key: 'k', ctrlKey: true, altKey: true },
      { key: 'j', ctrlKey: true },
      { key: 'k', ctrlKey: true, metaKey: true }
    ])('ignores %j', (init) => {
      expect(isSearchShortcut(key(init), false)).toBe(false);
    });

    it('ignores IME composition', () => {
      expect(isSearchShortcut(key({ key: 'k', ctrlKey: true, isComposing: true }), false)).toBe(false);
    });
  });

  describe('F2-F5', () => {
    it.each([
      'F2',
      'F3',
      'F4',
      'F5'
    ])('recognises %s pressed alone', (name) => {
      expect(frequentShortcutOf(key({ key: name }))).toBe(name);
    });

    it.each([
      { key: 'F1' },
      { key: 'F6' },
      { key: 'a' },
      { key: 'F2', ctrlKey: true },
      { key: 'F2', metaKey: true },
      { key: 'F3', altKey: true },
      { key: 'F4', shiftKey: true },
      { key: 'F5', repeat: true },
      { key: 'F5', isComposing: true }
    ])('ignores %j', (init) => {
      expect(frequentShortcutOf(key(init))).toBeNull();
    });
  });

  describe('editable targets', () => {
    function mount(html: string): HTMLElement {
      document.body.innerHTML = html;
      return document.body.firstElementChild as HTMLElement;
    }

    it.each([
      '<input />',
      '<textarea></textarea>',
      '<select></select>',
      '<div role="textbox"></div>',
      '<div role="searchbox"></div>',
      '<div role="combobox"></div>',
      '<div contenteditable="true"></div>',
      '<mat-select></mat-select>'
    ])('treats %s as a text-editing target', (html) => {
      expect(isEditableTarget(mount(html))).toBe(true);
    });

    it('treats a child of an editable region as editable', () => {
      const root = mount('<div contenteditable="true"><span id="child">x</span></div>');
      expect(isEditableTarget(root.querySelector('#child'))).toBe(true);
    });

    it.each([
      '<button></button>',
      '<a href="#">link</a>',
      '<div></div>',
      '<div contenteditable="false"></div>'
    ])('does not treat %s as editable', (html) => {
      expect(isEditableTarget(mount(html))).toBe(false);
    });

    it('does not treat a non-element target as editable', () => {
      expect(isEditableTarget(null)).toBe(false);
      expect(isEditableTarget(document)).toBe(false);
    });
  });

  describe('open overlays', () => {
    it('is false on a clean page', () => {
      expect(hasOpenOverlay(document)).toBe(false);
    });

    it.each([
      '<div class="mat-mdc-dialog-container"></div>',
      '<div role="dialog"></div>',
      '<div aria-modal="true"></div>',
      '<div class="mat-mdc-select-panel"></div>',
      '<div class="mat-mdc-menu-panel"></div>',
      '<div class="mat-mdc-autocomplete-panel"></div>'
    ])('is true while %s is open', (inner) => {
      document.body.innerHTML = `<div class="cdk-overlay-container">${inner}</div>`;
      expect(hasOpenOverlay(document)).toBe(true);
    });

    it('is false for an empty overlay container left behind by a closed dialog', () => {
      document.body.innerHTML = '<div class="cdk-overlay-container"></div>';
      expect(hasOpenOverlay(document)).toBe(false);
    });
  });
});
