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
    // Convert filterBy array to object and ensure it's always defined
    const filterObj = Array.isArray(filterBy)
      ? filterBy.reduce((acc, curr) => {
          if (curr.value !== undefined && curr.value !== '') {
            acc[curr.type] = curr.value;
          }
          return acc;
        }, {})
      : filterBy || {};
    this.centersService
      .retrieveAll23({
        ...filterObj,
        orderBy: orderBy,
        sortOrder: sortOrder,
        offset: pageIndex * limit,
        limit: limit
      })
      .subscribe((centers: any) => {
        centers.pageItems = centerActive
          ? (centers.pageItems || []).filter((center: any) => center.active)
          : centers.pageItems || [];
        this.recordsSubject.next(centers.totalFilteredRecords);
        this.centersSubject.next(centers.pageItems);
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
