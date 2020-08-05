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

  getDividends(shareProductId: string): Observable<any> {
    return this.http.get(`/shareproduct/${shareProductId}/dividend`);
  }

  /**
   * Create Dividend.
   * @param shareProductId Share Product Id.
   * @param dividendData Dividend Data.
   * @returns {Observable<any>}
   */
  createDividend(shareProductId: string, dividendData: any): Observable<any> {
    return this.http.post(`/shareproduct/${shareProductId}/dividend`, dividendData);
  }

  getDividendData(shareProductId: any, dividendId: any): Observable<any> {
    const httpParams = new HttpParams().set('dateFormat', 'dd MMMM yyyy')
                                        .set('limit', '10')
                                        .set('locale', 'en')
                                        .set('offset', '0');
    return this.http.get(`/shareproduct/${shareProductId}/dividend/${dividendId}`, { params: httpParams });
  }

  approveDividend(shareProductId: any, dividendId: any, data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', 'approve');
    return this.http.put(`/shareproduct/${shareProductId}/dividend/${dividendId}`, data, { params: httpParams });

  }

  /**
   * @returns {Observable<any>} Recurring deposit products data
   */
  getRecurringDepositProducts(): Observable<any> {
    return this.http.get('/recurringdepositproducts');
  }

  /**
   * @param {string} recurringDepositProductId Product Id of recurring Deposit
   * @param {boolean} template Template
   * @return {Observable<any>} Recurring Deposit Product Details
   */
  getRecurringDepositProduct(recurringDepositProductId: string, template: boolean = false): Observable<any> {
    const httpParams = new HttpParams().set('template', template.toString());
    return this.http.get(`/recurringdepositproducts/${recurringDepositProductId}`, { params: httpParams });
  }

  getRecurringDepositProductsTemplate(): Observable<any> {
    return this.http.get('/recurringdepositproducts/template');
  }

  /**
   * @returns {Observable<any>} Charges data.
   */
  getCharges(): Observable<any> {
    return this.http.get('/charges');
  }

  getChargesTemplate(): Observable<any> {
    return this.http.get('/charges/template');
  }

  /**
   * @param {string} chargeId Charge ID of charge.
   * @returns {Observable<any>} Charge.
   */
  getCharge(selectedCharge: string, template: boolean = false): Observable<any> {
    const httpParams = new HttpParams().set('template', template.toString());
    return this.http.get(`/charges/${selectedCharge}`, { params: httpParams });
  }

  /**
   * @param chargeId Charge Id to be updated.
   * @param charges  Charge Data to be updated.
   */
  updateCharge(chargeId: string, charges: any): Observable<any> {
    return this.http.put(`/charges/${chargeId}`, charges);
  }

  /**
   * @param {string} chargeId  Charge ID of Charge to be deleted.
   * @returns {Observable<any>}
   */
  deleteCharge(chargeId: string): Observable<any> {
    return this.http.delete(`/charges/${chargeId}`);
  }

  /**
   * @param {any} charge Charge to be created.
   * @returns {Observable<any>}
   */
  createCharge(charge: any): Observable<any> {
    return this.http.post('/charges', charge);
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
   * @param {string} fixedDepositProductId fixed deposit product ID of fixed deposit product.
   * @returns {Observable<any>} Fixed deposit product.
   */
  getFixedDepositProduct(fixedDepositProductId: string): Observable<any> {
    return this.http.get(`/fixeddepositproducts/${fixedDepositProductId}`);
  }

  getFixedDepositProductAndTemplate(fixedDepositProductId: any) {
    const httpParams = new HttpParams().set('template', 'true');
    return this.http.get(`/fixeddepositproducts/${fixedDepositProductId}`, { params: httpParams });
  }

  updateFixedDepositProduct(fixedDepositProductId: any, fixedDepositProduct: any): Observable<any> {
    return this.http.put(`/fixeddepositproducts/${fixedDepositProductId}`, fixedDepositProduct);
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
   * @returns {Observable<any>} Tax Components Template data.
   */
  getTaxComponentTemplate(): Observable<any> {
    return this.http.get('/taxes/component/template');
  }

  /**
   * @param {any} taxComponent Tax Component to be created.
   * @returns {Observable<any>}
   */
  createTaxComponent(taxComponent: any): Observable<any> {
    return this.http.post('/taxes/component', taxComponent);
  }

  /*
   * @param {string} taxComponentId tax Component ID of tax Component to be edited.
   * @returns {Observable<any>}
   */
  updateTaxComponent(taxComponentId: string, taxComponent: any): Observable<any> {
    return this.http.put(`/taxes/component/${taxComponentId}`, taxComponent);
  }

  /**
   * @returns {Observable<any>} Tax Groups data
   */
  getTaxGroups(): Observable<any> {
    return this.http.get('/taxes/group');
  }

  /**
   * @param {string} taxGroupId Tax Component ID of Tax Component.
   * @param {string} template Template
   * @returns {Observable<any>} Tax Component.
   */
  getTaxGroup(taxGroupId: string, template: string): Observable<any> {
    const httpParams = new HttpParams().set('template', template);
    return this.http.get(`/taxes/group/${taxGroupId}`, { params: httpParams });
  }

  /**
   * @returns {Observable<any>} Tax Group Template
   */
  getTaxGroupTemplate(): Observable<any> {
    return this.http.get('/taxes/group/template');
  }

  /**
   * @param {any} taxGroup Tax Group
   * @returns {Observable<any>} Tax Group Resource Id
   */
  createTaxGroup(taxGroup: any): Observable<any> {
    return this.http.post('/taxes/group', taxGroup);
  }

  /**
   * @param {any} taxGroupId Tax Group ID
   * @param {any} taxGroup Tax Group
   * @returns {Observable<any>} Changes in the Tax Group
   */
  updateTaxGroup(taxGroupId: any, taxGroup: any): Observable<any> {
    return this.http.put(`/taxes/group/${taxGroupId}`, taxGroup);
  }

  /**
   * @returns {Observable<any>} Product mixes data
   */
  getProductMixes(): Observable<any> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('associations', 'productMixes');
    return this.http.get('/loanproducts', { params: httpParams });
  }

  /**
   * @returns {Observable<any>} Floating Rates data.
   */
  getFloatingRates(): Observable<any> {
    return this.http.get('/floatingrates');
  }

  /**
   * @param {any} floatingRate Floating Rate.
   * @returns {Observable<any>}
   */
  createFloatingRate(floatingRate: any): Observable<any> {
    return this.http.post('/floatingrates', floatingRate);
  }

  /**
   * @param {string} floatingRateId Floating Rate ID.
   * @returns {Observable<any>}
   */
  getFloatingRate(floatingRateId: string): Observable<any> {
    return this.http.get(`/floatingrates/${floatingRateId}`);
  }

  /**
   * @param {string} floatingRateId Floating Rate ID.
   * @param {any} floatingRate Changes in Floating Rate.
   * @returns {Observable<any>}
   */
  updateFloatingRate(floatingRateId: string, floatingRate: any): Observable<any> {
    return this.http.put(`/floatingrates/${floatingRateId}`, floatingRate);
  }

  /**
   * @param {string} productId Id of the product.
   * @returns {Observable<any>} Product.
   */
  getProductMix(productId: string): Observable<any> {
    return this.http.get(`/loanproducts/${productId}/productmix`);
  }

  /*
   * @returns {Observable<any>} Products mix Template data
   */
  getProductsMixTemplate(): Observable<any> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('isProductMixTemplate', 'true');
    return this.http.get('/loanproducts/template', { params: httpParams });
  }

  /**
   * @param {string} productMixId product mix ID of product mix.
   * @returns {Observable<any>} Product mix Template data
   */
  getProductMixTemplate(productMixId: string): Observable<any> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('template', 'true');
    return this.http.get(`/loanproducts/${productMixId}/productmix`, { params: httpParams });
  }

  /**
   * @param {string} productMixId product mix ID of product mix.
   * @param {any} productMix Product mix to be created.
   * @returns {Observable<any>}
   */
  createProductMix(productMix: any, productMixId: string): Observable<any> {
    return this.http.post(`/loanproducts/${productMixId}/productmix`, productMix);
  }

  /**
   * @param {string} productMixId product mix ID of product mix.
   * @param {any} productMix Product mix to be updaated.
   * @returns {Observable<any>}
   */
  updateProductMix(productMix: any, productMixId: string): Observable<any> {
    return this.http.put(`/loanproducts/${productMixId}/productmix`, productMix);
  }

  /**
   * @param {string} productMixId product mix ID of product mix.
   * @returns {Observable<any>}
   */
  deleteProductMix(productMixId: string): Observable<any> {
    return this.http.delete(`/loanproducts/${productMixId}/productmix`);
  }

  /*
   * @param {string} productId Product ID
   * @returns {Observable<any>}
   */
  getAllInterestRateCharts(productId: string): Observable<any> {
    const httpParams = new HttpParams().set('productId', productId);
    return this.http.get(`/interestratecharts`, {params: httpParams});
  }

  createRecurringDepositProduct(recurringDepositProduct: any): Observable<any> {
    return this.http.post('/recurringdepositproducts', recurringDepositProduct);
  }

  getRecurringDepositProductAndTemplate(recurringDepositProductId: any) {
    const httpParams = new HttpParams().set('template', 'true');
    return this.http.get(`/recurringdepositproducts/${recurringDepositProductId}`, { params: httpParams });
  }

  updateRecurringDepositProduct(recurringDepositProductId: any, recurringDepositProduct: any): Observable<any> {
    return this.http.put(`/recurringdepositproducts/${recurringDepositProductId}`, recurringDepositProduct);
  }

}
