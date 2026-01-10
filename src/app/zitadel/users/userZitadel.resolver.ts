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
import { UsersServiceZitadel } from './usersZitadel.service';

/**
 * UsersZitadel data resolver.
 */
@Injectable()
export class UserZitadelResolver {
  private usersServiceZitadel = inject(UsersServiceZitadel);

  /**
   * Returns the user data.
   * @returns {Observable<any>}
   */

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const userId = route.paramMap.get('id');
    return this.usersServiceZitadel.getUser(userId);
  }
}
