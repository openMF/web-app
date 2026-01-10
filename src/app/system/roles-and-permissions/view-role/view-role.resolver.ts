/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Roles and Permission data resolver.
 */
@Injectable()
export class ViewRoleResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the roles and permissions data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    return this.systemService.getRole(id);
  }
}
