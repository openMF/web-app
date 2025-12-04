/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/**
 * Provisioning entry data resolver.
 */
@Injectable()
export class ProvisioningEntryResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the provisioning entry data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const provisioningEntryId = route.paramMap.get('id');
    return this.accountingService.getProvisioningEntry(provisioningEntryId);
  }
}
