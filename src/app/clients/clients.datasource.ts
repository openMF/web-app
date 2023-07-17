/** Angular Imports */
import { CollectionViewer, DataSource } from '@angular/cdk/collections';

/** rxjs Imports */
import { Observable, BehaviorSubject } from 'rxjs';

/** Custom Services */
import { ClientsService } from './clients.service';
import { SearchService } from 'app/search/search.service';

/**
 * Clients custom data source to implement server side filtering, pagination and sorting.
 */
export class ClientsDataSource implements DataSource<any> {

  /** clients behavior subject to represent loaded journal clients page. */
  private clientsSubject = new BehaviorSubject<any[]>([]);
  /** Records subject to represent total number of filtered clients records. */
  private recordsSubject = new BehaviorSubject<number>(0);
  /** Records observable which can be subscribed to get the value of total number of filtered clients records. */
  public records$ = this.recordsSubject.asObservable();

  /**
   * @param {ClientsService} clientsService Clients Service
   * @param {SearchService} searchService Search Service
   */
  constructor(private clientsService: ClientsService, private searchService: SearchService) { }

  /**
   * Gets clients on the basis of provided parameters and emits the value.
   * @param {any} filterBy Properties by which clients should be filtered.
   * @param {string} orderBy Property by which clients should be sorted.
   * @param {string} sortOrder Sort order: ascending or descending.
   * @param {number} pageIndex Page number.
   * @param {number} limit Number of clients within the page.
   */
  getClients(orderBy: string = '', sortOrder: string = '', pageIndex: number = 0, limit: number = 10, showClosedAccounts: boolean = true) {
    this.clientsSubject.next([]);
    this.clientsService.getClients(orderBy, sortOrder, pageIndex * limit, limit)
      .subscribe((clients: any) => {
        if (showClosedAccounts) {
          clients.pageItems = clients.pageItems;
        } else {
          clients.pageItems = clients.pageItems.filter((client: any) => client.status.value !== 'Closed');
        }
        this.recordsSubject.next(clients.totalFilteredRecords);
        this.clientsSubject.next(clients.pageItems);
      });
  }
  /**
   * Search clients on the basis of provided parameters.
   * @param {string} searchValue Property by which clients should be sorted.
   * @param {boolean} showClosedAccounts determines if only active account should be displayed.
   */
   searchClients(searchValue: string, showClosedAccounts: boolean = true) {
    this.clientsSubject.next([]);
    this.searchService.getSearchResults(searchValue, "clients,clientIdentifiers").subscribe((data: any) => {
      if (!showClosedAccounts) {
        data = data.filter((client: any) => client.entityStatus && client.entityStatus.value !== "Closed");
      }
      this.recordsSubject.next(data.length);
      const clients = data
        .filter((result) => result.entityType === "CLIENT" || result.entityType === "CLIENTIDENTIFIER")
        .map(
          ({ entityStatus, entityName, entityAccountNo, entityId, entityExternalId, parentName, entityMobileNo, entityType, parentId, parentExternalId }) => ({
            status: { ...entityStatus },
            gender: { name: "" },
            mobileNo: entityMobileNo,
            displayName: entityType === "CLIENT" ? entityName: parentName,
            accountNo: entityAccountNo,
            id: entityType === "CLIENT" ? entityId: parentId,
            externalId: entityType === "CLIENT" ? entityExternalId: parentExternalId,
            officeName: entityType === "CLIENT" ? parentName: null,
          })
        );
      this.clientsSubject.next(clients);
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
  filterClients(filter: string, orderBy: string = '', sortOrder: string = '', pageIndex: number = 0, limit: number = 10, showClosedAccounts: boolean = true) {
    this.clientsSubject.next([]);
    this.clientsService.getClients(orderBy, sortOrder, pageIndex * limit, limit)
      .subscribe((clients: any) => {
        if (showClosedAccounts) {
          clients.pageItems = clients.pageItems.filter((client: any) => client.displayName.toLowerCase().includes(filter));
        } else {
          clients.pageItems = clients.pageItems.filter((client: any) => client.status.value !== 'Closed' && client.displayName.toLowerCase().includes(filter));
        }
        this.recordsSubject.next(clients.totalFilteredRecords);
        this.clientsSubject.next(clients.pageItems);
      });
  }

}
