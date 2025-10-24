/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** Translation Imports */
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private translateService = inject(TranslateService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  public translate(key: string, params?: object): Observable<string> {
    return this.translateService.get(key, params);
  }
}
