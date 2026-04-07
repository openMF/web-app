/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { RolesService } from '@fineract/client';

/**
 * Roles and Permission data resolver.
 */
@Injectable()
export class ViewRoleResolver {
  /**
   * @param {RolesService} rolesService Roles service.
   */
  constructor(private rolesService: RolesService) {}

  /**
   * Returns the roles and permissions data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    return this.rolesService.retrieveRole({ roleId: Number(id) });
  }
}
