/** Angular Imports */
import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { AlertService } from 'app/core/alert/alert.service';
// import { Dates } from 'app/core/utils/dates';

/** Environment Imports */
import { environment } from '../../environments/environment';

/**
 * Settings Service
 */
@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public static businessDateConfigName = 'enable_business_date';
  public static businessDateType = 'BUSINESS_DATE';
  public static cobDateType = 'COB_DATE';

  constructor(private alertService: AlertService,
    private dateUtils: DatePipe) { }

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

  setDefaultLanguage() {
    this.setLanguage({
      name: environment.defaultLanguage,
      code: environment.defaultLanguage.substring(0, 2)
    });
  }

  /**
   * Sets server URL setting throughout the app.
   * @param {string} url URL
   */
  setServer(url: string) {
    localStorage.setItem('mifosXServerURL', url);
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
    if (!localStorage.getItem('mifosXLanguage')) {
      this.setDefaultLanguage();
    }
    return JSON.parse(localStorage.getItem('mifosXLanguage'));
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
    if (localStorage.getItem('mifosXServerURL')) {
      return localStorage.getItem('mifosXServerURL');
    }
    return environment.baseApiUrl;
  }

  /**
   * Returns server url with api path and version
   */
  get serverUrl() {
    return this.server + environment.apiProvider + environment.apiVersion;
  }

  /**
   * Validate If the enable_business_date configuration is enabled or disabled.
   */
   validateBusinessDateStatus(configurations: any) {
    configurations.some((config: any) => {
      if (config.name === SettingsService.businessDateConfigName) {
        return config.enabled;
      }
    });
  }

  /**
   * Get the Business Date or COB Date.
   */
  getBusinessDates(businessDateData: any, dateType: string): void {
    businessDateData.some((data: any) => {
      if (data.type === dateType) {
        const dateVal = new Date(data.date);
        let message= this.dateUtils.transform(dateVal, this.dateFormat());
        this.alertService.alert({ type: dateType + ' Set',
          message: message});
        return;
      }
    });
  }

}
