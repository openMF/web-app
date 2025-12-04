/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/**
 * Provisioning entry entries data resolver.
 */
@Injectable()
export class ProvisioningEntryEntriesResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the provisioning entry entries data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const provisioningEntryId = route.paramMap.get('id');
    return this.accountingService.getProvisioningEntryEntries(provisioningEntryId);
  }
}
