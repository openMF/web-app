/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountTransfersService } from '../account-transfers.service';

/**
 * View Standing Instructions resolver.
 */
@Injectable()
export class StandingInstructionsTemplateResolver implements Resolve<Object> {

    accountTypeId: string;

    /**
     * @param {accountTransfersService} AccountTransfersService Account Transfers service.
     */
    constructor(private accountTransfersService: AccountTransfersService) { }

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
        return this.accountTransfersService.getStandingInstructionsTemplate(clientId, officeId, this.accountTypeId);
    }

}
