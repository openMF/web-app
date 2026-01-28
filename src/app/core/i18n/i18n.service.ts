/** Angular Imports */
import { Injectable } from '@angular/core';

/** Translation Imports */
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable()
export class I18nService {
  constructor(private translateService: TranslateService) {}

  public translate(key: string, params?: object): Observable<string> {
    return this.translateService.get(key, params);
  }
}
