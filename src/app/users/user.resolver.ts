/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UsersService } from './users.service';

/**
 * User data resolver.
 */
@Injectable()
export class UserResolver implements Resolve<Object> {

  /**
   * @param {UsersService} usersService Users service.
   */
  constructor(private usersService: UsersService) {}

  /**
   * Returns the user data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const userId = route.paramMap.get('id');
    return this.usersService.getUser(userId);
  }
}
