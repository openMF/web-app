/** Angular Imports */
import { Injectable } from '@angular/core';

/**
 * Settings Service
 */
@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() { }

  /**
   * Sets date format setting throughout the app.
   * @param {string} dateFormat Date Format
   */
  setDateFormat(dateFormat: string) {
    localStorage.setItem('mifosXDateFormat', JSON.stringify(dateFormat));
  }

  /**
   * Sets language setting throughout the app.
   * @param {any} language Language.
   */
  setLanguage(language: { name: string, code: string }) {
    localStorage.setItem('mifosXLanguage', JSON.stringify(language));
  }

  /**
   * Returns date format setting.
   */
  get dateFormat() {
    return JSON.parse(localStorage.getItem('mifosXDateFormat'));
  }

  /**
   * Returns language setting
   */
  get language() {
    return JSON.parse(localStorage.getItem('mifosXLanguage'));
  }

}
