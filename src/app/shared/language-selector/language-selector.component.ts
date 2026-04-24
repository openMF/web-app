/** Angular Imports */
import { Component } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Language selector component.
 *
 * TODO: Decision to be taken on using ngx-translate or angular-internationalization
 *       to provide language support in the application.
 */
@Component({
  selector: 'mifosx-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class LanguageSelectorComponent {
  /** Language selector form control. */
  languageSelector = new UntypedFormControl();

  /**
   * Sets the language of the application in the selector on initial setup.
   * @param {TranslateService} translateService Translate Service.
   */
  constructor(
    private translateService: TranslateService,
    private settingsService: SettingsService
  ) {
    this.languageSelector.setValue(this.currentLanguage);
  }

  /**
   * Sets a new language to be used by the application.
   * @param {string} language New language.
   */
  setLanguage() {
    this.translateService.use(this.languageSelector.value);
    this.settingsService.setLanguage({ name: '', code: this.languageSelector.value.substring(0, 2) });
  }

  /**
   * Returns the current language used by the application.
   * @returns {string} Current language.
   */
  get currentLanguage(): string {
    return this.translateService.currentLang;
  }

  /**
   * Returns all the languages supported by the application.
   * @return {string[]} Supported languages.
   */
  get languages(): string[] {
    return this.translateService.getLangs();
  }
}
