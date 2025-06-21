/** Angular Imports */
import { Component } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Environment Imports */
import { environment } from '../../../environments/environment';

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
export class LanguageSelectorComponent implements OnInit {
  /** Language selector form control. */
  languageSelector = new UntypedFormControl();

  /**
   * Sets the language of the application in the selector on initial setup.
   * @param {TranslateService} translateService Translate Service.
   */
  constructor(
    private translateService: TranslateService,
    private settingsService: SettingsService
  ) {}

  /**
   * Initializes the language selector with the current language.
   */
  ngOnInit() {
    // Add a small delay to ensure translation service is fully initialized
    setTimeout(() => {
      const currentLang = this.currentLanguage;
      const availableLanguages = this.languages;

      // Only set the value if it exists in the available languages
      if (availableLanguages && availableLanguages.includes(currentLang)) {
        this.languageSelector.setValue(currentLang);
      } else if (availableLanguages && availableLanguages.length > 0) {
        // Fallback to the first available language if current language is not in the list
        const fallbackLang = availableLanguages.find((lang) => lang.startsWith('en')) || availableLanguages[0];
        this.languageSelector.setValue(fallbackLang);
        this.translateService.use(fallbackLang);
      }
    }, 100);
  }

  /**
   * Sets a new language to be used by the application.
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
    // Return the current language from translate service, or fall back to default language
    return this.translateService.currentLang || this.settingsService.language?.name || environment.defaultLanguage;
  }

  /**
   * Returns all the languages supported by the application.
   * @return {string[]} Supported languages.
   */
  get languages(): string[] {
    return this.translateService.getLangs();
  }
}
