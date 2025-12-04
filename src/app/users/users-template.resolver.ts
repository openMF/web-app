/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UsersService } from './users.service';

/**
 * Users template data resolver.
 */
@Injectable()
export class UsersTemplateResolver {
  private usersService = inject(UsersService);

  /**
   * Returns the users template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.usersService.getUsersTemplate();
  }
}
