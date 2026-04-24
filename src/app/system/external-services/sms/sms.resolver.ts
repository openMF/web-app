/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ExternalServicesService } from '@fineract/client';

/**
 * SMS Configuration data resolver.
 */
@Injectable()
export class SMSConfigurationResolver {
  /**
   * @param {ExternalServicesService} externalServicesService External services service.
   */
  constructor(private externalServicesService: ExternalServicesService) {}

  /**
   * Returns the SMS Configuration data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.externalServicesService.retrieveOne2({ servicename: 'SMS' });
  }
}
