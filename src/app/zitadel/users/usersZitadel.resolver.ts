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

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {UsersServiceZitadel} usersServiceZitadel Users service.
   */
  constructor() {}

  /**
   * Returns the users data.
   * @returns {Observable<any>}
   */

  resolve(): Observable<any> {
    return this.usersServiceZitadel.getUsers();
  }
}
