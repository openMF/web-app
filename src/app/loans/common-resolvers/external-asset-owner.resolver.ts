import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ExternalAssetOwnerService } from '../services/external-asset-owner.service';

@Injectable({
  providedIn: 'root'
})
export class ExternalAssetOwnerResolver {
  private externalAssetOwnerService = inject(ExternalAssetOwnerService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {ExternalAssetOwnerService} externalAssetOwnerService External Asset Owner service.
   */
  constructor() {}

  /**
   * Returns the Loans with Association data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    return this.externalAssetOwnerService.retrieveExternalAssetOwnerTransfers(loanId);
  }
}
