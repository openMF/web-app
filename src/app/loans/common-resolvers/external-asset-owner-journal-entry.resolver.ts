import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ExternalAssetOwnerService } from '../services/external-asset-owner.service';

@Injectable({
  providedIn: 'root'
})
export class ExternalAssetOwnerJournalEntryResolver {
  /**
   * @param {ExternalAssetOwnerService} externalAssetOwnerService External Asset Owner service.
   */
  constructor(private externalAssetOwnerService: ExternalAssetOwnerService) {}

  /**
   * Returns the Loans with Association data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const transferId = route.paramMap.get('transferId') || route.parent.paramMap.get('transferId');
    return this.externalAssetOwnerService.retrieveExternalAssetOwnerTransferJournalEntries(transferId);
  }
}
