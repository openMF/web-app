/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { parseExchangeResponse } from '../cash-exchange/cash-exchange.service';
import { ClosingCheck, ClosingContext, ClosingRecord, ClosingRequest } from './end-of-day-closing.models';
@Injectable({ providedIn: 'root' })
export class EndOfDayClosingService {
  private readonly http = inject(HttpClient);
  private readonly path = '/v2/base-teller/end-of-day-closing';
  context() {
    return this.http
      .get(this.path + '/context', { responseType: 'text' })
      .pipe(map(parseExchangeResponse<ClosingContext>));
  }
  checks(cashierId: number) {
    return this.http
      .get(this.path + '/checks', { params: { cashierId }, responseType: 'text' })
      .pipe(map(parseExchangeResponse<ClosingCheck[]>));
  }
  preview(request: ClosingRequest) {
    return this.http
      .post(this.path + '/preview', request, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<ClosingRecord>));
  }
  complete(request: ClosingRequest, username: string, credential: string) {
    return this.http
      .post(this.path, { ...request, authorization: { username, credential } }, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<ClosingRecord>));
  }
  retrieve(id: number) {
    return this.http
      .get(this.path + '/' + id, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<ClosingRecord>));
  }
  report(id: number) {
    return this.http
      .get(this.path + '/' + id + '/report', { responseType: 'text' })
      .pipe(map(parseExchangeResponse<ClosingRecord>));
  }
}
