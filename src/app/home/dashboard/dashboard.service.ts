/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  getActiveLoansSummary(): Observable<any> {
    const params = new HttpParams()
      .set('genericResultSet', 'true')
      .set('R_officeId', '1')
      .set('R_currencyId', '-1')
      .set('R_fundId', '-1')
      .set('R_loanPurposeId', '-1')
      .set('R_parType', '1')
      .set('R_loanOfficerId', '-1')
      .set('R_loanProductId', '-1');

    const reportName = 'Active Loans - Summary';

    return this.http.get(`/runreports/${encodeURIComponent(reportName)}`, { params });
  }
}
