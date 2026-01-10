/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Payment types data resolver.
 */
@Injectable()
export class PaymentTypesResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the payment types data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.accountingService.getPaymentTypes();
  }
}
