import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProductsService } from 'app/products/products.service';
import { ActivatedRoute, Router } from '@angular/router';

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
/** Select Income. */
selectedIncome: any;
/** Select Time Type. */
selectedTime: any;
/** Select Currency Type. */
selectedCurrency: any;
/** Select Calculation Type. */
selectedCalculation: any;


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
      this.selectedCalculation = this.chargeData.chargeCalculationType.id;
      this.selectedCurrency = this.chargeData.currency.code;
      this.selectedIncome = 121;
      this.selectedTime = this.chargeData.chargeTimeType.id;
    });
  }

  ngOnInit() {
    this.createUserForm();
  }

  /**
   * Creates the user form.
   */
  createUserForm() {
    this.form = this.formBuilder.group({
      'name': [this.chargeData.name, Validators.required],
      'amount': [this.chargeData.amount, Validators.required],
      'isActive': [this.chargeData.active],
      'isPenalty': [this.chargeData.penalty],
    });
  }


  /**
   * submit form.
   */

  submit() {
    const name = this.form.get('name').value;
    const amount = parseFloat(this.form.get('amount').value);
    const isActive = this.form.get('isActive').value;
    const isPenalty = this.form.get('isPenalty').value;
    const formObj = {'name': name, active: isActive, penalty: isPenalty,
                    'amount': amount, currencyCode: this.selectedCurrency,
                    chargeAppliesTo: this.chargeData.chargeAppliesTo.id, chargeTimeType: this.selectedTime,
                    chargeCalculationType: this.selectedCalculation, incomeAccountId: this.selectedIncome,
                    chargePaymentMode: this.chargeData.chargePaymentMode.id, locale: 'en'};
    this.productsService.updateCharge(this.chargeData.id.toString(), formObj)
      .subscribe((response: any) => {
        this.router.navigate(['/home'], { relativeTo: this.route });
   });
  }


  /**
   * get selected currency.
   */

  onChangeCurrency(currency: any) {
    this.selectedCurrency = currency;
  }


  /**
   * get selected time type.
   */

  onChangeTime(time: any) {
    this.selectedTime = parseInt(time, 10);
  }


  /**
   * get selected calculation type.
   */

  onChangeCalculation(calculation: any) {
    this.selectedCalculation = parseInt(calculation, 10);
  }


  /**
   * get selected income method.
   */

  onChangeIncome(income: any) {
    this.selectedIncome = parseInt(income, 10);
  }

}
