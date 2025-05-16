/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountTransfersService } from '../account-transfers.service';

/**
 * View Standing Instructions resolver.
 */
@Injectable()
export class ViewStandingInstructionsResolver {
  /**
   * @param {accountTransfersService} AccountTransfersService Account Transfers service.
   */
  constructor(private accountTransfersService: AccountTransfersService) {}

  /**
   * Returns the Standing Instructions Data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const standingInstructionsId = route.parent.paramMap.get('standingInstructionsId');
    return this.accountTransfersService.getStandingInstructionsData(standingInstructionsId);
  }
}
