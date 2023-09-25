import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ExternalAssetOwnerService } from '../services/external-asset-owner.service';

@Injectable({
  providedIn: 'root'
})
export class ExternalAssetOwnerActiveTransferResolver implements Resolve<boolean> {

    /**
     * @param {ExternalAssetOwnerService} externalAssetOwnerService External Asset Owner service.
     */
    constructor(private externalAssetOwnerService: ExternalAssetOwnerService) { }

    /**
     * Returns the Loans with Association data.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
      const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
      return this.externalAssetOwnerService.retrieveExternalAssetOwnerActiveTransfer(loanId);
    }

}
