/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { PermissionsService } from '@fineract/client';

/**
 * Maker Checker Tasks resolver.
 */
@Injectable()
export class MakerCheckerTasksResolver {
  /**
   * @param {PermissionsService} permissionsService Permissions Service.
   */
  constructor(private permissionsService: PermissionsService) {}

  /**
   * Returns all the Configurable Maker Checker Tasks.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.permissionsService.retrieveAllPermissions();
  }
}
