/** Angular Imports */
import { Injectable } from '@angular/core';

/** Environment Imports */
import { environment } from '../../environments/environment';

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
   * Sets server URL setting throughout the app.
   * @param {string} url URL
   */
  setServer(url: string) {
    localStorage.setItem('mifosXServerURL', JSON.stringify(url));
  }

  /**
   * Sets server URL setting throughout the app.
   * @param {string[]} list List of default servers
   */
  setServers(list: string[]) {
    localStorage.setItem('mifosXServers', JSON.stringify(list));
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
    return localStorage.getItem('mifosXLanguage');
  }

  /**
   * Returns list of default server
   */
  get servers() {
    return JSON.parse(localStorage.getItem('mifosXServers'));
  }

  /**
   * Returns server setting
   */
  get server() {
    return environment.baseApiUrl;
  }

}
