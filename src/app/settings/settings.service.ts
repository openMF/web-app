import { Injectable } from '@angular/core';
import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { safeParse, safeParseArray, safeParseObject } from 'app/core/utils/json';

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
  public static businessDateConfigName = 'enable-business-date';
  public static businessDateType = 'BUSINESS_DATE';
  public static cobDateType = 'COB_DATE';
  minAllowedDate = new Date(1950, 0, 1);
  maxAllowedDate = new Date(2100, 0, 1);

  // Fallback in-memory storage for incognito mode
  private memoryStorage: { [key: string]: string } = {};

  constructor(
    private alertService: AlertService,
    private dateUtils: Dates
  ) {}

  // Helper to safely set item
  private setStorageItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Fallback to memory in incognito/private mode
      this.memoryStorage[key] = value;
    }
  }

  // Helper to safely get item
  private getStorageItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return this.memoryStorage[key] || null;
    }
  }

  /**
   * Sets date format setting throughout the app.
   * @param {string} dateFormat Date Format
   */
  setDateFormat(dateFormat: string) {
    this.setStorageItem('mifosXDateFormat', JSON.stringify(dateFormat));
  }

  /**
   * Sets language setting throughout the app.
   * @param {any} language Language.
   */
  setLanguage(language: { name: string; code: string }) {
    this.setStorageItem('mifosXLanguage', JSON.stringify(language));
  }

  /**
   * Sets decimals to Display throughout the app.
   * @param {string} decimals.
   */
  setDecimalToDisplay(decimals: string) {
    this.setStorageItem('mifosXDecimalsToDisplay', decimals);
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
    this.setStorageItem('mifosXServerURL', url);
  }

  /**
   * Sets server URL setting throughout the app.
   * @param {string[]} list List of default servers
   */
  setServers(list: string[]) {
    this.setStorageItem('mifosXServers', JSON.stringify(list));
  }

  /**
   * Sets Tenant Identifiers list setting throughout the app.
   * @param {string[]} list List of default tenants
   */
  setTenantIdentifiers(list: string[]) {
    this.setStorageItem('mifosXTenantIdentifiers', JSON.stringify(list));
  }

  /**
   * Sets Tenant Identifier setting throughout the app.
   * @param {string} Tenant Identifier
   */
  setTenantIdentifier(tenantIdentifier: string) {
    this.setStorageItem('mifosXTenantIdentifier', tenantIdentifier);
  }

  /**
   * Sets server Date setting for max datepicker, default today
   * @param {string} date
   */
  setBusinessDate(date: string) {
    this.setStorageItem('mifosXServerDate', date);
  }

  /**
   * Sets server Date config is enabled
   * @param {string} enabled
   */
  setBusinessDateConfig(enabled: string) {
    this.setStorageItem('mifosXServerBusinessDateEnabled', enabled);
  }

  setThemeDarkEnabled(enabled: boolean) {
    this.setStorageItem('mifosXThemeDarkEnabled', JSON.stringify(enabled));
  }

  // --- GETTERS ---

  get dateFormat(): string {
    const item = this.getStorageItem('mifosXDateFormat');
    const parsed = safeParse<string | null>(item, null);
    return typeof parsed === 'string' && parsed.length > 0 ? parsed : 'dd MMMM yyyy';
  }

  get language(): { name: string; code: string } | undefined {
    const item = this.getStorageItem('mifosXLanguage');
    if (!item) {
      const defaultLanguage = environment.defaultLanguage || 'en-US';
      const lang = {
        name: defaultLanguage,
        code: defaultLanguage.substring(0, 2)
      };
      this.setLanguage(lang); // persist if possible
      return lang;
    }
    return safeParseObject<{ name: string; code: string } | undefined>(item, undefined);
  }

  get languageCode() {
    const lang = this.language;
    if (!lang || !lang.code) return 'en-US';
    const code = lang.code;
    if (code === 'es') return 'es-MX';
    if (code === 'en') return 'en-US';
    return code + '-' + code.toUpperCase();
  }

  get decimals() {
    return this.getStorageItem('mifosXDecimalsToDisplay') || '2';
  }

  get servers() {
    return safeParseArray<string>(this.getStorageItem('mifosXServers'), []);
  }

  get server() {
    const stored = this.getStorageItem('mifosXServerURL');
    if (stored) return stored;
    if (environment.baseApiUrl && environment.baseApiUrl !== '') {
      return environment.baseApiUrl;
    }
    const servers = this.servers;
    return servers.length > 0 ? servers[0] : '';
  }

  get baseServerUrl() {
    return this.server + environment.apiProvider;
  }

  get serverUrl() {
    return this.server + environment.apiProvider + environment.apiVersion;
  }

  get serverHost() {
    return this.server;
  }

  get businessDate(): Date {
    const dateStr = this.getStorageItem('mifosXServerDate');
    return this.dateUtils.convertToDate(dateStr, SettingsService.businessDateFormat);
  }

  get businessDateConfig(): string | null {
    return this.getStorageItem('mifosXServerBusinessDateEnabled');
  }

  get minPastDate(): Date {
    return this.minAllowedDate;
  }

  get maxFutureDate(): Date {
    return this.maxAllowedDate;
  }

  get tenantIdentifiers() {
    return safeParseArray<string>(this.getStorageItem('mifosXTenantIdentifiers'), []);
  }

  get tenantIdentifier(): string | null {
    return this.getStorageItem('mifosXTenantIdentifier');
  }

  get themeDarkEnabled(): boolean {
    const item = this.getStorageItem('mifosXThemeDarkEnabled');
    return safeParse<boolean>(item, false);
  }

  /**
   * Validate If the enable_business_date configuration is enabled or disabled.
   */
  validateBusinessDateStatus(configurations: any) {
    return configurations.some((config: any) => {
      if (config.name === SettingsService.businessDateConfigName) {
        return config.enabled;
      }
      return false;
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
        this.alertService.alert({
          type: dateType + ' Set',
          message: this.dateUtils.formatDate(dateVal, this.dateFormat)
        });
        return true;
      }
      return false;
    });
  }
}
