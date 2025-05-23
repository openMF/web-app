/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Hooks template data resolver.
 */
@Injectable()
export class HooksTemplateResolver {
  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the hooks template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getHooksTemplate();
  }
}
