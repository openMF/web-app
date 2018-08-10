/** Angular Imports */
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

/** Custom Model */
import { Theme } from './theme.model';

/** Custom Services */
import { ThemeStorageService } from './theme-storage.service';

/**
 * Theme picker component.
 *
 * TODO: Customization of theme for every component and custom background with darker contrast.
 */
@Component({
  selector: 'mifosx-theme-picker',
  templateUrl: './theme-picker.component.html',
  styleUrls: ['./theme-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ThemePickerComponent implements OnInit {

  /** Default theme for the application. */
  currentTheme: Theme = {
    href: 'denim-yellowgreen.css',
    primary: '#1074B9',
    accent: '#B4D575',
    isDark: false,
    isDefault: true
  };
  /** Available themes for the application. */
  themes = [
    this.currentTheme,
    {
      href: 'pictonblue-yellowgreen.css',
      primary: '#1DAEEC',
      accent: '#B4D575',
      isDark: false
    },
    {
      href: 'indigo-pink.css',
      primary: '#3F51B5',
      accent: '#E91E63',
      isDark: false,
    },
    {
      href: 'deeppurple-amber.css',
      primary: '#673AB7',
      accent: '#FFC107',
      isDark: false
    },
    {
      href: 'pink-bluegrey.css',
      primary: '#E91E63',
      accent: '#607D8B',
      isDark: true
    },
    {
      href: 'purple-green.css',
      primary: '#9C27B0',
      accent: '#4CAF50',
      isDark: true
    }
  ];

  /**
   * @param {ThemeStorageService} themeStorageService Theme Storage Service.
   */
  constructor(public themeStorageService: ThemeStorageService) {  }

  /**
   * Initializes the theme for the application.
   */
  ngOnInit() {
    const theme = this.themeStorageService.getTheme();
    if (theme) {
      this.currentTheme = theme;
    }
  }

  /**
   * Installs a new theme for the application.
   * @param {Theme} theme
   */
  installTheme(theme: Theme) {
    this.currentTheme = theme;
    this.themeStorageService.installTheme(theme);
  }

}
