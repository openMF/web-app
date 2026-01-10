/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/**
 * Financial activity mappings template data resolver.
 */
@Injectable()
export class FinancialActivityMappingsTemplateResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the financial activity mappings template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getFinancialActivityAccountsTemplate();
  }
}
