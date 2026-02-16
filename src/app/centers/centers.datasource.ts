/** Angular Imports */
import { CollectionViewer, DataSource } from '@angular/cdk/collections';

/** rxjs Imports */
import { Observable, BehaviorSubject } from 'rxjs';

/** Custom Services */
import { CentersService } from '@fineract/client';

/**
 * Centers custom data source to implement server side filtering, pagination and sorting.
 */
export class CentersDataSource implements DataSource<any> {
  /** centers behavior subject to represent loaded centers page. */
  private centersSubject = new BehaviorSubject<any[]>([]);
  /** Records subject to represent total number of filtered centers records. */
  private recordsSubject = new BehaviorSubject<number>(0);
  /** Records observable which can be subscribed to get the value of total number of filtered centers records. */
  public records$ = this.recordsSubject.asObservable();

  /**
   * @param {CentersService} centersService Centers Service
   */
  constructor(private centersService: CentersService) {}

  /**
   * Gets centers on the basis of provided parameters and emits the value.
   * @param {any} filterBy Properties by which entries should be filtered.
   * @param {string} orderBy Property by which entries should be sorted.
   * @param {string} sortOrder Sort order: ascending or descending.
   * @param {number} pageIndex Page number.
   * @param {number} limit Number of entries within the page.
   * @param {boolean} centerActive Specify whether to only filter active centers.
   */
  getCenters(
    filterBy: any,
    orderBy: string = '',
    sortOrder: string = '',
    pageIndex: number = 0,
    limit: number = 10,
    centerActive: boolean = true
  ) {
    this.centersSubject.next([]);
    this.centersService
      .retrieveAll23({
        paged: true,
        orderBy: orderBy,
        sortOrder: sortOrder,
        offset: pageIndex * limit,
        limit: limit,
        // Filtering not directly supported by generated service in the same way, might need adjust
        name: filterBy.find((f: any) => f.type === 'name' && f.value !== '')?.value,
        externalId: filterBy.find((f: any) => f.type === 'externalId' && f.value !== '')?.value
      } as any)
      .subscribe((centers: any) => {
        const pageItems = centers.pageItems || [];
        const filteredItems = centerActive ? pageItems.filter((center: any) => center.active) : pageItems;
        this.recordsSubject.next(centers.totalFilteredRecords || 0);
        this.centersSubject.next(filteredItems);
      });
  }

  /**
   * @param {CollectionViewer} collectionViewer
   */
  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this.centersSubject.asObservable();
  }

  /**
   * @param {CollectionViewer} collectionViewer
   */
  disconnect(collectionViewer: CollectionViewer): void {
    this.centersSubject.complete();
    this.recordsSubject.complete();
  }
}
