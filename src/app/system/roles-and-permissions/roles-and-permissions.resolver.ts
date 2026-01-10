/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Roles and Permissions data resolver.
 */
@Injectable()
export class RolesAndPermissionsResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the roles and permissions data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getRoles();
  }
}
