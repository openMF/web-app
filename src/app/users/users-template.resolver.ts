/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UsersService } from './users.service';

/**
 * Users template data resolver.
 */
@Injectable()
export class UsersTemplateResolver implements Resolve<Object> {

  /**
   * @param {UsersService} usersService Users service.
   */
  constructor(private usersService: UsersService) {}

  /**
   * Returns the users template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.usersService.getUsersTemplate();
  }

}
