/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Also read by the script at the top of index.html. */
const THEME_KEY = 'mifosXTheme';

/**
 * Single owner of the light/dark theme. The top-bar switch saves the choice in localStorage, so a refresh, a new tab
 * or signing in again keeps it; with nothing saved the app starts light. The OS colour scheme is ignored
 * (following it is what used to switch the app to dark after cancelling the print dialog).
 * Printing always uses the light theme. index.html applies the saved class before the app loads, to avoid a flash.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemingService {
  theme = new BehaviorSubject('light-theme');

  constructor() {
    this.setDarkMode(localStorage.getItem(THEME_KEY) === 'dark-theme', false);

    window.addEventListener('beforeprint', () => document.body.classList.remove('dark-theme'));
    window.addEventListener('afterprint', () => document.body.classList.toggle('dark-theme', this.isDark));
  }

  get isDark(): boolean {
    return this.theme.value === 'dark-theme';
  }

  setDarkMode(isDarkMode: boolean, save = true) {
    if (save) {
      localStorage.setItem(THEME_KEY, isDarkMode ? 'dark-theme' : 'light-theme');
    }
    document.body.classList.toggle('dark-theme', isDarkMode);
    document.body.classList.toggle('light-theme', !isDarkMode);
    this.theme.next(isDarkMode ? 'dark-theme' : 'light-theme');
  }
}
