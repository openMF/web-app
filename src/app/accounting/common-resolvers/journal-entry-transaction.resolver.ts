/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { JournalEntriesService } from '@fineract/client';

/**
 * Transaction data resolver.
 */
@Injectable()
export class JournalEntryTransactionResolver {
  /**
   * @param {JournalEntriesService} journalEntriesService Journal Entries service.
   */
  constructor(private journalEntriesService: JournalEntriesService) {}

  /**
   * Returns the transaction data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const transactionId = route.paramMap.get('id');
    return this.journalEntriesService.retrieveAll1({
      transactionId: transactionId,
      transactionDetails: true
    });
  }
}
