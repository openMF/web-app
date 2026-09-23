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

  themes = [
    'dark-theme',
    'light-theme'
  ];
  theme = new BehaviorSubject('light-theme');

  private darkModeOn = false;

  constructor() {
    this.setDarkMode(!!this.settingsService.themeDarkEnabled);
  }

  isDarkMode(): boolean {
    return this.darkModeOn;
  }

  setDarkMode(isDarkMode: boolean) {
    this.darkModeOn = isDarkMode;
    document.body.classList.toggle('dark-theme', isDarkMode);
    document.body.classList.toggle('light-theme', !isDarkMode);
    this.theme.next(isDarkMode ? 'dark-theme' : 'light-theme');
  }

  setInitialDarkMode(): void {
    this.setDarkMode(this.darkModeOn);
  }
}
