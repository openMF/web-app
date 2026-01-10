/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UsersServiceZitadel } from './usersZitadel.service';

/**
 * UsersZitadel data resolver.
 */

@Injectable()
export class UsersZitadelResolver {
  private usersServiceZitadel = inject(UsersServiceZitadel);

  /**
   * Returns the users data.
   * @returns {Observable<any>}
   */

  resolve(): Observable<any> {
    return this.usersServiceZitadel.getUsers();
  }
}
