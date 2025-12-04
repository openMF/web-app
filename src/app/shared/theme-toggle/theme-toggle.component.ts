import { Component, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { ThemingService } from './theming.service';
import { SettingsService } from 'app/settings/settings.service';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIconButton,
    MatIcon
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

  toggleTheme() {
    this.darkModeOn = !this.darkModeOn;
    this.settingsService.setThemeDarkEnabled(this.darkModeOn);
    this.themingService.setDarkMode(this.darkModeOn);
  }
}
