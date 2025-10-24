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

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {UsersServiceZitadel} usersServiceZitadel Users service.
   */
  constructor() {}

  /**
   * Returns the user data.
   * @returns {Observable<any>}
   */

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const userId = route.paramMap.get('id');
    return this.usersServiceZitadel.getUser(userId);
  }
}
