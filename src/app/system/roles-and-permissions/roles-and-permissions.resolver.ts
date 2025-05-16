/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Roles and Permissions data resolver.
 */
@Injectable()
export class RolesAndPermissionsResolver {
  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the roles and permissions data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getRoles();
  }
}
