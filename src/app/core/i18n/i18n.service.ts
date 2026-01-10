/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable } from '@angular/core';

/** Translation Imports */
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable()
export class I18nService {
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private translateService: TranslateService) {}

  public translate(key: string, params?: object): Observable<string> {
    return this.translateService.get(key, params);
  }
}
