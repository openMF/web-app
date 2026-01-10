/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UsersService } from './users.service';

/**
 * Users data resolver.
 */
@Injectable()
export class UsersResolver {
  private usersService = inject(UsersService);

  /**
   * Returns the users data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.usersService.getUsers();
  }
}
