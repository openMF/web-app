import { Pipe, PipeTransform, inject, OnDestroy } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import moment from 'moment';

// Load moment.js locale data for all supported languages
import 'moment/locale/ne'; // Nepali
import 'moment/locale/es'; // Spanish
import 'moment/locale/de'; // German
import 'moment/locale/fr'; // French
import 'moment/locale/it'; // Italian
import 'moment/locale/ko'; // Korean
import 'moment/locale/lt'; // Lithuanian
import 'moment/locale/lv'; // Latvian
import 'moment/locale/pt'; // Portuguese
import 'moment/locale/sw'; // Swahili
import 'moment/locale/cs'; // Czech

@Pipe({ name: 'dateFormat', pure: false })
export class DateFormatPipe implements PipeTransform, OnDestroy {
  private settingsService = inject(SettingsService);
  private translateService = inject(TranslateService);
  private onLangChange: Subscription;

  constructor() {
    // Subscribe to language changes so Angular re-evaluates the pipe when language switches
    this.onLangChange = this.translateService.onLangChange.subscribe(() => {
      // No body needed; impure pipe will be re-run during change detection
    });
  }

  ngOnDestroy(): void {
    if (this.onLangChange) {
      this.onLangChange.unsubscribe();
    }
  }

  transform(value: any, dateFormat?: string): any {
    const defaultDateFormat = this.settingsService.dateFormat.replace('dd', 'DD');
    if (typeof value === 'undefined' || value === null) {
      return '';
    }

    // Map SettingsService language code to a moment.js locale identifier
    const langCode = this.settingsService.language.code;
    let momentLocale: string;

    if (!langCode) {
      momentLocale = 'en';
    } else if (langCode.includes('-')) {
      // Convert codes like 'ne-NE' or 'es-MX' to base language 'ne', 'es'
      momentLocale = langCode.split('-')[0];
    } else {
      momentLocale = langCode;
    }

    moment.locale(momentLocale);

    let dateVal;
    if (Array.isArray(value)) {
      // Backend sometimes returns [yyyy, MM, dd]
      dateVal = moment(value.join('-'), 'YYYY-MM-DD');
    } else {
      dateVal = moment(value);
    }

    if (!dateVal.isValid()) {
      return '';
    }

    if (!dateFormat) {
      return dateVal.format(defaultDateFormat);
    }

    return dateVal.format(dateFormat);
  }
}
