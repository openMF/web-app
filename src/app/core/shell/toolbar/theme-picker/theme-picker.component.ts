import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Theme } from './theme.model';
import { ThemeStorageService } from './theme-storage.service';

@Component({
  selector: 'mifosx-theme-picker',
  templateUrl: './theme-picker.component.html',
  styleUrls: ['./theme-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ThemePickerComponent implements OnInit {

  currentTheme: Theme = {
    href: 'denim-yellowgreen.css',
    primary: '#1074B9',
    accent: '#B4D575',
    isDark: false,
    isDefault: true
  };
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
    { // TODO: Remove Dark Themes
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

  constructor(public themeStorageService: ThemeStorageService) {  }

  ngOnInit() {
    const theme = this.themeStorageService.getTheme();
    if (theme) {
      this.currentTheme = theme;
    }
  }

  installTheme(theme: Theme) {
    this.currentTheme = theme;
    this.themeStorageService.installTheme(theme);
  }

}
