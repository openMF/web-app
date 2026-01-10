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
import { LoansService } from '../loans.service';

/**
 * GLIM Account data resolver.
 */
@Injectable()
export class GLIMViewResolver {
  private loansService = inject(LoansService);

  /**
   * Returns the Savings Account data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const groupId = route.paramMap.get('groupId');
    const glimId = route.paramMap.get('glimId');
    return this.loansService.getGLIMAccountData(glimId, groupId);
  }
}
