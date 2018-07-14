import {Injectable, EventEmitter} from '@angular/core';

import { Theme } from './theme.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeStorageService {

  private themeStorageKey = 'mifosXTheme';
  onThemeUpdate: EventEmitter<Theme>;

  constructor() {
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

}
