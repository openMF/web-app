/** Angular Imports */
import { CollectionViewer, DataSource } from '@angular/cdk/collections';

/** rxjs Imports */
import { Observable, BehaviorSubject } from 'rxjs';

/** Custom Services */
import { JournalEntriesService } from '@fineract/client';

/**
 * Journal entries custom data source to implement server side filtering, pagination and sorting.
 */
export class JournalEntriesDataSource implements DataSource<any> {
  /** Journal entries behavior subject to represent loaded journal entries page. */
  private journalEntriesSubject = new BehaviorSubject<any[]>([]);
  /** Records subject to represent total number of filtered journal entry records. */
  private recordsSubject = new BehaviorSubject<number>(0);
  /** Records observable which can be subscribed to get the value of total number of filtered journal entry records. */
  public records$ = this.recordsSubject.asObservable();

  /**
   * @param {AccountingService} accountingService Accounting Service
   */
  constructor(private journalEntriesService: JournalEntriesService) {}

  /**
   * Gets journal entries on the basis of provided parameters and emits the value.
   * @param {any} filterBy Properties by which entries should be filtered.
   * @param {string} orderBy Property by which entries should be sorted.
   * @param {string} sortOrder Sort order: ascending or descending.
   * @param {number} pageIndex Page number.
   * @param {number} limit Number of entries within the page.
   */
  getJournalEntries(
    filterBy: any,
    orderBy: string = '',
    sortOrder: string = '',
    pageIndex: number = 0,
    limit: number = 10
  ) {
    this.journalEntriesSubject.next([]);
    orderBy = orderBy === 'debit' || orderBy === 'credit' ? 'amount' : orderBy;

    // Build parameters from filterBy array
    const params: any = {
      offset: pageIndex * limit,
      limit: limit,
      orderBy: orderBy,
      sortOrder: sortOrder
    };

    // Add filter parameters
    filterBy.forEach(function (filter: any) {
      if (filter.value) {
        params[filter.type] = filter.value;
      }
    });

    this.journalEntriesService.retrieveAll1(params).subscribe((journalEntries: any) => {
      this.recordsSubject.next(journalEntries.totalFilteredRecords);
      this.journalEntriesSubject.next(journalEntries.pageItems);
    });
  }

  /**
   * @param {CollectionViewer} collectionViewer
   */
  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this.journalEntriesSubject.asObservable();
  }

  /**
   * @param {CollectionViewer} collectionViewer
   */
  disconnect(collectionViewer: CollectionViewer): void {
    this.journalEntriesSubject.complete();
    this.recordsSubject.complete();
  }
}
