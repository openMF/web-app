/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SavingsService } from '../savings.service';

/**
 * Savings Account Transaction Template data resolver.
 */
@Injectable()
export class SavingAccountTransactionTemplateResolver implements Resolve<Object> {

    /**
     * @param {SavingsService} savingsService Savings service.
     */
    constructor(private savingsService: SavingsService) { }

    /**
     * Returns the Savings Account Transaction Template.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const savingAccountId = route.paramMap.get('savingAccountId');
        return this.savingsService.getSavingsTransactionTemplateResource(savingAccountId);
    }
}
