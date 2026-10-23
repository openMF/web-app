/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { map } from 'rxjs';
import { parseExchangeResponse } from '../cash-exchange/cash-exchange.service';
import { PickupCheck, PickupContext, PickupRecord, PickupRequest } from './cash-drawer-pickup.models';

@Injectable({ providedIn: 'root' })
export class CashDrawerPickupService {
  // In-memory only: allow leaving the dialog/route without losing an unresolved selection/key.
  // Never retain authorization fields here.
  pendingPickup?: { request: PickupRequest; preview: PickupRecord };
  private readonly http = inject(HttpClient);
  private readonly path = '/v2/base-teller/cash-drawer-pickups';
  constructor() {
    inject(AuthenticationService)
      .isAuthenticated$.pipe(takeUntilDestroyed())
      .subscribe((authenticated) => {
        if (!authenticated) this.pendingPickup = undefined;
      });
  }
  context() {
    return this.http
      .get(`${this.path}/context`, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<PickupContext>));
  }
  checks(cashierId: number) {
    return this.http
      .get(`${this.path}/checks`, { params: { cashierId }, responseType: 'text' })
      .pipe(map(parseExchangeResponse<PickupCheck[]>));
  }
  preview(request: PickupRequest) {
    return this.http
      .post(`${this.path}/preview`, request, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<PickupRecord>));
  }
  create(request: PickupRequest, authorizationUsername: string, authorizationCredential: string) {
    return this.http
      .post(this.path, { ...request, authorizationUsername, authorizationCredential }, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<PickupRecord>));
  }
  retrieve(id: number) {
    return this.http.get(`${this.path}/${id}`, { responseType: 'text' }).pipe(map(parseExchangeResponse<PickupRecord>));
  }
  receipt(id: number) {
    return this.http
      .get(`${this.path}/${id}/receipt`, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<PickupRecord>));
  }
}
