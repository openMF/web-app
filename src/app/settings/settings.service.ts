/** Angular Imports */
import { Injectable } from '@angular/core';
import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';

/** Environment Imports */
import { environment } from '../../environments/environment';

/**
 * Settings Service
 */
@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public static businessDateFormat = 'yyyy-MM-dd';
  public static businessDateConfigName = 'enable_business_date';
  public static businessDateType = 'BUSINESS_DATE';
  public static cobDateType = 'COB_DATE';
  minAllowedDate = new Date(1950, 0, 1);
  maxAllowedDate = new Date(2100, 0, 1);

  constructor(private alertService: AlertService,
    private dateUtils: Dates) { }

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
   * Sets decimals to Display throughout the app.
   * @param {string} decimals.
   */
  setDecimalToDisplay(decimals: string) {
    localStorage.setItem('mifosXDecimalsToDisplay', decimals);
  }

  setDefaultLanguage() {
    const defaultLanguage = environment.defaultLanguage ? environment.defaultLanguage : 'en-US';
    this.setLanguage({
      name: defaultLanguage,
      code: defaultLanguage.substring(0, 2)
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
   * Sets Tenant Identifiers list setting throughout the app.
   * @param {string[]} list List of default tenants
   */
  setTenantIdentifiers(list: string[]) {
    localStorage.setItem('mifosXTenantIdentifiers', JSON.stringify(list));
  }

  /**
   * Sets Tenant Identifier setting throughout the app.
   * @param {string} Tenant Identifier
   */
  setTenantIdentifier(tenantIdentifier: string) {
    localStorage.setItem('mifosXTenantIdentifier', tenantIdentifier);
  }

  /**
   * Sets server Date setting for max datepicker, default today
   * @param {string} date
   */
  setBusinessDate(date: string) {
    localStorage.setItem('mifosXServerDate', date);
  }

  /**
   * Sets server Date config is enabled
   * @param {string} enabled
   */
  setBusinessDateConfig(enabled: string) {
    localStorage.setItem('mifosXServerBusinessDateEnabled', enabled);
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
   * Returns Decimals to Display setting
   */
  get decimals() {
    if (!localStorage.getItem('mifosXDecimalsToDisplay')) {
      return '2';
    }
    return localStorage.getItem('mifosXDecimalsToDisplay');
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
   * Returns server url with api path without version
   */
  get baseServerUrl() {
    return this.server + environment.apiProvider;
  }

  /**
   * Returns server url with api path and version
   */
  get serverUrl() {
    return this.server + environment.apiProvider + environment.apiVersion;
  }

  /**
   * Returns server url with api path and version
   */
  get serverHost() {
    return this.server;
  }

  /**
   * Returns current Business date server
   */
  get businessDate(): Date {
    return this.dateUtils.convertToDate(localStorage.getItem('mifosXServerDate'), SettingsService.businessDateFormat);
  }

  /**
   * Returns current Business date Config if it's enabled
   */
  get businessDateConfig(): any {
    return localStorage.getItem('mifosXServerBusinessDateEnabled');
  }

  /**
   * Returns min Past date
   */
  get minPastDate(): Date {
    return this.minAllowedDate;
  }

  /**
   * Returns max Future date
   */
  get maxFutureDate(): Date {
    return this.maxAllowedDate;
  }

  /**
   * Returns list of Tenant Identifiers
   */
  get tenantIdentifiers(): any {
    return JSON.parse(localStorage.getItem('mifosXTenantIdentifiers'));
  }

  /**
   * Returns Tenant Identifier
   */
  get tenantIdentifier(): string {
    return localStorage.getItem('mifosXTenantIdentifier');
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
        this.setBusinessDate(this.dateUtils.formatDate(dateVal, SettingsService.businessDateFormat));
        this.alertService.alert({ type: dateType + ' Set',
          message: this.dateUtils.formatDate(dateVal, this.dateFormat())});
        return;
      }
    });
  }
}
