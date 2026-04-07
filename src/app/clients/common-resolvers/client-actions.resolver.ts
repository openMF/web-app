/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import {
  ClientService,
  SelfScoreCardService,
  SelfSpmService,
  OfficesService,
  ClientChargesService,
  UserGeneratedDocumentsService,
  CollateralManagementService
} from '@fineract/client';

/**
 * Client Actions data resolver.
 */
@Injectable()
export class ClientActionsResolver {
  /**
   * @param {ClientsService} clientsService Clients service.
   * @param {CollateralManagementService} collateralManagementService Collateral Management Service
   */
  constructor(
    private clientsService: ClientService,
    private selfScoreCardService: SelfScoreCardService,
    private selfSpmService: SelfSpmService,
    private officesService: OfficesService,
    private clientChargesService: ClientChargesService,
    private userGeneratedDocumentsService: UserGeneratedDocumentsService,
    private collateralManagementService: CollateralManagementService
  ) {}

  /**
   * Returns the clients actions data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const actionName = route.paramMap.get('name');
    const clientId = route.paramMap.get('clientId') || route.parent.parent.paramMap.get('clientId');
    switch (actionName) {
      case 'Survey':
        return this.selfScoreCardService.findByClient({ clientId: Number(clientId) });
      case 'Take Survey':
        return this.selfSpmService.fetchAllSurveys();
      case 'Close':
        return this.clientsService.retrieveTemplate5({ commandParam: 'close' });
      case 'Reject':
        return this.clientsService.retrieveTemplate5({ commandParam: 'reject' });
      case 'Withdraw':
        return this.clientsService.retrieveTemplate5({ commandParam: 'withdraw' });
      case 'Transfer Client':
        return this.officesService.retrieveOffices();
      case 'Add Charge':
        return this.clientChargesService.retrieveTemplate4({ clientId: Number(clientId) });
      case 'Create Collateral':
        return this.collateralManagementService.getAllCollaterals();
      case 'Client Screen Reports':
        return this.userGeneratedDocumentsService.retrieveAll40();
      case 'Assign Staff':
      case 'Update Default Savings':
        return this.clientsService.retrieveOne11({ clientId: Number(clientId) });
      case 'Undo Transfer':
      case 'Accept Transfer':
      case 'Reject Transfer':
        return this.clientsService.retrieveTransferTemplate({ clientId: Number(clientId) });
      default:
        return undefined;
    }
  }
}
