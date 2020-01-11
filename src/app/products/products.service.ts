/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Products service.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @returns {Observable<any>} Loan products data
   */
  getLoanProducts(): Observable<any> {
    return this.http.get('/loanproducts');
  }

  createLoanProduct(loanProduct: string): Observable<any> {
    return this.http.post('/loanproducts', loanProduct);
  }

  getLoanProductsTemplate(): Observable<any> {
    return this.http.get('/loanproducts/template');
  }

  getLoanProduct(loanProductId: string, template: boolean = false): Observable<any> {
    const httpParams = new HttpParams().set('template', template.toString());
    return this.http.get(`/loanproducts/${loanProductId}`, { params: httpParams });
  }

  updateLoanProduct(loanProductId: string, loanProduct: any): Observable<any> {
    return this.http.put(`/loanproducts/${loanProductId}`, loanProduct);
  }

  /**
   * @returns {Observable<any>} Saving products data
   */
  getSavingProducts(): Observable<any> {
    return this.http.get('/savingsproducts');
  }

  createSavingProduct(savingProduct: string): Observable<any> {
    return this.http.post('/savingsproducts', savingProduct);
  }

  getSavingProductsTemplate(): Observable<any> {
    return this.http.get('/savingsproducts/template');
  }

  getSavingProduct(savingProductId: string, template: boolean = false): Observable<any> {
    const httpParams = new HttpParams().set('template', template.toString());
    return this.http.get(`/savingsproducts/${savingProductId}`, { params: httpParams });
  }

  updateSavingProduct(savingProductId: string, savingProduct: any): Observable<any> {
    return this.http.put(`/savingsproducts/${savingProductId}`, savingProduct);
  }

  /**
   * @returns {Observable<any>} Share products data
   */
  getShareProducts(): Observable<any> {
    return this.http.get('/products/share');
  }

  createShareProduct(shareProduct: string): Observable<any> {
    return this.http.post('/products/share', shareProduct);
  }

  getShareProductsTemplate(): Observable<any> {
    return this.http.get('/products/share/template');
  }

  getShareProduct(shareProductId: string, template: boolean = false): Observable<any> {
    const httpParams = new HttpParams().set('template', template.toString());
    return this.http.get(`/products/share/${shareProductId}`, { params: httpParams });
  }

  updateShareProduct(shareProductId: string, shareProduct: any): Observable<any> {
    return this.http.put(`/products/share/${shareProductId}`, shareProduct);
  }

  /**
   * @returns {Observable<any>} Recurring deposit products data
   */
  getRecurringDepositProducts(): Observable<any> {
    return this.http.get('/recurringdepositproducts');
  }

  /**
   * @returns {Observable<any>} Charges data
   */
  getCharges(): Observable<any> {
    return this.http.get('/charges');
  }

  /**
   * @param {string} chargeId Charge ID of charge.
   * @returns {Observable<any>} Charge.
   */
  getCharge(chargeId: string): Observable<any> {
    return this.http.get(`/charges/${chargeId}`);
  }

  /**
   * @param {string} chargeId  Charge ID of Charge to be deleted.
   * @returns {Observable<any>}
   */
  deleteCharge(chargeId: string): Observable<any> {
    return this.http.delete(`/charges/${chargeId}`);
  }

  /**
   * @returns {Observable<any>} Fixed deposit products data
   */
  getFixedDepositProducts(): Observable<any> {
    return this.http.get('/fixeddepositproducts');
  }

  createFixedDepositProduct(fixedDepositProduct: string): Observable<any> {
    return this.http.post('/fixeddepositproducts', fixedDepositProduct);
  }

  getFixedDepositProductsTemplate(): Observable<any> {
    return this.http.get('/fixeddepositproducts/template');
  }

  /**
   * @returns {Observable<any>} Tax Components data
   */
  getTaxComponents(): Observable<any> {
    return this.http.get('/taxes/component');
  }

  /**
   * @param {string} taxComponentId tax Component ID of tax Component.
   * @returns {Observable<any>} Tax Component.
   */
  getTaxComponent(taxComponentId: string): Observable<any> {
    return this.http.get(`/taxes/component/${taxComponentId}`);
  }

  /**
   * @returns {Observable<any>} Tax Groups data
   */
  getTaxGroups(): Observable<any> {
    return this.http.get('/taxes/group');
  }

  /**
   * @returns {Observable<any>} Product mixes data
   */
  getProductMixes(): Observable<any> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('associations', 'productMixes');
    return this.http.get('/loanproducts', { params: httpParams });
  }

}
