/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Create Cashier component.
 */
@Component({
  selector: 'mifosx-create-cashier',
  templateUrl: './create-cashier.component.html',
  styleUrls: ['./create-cashier.component.scss']
})
export class CreateCashierComponent implements OnInit {

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Cashier Template. */
  cashierTemplate: any;
  /** Create cashier form. */
  createCashierForm: FormGroup;

  /**
   * Fetches cashier template from `resolve`
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   * @param {DatePipe} datePipe Date Pipe.
   * @param {OrganizationService} organizationService Organization Service.
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe,
              private organizationService: OrganizationService ) {
    this.route.data.subscribe((data: { cashierTemplate: any }) => {
      this.cashierTemplate = data.cashierTemplate;
    });
  }

  ngOnInit() {
    this.setCreateCashierForm();
  }

  /**
   * Sets Create Charge Form.
   */
  setCreateCashierForm() {
    this.createCashierForm = this.formBuilder.group({
      'staffId': ['', Validators.required],
      'description': [''],
      'startDate': ['', Validators.required],
      'endDate': ['', Validators.required],
      'isFullDay': [false]
    });
  }

  /**
   * Submits Create cashier form.
   */
  submit() {
    const dateFormat = 'dd MMMM yyyy';
    const startDate = this.createCashierForm.value.startDate;
    const endDate = this.createCashierForm.value.endDate;
    this.createCashierForm.patchValue({
      'startDate': this.datePipe.transform(startDate, dateFormat),
      'endDate': this.datePipe.transform(endDate, dateFormat)
    });
    const createCashierForm = this.createCashierForm.value;
    createCashierForm.locale = 'en';
    createCashierForm.dateFormat = dateFormat;
    this.organizationService.createCashier(this.cashierTemplate.tellerId, createCashierForm).subscribe((response: any) => {
      this.router.navigate(['../'], {relativeTo: this.route});
    });
  }

}
