/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * loan datatables resolver.
 */
@Injectable()
export class LoanDatatablesResolver implements Resolve<Object> {

    /**
     * @param {loansService} loansService loans service.
     */
    constructor(private loansService: LoansService) { }

    /**
     * Returns the loan datatables.
     * @returns {Observable<any>}
     */
    resolve(): Observable<any> {
        return this.loansService.getLoanDataTables();
    }

}
