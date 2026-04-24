/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProvisioningCategoryService } from '@fineract/client';

/**
 * Provisioning categories data resolver.
 */
@Injectable()
export class ProvisioningCategoriesResolver {
  /**
   * @param {ProvisioningCategoryService} provisioningCategoryService Provisioning Category service.
   */
  constructor(private provisioningCategoryService: ProvisioningCategoryService) {}

  /**
   * Returns the Provisioning categories data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.provisioningCategoryService.retrieveAll15();
  }
}
