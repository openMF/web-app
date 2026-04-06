/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { ThemingService } from './theming.service';
import { SettingsService } from 'app/settings/settings.service';
import { MatIconButton } from '@angular/material/button';
import { M3IconComponent } from '../m3-ui/m3-icon/m3-icon.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIconButton,
    M3IconComponent
  ]
})
export class ThemeToggleComponent implements OnInit, OnChanges {
  private themingService = inject(ThemingService);
  private settingsService = inject(SettingsService);

  darkModeOn: boolean;

  ngOnInit(): void {
    this.darkModeOn = !!this.settingsService.themeDarkEnabled;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.darkModeOn = !!this.settingsService.themeDarkEnabled;
  }

  /**
   * Toggle between light and dark themes
   * This method handles the complete theme switching process:
   * 1. Toggles the local state
   * 2. Persists the preference to settings
   */
  toggleTheme() {
    // Step 1: Toggle the dark mode state
    this.darkModeOn = !this.darkModeOn;
    // Step 2: Persist the theme preference to localStorage via settings service
    this.settingsService.setThemeDarkEnabled(this.darkModeOn);
    this.themingService.setDarkMode(this.darkModeOn);
  }
}
