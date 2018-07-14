import {Injectable, EventEmitter} from '@angular/core';

import { LocalStorage } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';

import { Theme } from './theme.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeStorageService {

  private themeStorageKey = 'mifosXTheme';
  onThemeUpdate: EventEmitter<Theme>;

  constructor(private localStorage: LocalStorage) {
    this.onThemeUpdate = new EventEmitter<Theme>();
  }

  storeTheme(mifosXTheme: Theme) {
    this.localStorage.setItem(this.themeStorageKey, mifosXTheme)
      .subscribe(() => this.onThemeUpdate.emit(mifosXTheme));
  }

  getTheme(): Observable<Theme> {
    return this.localStorage.getItem<Theme>(this.themeStorageKey);
  }

  clearTheme() {
    this.localStorage.removeItemSubscribe(this.themeStorageKey);
  }

}
