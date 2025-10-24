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

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param { UsersServiceZitadel } usersServiceZitadel Users service.
   */
  constructor() {}

  /**
   * Returns the users template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.usersServiceZitadel.getUsersTemplate();
  }
}
