/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { PaymentTypeService } from '@fineract/client';

/**
 * Payment Types data resolver.
 */
@Injectable()
export class PaymentTypesResolver {
  /**
   * @param {PaymentTypeService} paymentTypeService Payment Type service.
   */
  constructor(private paymentTypeService: PaymentTypeService) {}

  /**
   * Returns the payment types data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const paymentTypeId = route.paramMap.get('id');
    if (paymentTypeId) {
      return this.paymentTypeService.getAllPaymentTypes({ onlyWithCode: !!paymentTypeId });
    } else {
      return this.paymentTypeService.getAllPaymentTypes();
    }
  }
}
