/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UsersServiceZitadel } from './usersZitadel.service';
/**
 * Users template data resolver.
 */
@Injectable()
export class UsersZitadelTemplateResolver {
  /**
   * @param { UsersServiceZitadel } usersServiceZitadel Users service.
   */
  constructor(private usersServiceZitadel: UsersServiceZitadel) {}

  /**
   * Returns the users template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.usersServiceZitadel.getUsersTemplate();
  }
}
