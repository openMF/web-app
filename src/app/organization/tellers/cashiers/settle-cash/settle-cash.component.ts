import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrganizationService } from 'app/organization/organization.service';

@Component({
  selector: 'mifosx-settle-cash',
  templateUrl: './settle-cash.component.html',
  styleUrls: ['./settle-cash.component.scss']
})
export class SettleCashComponent implements OnInit {

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Cashier data. */
  cashierData: any;
  /** Cashier Form. */
  settleCashForm: FormGroup;

  /**
   * Get cashier data from `Resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route ActivateRoute.
   * @param {DatePipe} datePipe Date Pipe.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {Router} router Router.
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private datePipe: DatePipe,
              private organizationService: OrganizationService,
              private router: Router) {
    this.route.data.subscribe((data: { cashierTemplate: any}) => {
      this.cashierData = data.cashierTemplate;
    });
  }

  ngOnInit() {
    this.setCashierForm();
  }

  /**
   * Set Cashier form.
   */
  setCashierForm() {
    this.settleCashForm = this.formBuilder.group({
      'office': [{value: this.cashierData.officeName, disabled: true}],
      'tellerName': [{value: this.cashierData.tellerName, disabled: true}],
      'cashier': [{value: this.cashierData.cashierName, disabled: true}],
      'assignmentPeriod': [{value: this.datePipe.transform(this.cashierData.startDate, 'dd MMMM yyyy') + ' - ' + this.datePipe.transform(this.cashierData.endDate, 'dd MMMM yyyy'), disabled: true}],
      'txnDate': [new Date(), Validators.required],
      'currencyCode': ['', Validators.required],
      'txnAmount': ['', Validators.required],
      'txnNote': ['', Validators.required]
    });
  }

  /**
   * Submits Settle Cash form.
   */
  submit() {
    const dateFormat = 'dd MMMM yyyy';
    const txnDate = this.settleCashForm.value.txnDate;
    this.settleCashForm.patchValue({
      txnDate: this.datePipe.transform(txnDate, dateFormat)
    });
    const settleCashForm = this.settleCashForm.value;
    settleCashForm.dateFormat = dateFormat;
    settleCashForm.locale = 'en';
    this.organizationService.settleCash(this.cashierData.tellerId, this.cashierData.cashierId, settleCashForm).subscribe((response: any) => {
      this.router.navigate(['../'], {relativeTo: this.route});
    });
  }

}
