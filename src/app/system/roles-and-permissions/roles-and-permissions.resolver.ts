/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { RolesService } from '@fineract/client';

/**
 * Roles and Permissions data resolver.
 */
@Injectable()
export class RolesAndPermissionsResolver {
  /**
   * @param {RolesService} rolesService Roles service.
   */
  constructor(private rolesService: RolesService) {}

  /**
   * Returns the roles and permissions data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.rolesService.retrieveAllRoles();
  }
}
