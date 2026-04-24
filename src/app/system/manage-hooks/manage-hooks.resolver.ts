/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { HooksService } from '@fineract/client';

/**
 * Manage hooks data resolver.
 */
@Injectable()
export class ManageHooksResolver {
  /**
   * @param {HooksService} hooksService Hooks service.
   */
  constructor(private hooksService: HooksService) {}

  /**
   * Returns the hooks data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.hooksService.retrieveHooks();
  }
}
