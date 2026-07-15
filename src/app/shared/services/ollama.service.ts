/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'environments/environment';

interface OllamaTagsResponse {
  models: Array<{ name: string }>;
}

interface OllamaGenerateResponse {
  response: string;
}

/**
 * Service for communicating with a local Ollama instance.
 *
 * Uses HttpBackend directly to bypass Fineract auth interceptors.
 * The feature is fully optional — all methods no-op when disabled or unconfigured.
 */
@Injectable({
  providedIn: 'root'
})
export class OllamaService {
  private httpBackend = inject(HttpBackend);
  private externalHttp = new HttpClient(this.httpBackend);

  get enabled(): boolean {
    const stored = localStorage.getItem('mifosXOllamaEnabled');
    if (stored !== null) {
      return stored === 'true';
    }
    return environment.ollamaEnabled;
  }

  get url(): string {
    return localStorage.getItem('mifosXOllamaUrl') || environment.ollamaUrl || '';
  }

  get model(): string {
    return localStorage.getItem('mifosXOllamaModel') || environment.ollamaModel || '';
  }

  /** Returns list of available model names from the configured Ollama URL. */
  listModels(): Observable<string[]> {
    return this.listModelsFromUrl(this.url);
  }

  /** Returns list of available model names from a given Ollama URL (used before saving settings). */
  listModelsFromUrl(url: string): Observable<string[]> {
    if (!url) return of([]);
    return this.externalHttp.get<OllamaTagsResponse>(`${url}/api/tags`).pipe(
      map((res) => (res?.models ?? []).map((m) => m.name)),
      catchError(() => of([]))
    );
  }

  /**
   * Sends a prompt to Ollama and returns the generated text.
   * Returns an empty string if the service is disabled or unconfigured.
   */
  generate(prompt: string, system?: string): Observable<string> {
    if (!this.enabled || !this.url || !this.model) return of('');
    const body: Record<string, unknown> = { model: this.model, prompt, stream: false };
    if (system) body['system'] = system;
    return this.externalHttp.post<OllamaGenerateResponse>(`${this.url}/api/generate`, body).pipe(
      map((res) => res?.response ?? ''),
      catchError(() => of(''))
    );
  }

  /**
   * Generates a Fineract SELECT query from a natural-language description.
   * Includes the core Fineract schema as a system prompt so Ollama can reference
   * real table and column names. Fineract runs on MySQL, MariaDB, or PostgreSQL,
   * so the prompt asks for portable ANSI SQL rather than a vendor-specific dialect.
   */
  generateSqlQuery(description: string): Observable<string> {
    const system = `You are a Mifos Fineract SQL report query generator.
Generate a single ANSI SQL SELECT query based on the user's description.
Fineract can run on MySQL, MariaDB, or PostgreSQL, so avoid vendor-specific syntax and stick to standard ANSI SQL.
Use only these tables and columns:

m_client: id, account_no, firstname, lastname, status_enum (100=pending 300=active 600=closed), office_id, staff_id, activation_date, birthdate, mobile_no, email_address
m_loan: id, account_no, client_id, group_id, product_id, loan_officer_id, loan_status_id (100=pending 200=approved 300=active 400=withdrawn 500=rejected 600=closed 700=overpaid), principal_amount, approved_principal, outstanding_derived, disbursedon_date, expected_maturedon_date, closedon_date, currency_code, office_id
m_loan_repayment_schedule: id, loan_id, duedate, installment, principal_amount, interest_amount, fee_charges_amount, penalty_charges_amount, principal_completed_derived, interest_completed_derived, completed_derived
m_loan_transaction: id, loan_id, transaction_type_enum (1=disbursement 2=repayment 5=waive_interest 9=written_off), transaction_date, amount, is_reversed
m_savings_account: id, account_no, client_id, group_id, product_id, status_enum (100=submitted 200=approved 300=active 600=closed), account_balance_derived, currency_code, office_id
m_savings_account_transaction: id, savings_account_id, transaction_type_enum (1=deposit 2=withdrawal 4=interest_posting), transaction_date, amount, running_balance_derived, is_reversed
m_office: id, name, hierarchy, parent_id, opening_date
m_staff: id, firstname, lastname, display_name, is_loan_officer, is_active, office_id
m_group: id, account_no, display_name, office_id, staff_id, status_enum, level_id, activation_date
m_product_loan: id, name, currency_code, min_principal_amount, max_principal_amount
m_savings_product: id, name, currency_code
m_currency: code, name, display_symbol, decimal_places

Rules:
- Return ONLY the raw SQL SELECT statement. No markdown, no backticks, no explanation.
- Use meaningful column aliases (e.g. c.firstname AS first_name).
- Parameterise date ranges with ${'{'}dateFormat${'}'} and ${'{'}startDate${'}'} / ${'{'}endDate${'}'} placeholders if the user mentions a date range.`;

    return this.generate(description, system).pipe(map((sql) => this.validateSelectSql(this.stripMarkdownFences(sql))));
  }

  private stripMarkdownFences(text: string): string {
    return text
      .replace(/^```(?:sql)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();
  }

  /** Returns the SQL unchanged if it is a single SELECT statement, otherwise an empty string. */
  private validateSelectSql(sql: string): string {
    const normalized = sql.trim().replace(/;+\s*$/, '');
    const isSingleSelect = /^select\b/i.test(normalized) && !/;\s*\S/.test(normalized);
    return isSingleSelect ? normalized : '';
  }

  /** Returns true if the configured Ollama instance is reachable. */
  checkConnection(): Observable<boolean> {
    return this.checkConnectionAt(this.url);
  }

  /** Returns true if an Ollama instance at the given URL is reachable. */
  checkConnectionAt(url: string): Observable<boolean> {
    if (!url) return of(false);
    return this.externalHttp.get<OllamaTagsResponse>(`${url}/api/tags`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
