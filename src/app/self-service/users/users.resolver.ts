/** Angular Routes */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UserService } from './user.service';

/** Custom Model */
import { User } from './user.model';

/**
 * Self service users data resolver.
 */
@Injectable()
export class UsersResolver implements Resolve<Object> {

  /**
   * @param {UserService} userService Self service user service.
   */
  constructor(private userService: UserService) {}

  /**
   * Returns the users data.
   * @returns {Observable<User[]>}
   */
  resolve(): Observable<User[]> {
    return this.userService.getUsers();
  }

}
