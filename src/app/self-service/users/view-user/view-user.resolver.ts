/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */

/** Custom Model */
import { User } from '../user.model';
import { UsersService } from 'app/users/users.service';

/**
 * View self service user data resolver.
 */
@Injectable()
export class ViewUserResolver implements Resolve<Object> {

  /**
   * @param {UserService} userService Self service user service.
   */
  constructor(private userService: UsersService) {}

  /**
   * Returns the user data.
   * @returns {Observable<User>}
   */
  resolve(): Observable<User> {
    return this.userService.getUser('1');
  }

}
