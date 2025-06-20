import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
  darkModeOn: boolean;

  constructor(
    private themingService: ThemingService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.darkModeOn = this.settingsService.themeDarkEnabled === 'true';
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.darkModeOn = this.settingsService.themeDarkEnabled === 'true';
  }

  toggleTheme() {
    this.darkModeOn = !this.darkModeOn;
    this.settingsService.setThemeDarkEnabled(this.darkModeOn ? 'true' : 'false');
    this.themingService.setDarkMode(this.darkModeOn);
  }
}
