/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from 'app/settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class ThemingService {
  private settingsService = inject(SettingsService);

  private darkModeOn = false;

  themes = [
    'dark-theme',
    'light-theme'
  ]; // <- list all themes in this array
  theme = new BehaviorSubject('light-theme'); // <- initial theme

  constructor() {
    this.setInitialDarkMode();
  }

  isDarkMode(): boolean {
    return this.darkModeOn;
  }

  setDarkMode(isDarkMode: boolean) {
    this.darkModeOn = isDarkMode;
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      this.theme.next('dark-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      this.theme.next('light-theme');
    }
  }

  setInitialDarkMode(): void {
    this.setDarkMode(!!this.settingsService.themeDarkEnabled);
  }
}
