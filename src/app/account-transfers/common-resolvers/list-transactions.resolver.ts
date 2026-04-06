/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountTransfersService } from '../account-transfers.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * View Standing Instructions resolver.
 */
@Injectable()
export class ListTransactionsResolver {
  private accountTransfersService = inject(AccountTransfersService);
  private settingsService = inject(SettingsService);

  /**
   * Returns the Standing Instructions Data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.parent.paramMap.get('standingInstructionsId');
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    return this.accountTransfersService.getStandingInstructionsTransactions(id, dateFormat, locale);
  }
}
