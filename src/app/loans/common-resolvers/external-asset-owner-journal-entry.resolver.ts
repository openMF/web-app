import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ExternalAssetOwnerService } from '../services/external-asset-owner.service';

@Injectable({
  providedIn: 'root'
})
export class ExternalAssetOwnerJournalEntryResolver {
  private externalAssetOwnerService = inject(ExternalAssetOwnerService);

  /**
   * Returns the Loans with Association data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const transferId = route.paramMap.get('transferId') || route.parent.paramMap.get('transferId');
    return this.externalAssetOwnerService.retrieveExternalAssetOwnerTransferJournalEntries(transferId);
  }
}
