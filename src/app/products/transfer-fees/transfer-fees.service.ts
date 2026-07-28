/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { map, Observable } from 'rxjs';

/** Custom Models */
import { TransferFee, TransferFeePayload } from './models/transfer-fee.model';

/**
 * Transfer fees service.
 */
@Injectable({
  providedIn: 'root'
})
export class TransferFeesService {
  private http = inject(HttpClient);

  private readonly resourceUrl = '/v1/self/transfer-fees';

  /**
   * @returns {Observable<TransferFee[]>} Transfer fees data.
   */
  getTransferFees(): Observable<TransferFee[]> {
    return this.http.get<TransferFee[]>(this.resourceUrl);
  }

  /**
   * @param {number | string} transferFeeId Transfer fee id.
   * @returns {Observable<TransferFee>} Transfer fee data.
   */
  getTransferFee(transferFeeId: number | string): Observable<TransferFee> {
    const id = `${transferFeeId}`;
    // The Self-Service Plugin currently exposes list/create/update/delete only; no GET /{id} endpoint exists.
    // Load the supported list endpoint and resolve the selected fee client-side until the plugin adds one.
    return this.getTransferFees().pipe(
      map((transferFees: TransferFee[]) => {
        const transferFee = (transferFees || []).find((item: TransferFee) => `${item.id}` === id);
        if (!transferFee) {
          throw new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found'
          });
        }
        return transferFee;
      })
    );
  }

  /**
   * @param {TransferFeePayload} transferFee Transfer fee to be created.
   * @returns {Observable<any>}
   */
  createTransferFee(transferFee: TransferFeePayload): Observable<any> {
    return this.http.post(this.resourceUrl, transferFee);
  }

  /**
   * @param {number} transferFeeId Transfer fee id.
   * @param {TransferFeePayload} transferFee Transfer fee to be updated.
   * @returns {Observable<any>}
   */
  updateTransferFee(transferFeeId: number, transferFee: TransferFeePayload): Observable<any> {
    return this.http.put(`${this.resourceUrl}/${transferFeeId}`, transferFee);
  }

  /**
   * @param {number} transferFeeId Transfer fee id to be deleted.
   * @returns {Observable<any>}
   */
  deleteTransferFee(transferFeeId: number): Observable<any> {
    return this.http.delete(`${this.resourceUrl}/${transferFeeId}`);
  }
}
