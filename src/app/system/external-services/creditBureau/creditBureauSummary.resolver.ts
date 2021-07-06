/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

@Injectable()
export class CreditBureauSummaryResolver implements Resolve<Object> {

  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the Organisation Credit Bureau Data ie. Credit Bureau Alias.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getOrganisationCreditBureauSummary();
  }

}
