/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { APIRequestContext, APIResponse, request } from '@playwright/test';

export class FineractApiClient {
  private ctx!: APIRequestContext;

  constructor(
    private baseUrl: string,
    private tenantId: string,
    private username: string,
    private password: string
  ) {}

  async init(): Promise<void> {
    this.ctx = await request.newContext({
      baseURL: this.baseUrl,
      ignoreHTTPSErrors: true,
      extraHTTPHeaders: {
        'Fineract-Platform-TenantId': this.tenantId,
        Authorization: `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
  }

  private async validateResponse(res: APIResponse, operation: string): Promise<any> {
    if (!res.ok()) {
      throw new Error(`Fineract API error [${operation}]: ${res.status()} ${res.statusText()}`);
    }
    return res.json();
  }

  async healthCheck(): Promise<boolean> {
    const res = await this.ctx.get('/fineract-provider/actuator/health');
    return res.ok();
  }

  async getOffices(): Promise<any[]> {
    const res = await this.ctx.get('/fineract-provider/api/v1/offices');
    return this.validateResponse(res, 'getOffices');
  }

  async createClient(data: Record<string, unknown>): Promise<any> {
    const res = await this.ctx.post('/fineract-provider/api/v1/clients', { data });
    return this.validateResponse(res, 'createClient');
  }

  /**
   * Creates a savings account.
   * @param overrides Must include mandatory Fineract fields:
   *   submittedOnDate, dateFormat, locale, nominalAnnualInterestRate,
   *   interestCompoundingPeriodType, interestPostingPeriodType,
   *   interestCalculationType, interestCalculationDaysInYearType
   */
  async createSavingsAccount(
    clientId: number,
    productId: number,
    overrides: Record<string, unknown> = {}
  ): Promise<any> {
    const res = await this.ctx.post('/fineract-provider/api/v1/savingsaccounts', {
      data: { ...overrides, clientId, productId }
    });
    return this.validateResponse(res, 'createSavingsAccount');
  }

  async dispose(): Promise<void> {
    await this.ctx?.dispose();
  }
}
