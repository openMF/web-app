/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Codes data resolver.
 */
@Injectable()
export class CodesResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Codes data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getCodes();
  }
}
