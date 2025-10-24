/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Maker Checker Tasks resolver.
 */
@Injectable()
export class MakerCheckerTasksResolver {
  private systemService = inject(SystemService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {SystemService} systemService System service.
   */
  constructor() {}

  /**
   * Returns all the Configurable Maker Checker Tasks.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getMakerCheckerPermissions();
  }
}
