/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProvisioningEntriesService } from '@fineract/client';

/**
 * Provisioning entry entries data resolver.
 */
@Injectable()
export class ProvisioningEntryEntriesResolver {
  /**
   * @param {ProvisioningEntriesService} provisioningEntriesService Provisioning Entries service.
   */
  constructor(private provisioningEntriesService: ProvisioningEntriesService) {}

  /**
   * Returns the provisioning entry entries data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const provisioningEntryId = route.paramMap.get('id');
    return this.provisioningEntriesService.retrieveProviioningEntries({ entryId: Number(provisioningEntryId) });
  }
}
