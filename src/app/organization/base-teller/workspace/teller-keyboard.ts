/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FREQUENT_SHORTCUTS, FrequentShortcut } from './base-teller-workflows';

const EDITABLE_SELECTOR =
  'input, textarea, select, mat-select, mat-checkbox, mat-radio-button, mat-slide-toggle, ' +
  '[role="combobox"], [role="textbox"], [role="searchbox"], [role="checkbox"], [role="radio"], [role="switch"], ' +
  '[role="spinbutton"]';

/**
 * True when a key event originates from something the user types into. Mirrors the guard used by the application's
 * global shortcut handler so teller shortcuts never fire while text is being entered.
 */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.closest(EDITABLE_SELECTOR) !== null || target.isContentEditable) {
    return true;
  }
  const editable = target.closest('[contenteditable]');
  return editable !== null && editable.getAttribute('contenteditable') !== 'false';
}

const OVERLAY_SELECTOR =
  '.cdk-overlay-container .mat-mdc-dialog-container, ' +
  '.cdk-overlay-container [role="dialog"], ' +
  '.cdk-overlay-container [aria-modal="true"], ' +
  '.cdk-overlay-container .mat-mdc-select-panel, ' +
  '.cdk-overlay-container .mat-mdc-menu-panel, ' +
  '.cdk-overlay-container .mat-mdc-autocomplete-panel';

/** True while a dialog, menu or select panel is open, when workspace shortcuts must stay out of the way. */
export function hasOpenOverlay(doc: Document): boolean {
  return doc.querySelector(OVERLAY_SELECTOR) !== null;
}

export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  const nav = navigator as { userAgentData?: { platform?: string }; platform?: string; userAgent?: string };
  const platform = (nav.userAgentData?.platform || nav.platform || nav.userAgent || '').toLowerCase();
  return platform.includes('mac') || platform.includes('darwin');
}

type ModifierEvent = Pick<
  KeyboardEvent,
  'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey' | 'isComposing' | 'repeat'
>;

/** Ctrl+K on Windows/Linux, Cmd+K on macOS. The other modifier must not be held. */
export function isSearchShortcut(event: ModifierEvent, mac: boolean = isMacPlatform()): boolean {
  if (event.isComposing || event.altKey || event.shiftKey || event.key.toLowerCase() !== 'k') {
    return false;
  }
  return mac ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
}

/** F2-F5 pressed alone. Held-down repeats and IME composition are ignored. */
export function frequentShortcutOf(event: ModifierEvent): FrequentShortcut | null {
  if (event.isComposing || event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
    return null;
  }
  return (FREQUENT_SHORTCUTS as readonly string[]).includes(event.key) ? (event.key as FrequentShortcut) : null;
}
