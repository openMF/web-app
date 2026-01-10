/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * SMS Configuration data resolver.
 */
@Injectable()
export class SMSConfigurationResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the SMS Configuration data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getExternalConfiguration('SMS');
  }
}
