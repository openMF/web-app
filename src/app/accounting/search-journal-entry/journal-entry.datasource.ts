import { CollectionViewer, DataSource } from "@angular/cdk/collections";

import { Observable, BehaviorSubject } from "rxjs";

import { AccountingService } from "../accounting.service";

export class JournalEntriesDataSource implements DataSource<any> {

    private journalEntriesSubject = new BehaviorSubject<any[]>([]);
    private recordsSubject = new BehaviorSubject<number>(0);

    public records$ = this.recordsSubject.asObservable();

    constructor(private accountingService: AccountingService) {  }

    loadJournalEntries(filterBy: any, orderBy = '', sortBy = '', offset = 0, limit = 10) {
      this.journalEntriesSubject.next([]);
      orderBy = (orderBy === 'debit' || orderBy === 'credit') ? 'amount' : orderBy;
      this.accountingService.getJournalEntries(filterBy, orderBy, sortBy, offset, limit)
        .subscribe((journalEntries: any) => {
          console.log(journalEntries);
          this.recordsSubject.next(journalEntries.totalFilteredRecords);
          this.journalEntriesSubject.next(journalEntries.pageItems);
        });
    }

    connect(collectionViewer: CollectionViewer): Observable<any[]> {
      return this.journalEntriesSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
      this.journalEntriesSubject.complete();
      this.recordsSubject.complete();
    }

}
