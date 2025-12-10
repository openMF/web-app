/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Provisioning categories data resolver.
 */
@Injectable()
export class ProvisioningCategoriesResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the Provisioning categories data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getProvisioningCategories();
  }
}
