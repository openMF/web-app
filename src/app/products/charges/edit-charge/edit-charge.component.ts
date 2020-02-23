import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../products.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';
import { id } from '@swimlane/ngx-charts/release/utils';
import { AlertService } from 'app/core/alert/alert.service';
import { Alert } from 'app/core/alert/alert.model';

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
      'id': [this.chargeData.id,Validators.required],
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
     let amount=parseFloat(this.form.get('amount').value);
     let isActive=this.form.get('isActive').value;
     let isPenalty=this.form.get('isPenalty').value;
     let formObj={'name':name,active:isActive,penalty:isPenalty,'amount':amount,currencyCode:this.selectedCurrency,chargeAppliesTo:this.chargeData.chargeAppliesTo.id,chargeTimeType:this.selectedTime,chargeCalculationType:this.selectedCalculation,incomeAccountId:this.selectedIncome,chargePaymentMode:this.chargeData.chargePaymentMode.id,locale:'en'};
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
     this.selectedTime=parseInt(time);
   }


   /**
    * get selected calculation type
    */

   onChangeCalculation(calculation:any){
     this.selectedCalculation=parseInt(calculation);
   }


   /**
    * get selected income method
    */

   onChangeIncome(income:any){
     this.selectedIncome=parseInt(income);
   }

}
