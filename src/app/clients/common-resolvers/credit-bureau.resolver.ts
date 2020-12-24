import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { CreditBureauService } from '../clients-view/credit-report/creditbureau.service';

/**
 * Creditbureau data resolver.
 */
@Injectable()
export class CreditBureauResolver implements Resolve<Object> {

  constructor(private creditBureauService: CreditBureauService) { }

  /**
   * Returns the All Integrated Credit Bureau.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.creditBureauService.getCreditBureauService();
  }

}
