/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { RecurringDepositsService } from '../recurring-deposits.service';

/**
 * Recurring Deposits Account Transaction data resolver.
 */
@Injectable()
export class RecurringDepositsAccountTransactionResolver implements Resolve<Object> {

    /**
     * @param {RecurringDepositsService} recurringDepositsService Recurring Deposits service.
     */
    constructor(private recurringDepositsService: RecurringDepositsService) { }

    /**
     * Returns the Recurring Deposits Account Transaction data.
     * @param {ActivatedRouteSnapshot} route Route Snapshot
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const recurringDepositAccountId = route.parent.paramMap.get('recurringDepositAccountId');
        const transactionId = route.paramMap.get('id');
        return this.recurringDepositsService.getRecurringDepositsAccountTransaction(recurringDepositAccountId, transactionId);
    }

}
