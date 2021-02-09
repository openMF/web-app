/** Angular Imports */
import { Injectable } from '@angular/core';

/** Translation Imports */
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

/** Custom Services */
import { Logger } from '../logger/logger.service';

/** Other Imports */
import * as en from '../../../assets/i18n/en.json';
import * as id from '../../../assets/i18n/id.json';

/** Initialize Logger */
const log = new Logger('I18nService');

/**
 * Pass-through function to mark a string for translation extraction.
 * Running `npm translations:extract` will include the given string by using this.
 * @param {string} s The string to extract for translation.
 * @return {string} The same string.
 */
export function extract(s: string) {
  return s;
}

@Injectable()
export class I18nService {

  /** Key to store current language of application in local storage. */
  private languageStorageKey = 'koppiKantorLanguage';

  defaultLanguage: string;
  supportedLanguages: string[];

  constructor(private translate: TranslateService) {
    // Embed languages to avoid extra HTTP requests
    translate.setTranslation('id', id);
    translate.setTranslation('en', en);
  }

  /**
   * Initializes i18n for the application.
   * Loads language from local storage if present, or sets default language.
   * @param {!string} defaultLanguage The default language to use.
   * @param {Array.<String>} supportedLanguages The list of supported languages.
   */
  init(defaultLanguage: string, supportedLanguages: string[]) {
    this.defaultLanguage = defaultLanguage;
    this.supportedLanguages = supportedLanguages;
    log.debug('supportedLanguages', supportedLanguages);
    this.language = '';


    log.debug(`defaultLanguage set to`, defaultLanguage);
    this.translate.use('id');

    this.translate.onLangChange
      .subscribe((event: LangChangeEvent) => { localStorage.setItem(this.languageStorageKey, event.lang); });
  }

  /**
   * Sets the current language.
   * Note: The current language is saved to the local storage.
   * If no parameter is specified, the language is loaded from local storage (if present).
   * @param {string} language The IETF language code to set.
   */
  set language(language: string) {
    language = language || localStorage.getItem(this.languageStorageKey) || this.translate.getBrowserCultureLang();
    let isSupportedLanguage = this.supportedLanguages.includes(language);

    // INFO: We don't support this. Onyl ID and EN.
    // If no exact match is found, search without the region
    // if (language && !isSupportedLanguage) {
    //   language = language.split('-')[0];
    //   language = this.supportedLanguages.find(supportedLanguage => supportedLanguage.startsWith(language)) || '';
    //   isSupportedLanguage = Boolean(language);
    // }

    // Fallback if language is not supported
    if (!isSupportedLanguage) {
      language = this.defaultLanguage;
    }

    this.translate.use(language);
    log.debug(`Language set to ${language}`);
  }

  /**
   * Gets the current language.
   * @return {string} The current language code.
   */
  get language(): string {
    return this.translate.currentLang;
  }

}
