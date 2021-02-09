/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

/** Custom Services */
// import { I18nService } from '../../core/i18n/i18n.service';

/**
 * Language selector component.
 *
 * TODO: Decision to be taken on using ngx-translate or angular-internationalization
 *       to provide language support in the application.
 */
@Component({
  selector: 'mifosx-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent implements OnInit {

  /** Language selector form control. */
  languageSelector = new FormControl();

  // /**
  //  * Sets the language of the application in the selector on initial setup.
  //  * @param {I18nService} i18nService Internationalization Service.
  //  */
  constructor() {
    this.languageSelector.setValue(this.currentLanguage);
    console.log('[LanguageSelector] currentLanguage', this.currentLanguage);
  }

  ngOnInit() {
    // console.log('[LanguageSelector] i18nService.language', this.i18nService.language);
  }

  /**
   * Sets a new language to be used by the application.
   * @param {string} language New language.
   */
  setLanguage(language: any) {
    // this.i18nService.language = language;
  }

  /**
   * Returns the current language used by the application.
   * @returns {string} Current language.
   */
  get currentLanguage(): string {
    // return this.i18nService.language;
    return 'id';
  }

  /**
   * Returns all the languages supported by the application.
   * @return {string[]} Supported languages.
   */
  get languages(): string[] {
    return ['id'];
    // return this.i18nService.supportedLanguages;
  }

}
