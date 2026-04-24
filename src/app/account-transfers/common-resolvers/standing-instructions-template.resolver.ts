/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { StandingInstructionsService } from '@fineract/client';

/**
 * View Standing Instructions resolver.
 */
@Injectable()
export class StandingInstructionsTemplateResolver {
  accountTypeId: string;

  /**
   * @param {StandingInstructionsService} StandingInstructionsService Standing Instructions service.
   */
  constructor(private standingInstructionsService: StandingInstructionsService) {}

  /**
   * Returns the Standing Instructions Data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const officeId = route.queryParamMap.get('officeId');
    const accountType = route.queryParamMap.get('accountType');
    const clientId = route.parent.paramMap.get('clientId');
    switch (accountType) {
      case 'fromloans':
        this.accountTypeId = '1';
        break;
      case 'fromsavings':
        this.accountTypeId = '2';
        break;
      default:
        this.accountTypeId = '0';
    }
    return this.standingInstructionsService.template6({
      toClientId: clientId ? Number(clientId) : undefined,
      toOfficeId: officeId ? Number(officeId) : undefined,
      toAccountType: this.accountTypeId ? Number(this.accountTypeId) : undefined
    });
  }
}
