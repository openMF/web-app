/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Keyboard Shortcuts Button Configuration
 *
 * Every shortcut uses Ctrl+Alt:
 *
 * - Bare Ctrl+letter combinations are reserved by browsers for opening windows and
 *   tabs, finding text, reloading, opening downloads/dev tools, and focusing the
 *   address bar. `preventDefault()` cannot reliably override those browser actions.
 * - Bare Alt+letter combinations do not work reliably on macOS because Option
 *   changes `event.key` to a different character. Matching also checks `event.code`
 *   so the Ctrl+Alt shortcuts keep working there.
 * - Ctrl+Alt was the application's original navigation chord, so this keeps one
 *   consistent chord instead of introducing another modifier scheme.
 *
 * Run Report uses P and Logout uses O because Ctrl+Alt+T opens a terminal and
 * Ctrl+Alt+L locks the screen on common Linux desktops.
 */
export type ButtonCombination = {
  title: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  key: string;
  route: string;
  id?: string;
};

export class KeyboardShortcutsConfiguration {
  buttonsArray: ButtonCombination[];

  constructor() {
    this.makeCombination();
  }

  makeCombination() {
    this.buttonsArray = [
      // Navigation Page - ctrl + alt + n
      {
        title: 'Navigation Page',
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        key: 'n',
        route: 'navigation'
      },
      // Run Report - ctrl + alt + p
      {
        title: 'Run Report',
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        key: 'p',
        route: '',
        id: 'runReport'
      },
      // Checker Inbox & Pending Tasks - ctrl + alt + i
      {
        title: 'Checker Inbox & Pending Tasks',
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        key: 'i',
        route: 'checker-inbox-and-tasks/checker-inbox'
      },
      // Collection Sheet - ctrl + alt + o
      // {
      //   title: 'Collection Sheet',
      //   ctrlKey: true,
      //   shiftKey: false,
      //   altKey: true,
      //   key: 'o',
      //   route: ''
      // },
      // Create Client - ctrl + alt + c
      {
        title: 'Create Client',
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        key: 'c',
        route: 'clients/create'
      },
      // Create Group - ctrl + alt + g
      {
        title: 'Create Group',
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        key: 'g',
        route: 'groups/create'
      },
      // Create Center - ctrl + alt + q
      {
        title: 'Create Center',
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        key: 'q',
        route: 'centers/create'
      },
      // Frequent Posting - ctrl + alt + f
      {
        title: 'Frequent Posting',
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        key: 'f',
        route: 'accounting/journal-entries/frequent-postings'
      },
      // Closure Entries - ctrl + alt + e
      {
        title: 'Closure Entries',
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        key: 'e',
        route: 'accounting/closing-entries'
      },
      // Journal Entry - ctrl + alt + j
      {
        title: 'Journal Entry',
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        key: 'j',
        route: 'accounting/journal-entries/create'
      },
      // Reports - ctrl + alt + r
      {
        title: 'Reports',
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        key: 'r',
        route: 'reports'
      },
      // Accounting - ctrl + alt + a
      {
        title: 'Accounting',
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        key: 'a',
        route: 'accounting'
      },
      // Save/Submit Forms - ctrl + alt + s
      {
        title: 'Save/Submit Forms',
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        key: 's',
        route: '',
        id: 'submit'
      },
      // Cancel - ctrl + alt + x
      {
        title: 'Cancel',
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        key: 'x',
        route: '',
        id: 'cancel'
      },
      // Help - ctrl + alt + h
      {
        title: 'Help',
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        key: 'h',
        route: '',
        id: 'help'
      },
      // Pagination: Next - ctrl + alt + n
      // {
      //   title: 'Pagination: Next',
      //   ctrlKey: true,
      //   shiftKey: false,
      //   altKey: true,
      //   key: 'n',
      //   route: ''
      // },
      // Pagination: Previous - ctrl + alt + p
      // {
      //   title: 'Pagination: Previous',
      //   ctrlKey: true,
      //   shiftKey: false,
      //   altKey: true,
      //   key: 'p',
      //   route: ''
      // },
      // Logout - ctrl + alt + o
      {
        title: 'Logout',
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        key: 'o',
        route: '',
        id: 'logout'
      }
    ];
  }

  get buttonCombinations() {
    return this.buttonsArray;
  }
}
