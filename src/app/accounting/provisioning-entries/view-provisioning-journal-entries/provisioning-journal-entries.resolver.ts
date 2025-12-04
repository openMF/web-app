/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/**
 * Provisioning journal entries data resolver.
 */
@Injectable()
export class ProvisioningJournalEntriesResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the provisioning journal entries data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    return this.accountingService.getProvisioningJournalEntries(id);
  }
}
