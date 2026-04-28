/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { APIRequestContext, APIResponse, request } from '@playwright/test';

export class FineractApiClient {
  private static readonly CLIENT_CLOSURE_REASON_CODE_NAME = 'ClientClosureReason';
  private static readonly DEFAULT_DATE_FORMAT = 'dd MMMM yyyy';
  private static readonly DEFAULT_LOCALE = 'en';
  private static readonly CREATE_RACE_RETRY_DELAY_MS = 250;
  private static readonly CREATE_RACE_RETRY_COUNT = 2;
  private ctx!: APIRequestContext;

  /**
   * Creates an authenticated Fineract API client for Playwright tests.
   * @param baseUrl - The Fineract base URL
   * @param tenantId - The tenant identifier header value
   * @param username - The username for basic authentication
   * @param password - The password for basic authentication
   */
  constructor(
    private baseUrl: string,
    private tenantId: string,
    private username: string,
    private password: string
  ) {}

  /**
   * Initializes the Playwright request context with Fineract auth headers.
   */
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

  /**
   * Validates a Fineract API response and returns its parsed JSON payload.
   * @param res - The API response to validate
   * @param operation - The operation name for error reporting
   * @returns The parsed JSON payload for a successful response
   */
  private async validateResponse(res: APIResponse, operation: string): Promise<any> {
    if (!res.ok()) {
      const errorBody = await res.text();
      const trimmedBody = errorBody.trim();
      const errorSuffix = trimmedBody ? ` - ${trimmedBody}` : '';
      throw new Error(`Fineract API error [${operation}]: ${res.status()} ${res.statusText()}${errorSuffix}`);
    }
    return res.json();
  }

