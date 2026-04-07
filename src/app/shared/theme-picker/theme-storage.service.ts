import { Injectable, EventEmitter } from '@angular/core';
import { Theme } from './theme.model';
import { ThemeManagerService } from './theme-manager.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeStorageService {
  private themeStorageKey = 'mifosXTheme';
  onThemeUpdate: EventEmitter<Theme>;

  constructor(public themeManagerService: ThemeManagerService) {
    this.onThemeUpdate = new EventEmitter<Theme>();
  }

  storeTheme(mifosXTheme: Theme) {
    localStorage.setItem(this.themeStorageKey, JSON.stringify(mifosXTheme));
    this.onThemeUpdate.emit(mifosXTheme);
  }

  getTheme(): Theme {
    return JSON.parse(localStorage.getItem(this.themeStorageKey));
  }

  clearTheme() {
    localStorage.removeItem(this.themeStorageKey);
  }

  /**
   * Dynamically installs the theme by adding a class to the body.
   * @param {Theme} theme
   */
  installTheme(theme: Theme) {
    const body = document.body;

    // Remove any previously applied theme classes
    body.classList.remove(
      'pictonblue-yellowgreen-theme',
      'indigo-pink-theme',
      'deeppurple-amber-theme',
      'pink-bluegrey-theme',
      'purple-green-theme'
    );

    if (!theme.isDefault) {
      body.classList.add(this.getThemeClass(theme.href));
    }

    this.storeTheme(theme);
  }

  /**
   * Maps theme file names to their respective CSS class.
   * @param themeHref The theme file name.
   * @returns The CSS class name for the theme.
   */
  private getThemeClass(themeHref: string): string {
    switch (themeHref) {
      case 'pictonblue-yellowgreen.css':
        return 'pictonblue-yellowgreen-theme';
      case 'indigo-pink.css':
        return 'indigo-pink-theme';
      case 'deeppurple-amber.css':
        return 'deeppurple-amber-theme';
      case 'pink-bluegrey.css':
        return 'pink-bluegrey-theme';
      case 'purple-green.css':
        return 'purple-green-theme';
      default:
        return '';
    }
  }
}
