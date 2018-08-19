/** TODO: Separate services for feature modules for cleaner accounting service. */

/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Accounting service.
 */
@Injectable({
  providedIn: 'root'
})
export class AccountingService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @returns {Observable<any>} Offices data ordered by id.
   */
  getOffices(): Observable<any> {
    const httpParams = new HttpParams().set('orderBy', 'id');
    return  this.http.get('/offices', { params: httpParams });
  }

  /**
   * @param {boolean} useHttpParams True if http params should be used.
   * @returns {Observable<any>} Accounting rules data.
   */
  getAccountingRules(useHttpParams: boolean = false): Observable<any> {
    let httpParams = new HttpParams();
    if (useHttpParams) {
      httpParams = httpParams.set('associations', 'all');
    }
    return this.http.get('/accountingrules', { params: httpParams });
  }

  /**
   * @returns {Observable<any>} Currencies data.
   */
  getCurrencies(): Observable<any> {
    return this.http.get('/currencies');
  }

  /**
   * @returns {Observable<any>} Payment types data.
   */
  getPaymentTypes(): Observable<any> {
    return this.http.get('/paymenttypes');
  }

  /**
   * @param {any} journalEntry Journal entry to be created.
   * @returns {Observable<any>}
   */
  createJournalEntry(journalEntry: any): Observable<any> {
    return this.http.post('/journalentries', journalEntry);
  }

  /**
   * @returns {Observable<any>} GL Accounts.
   */
  getGlAccounts(): Observable<any> {
    const httpParams = new HttpParams()
      .set('manualEntriesAllowed', 'true')
      .set('usage', '1')
      .set('disabled', 'false');
    return this.http.get(`/glaccounts`, { params: httpParams });
  }

  /**
   * @param transactionId Transaction ID of journal entries.
   * @returns {Observable<any>} Journal Entries.
   */
  getJournalEntry(transactionId: string): Observable<any> {
    const httpParams = new HttpParams()
      .set('transactionId', transactionId)
      .set('transactionDetails', 'true');
    return this.http.get(`/journalentries`, { params: httpParams });
  }

  /**
   * @param {any} filterBy Properties by which entries should be filtered.
   * @param {string} orderBy Property by which entries should be sorted.
   * @param {string} sortOrder Sort order: ascending or descending.
   * @param {number} offset Page offset.
   * @param {number} limit Number of entries within the page.
   * @returns {Observable<any>} Journal Entries.
   */
  getJournalEntries(filterBy: any, orderBy: string, sortOrder: string, offset: number, limit: number): Observable<any> {
    let httpParams = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString())
      .set('sortOrder', sortOrder)
      .set('orderBy', orderBy);
    // filterBy: officeId, glAccountId, manualEntriesOnly, fromDate, toDate, transactionId
    filterBy.forEach(function (filter: any) {
      if (filter.value) {
        httpParams = httpParams.set(filter.type, filter.value);
      }
    });
    return this.http.get('/journalentries', { params: httpParams });
  }

  /**
   * @param {string} transactionId Transaction ID to be reverted.
   * @param {string} comments Any comments.
   * @returns {Observable<any>}
   */
  revertTransaction(transactionId: string, comments: string): Observable<any> {
    const httpParams = new HttpParams().set('command', 'reverse');
    let data = {};
    if (comments) {
      data = { comments: comments };
    }
    return this.http.post(`/journalentries/${transactionId}`, data, { params: httpParams });
  }

  /**
   * @returns {Observable<any>} Financial activity accounts.
   */
  getFinancialActivityAccounts(): Observable<any> {
    return this.http.get('/financialactivityaccounts');
  }

  /**
   * @returns {Observable<any>} Financial activity accounts template.
   */
  getFinancialActivityAccountsTemplate(): Observable<any> {
    return this.http.get('/financialactivityaccounts/template');
  }

  /**
   * @param {any} financialActivityAccount Financial activity account to be created.
   * @returns {Observable<any>}
   */
  createFinancialActivityAccount(financialActivityAccount: any): Observable<any> {
    return this.http.post('/financialactivityaccounts', financialActivityAccount);
  }

  /**
   * @param {string} financialActivityAccountId Financial activity account ID of financial activity account.
   * @param {boolean} template True if template is required.
   * @returns {Observable<any>} Financial activity account.
   */
  getFinancialActivityAccount(financialActivityAccountId: string, template: boolean = false): Observable<any> {
    const httpParams = new HttpParams().set('template', template.toString());
    return this.http.get(`/financialactivityaccounts/${financialActivityAccountId}`, { params: httpParams });
  }

  /**
   * @param {string} financialActivityAccountId Financial activity account ID of financial activity account to be updated.
   * @param {any} financialActivityAccount Financial activity account to be updated.
   * @returns {Observable<any>}
   */
  updateFinancialActivityAccount(financialActivityAccountId: string, financialActivityAccount: any): Observable<any> {
    return this.http.put(`/financialactivityaccounts/${financialActivityAccountId}`, financialActivityAccount);
  }

  /**
   * @param {string} financialActivityAccountId Financial activity account ID of financial activity account to be deleted.
   * @returns {Observable<any>}
   */
  deleteFinancialActivityAccount(financialActivityAccountId: string): Observable<any> {
    return this.http.delete(`/financialactivityaccounts/${financialActivityAccountId}`);
  }

  /**
   * @param {string} officeId Office ID to retrive opening balances accounts for.
   * @returns {Observable<any>}
   */
  retrieveOpeningBalances(officeId: string): Observable<any> {
    const httpParams = new HttpParams().set('officeId', officeId);
    return this.http.get('/journalentries/openingbalance', { params: httpParams });
  }

  /**
   * @param {any} openingBalances Opening balances for office accounts to be defined.
   * @returns {Observable<any>}
   */
  defineOpeningBalances(openingBalances: any): Observable<any> {
    const httpParams = new HttpParams().set('command', 'defineOpeningBalance');
    return this.http.post(`/journalentries`, openingBalances, { params: httpParams });
  }

  /**
   * @returns {Observable<any>} GL accounts.
   */
  getChartOfAccounts(): Observable<any> {
    return this.http.get('/glaccounts');
  }

  /**
   * @returns {Observable<any>} GL accounts template.
   */
  getChartOfAccountsTemplate(): Observable<any> {
    return this.http.get('/glaccounts/template');
  }

  /**
   * @param {any} glAccount GL account to be created.
   * @returns {Observable<any>}
   */
  createGlAccount(glAccount: any): Observable<any> {
    return this.http.post('/glaccounts', glAccount);
  }

  /**
   * @param {string} glAccountId GL account ID of gl account.
   * @param {boolean} template True if template is required.
   * @returns {Observable<any>} GL account.
   */
  getGlAccount(glAccountId: string, template: boolean = false): Observable<any> {
    const httpParams = new HttpParams().set('template', template.toString());
    return this.http.get(`/glaccounts/${glAccountId}`, { params: httpParams });
  }

  /**
   * @param {string} glAccountId GL account ID of gl account.
   * @param {any} glAccount GL account to be updated.
   * @returns {Observable<any>}
   */
  updateGlAccount(glAccountId: string, glAccount: any): Observable<any> {
    return this.http.put(`/glaccounts/${glAccountId}`, glAccount);
  }

  /**
   * @param glAccountId GL account ID of gl account to be deleted.
   * @returns {Observable<any>}
   */
  deleteGlAccount(glAccountId: string): Observable<any> {
    return this.http.delete(`/glaccounts/${glAccountId}`);
  }

  /**
   * @returns {Observable<any>} GL account closures.
   */
  getAccountingClosures(): Observable<any> {
    return this.http.get('/glclosures');
  }

  /**
   * @param {any} accountingClosure GL closure to be created.
   * @returns {Observable<any>}
   */
  createAccountingClosure(accountingClosure: any): Observable<any> {
    return this.http.post('/glclosures', accountingClosure);
  }

  /**
   * @param {string} accountingClosureId Accounting closure ID of gl closure.
   * @returns {Observable<any>} Accounting closure.
   */
  getAccountingClosure(accountingClosureId: string): Observable<any> {
    return this.http.get(`/glclosures/${accountingClosureId}`);
  }

  /**
   * @param {string} accountingClosureId Accounting closure ID of gl closure to be updated.
   * @param {any} accountingClosure Accounting closure to be updated.
   * @returns {Observable<any>}
   */
  updateAccountingClosure(accountingClosureId: string, accountingClosure: any): Observable<any> {
    return this.http.put(`/glclosures/${accountingClosureId}`, accountingClosure);
  }

  /**
   * @param {string} accountingClosureId Accounting closure ID of gl closure to be deleted.
   * @returns {Observable<any>}
   */
  deleteAccountingClosure(accountingClosureId: string): Observable<any> {
    return this.http.delete(`/glclosures/${accountingClosureId}`);
  }

  /**
   * @returns {Observable<any>} Accounting rules template.
   */
  getAccountingRulesTemplate(): Observable<any> {
    return this.http.get('/accountingrules/template');
  }

  /**
   * @param {any} accountingRule Accounting rule to be created.
   * @returns {Observable<any>}
   */
  createAccountingRule(accountingRule: any): Observable<any> {
    return this.http.post('/accountingrules', accountingRule);
  }

  /**
   * @param {string} accountingRuleId Accounting rule ID of accounting rule.
   * @returns {Observable<any>} Accounting rule.
   */
  getAccountingRule(accountingRuleId: string): Observable<any> {
    return this.http.get(`/accountingrules/${accountingRuleId}`);
  }

  /**
   * @param {string} accoutingRuleId Accounting rule ID of accounting rule to be updated.
   * @param {any} accountingRule Accounting rule to be updated.
   * @returns {Observable<any>}
   */
  updateAccountingRule(accoutingRuleId: string, accountingRule: any): Observable<any> {
    return this.http.put(`/accountingrules/${accoutingRuleId}`, accountingRule);
  }

  /**
   * @param {string} accountingRuleId Accounting rule ID of accounting rule to be deleted.
   * @returns {Observable<any>}
   */
  deleteAccountingRule(accountingRuleId: string): Observable<any> {
    return this.http.delete(`/accountingrules/${accountingRuleId}`);
  }

  /**
   * @param {any} periodicAccruals Accruals to be executed.
   * @returns {Observable<any>}
   */
  executePeriodicAccruals(periodicAccruals: any): Observable<any> {
    return this.http.post('/runaccruals', periodicAccruals);
  }

  /**
   * @returns {Observable<any>} Provisioning entries.
   */
  getProvisioningEntries(): Observable<any> {
    return this.http.get('/provisioningentries');
  }

  /**
   * @param {any} provisioningEntry Provisioning entry to be created.
   * @returns {Observable<any>}
   */
  createProvisioningEntry(provisioningEntry: any): Observable<any> {
    return this.http.post('/provisioningentries', provisioningEntry);
  }

  /**
   * @param {string} provisioningEntryId Provisioning entry ID of provisioning entry.
   * @returns {Observable<any>} Provisioning entry.
   */
  getProvisioningEntry(provisioningEntryId: string): Observable<any> {
    return this.http.get(`/provisioningentries/${provisioningEntryId}`);
  }

  /**
   * @returns {Observable<any>} Loan products data.
   */
  getLoanProducts(): Observable<any> {
    return this.http.get('/loanproducts');
  }

  /**
   * @returns {Observable<any>} Provisioning categories data.
   */
  getProvisioningCategories(): Observable<any> {
    return this.http.get('/provisioningcategory');
  }

  /**
   * @param {string} provisioningEntryId Provisioning entry ID of provisioning entry.
   * @returns {Observable<any>} Provisioning entry entries.
   */
  getProvisioningEntryEntries(provisioningEntryId: string): Observable<any> {
    const httpParams = new HttpParams().set('entryId', provisioningEntryId);
    return this.http.get('/provisioningentries/entries', { params: httpParams });
  }

  /**
   * @param {string} provisioningEntryId Provisioning entry ID of provisioning entry.
   * @returns {Observable<any>} Provisioning journal entries.
   */
  getProvisioningJournalEntries(provisioningEntryId: string): Observable<any> {
    const httpParams = new HttpParams().set('entryId', provisioningEntryId);
    return this.http.get('/journalentries/provisioning', { params: httpParams });
  }

  /**
   * @param {string} provisioningEntryId Provisioning entry ID for which journal entries need to be created.
   * @returns {Observable<any>}
   */
  createProvisioningJournalEntries(provisioningEntryId: string): Observable<any> {
    const httpParams = new HttpParams().set('command', 'createjournalentry');
    return this.http.post(`/provisioningentries/${provisioningEntryId}`, {}, { params: httpParams });
  }

  /**
   * @param {string} provisioningEntryId Provisioning entry ID for which provisioning entry needs to be recreated.
   * @returns {Observable<any>}
   */
  recreateProvisioningEntries(provisioningEntryId: string): Observable<any> {
    const httpParams = new HttpParams().set('command', 'recreateprovisioningentry');
    return this.http.post(`/provisioningentries/${provisioningEntryId}`, {}, { params: httpParams });
  }

}
