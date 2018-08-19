/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Provisioning categories data resolver.
 */
@Injectable()
export class ProvisioningCategoriesResolver implements Resolve<Object> {

  /**
   * @param {AccountingService} accountingService Accounting service.
   */
  constructor(private accountingService: AccountingService) {}

  /**
   * Returns the Provisioning categories data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getProvisioningCategories();
  }

}
