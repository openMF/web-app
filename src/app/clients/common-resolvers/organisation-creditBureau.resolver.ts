import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** CreditBureauService Services */
import { CreditBureauService } from '../clients-view/credit-report/creditbureau.service';

/**
 * Creditbureau data resolver.
 */
@Injectable()
export class OrganisationCreditBureauResolver implements Resolve<Object> {


  constructor(private creditBureauService: CreditBureauService) { }

  resolve(): Observable<any> {
    return this.creditBureauService.getOrganisationCreditBureauService();
  }

}
