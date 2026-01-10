/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/**
 * Payment Types data resolver.
 */
@Injectable()
export class PaymentTypesResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the payment types data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const paymentTypeId = route.paramMap.get('id');
    if (paymentTypeId) {
      return this.organizationService.getPaymentType(paymentTypeId);
    } else {
      return this.organizationService.getPaymentTypes();
    }
  }
}
