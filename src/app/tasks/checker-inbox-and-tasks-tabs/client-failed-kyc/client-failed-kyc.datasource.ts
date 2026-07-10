/** Angular Imports */
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Injectable } from '@angular/core';
import { ClientsService } from 'app/clients/clients.service';
import { SearchService } from 'app/search/search.service';
import { SettingsService } from 'app/settings/settings.service';

/** rxjs Imports */
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Client Verification Data resolver.
 */
@Injectable()
export class ClientFailedKYCDataSource implements DataSource<any> {
  /** clients behavior subject to represent loaded journal clients page. */
  private readonly clientsSubject = new BehaviorSubject<any[]>([]);
  /** Records subject to represent total number of filtered clients records. */
  private readonly recordsSubject = new BehaviorSubject<number>(0);
  /** Records observable which can be subscribed to get the value of total number of filtered clients records. */
  public records$ = this.recordsSubject.asObservable();

  subStatus: string = 'clientSubStatusType.kyc_failed';

  /**
   * @param {ClientsService} clientsService Clients Service
   * @param {SearchService} searchService Search Service
   */
  constructor(private readonly clientsService: ClientsService, private readonly searchService: SearchService, private readonly settingsService: SettingsService) { }

  /**
   * Gets clients on the basis of provided parameters and emits the value.
   * @param {any} filterBy Properties by which clients should be filtered.
   * @param {string} orderBy Property by which clients should be sorted.
   * @param {string} sortOrder Sort order: ascending or descending.
   * @param {number} pageIndex Page number.
   * @param {number} limit Number of clients within the page.
   */
  getClients(
    orderBy: string = '',
    sortOrder: string = '',
    pageIndex: number = 0,
    limit: number = 10,
  ) {
    const ob = orderBy || 'last_kyc_approval_on_date';
    const so = (sortOrder || 'ASC').toUpperCase();

    const countryId = this.settingsService.getSelectedCountry()?.id;
    const clientsCall$ = countryId
      ? this.clientsService.getClientsByCountry(ob, so, pageIndex * limit, limit, countryId, this.subStatus)
      : this.clientsService.getClients(ob, so, pageIndex * limit, limit, this.subStatus);

    clientsCall$.subscribe((clients: any) => {
      const items = (clients?.pageItems ?? []).filter((c: any) => c?.status?.value !== 'Closed');
      this.recordsSubject.next(clients?.totalFilteredRecords ?? items.length);
      this.clientsSubject.next(items);
    });
  }

  /**
   * @param {CollectionViewer} collectionViewer
   */
  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this.clientsSubject.asObservable();
  }

  /**
   * @param {CollectionViewer} collectionViewer
   */
  disconnect(collectionViewer: CollectionViewer): void {
    this.clientsSubject.complete();
    this.recordsSubject.complete();
  }

  /** Filter Active Client Data.
   * @param {string} filterValue Filter Value which clients should be filtered.
   * @param {string} orderBy Property by which clients should be sorted.
   * @param {string} sortOrder Sort order: ascending or descending.
   * @param {number} pageIndex Page number.
   * @param {number} limit Number of clients within the page.
   */
  filterClients(
    filter: string,
    orderBy: string = '',
    sortOrder: string = '',
    pageIndex: number = 0,
    limit: number = 10,
  ) {
    this.clientsSubject.next([]);

    const ob = orderBy || 'last_kyc_approval_on_date';
    const so = (sortOrder || 'ASC').toUpperCase();
    const offset = pageIndex * limit;
    const countryId = this.settingsService.getSelectedCountry()?.id;
    const clientsCall$ = countryId
      ? this.clientsService.getClientsByCountry(ob, so, offset, limit, countryId, this.subStatus, filter)
      : this.clientsService.getClients(ob, so, offset, limit, this.subStatus, filter);
    clientsCall$.subscribe((clients: any) => {

      const items = (clients?.pageItems ?? []).filter((c: any) => c?.status?.value !== 'Closed');
      this.recordsSubject.next(clients?.totalFilteredRecords ?? items.length);

      this.clientsSubject.next(items);
    });
  }
}

