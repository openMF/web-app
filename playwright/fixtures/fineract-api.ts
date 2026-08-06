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
  private static readonly CLIENT_REJECT_REASON_CODE_NAME = 'ClientRejectReason';
  private static readonly CLIENT_WITHDRAW_REASON_CODE_NAME = 'ClientWithdrawReason';
  private static readonly DEFAULT_DATE_FORMAT = 'dd MMMM yyyy';
  private static readonly DEFAULT_LOCALE = 'en';
  private static readonly DEFAULT_CURRENCY_CODE = 'USD';

  // Savings enum ids. Fineract exposes these through
  // `/savingsproducts/template`; they are stable across stock tenants,
  // and naming them here keeps the seed payload readable instead of a
  // wall of bare integers. Tests asserting on a specific option should
  // still read it from the template rather than these constants.
  /** `interestCompoundingPeriodType` — Daily. */
  private static readonly SAVINGS_COMPOUNDING_DAILY = 1;
  /** `interestPostingPeriodType` — Monthly. */
  private static readonly SAVINGS_POSTING_MONTHLY = 4;
  /** `interestCalculationType` — Daily balance. */
  private static readonly SAVINGS_CALCULATION_DAILY_BALANCE = 1;
  /** `interestCalculationDaysInYearType` — 365 days. */
  private static readonly SAVINGS_DAYS_IN_YEAR_365 = 365;
  /** Nominal annual interest rate applied to the shared E2E product. */
  private static readonly DEFAULT_SAVINGS_INTEREST_RATE = 5;

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
   * Fetches the client creation template from Fineract, optionally scoped to an office.
   * @param officeId - Optional office id to scope the template
   * @returns The client template payload
   */
  async getClientTemplate(officeId?: number): Promise<any> {
    const url = officeId
      ? `/fineract-provider/api/v1/clients/template?officeId=${officeId}`
      : '/fineract-provider/api/v1/clients/template';
    const res = await this.ctx.get(url);
    return this.validateResponse(res, 'getClientTemplate');
  }

  /**
   * Creates a group using the supplied request payload.
   * @param data - The group creation payload
   * @returns The Fineract create-group response payload
   */
  async createGroup(data: Record<string, unknown>): Promise<any> {
    const res = await this.ctx.post('/fineract-provider/api/v1/groups', { data });
    return this.validateResponse(res, 'createGroup');
  }

  /**
   * Fetches a group record by id.
   * @param groupId - The group id to fetch
   * @returns The requested group payload
   */
  async getGroup(groupId: number): Promise<any> {
    const res = await this.ctx.get(`/fineract-provider/api/v1/groups/${groupId}`);
    return this.validateResponse(res, 'getGroup');
  }

  /**
   * Deletes a group by id. Only pending groups with no member clients
   * are accepted by Fineract for hard-delete.
   * @param groupId - The group id to delete
   * @returns The Fineract delete-group response payload
   */
  async deleteGroup(groupId: number): Promise<any> {
    const res = await this.ctx.delete(`/fineract-provider/api/v1/groups/${groupId}`);
    return this.validateResponse(res, 'deleteGroup');
  }

  /**
   * Creates a user (application user / staff with login) using the supplied payload.
   * @param data - The user creation payload
   * @returns The Fineract create-user response payload
   */
  async createUser(data: Record<string, unknown>): Promise<any> {
    const res = await this.ctx.post('/fineract-provider/api/v1/users', { data });
    return this.validateResponse(res, 'createUser');
  }

  /**
   * Fetches a user record by id.
   * @param userId - The user id to fetch
   * @returns The requested user payload
   */
  async getUser(userId: number): Promise<any> {
    const res = await this.ctx.get(`/fineract-provider/api/v1/users/${userId}`);
    return this.validateResponse(res, 'getUser');
  }

  /**
   * Deletes a user by id.
   * @param userId - The user id to delete
   * @returns The Fineract delete-user response payload
   */
  async deleteUser(userId: number): Promise<any> {
    const res = await this.ctx.delete(`/fineract-provider/api/v1/users/${userId}`);
    return this.validateResponse(res, 'deleteUser');
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

    // Explicit undefined check, not a truthiness test: a product id of 0
    // is a valid scope and must still be sent, or the template silently
    // falls back to an unscoped (product-agnostic) response.
    if (productId !== undefined) {
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
   * Deletes a loan by id.
   *
   * Fineract only permits hard-delete while the loan is still in
   * "Submitted and pending approval". Approved or disbursed loans
   * cannot be deleted — the `CleanupGuard` records the failure without
   * throwing.
   * @param loanId - The loan id to delete
   */
  async deleteLoan(loanId: number): Promise<void> {
    const res = await this.ctx.delete(`/fineract-provider/api/v1/loans/${loanId}`);
    await this.validateResponse(res, 'deleteLoan');
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
   * Attempts a client command WITHOUT throwing on non-2xx responses.
   *
   * Sibling of {@link executeClientCommand} intended for negative-path
   * tests (illegal state transitions, validation-failure matrices)
   * where the error body IS the assertion target. Returns the raw
   * status code and body text so callers can pattern-match against
   * Fineract's `userMessageGlobalisationCode`, `developerMessage`,
   * or free-form user message strings — the same payload the UI
   * snackbar renders.
   *
   * @param clientId - The client id to operate on
   * @param command - The Fineract client command name (e.g. 'activate')
   * @param data - The command payload
   * @returns Response envelope with ok flag, HTTP status, and raw body text
   */
  async tryExecuteClientCommand(
    clientId: number,
    command: string,
    data: Record<string, unknown>
  ): Promise<{ ok: boolean; status: number; bodyText: string }> {
    const res = await this.ctx.post(`/fineract-provider/api/v1/clients/${clientId}?command=${command}`, { data });
    const bodyText = await res.text();
    return { ok: res.ok(), status: res.status(), bodyText };
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
   * Ensures a rejection reason exists for reject-client workflow tests.
   * @param name - The rejection reason name to ensure exists
   * @returns The existing or created rejection reason
   */
  async ensureClientRejectionReason(name = 'E2E Reject Client Reason'): Promise<any> {
    return this.ensureCodeValue(FineractApiClient.CLIENT_REJECT_REASON_CODE_NAME, name, {
      description: 'Seeded for Playwright reject-client test'
    });
  }

  /**
   * Ensures a withdrawal reason exists for withdraw-client workflow tests.
   * @param name - The withdrawal reason name to ensure exists
   * @returns The existing or created withdrawal reason
   */
  async ensureClientWithdrawalReason(name = 'E2E Withdraw Client Reason'): Promise<any> {
    return this.ensureCodeValue(FineractApiClient.CLIENT_WITHDRAW_REASON_CODE_NAME, name, {
      description: 'Seeded for Playwright withdraw-client test'
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
   * Rejects a client with the provided reason and rejection date.
   * @param clientId - The client id to reject
   * @param rejectionReasonId - The rejection reason code value id
   * @param rejectionDate - The rejection date in Fineract's expected format
   * @returns The reject-client command response payload
   */
  async rejectClient(clientId: number, rejectionReasonId: number, rejectionDate: string): Promise<any> {
    return this.executeClientCommand(clientId, 'reject', {
      rejectionDate,
      rejectionReasonId,
      dateFormat: FineractApiClient.DEFAULT_DATE_FORMAT,
      locale: FineractApiClient.DEFAULT_LOCALE
    });
  }

  /**
   * Withdraws a client application with the provided reason and withdrawal date.
   * @param clientId - The client id to withdraw
   * @param withdrawalReasonId - The withdrawal reason code value id
   * @param withdrawalDate - The withdrawal date in Fineract's expected format
   * @returns The withdraw-client command response payload
   */
  async withdrawClient(clientId: number, withdrawalReasonId: number, withdrawalDate: string): Promise<any> {
    return this.executeClientCommand(clientId, 'withdraw', {
      withdrawalDate,
      withdrawalReasonId,
      dateFormat: FineractApiClient.DEFAULT_DATE_FORMAT,
      locale: FineractApiClient.DEFAULT_LOCALE
    });
  }

  /**
   * Approves a loan on the provided date.
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

  // ── Savings products ─────────────────────────────────────────────

  /**
   * Fetches all configured savings products.
   *
   * Used by {@link ensureMinimalSavingsProduct} to decide whether the
   * shared E2E product already exists. Unlike loan products, Fineract
   * exposes no `basic-details` projection for savings, so this returns
   * the full product list.
   * @returns The savings product collection
   */
  async getSavingsProducts(): Promise<any[]> {
    const res = await this.ctx.get('/fineract-provider/api/v1/savingsproducts');
    return this.validateResponse(res, 'getSavingsProducts');
  }

  /**
   * Fetches the savings product creation template.
   *
   * The template carries the enum option lists
   * (`interestCompoundingPeriodTypeOptions`,
   * `interestPostingPeriodTypeOptions`, …) that the create-product
   * payload references by id. Callers that need to assert against a
   * specific option should read it from here rather than hard-coding
   * an id, since the ids are tenant-configurable.
   * @returns The savings product template payload
   */
  async getSavingsProductTemplate(): Promise<any> {
    const res = await this.ctx.get('/fineract-provider/api/v1/savingsproducts/template');
    return this.validateResponse(res, 'getSavingsProductTemplate');
  }

  /**
   * Creates a savings product using the supplied request payload.
   * @param data - The savings product creation payload
   * @returns The Fineract create-savings-product response payload
   */
  async createSavingsProduct(data: Record<string, unknown>): Promise<any> {
    const res = await this.ctx.post('/fineract-provider/api/v1/savingsproducts', { data });
    return this.validateResponse(res, 'createSavingsProduct');
  }

  /**
   * Ensures a minimal savings product exists for savings-account tests.
   *
   * Mirrors {@link ensureMinimalLoanProduct} exactly, including the
   * duplicate-create race retry: several workers may reach this method
   * concurrently on a cold tenant, and only one POST can win.
   *
   * The product name is deliberately FIXED (not `E2E_`-suffixed via
   * `generateE2EName`). Products are shared infrastructure rather than
   * per-test data — generating a unique product per test would bloat
   * the tenant and defeat the `ApiSetupManager` dedupe that makes this
   * a one-time cost for the whole run.
   *
   * `accountingRule: 1` (NONE) keeps the product free of any
   * chart-of-accounts / GL mapping prerequisites.
   *
   * @param options - Optional savings product identifiers to match or create
   * @returns The existing or created savings product
   */
  async ensureMinimalSavingsProduct(
    options: {
      name?: string;
      shortName?: string;
    } = {}
  ): Promise<any> {
    const name = options.name ?? 'E2E Savings Product';
    const shortName = options.shortName ?? 'E2SP';

    for (let attempt = 0; attempt <= FineractApiClient.CREATE_RACE_RETRY_COUNT; attempt += 1) {
      const existingProducts = await this.getSavingsProducts();
      const existingProduct = existingProducts.find(
        (product) => product.name === name && product.shortName === shortName
      );

      if (existingProduct) {
        return existingProduct;
      }

      try {
        const createdProduct = await this.createSavingsProduct({
          name,
          shortName,
          description: 'Seeded for Playwright tests',
          currencyCode: FineractApiClient.DEFAULT_CURRENCY_CODE,
          digitsAfterDecimal: 2,
          inMultiplesOf: 0,
          // These five interest fields map 1:1 onto the required
          // controls of the savings-account TERMS step, so an account
          // created from this product can be submitted without the
          // spec supplying any of them explicitly.
          nominalAnnualInterestRate: FineractApiClient.DEFAULT_SAVINGS_INTEREST_RATE,
          interestCompoundingPeriodType: FineractApiClient.SAVINGS_COMPOUNDING_DAILY,
          interestPostingPeriodType: FineractApiClient.SAVINGS_POSTING_MONTHLY,
          interestCalculationType: FineractApiClient.SAVINGS_CALCULATION_DAILY_BALANCE,
          interestCalculationDaysInYearType: FineractApiClient.SAVINGS_DAYS_IN_YEAR_365,
          accountingRule: 1,
          withdrawalFeeForTransfers: false,
          // NOTE: no `dateFormat` here, deliberately. Unlike almost
          // every other Fineract create endpoint, /savingsproducts
          // carries no date field at all, and its parameter allow-list
          // rejects `dateFormat` outright with
          // "The parameter dateFormat is not supported." `locale` is
          // still required — it drives decimal parsing on the interest
          // rate.
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
          const refreshedProducts = await this.getSavingsProducts();
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

    throw new Error(`Fineract API error [ensureMinimalSavingsProduct]: failed to resolve savings product '${name}'`);
  }

  // ── Savings accounts ─────────────────────────────────────────────

  /**
   * Fetches the savings-account application template for a client.
   * @param clientId - The client id used to resolve the template
   * @param productId - Optional savings product id to scope the template
   * @returns The savings account template payload
   */
  async getSavingsAccountTemplate(clientId: number, productId?: number): Promise<any> {
    const query = new URLSearchParams({ clientId: clientId.toString() });

    // Explicit undefined check, not a truthiness test: a product id of 0
    // is a valid scope and must still be sent, or the template silently
    // falls back to an unscoped (product-agnostic) response.
    if (productId !== undefined) {
      query.set('productId', productId.toString());
    }

    const res = await this.ctx.get(`/fineract-provider/api/v1/savingsaccounts/template?${query.toString()}`);
    return this.validateResponse(res, 'getSavingsAccountTemplate');
  }

  /**
   * Creates a savings account.
   *
   * Fineract requires the five interest fields plus `submittedOnDate`,
   * `dateFormat`, and `locale` on every create. Prefer
   * {@link createSavingsAccountForClient}, which derives them from the
   * product template, over calling this directly with hand-written
   * values.
   *
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
   * Fetches a savings account with all associations by id.
   * @param savingsAccountId - The savings account id to fetch
   * @returns The requested savings account payload
   */
  async getSavingsAccount(savingsAccountId: number): Promise<any> {
    const res = await this.ctx.get(`/fineract-provider/api/v1/savingsaccounts/${savingsAccountId}?associations=all`);
    return this.validateResponse(res, 'getSavingsAccount');
  }

  /**
   * Deletes a savings account by id.
   *
   * Fineract only permits hard-delete while the account is still in
   * "Submitted and pending approval". Approved or active accounts
   * cannot be deleted at all — the `CleanupGuard` records the failure
   * without throwing, and the `E2E_` name prefix keeps the orphan
   * greppable.
   * @param savingsAccountId - The savings account id to delete
   */
  async deleteSavingsAccount(savingsAccountId: number): Promise<void> {
    const res = await this.ctx.delete(`/fineract-provider/api/v1/savingsaccounts/${savingsAccountId}`);
    await this.validateResponse(res, 'deleteSavingsAccount');
  }

  /**
   * Executes a command against an existing savings account resource.
   * @param savingsAccountId - The savings account id to operate on
   * @param command - The Fineract savings command name (approve, activate, …)
   * @param data - The command payload
   * @returns The command response payload
   */
  async executeSavingsCommand(
    savingsAccountId: number,
    command: string,
    data: Record<string, unknown> = {}
  ): Promise<any> {
    const res = await this.ctx.post(
      `/fineract-provider/api/v1/savingsaccounts/${savingsAccountId}?command=${command}`,
      { data }
    );
    return this.validateResponse(res, 'executeSavingsCommand');
  }

  /**
   * Attempts a savings command WITHOUT throwing on non-2xx responses.
   *
   * Sibling of {@link executeSavingsCommand} for negative-path tests
   * (illegal transitions, validation matrices) where the error body IS
   * the assertion target. Mirrors {@link tryExecuteClientCommand}.
   *
   * @param savingsAccountId - The savings account id to operate on
   * @param command - The Fineract savings command name
   * @param data - The command payload
   * @returns Response envelope with ok flag, HTTP status, and raw body text
   */
  async tryExecuteSavingsCommand(
    savingsAccountId: number,
    command: string,
    data: Record<string, unknown> = {}
  ): Promise<{ ok: boolean; status: number; bodyText: string }> {
    const res = await this.ctx.post(
      `/fineract-provider/api/v1/savingsaccounts/${savingsAccountId}?command=${command}`,
      { data }
    );
    const bodyText = await res.text();
    return { ok: res.ok(), status: res.status(), bodyText };
  }

  /**
   * Approves a savings account on the provided date.
   * @param savingsAccountId - The savings account id to approve
   * @param approvedOnDate - The approval date in Fineract's expected format
   * @returns The approve command response payload
   */
  async approveSavingsAccount(savingsAccountId: number, approvedOnDate: string): Promise<any> {
    return this.executeSavingsCommand(savingsAccountId, 'approve', {
      approvedOnDate,
      dateFormat: FineractApiClient.DEFAULT_DATE_FORMAT,
      locale: FineractApiClient.DEFAULT_LOCALE
    });
  }

  /**
   * Activates an approved savings account on the provided date.
   * @param savingsAccountId - The savings account id to activate
   * @param activatedOnDate - The activation date in Fineract's expected format
   * @returns The activate command response payload
   */
  async activateSavingsAccount(savingsAccountId: number, activatedOnDate: string): Promise<any> {
    return this.executeSavingsCommand(savingsAccountId, 'activate', {
      activatedOnDate,
      dateFormat: FineractApiClient.DEFAULT_DATE_FORMAT,
      locale: FineractApiClient.DEFAULT_LOCALE
    });
  }

  /**
   * Posts a transaction against an ACTIVE savings account.
   *
   * @param savingsAccountId - The savings account id to transact on
   * @param command - Either 'deposit' or 'withdrawal'
   * @param transactionDate - The transaction date in Fineract's expected format
   * @param transactionAmount - The transaction amount
   * @returns The transaction response payload
   */
  async createSavingsTransaction(
    savingsAccountId: number,
    command: 'deposit' | 'withdrawal',
    transactionDate: string,
    transactionAmount: number
  ): Promise<any> {
    const res = await this.ctx.post(
      `/fineract-provider/api/v1/savingsaccounts/${savingsAccountId}/transactions?command=${command}`,
      {
        data: {
          transactionDate,
          transactionAmount,
          dateFormat: FineractApiClient.DEFAULT_DATE_FORMAT,
          locale: FineractApiClient.DEFAULT_LOCALE
        }
      }
    );
    return this.validateResponse(res, 'createSavingsTransaction');
  }

  /**
   * Creates a savings account for a client, deriving every required
   * interest field from the product template.
   *
   * This is the method factories should call: hand-writing the five
   * interest fields at each call site is the most common source of
   * `createSavingsAccount` 400s, and the template already carries
   * tenant-correct values.
   *
   * @param clientId - The client id that owns the account
   * @param submittedOnDate - The submitted-on date. MUST NOT precede
   *   the client's activation date or Fineract rejects the create.
   * @param productId - Optional savings product id; defaults to the
   *   shared minimal E2E product.
   * @returns The Fineract create-savings-account response payload
   */
  async createSavingsAccountForClient(clientId: number, submittedOnDate: string, productId?: number): Promise<any> {
    const resolvedProductId = productId ?? (await this.ensureMinimalSavingsProduct()).id;
    const template = await this.getSavingsAccountTemplate(clientId, resolvedProductId);

    return this.createSavingsAccount(clientId, resolvedProductId, {
      submittedOnDate,
      nominalAnnualInterestRate: template.nominalAnnualInterestRate ?? FineractApiClient.DEFAULT_SAVINGS_INTEREST_RATE,
      interestCompoundingPeriodType:
        template.interestCompoundingPeriodType?.id ?? FineractApiClient.SAVINGS_COMPOUNDING_DAILY,
      interestPostingPeriodType: template.interestPostingPeriodType?.id ?? FineractApiClient.SAVINGS_POSTING_MONTHLY,
      interestCalculationType:
        template.interestCalculationType?.id ?? FineractApiClient.SAVINGS_CALCULATION_DAILY_BALANCE,
      interestCalculationDaysInYearType:
        template.interestCalculationDaysInYearType?.id ?? FineractApiClient.SAVINGS_DAYS_IN_YEAR_365,
      dateFormat: FineractApiClient.DEFAULT_DATE_FORMAT,
      locale: FineractApiClient.DEFAULT_LOCALE
    });
  }

  /**
   * Deletes a client by id. Only works for clients in Pending state
   * (Fineract rejects deletion of active/closed clients).
   * @param clientId - The client id to delete
   */
  async deleteClient(clientId: number): Promise<void> {
    const res = await this.ctx.delete(`/fineract-provider/api/v1/clients/${clientId}`);
    await this.validateResponse(res, 'deleteClient');
  }

  /**
   * Returns all family members for a client.
   * @param clientId - The client id
   */
  async getClientFamilyMembers(clientId: number): Promise<any[]> {
    const res = await this.ctx.get(`/fineract-provider/api/v1/clients/${clientId}/familymembers`);
    const body = await this.validateResponse(res, 'getClientFamilyMembers');
    return Array.isArray(body) ? body : (body?.clients ?? []);
  }

  /**
   * Deletes a single family member record for a client.
   * Must be called before deleteClient to avoid a 403 FK violation.
   * @param clientId - The owning client id
   * @param memberId - The family member id to delete
   */
  async deleteClientFamilyMember(clientId: number, memberId: number): Promise<void> {
    const res = await this.ctx.delete(`/fineract-provider/api/v1/clients/${clientId}/familymembers/${memberId}`);
    await this.validateResponse(res, 'deleteClientFamilyMember');
  }

  /**
   * Disposes the underlying Playwright request context.
   */
  async dispose(): Promise<void> {
    await this.ctx?.dispose();
  }
}
