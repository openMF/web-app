/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Manage hooks data resolver.
 */
@Injectable()
export class ManageHooksResolver {
  private systemService = inject(SystemService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {SystemService} systemService System service.
   */
  constructor() {}

  /**
   * Returns the hooks data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getHooks();
  }
}
