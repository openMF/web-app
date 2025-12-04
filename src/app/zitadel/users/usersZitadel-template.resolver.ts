/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UsersServiceZitadel } from './usersZitadel.service';
/**
 * Users template data resolver.
 */
@Injectable()
export class UsersZitadelTemplateResolver {
  private usersServiceZitadel = inject(UsersServiceZitadel);

  /**
   * Returns the users template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.usersServiceZitadel.getUsersTemplate();
  }
}
