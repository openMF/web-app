import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { CreditBureauService } from '../clients-view/credit-report/creditbureau.service';

/**
 * Creditbureau data resolver.
 */
@Injectable()
export class CreditBureauConfigurationResolver implements Resolve<Object> {

  constructor(private creditBureauService: CreditBureauService) { }


  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const organisationCreditBureauId = route.paramMap.get('creditBureauId');
    return this.creditBureauService.getCreditBureauConfigurationService(organisationCreditBureauId);
  }

}
