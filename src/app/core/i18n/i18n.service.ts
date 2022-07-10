/** Angular Imports */
import { Injectable } from '@angular/core';

/** Translation Imports */
import { TranslateService } from '@ngx-translate/core';

/** Custom Services */
import { Logger } from '../logger/logger.service';

/** Initialize Logger */
const log = new Logger('I18nService');

/**
 * Pass-through function to mark a string for translation extraction.
 * Running `npm translations:extract` will include the given string by using this.
 * @param {string} s The string to extract for translation.
 * @return {string} The translated string.
 */
export function extract(s: string) {
  return I18nService.translate(s);
}

@Injectable()
export class I18nService {

  constructor(private translateService: TranslateService) { }

  public static translate(key: string): string {
    return key;
  }
}
