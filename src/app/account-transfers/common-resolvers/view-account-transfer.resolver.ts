/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountTransfersService } from '../account-transfers.service';

/**
 * View Account Transfer data resolver.
 */
@Injectable()
export class ViewAccountTransferResolver implements Resolve<Object> {

    /**
     * @param {AccountTransfersService} AccountTransfersService Savings service.
     */
    constructor(private accountTransfersService: AccountTransfersService) { }

    /**
     * Returns the View Account Transfer data.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const transferId = route.paramMap.get('transferid');
        return this.accountTransfersService.getViewAccountTransferDetails(transferId);
    }

}
