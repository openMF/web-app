/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Custom Services */
import { RunReportsService } from '@fineract/client';

/**
 * Client Summary resolver.
 */
@Injectable()
export class ClientSummaryResolver {
  /**
   * @param {RunReportsService} runReportsService Reports service.
   */
  constructor(private runReportsService: RunReportsService) {}

  /**
   * Returns the Client Summary data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.paramMap.get('clientId');
    return this.runReportsService.runReport({
      reportName: `ClientSummary?R_clientId=${clientId}&genericResultSet=false`
    });
  }
}
