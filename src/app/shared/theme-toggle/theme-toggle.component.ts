/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemingService } from './theming.service';
import { SettingsService } from 'app/settings/settings.service';
import { MatTooltip } from '@angular/material/tooltip';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ThrIconComponent } from 'app/shared/thr-icon/thr-icon.component';

@Component({
  selector: 'mifosx-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    ThrIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeToggleComponent implements OnInit {
  private themingService = inject(ThemingService);
  private settingsService = inject(SettingsService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  darkModeOn = false;

  /** Translation key describing the theme the toggle will switch to. */
  get themeToggleLabel(): string {
    return this.darkModeOn ? 'tooltips.Switch to light theme' : 'tooltips.Switch to dark theme';
  }

  ngOnInit(): void {
    this.syncFromTheme();
    this.themingService.theme.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.syncFromTheme();
    });
  }

  toggleTheme() {
    const nextDark = !this.darkModeOn;
    this.settingsService.setThemeDarkEnabled(nextDark);
    this.themingService.setDarkMode(nextDark);
  }

  private syncFromTheme(): void {
    this.darkModeOn = this.themingService.isDarkMode();
    this.cdr.markForCheck();
  }
}
