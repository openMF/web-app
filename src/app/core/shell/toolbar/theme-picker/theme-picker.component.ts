import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Theme } from './theme.model';
import { ThemeManagerService } from './theme-manager.service';
import { ThemeStorageService } from './theme-storage.service';

@Component({
  selector: 'mifosx-theme-picker',
  templateUrl: './theme-picker.component.html',
  styleUrls: ['./theme-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ThemePickerComponent implements OnInit {

  currentTheme: Theme = {
    href: 'indigo-pink.css',
    primary: '#3F51B5',
    accent: '#E91E63',
    isDark: false,
    isDefault: true
  };
  themes = [
    this.currentTheme,
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
    },
    {
      href: 'denim-yellowgreen.css',
      primary: '#1074B9',
      accent: '#B4D575',
      isDark: false
    },
    {
      href: 'pictonblue-yellowgreen.css',
      primary: '#1DAEEC',
      accent: '#B4D575',
      isDark: false
    }
  ];

  constructor(public themeManagerService: ThemeManagerService,
              private themeStorageService: ThemeStorageService) {
    this.themeStorageService.getTheme().subscribe((theme) => {
      this.installTheme(theme);
    });
  }

  ngOnInit() { }

  installTheme(theme: Theme) {
    if (theme) {
      this.currentTheme = theme;
    }
    if (this.currentTheme.isDefault) {
      this.themeManagerService.removeTheme();
    } else {
      this.themeManagerService.setTheme(`theme/${this.currentTheme.href}`);
    }
    this.themeStorageService.storeTheme(this.currentTheme);
  }

}
