/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { PaymentTypeService } from '@fineract/client';

/**
 * Payment types data resolver.
 */
@Injectable()
export class PaymentTypesResolver {
  /**
   * @param {PaymentTypeService} paymentTypeService Payment type service.
   */
  constructor(private paymentTypeService: PaymentTypeService) {}

  /**
   * Returns the payment types data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.paymentTypeService.getAllPaymentTypes();
  }
}
