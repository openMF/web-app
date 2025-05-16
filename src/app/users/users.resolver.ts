/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UsersService } from './users.service';

/**
 * Users data resolver.
 */
@Injectable()
export class UsersResolver {
  /**
   * @param {UsersService} usersService Users service.
   */
  constructor(private usersService: UsersService) {}

  /**
   * Returns the users data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.usersService.getUsers();
  }
}
