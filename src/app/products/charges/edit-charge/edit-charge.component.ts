import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'app/products/products.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'mifosx-edit-charge',
  templateUrl: './edit-charge.component.html',
  styleUrls: ['./edit-charge.component.scss']
})
export class EditChargeComponent implements OnInit {

  /** Selected Data. */
  chargeData: any;
   /** User form. */
  form: FormGroup;
  /**Select Income */
  selectedIncome:any;
  /**Select Time Type */
  selectedTime:any;
  /**Select Currency Type */
  selectedCurrency:any;
  /**Select Calculation Type */
  selectedCalculation:any;


    /**
     * Retrieves the charge data from `resolve`.
     * @param {ProductsService} productsService Products Service.
     * @param {FormBuilder} formBuilder Form Builder.
     * @param {ActivatedRoute} route Activated Route.
     * @param {Router} router Router for navigation.
     * @param {MatDialog} dialog Dialog reference.
     */

  constructor(
    private productsService: ProductsService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) { 
    this.route.data.subscribe((data: { chargesTemplate: any }) => {
      this.chargeData = data.chargesTemplate;
      this.selectedCalculation=this.chargeData.chargeCalculationType.id;
      this.selectedCurrency=this.chargeData.currency.code;
      this.selectedIncome=121;
      this.selectedTime=this.chargeData.chargeTimeType.id;
    });
  }

  ngOnInit() {
    console.log(this.chargeData)
    this.createUserForm();
  }

  /**
   * Creates the user form.
   */
  createUserForm(){
    this.form = this.formBuilder.group({
      'name': [this.chargeData.name, Validators.required],
      'amount': [this.chargeData.amount,Validators.required],
      'isActive':[this.chargeData.active],
      'isPenalty':[this.chargeData.penalty],
    });
  }


  /**
   * submit form
   */

   submit(){
    
     let name=this.form.get('name').value;
     let amount=this.form.get('amount').value;
     let isActive=this.form.get('isActive').value;
     let isPenalty=this.form.get('isPenalty').value;
     let chargeTimeObj:any=this.chargeData.chargeTimeTypeOptions.filter((x:any)=>x.id===this.selectedTime)[0];
     let currencyObj=this.chargeData.currencyOptions.filter((x:any)=>x.code===this.selectedCurrency)[0];
     let calculationObj=this.chargeData.chargeCalculationTypeOptions.filter((x:any)=>x.id===this.selectedCalculation)[0];
     let chargeIncomeObj=this.chargeData.incomeOrLiabilityAccountOptions.incomeAccountOptions.filter((x:any)=>x.id===this.selectedIncome)[0];
     let taxGroupObj=this.chargeData.taxGroup;
     let chargePaymentObj=this.chargeData.chargePaymentMode;
     let chargesApplyObj=this.chargeData.chargeAppliesTo;
     let formObj={'name':name,active:isActive,penalty:isPenalty,'amount':amount,currency:{},locale:'en'};
     console.log(formObj)
     this.productsService.updateCharge(this.chargeData.id.toString(),formObj)
     .subscribe((response: any) => {
       this.router.navigate(['/home'], { relativeTo: this.route });
   });
   }


   /**
    * get selected currency
    */

   onChangeCurrency(currency:any){
     this.selectedCurrency=currency;
   }


   /**
    * get selected time type
    */

   onChangeTime(time:any){
     this.selectedTime=time;
   }


   /**
    * get selected calculation type
    */

   onChangeCalculation(calculation:any){
     this.selectedCalculation=calculation;
   }


   /**
    * get selected income method
    */

   onChangeIncome(income:any){
     this.selectedIncome=income;
   }

}
