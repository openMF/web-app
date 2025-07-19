/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { JournalEntriesService } from '@fineract/client';

/**
 * Provisioning journal entries data resolver.
 */
@Injectable()
export class ProvisioningJournalEntriesResolver {
  /**
   * @param {JournalEntriesService} journalEntriesService Journal Entries service.
   */
  constructor(private journalEntriesService: JournalEntriesService) {}

  /**
   * Returns the provisioning journal entries data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    return this.journalEntriesService.retrieveJournalEntries({ entryId: Number(id) });
  }
}
