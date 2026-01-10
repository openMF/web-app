/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UsersService } from './users.service';

/**
 * User data resolver.
 */
@Injectable()
export class UserResolver {
  private usersService = inject(UsersService);

  /**
   * Returns the user data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const userId = route.paramMap.get('id');
    return this.usersService.getUser(userId);
  }
}
