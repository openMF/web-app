/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  RemittanceTransaction,
  RemittanceVendor,
  PayoutAssignmentRequest,
  PayoutAssignmentResponse,
  PayoutConfirmationRequest,
  PayoutConfirmationResponse
} from './models/remittance.model';
import { ValidateRecipientRequest, ValidatedRecipient } from './models/beneficiary.model';

/**
 * Remittances Service
 *
 * Handles all HTTP communication with the Mifos Remittance Microservice.
 * Base URL pattern: {mifosRemittanceApiUrl}{mifosRemittanceApiProvider}{mifosRemittanceApiVersion}/remittances/:tenant/:vendor/...
 *
 * Auth: X-Gravitee-Api-Key header (injected server-side by the proxy)
 */
@Injectable({
  providedIn: 'root'
})
export class RemittancesService {
  private httpBackend = inject(HttpBackend);

  /** Separate HttpClient that bypasses interceptors (avoids Fineract API prefix) */
  private http = new HttpClient(this.httpBackend);

  private get baseUrl(): string {
    return `${environment.mifosRemittanceApiUrl}${environment.mifosRemittanceApiProvider}${environment.mifosRemittanceApiVersion}`;
  }

  private get tenant(): string {
    return environment.fineractPlatformTenantId || 'default';
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const apiHeader = environment.mifosRemittanceApiHeader;
    const apiKey = environment.mifosRemittanceApiKey;
    headers = headers.set(apiHeader, apiKey);
    return headers;
  }

  /**
   * Endpoint 0: Get available remittance vendors for the tenant.
   * GET /v1/remittances/:tenant/vendors
   */
  getVendors(): Observable<{ vendors: RemittanceVendor[] }> {
    return this.http.get<{ vendors: RemittanceVendor[] }>(`${this.baseUrl}/remittances/${this.tenant}/vendors`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Endpoint 1: Find remittance by external ID / PIN.
   * GET /v1/remittances/:tenant/:vendor/transactions/:id
   */
  findRemittance(vendor: string, externalId: string): Observable<RemittanceTransaction> {
    return this.http.get<RemittanceTransaction>(
      `${this.baseUrl}/remittances/${this.tenant}/${vendor}/transactions/${externalId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Endpoint 2: Validate recipient for a transaction.
   * POST /v1/remittances/:tenant/:vendor/transactions/:id/recipient
   */
  validateRecipient(
    vendor: string,
    transactionId: string,
    data: ValidateRecipientRequest
  ): Observable<ValidatedRecipient> {
    return this.http.post<ValidatedRecipient>(
      `${this.baseUrl}/remittances/${this.tenant}/${vendor}/transactions/${transactionId}/recipient`,
      data,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Endpoint 3: Assign transaction ready to payout (lock for payout).
   * POST /v1/remittances/:tenant/:vendor/transactions/:id/payout-assignment
   */
  assignPayout(
    vendor: string,
    transactionId: string,
    body?: PayoutAssignmentRequest
  ): Observable<PayoutAssignmentResponse> {
    return this.http.post<PayoutAssignmentResponse>(
      `${this.baseUrl}/remittances/${this.tenant}/${vendor}/transactions/${transactionId}/payout-assignment`,
      body || {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Endpoint 4: Confirm transaction payout.
   * POST /v1/remittances/:tenant/:vendor/transactions/:id/payout-confirmation/:clientId
   */
  confirmPayout(
    vendor: string,
    transactionId: string,
    clientId: number,
    body?: PayoutConfirmationRequest
  ): Observable<PayoutConfirmationResponse> {
    return this.http.post<PayoutConfirmationResponse>(
      `${this.baseUrl}/remittances/${this.tenant}/${vendor}/transactions/${transactionId}/payout-confirmation/${clientId}`,
      body || {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Unassign transaction from payout (state management).
   * DELETE /v1/remittances/:tenant/:vendor/transactions/:id/payout-assignment
   */
  unassignPayout(vendor: string, transactionId: string, reason: string): Observable<any> {
    return this.http.request(
      'DELETE',
      `${this.baseUrl}/remittances/${this.tenant}/${vendor}/transactions/${transactionId}/payout-assignment`,
      {
        headers: this.getHeaders(),
        body: { reason }
      }
    );
  }

  /**
   * Reverse payout confirmation (state management).
   * DELETE /v1/remittances/:tenant/:vendor/transactions/:id/payout-confirmation
   */
  reversePayoutConfirmation(vendor: string, transactionId: string, reason: string): Observable<any> {
    return this.http.request(
      'DELETE',
      `${this.baseUrl}/remittances/${this.tenant}/${vendor}/transactions/${transactionId}/payout-confirmation`,
      {
        headers: this.getHeaders(),
        body: { reason }
      }
    );
  }
}
