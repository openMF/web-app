/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SavingsService } from '../savings.service';

@Injectable({
  providedIn: 'root'
})
export class SavingNotesResolver {
  private savingsService = inject(SavingsService);

  /**
   * Returns the Savings data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingAccountId = route.parent.paramMap.get('savingAccountId');
    return this.savingsService.getSavingsNotes(savingAccountId);
  }
}
