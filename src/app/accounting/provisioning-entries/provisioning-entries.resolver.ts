/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProvisioningEntriesService } from '@fineract/client';

/**
 * Provisioning entries data resolver.
 */
@Injectable()
export class ProvisioningEntriesResolver {
  /**
   * @param {ProvisioningEntriesService} provisioningEntriesService Provisioning entries service.
   */
  constructor(private provisioningEntriesService: ProvisioningEntriesService) {}

  /**
   * Returns the provisioning entries data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.provisioningEntriesService.retrieveAllProvisioningEntries();
  }
}