  /**
   * Determines whether an API error can be treated as a duplicate/create race.
   * @param error - The thrown error from a create attempt
   * @returns true when the error represents a recoverable duplicate conflict
   */
  private isRecoverableDuplicateError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return /409|duplicate|already exists|resource already exists|unique/i.test(message);
  }

  /**
   * Pauses execution briefly before retrying a create race.
   * @returns A promise that resolves after the retry delay
   */
  private async waitForCreateRaceRetry(): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, FineractApiClient.CREATE_RACE_RETRY_DELAY_MS);
    });
  }

  /**
   * Checks whether the Fineract health endpoint responds successfully.
   * @returns true when the health endpoint returns an OK response
   */
  async healthCheck(): Promise<boolean> {
    const res = await this.ctx.get('/fineract-provider/actuator/health');
    return res.ok();
  }

  /**
   * Fetches the list of available offices.
   * @returns The available office collection
   */
  async getOffices(): Promise<any[]> {
    const res = await this.ctx.get('/fineract-provider/api/v1/offices');
    return this.validateResponse(res, 'getOffices');
  }

  /**
   * Creates a client using the supplied request payload.
   * @param data - The client creation payload
   * @returns The Fineract create-client response payload
   */
  async createClient(data: Record<string, unknown>): Promise<any> {
    const res = await this.ctx.post('/fineract-provider/api/v1/clients', { data });
    return this.validateResponse(res, 'createClient');
  }

  /**
   * Fetches a client record by id.
   * @param clientId - The client id to fetch
   * @returns The requested client payload
   */
  async getClient(clientId: number): Promise<any> {
    const res = await this.ctx.get(`/fineract-provider/api/v1/clients/${clientId}`);
    return this.validateResponse(res, 'getClient');
  }

  /**
   * Fetches all configured Fineract system codes.
   * @returns The configured system codes
   */
  async getCodes(): Promise<any[]> {
    const res = await this.ctx.get('/fineract-provider/api/v1/codes');
    return this.validateResponse(res, 'getCodes');
  }

  /**
   * Fetches basic loan product details used for deterministic test setup.
   * @returns The loan product basic-details collection
   */
  async getLoanProductsBasicDetails(): Promise<any[]> {
    const res = await this.ctx.get('/fineract-provider/api/v1/loanproducts/basic-details');
    return this.validateResponse(res, 'getLoanProductsBasicDetails');
  }

  /**
   * Creates a loan product using the supplied request payload.
   * @param data - The loan product creation payload
   * @returns The Fineract create-loan-product response payload
   */
  async createLoanProduct(data: Record<string, unknown>): Promise<any> {
    const res = await this.ctx.post('/fineract-provider/api/v1/loanproducts', { data });
    return this.validateResponse(res, 'createLoanProduct');
  }

  /**
   * Fetches a loan with associations by loan id.
   * @param clientId - The loan id to fetch
   * @returns The requested loan payload with associations
   */
  async getLoan(clientId: number): Promise<any> {
    const res = await this.ctx.get(`/fineract-provider/api/v1/loans/${clientId}?associations=all`);
    return this.validateResponse(res, 'getLoan');
  }

  /**
   * Fetches the individual loan template for a client and optional product.
   * @param clientId - The client id used to resolve the loan template
   * @param productId - Optional loan product id to scope the template
   * @returns The loan template payload
   */
  async getLoanTemplate(clientId: number, productId?: number): Promise<any> {
    const query = new URLSearchParams({
      clientId: clientId.toString(),
      templateType: 'individual',
      activeOnly: 'true',
      staffInSelectedOfficeOnly: 'true'
    });

    if (productId) {
      query.set('productId', productId.toString());
    }

    const res = await this.ctx.get(`/fineract-provider/api/v1/loans/template?${query.toString()}`);
    return this.validateResponse(res, 'getLoanTemplate');
  }

  /**
   * Creates a loan using the supplied request payload.
   * @param data - The loan creation payload
   * @returns The Fineract create-loan response payload
   */
  async createLoan(data: Record<string, unknown>): Promise<any> {
    const res = await this.ctx.post('/fineract-provider/api/v1/loans', { data });
    return this.validateResponse(res, 'createLoan');
  }

  /**
   * Fetches code values for a specific code id.
   * @param codeId - The code id whose values should be fetched
   * @returns The code values for the requested code
   */
  async getCodeValues(codeId: number): Promise<any[]> {
    const res = await this.ctx.get(`/fineract-provider/api/v1/codes/${codeId}/codevalues`);
    return this.validateResponse(res, 'getCodeValues');
  }

  /**
   * Creates a new code value under a specific code id.
   * @param codeId - The code id that owns the new value
   * @param data - The code value creation payload
   * @returns The Fineract create-code-value response payload
   */
  async createCodeValue(codeId: number, data: Record<string, unknown>): Promise<any> {
    const res = await this.ctx.post(`/fineract-provider/api/v1/codes/${codeId}/codevalues`, { data });
    return this.validateResponse(res, 'createCodeValue');
  }

  /**
   * Executes a command against an existing client resource.
   * @param clientId - The client id to operate on
   * @param command - The Fineract client command name
   * @param data - The command payload
   * @returns The command response payload
   */
  async executeClientCommand(clientId: number, command: string, data: Record<string, unknown>): Promise<any> {
    const res = await this.ctx.post(`/fineract-provider/api/v1/clients/${clientId}?command=${command}`, { data });
    return this.validateResponse(res, 'executeClientCommand');
  }

  /**
   * Executes a command against an existing loan resource.
   * @param loanId - The loan id to operate on
   * @param command - The Fineract loan command name
   * @param data - The command payload
   * @returns The command response payload
   */
  async executeLoanCommand(loanId: number, command: string, data: Record<string, unknown>): Promise<any> {
    const res = await this.ctx.post(`/fineract-provider/api/v1/loans/${loanId}?command=${command}`, { data });
    return this.validateResponse(res, 'executeLoanCommand');
  }

  /**
   * Resolves a system code by its exact name.
   * @param codeName - The exact system code name
   * @returns The matching system code payload
   */
  async getCodeByName(codeName: string): Promise<any> {
    const codes = await this.getCodes();
    const code = codes.find((candidate) => candidate.name === codeName);

    if (!code) {
      throw new Error(`Fineract API error [getCodeByName]: code '${codeName}' not found`);
    }

    return code;
  }

  /**
   * Ensures a named code value exists and returns the existing or created value.
   * @param codeName - The parent system code name
   * @param valueName - The exact code value name
   * @param options - Optional code value creation attributes
   * @returns The existing or created code value
   */
  async ensureCodeValue(
    codeName: string,
    valueName: string,
    options: {
      description?: string;
      isActive?: boolean;
    } = {}
  ): Promise<any> {
    const code = await this.getCodeByName(codeName);
    for (let attempt = 0; attempt <= FineractApiClient.CREATE_RACE_RETRY_COUNT; attempt += 1) {
      const existingValues = await this.getCodeValues(code.id);
      const existingValue = existingValues.find((value) => value.name === valueName);

      if (existingValue) {
        return existingValue;
      }

      try {
        const createdValue = await this.createCodeValue(code.id, {
          name: valueName,
          description: options.description ?? `Seeded for Playwright tests: ${valueName}`,
          position: existingValues.length + 1,
          isActive: options.isActive ?? true
        });

        return {
          id: createdValue.subResourceId,
          name: valueName
        };
      } catch (error) {
        if (!this.isRecoverableDuplicateError(error)) {
          throw error;
        }

        if (attempt === FineractApiClient.CREATE_RACE_RETRY_COUNT) {
          const refreshedValues = await this.getCodeValues(code.id);
          const refreshedValue = refreshedValues.find((value) => value.name === valueName);

          if (refreshedValue) {
            return refreshedValue;
          }
        } else {
          await this.waitForCreateRaceRetry();
        }
      }
    }

    throw new Error(`Fineract API error [ensureCodeValue]: failed to resolve code value '${valueName}'`);
  }

  /**
   * Ensures a closure reason exists for close-client workflow tests.
   * @param name - The closure reason name to ensure exists
   * @returns The existing or created closure reason
   */
  async ensureClientClosureReason(name = 'E2E Close Client Reason'): Promise<any> {
    return this.ensureCodeValue(FineractApiClient.CLIENT_CLOSURE_REASON_CODE_NAME, name, {
      description: 'Seeded for Playwright close-client test'
    });
  }

  /**
   * Ensures a minimal loan product exists for active-loan negative-path tests.
   * @param options - Optional loan product identifiers to match or create
   * @returns The existing or created loan product
   */
  async ensureMinimalLoanProduct(
    options: {
      name?: string;
      shortName?: string;
    } = {}
  ): Promise<any> {
    const name = options.name ?? 'E2E Loan Product';
    const shortName = options.shortName ?? 'E2LP';
    for (let attempt = 0; attempt <= FineractApiClient.CREATE_RACE_RETRY_COUNT; attempt += 1) {
      const existingProducts = await this.getLoanProductsBasicDetails();
      const existingProduct = existingProducts.find(
        (product) => product.name === name && product.shortName === shortName
      );

      if (existingProduct) {
        return existingProduct;
      }

      try {
        const createdProduct = await this.createLoanProduct({
          name,
          shortName,
          description: 'Seeded for Playwright tests',
          includeInBorrowerCycle: false,
          currencyCode: 'USD',
          digitsAfterDecimal: 2,
          principal: 1000,
          numberOfRepayments: 1,
          repaymentEvery: 1,
          repaymentFrequencyType: 2,
          interestRatePerPeriod: 0,
          interestRateFrequencyType: 2,
          amortizationType: 1,
          interestType: 0,
          interestCalculationPeriodType: 1,
          transactionProcessingStrategyCode: 'mifos-standard-strategy',
          daysInMonthType: 1,
          daysInYearType: 1,
          accountingRule: 1,
          loanScheduleType: 'CUMULATIVE',
          loanScheduleProcessingType: 'HORIZONTAL',
          isInterestRecalculationEnabled: false,
          dateFormat: FineractApiClient.DEFAULT_DATE_FORMAT,
          locale: FineractApiClient.DEFAULT_LOCALE,
          charges: []
        });

        return {
          id: createdProduct.resourceId,
          name,
          shortName
        };
      } catch (error) {
        if (!this.isRecoverableDuplicateError(error)) {
          throw error;
        }

        if (attempt === FineractApiClient.CREATE_RACE_RETRY_COUNT) {
          const refreshedProducts = await this.getLoanProductsBasicDetails();
          const refreshedProduct = refreshedProducts.find(
            (product) => product.name === name && product.shortName === shortName
          );

          if (refreshedProduct) {
            return refreshedProduct;
          }
        } else {
          await this.waitForCreateRaceRetry();
        }
      }
    }

    throw new Error(`Fineract API error [ensureMinimalLoanProduct]: failed to resolve loan product '${name}'`);
  }

  /**
   * Closes a client with the provided reason and closure date.
   * @param clientId - The client id to close
   * @param closureReasonId - The closure reason code value id
   * @param closureDate - The closure date in Fineract's expected format
   * @returns The close-client command response payload
   */
  async closeClient(clientId: number, closureReasonId: number, closureDate: string): Promise<any> {
    return this.executeClientCommand(clientId, 'close', {
      closureDate,
      closureReasonId,
      dateFormat: FineractApiClient.DEFAULT_DATE_FORMAT,
      locale: FineractApiClient.DEFAULT_LOCALE
    });
  }

  /**
   * Approves a loan on the provided date.
   * @param loanId - The loan id to approve
   * @param approvedOnDate - The approval date in Fineract's expected format
   * @returns The approve-loan command response payload
   */
  async approveLoan(loanId: number, approvedOnDate: string): Promise<any> {
    return this.executeLoanCommand(loanId, 'approve', {
      approvedOnDate,
      dateFormat: FineractApiClient.DEFAULT_DATE_FORMAT,
      locale: FineractApiClient.DEFAULT_LOCALE
    });
  }

  /**
   * Disburses a loan on the provided date for the supplied amount.
   * @param loanId - The loan id to disburse
   * @param actualDisbursementDate - The disbursement date in Fineract's expected format
   * @param transactionAmount - The amount to disburse
   * @returns The disburse-loan command response payload
   */
  async disburseLoan(loanId: number, actualDisbursementDate: string, transactionAmount: number): Promise<any> {
    return this.executeLoanCommand(loanId, 'disburse', {
      actualDisbursementDate,
      transactionAmount,
      dateFormat: FineractApiClient.DEFAULT_DATE_FORMAT,
      locale: FineractApiClient.DEFAULT_LOCALE
    });
  }

  /**
   * Creates, approves, and disburses an active loan for a client.
   * @param clientId - The client id that owns the loan
   * @param submittedOnDate - The submitted-on date in Fineract's expected format
   * @param expectedDisbursementDate - The expected disbursement date in Fineract's expected format
   * @returns The created loan after approval and disbursement
   */
  async createActiveLoanForClient(
    clientId: number,
    submittedOnDate: string,
    expectedDisbursementDate: string
  ): Promise<any> {
    const loanProduct = await this.ensureMinimalLoanProduct();
    const loanTemplate = await this.getLoanTemplate(clientId, loanProduct.id);
    const principal = loanTemplate.principal ?? 1000;

    const createLoanResponse = await this.createLoan({
      clientId,
      productId: loanProduct.id,
      submittedOnDate,
      expectedDisbursementDate,
      principal,
      loanType: 'individual',
      loanTermFrequency: loanTemplate.termFrequency ?? 1,
      loanTermFrequencyType: loanTemplate.termPeriodFrequencyType?.id ?? 2,
      numberOfRepayments: loanTemplate.numberOfRepayments ?? 1,
      repaymentEvery: loanTemplate.repaymentEvery ?? 1,
      repaymentFrequencyType: loanTemplate.repaymentFrequencyType?.id ?? 2,
      interestRatePerPeriod: loanTemplate.interestRatePerPeriod ?? 0,
      interestRateFrequencyType: loanTemplate.interestRateFrequencyType?.id ?? 2,
      amortizationType: loanTemplate.amortizationType?.id ?? 1,
      interestType: loanTemplate.interestType?.id ?? 0,
      interestCalculationPeriodType: loanTemplate.interestCalculationPeriodType?.id ?? 1,
      transactionProcessingStrategyCode: loanTemplate.transactionProcessingStrategyCode ?? 'mifos-standard-strategy',
      dateFormat: FineractApiClient.DEFAULT_DATE_FORMAT,
      locale: FineractApiClient.DEFAULT_LOCALE
    });

    const loanId = createLoanResponse.loanId ?? createLoanResponse.resourceId;
    await this.approveLoan(loanId, submittedOnDate);
    await this.disburseLoan(loanId, expectedDisbursementDate, principal);

    return this.getLoan(loanId);
  }

  /**
   * Creates an active client with deterministic activation details.
   * @param officeId - The office id that owns the client
   * @param data - The active client creation details
   * @returns The Fineract create-client response payload
   */
  async createActiveClient(
    officeId: number,
    data: {
      firstname: string;
      lastname: string;
      submittedOnDate: string;
      activationDate: string;
    }
  ): Promise<any> {
    return this.createClient({
      officeId,
      legalFormId: 1,
      firstname: data.firstname,
      lastname: data.lastname,
      active: true,
      submittedOnDate: data.submittedOnDate,
      activationDate: data.activationDate,
      dateFormat: FineractApiClient.DEFAULT_DATE_FORMAT,
      locale: FineractApiClient.DEFAULT_LOCALE
    });
  }

  /**
   * Creates a pending client that has not yet been activated.
   * @param officeId - The office id that owns the client
   * @param data - The pending client creation details
   * @returns The Fineract create-client response payload
   */
  async createPendingClient(
    officeId: number,
    data: {
      firstname: string;
      lastname: string;
      submittedOnDate: string;
    }
  ): Promise<any> {
    return this.createClient({
      officeId,
      legalFormId: 1,
      firstname: data.firstname,
      lastname: data.lastname,
      active: false,
      submittedOnDate: data.submittedOnDate,
      dateFormat: FineractApiClient.DEFAULT_DATE_FORMAT,
      locale: FineractApiClient.DEFAULT_LOCALE
    });
  }

  /**
   * Returns the first available office id for test setup.
   * @returns The first available office id
   */
  async getFirstOfficeId(): Promise<number> {
    const offices = await this.getOffices();
    const officeId = offices[0]?.id;

    if (!officeId) {
      throw new Error('Fineract API error [getFirstOfficeId]: no offices available');
    }

    return officeId;
  }

  /**
   * Creates a savings account.
   * @param overrides Must include mandatory Fineract fields:
   *   submittedOnDate, dateFormat, locale, nominalAnnualInterestRate,
   *   interestCompoundingPeriodType, interestPostingPeriodType,
   *   interestCalculationType, interestCalculationDaysInYearType
   * @param clientId - The client id that owns the savings account
   * @param productId - The savings product id to create the account from
   * @param overrides - Additional savings account creation fields
   * @returns The Fineract create-savings-account response payload
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

  /**
   * Disposes the underlying Playwright request context.
   */
  async dispose(): Promise<void> {
    await this.ctx?.dispose();
  }
}
