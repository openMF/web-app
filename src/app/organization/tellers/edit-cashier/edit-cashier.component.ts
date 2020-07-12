/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Edit Cashier component.
 */
@Component({
  selector: 'mifosx-edit-cashier',
  templateUrl: './edit-cashier.component.html',
  styleUrls: ['./edit-cashier.component.scss']
})
export class EditCashierComponent implements OnInit {

  /** Cashier Data. */
  cashierData: any = new Object();
  /** Edit cashier form. */
  editCashierForm: FormGroup;
  /** Is Staff ID present. */
  isStaffId = true;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   *
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
    this.route.data.subscribe((data: { cashier: any, cashierTemplate: any }) => {
      this.cashierData.data = data.cashier;
      this.cashierData.template = data.cashierTemplate;
      this.isStaffId = this.cashierData.template.staffOptions.some((element: any) => element.id === this.cashierData.data.staffId);
    });
  }

  ngOnInit() {
    this.setEditChargeForm();
  }

  /**
   * Sets Edit Charge Form.
   */
  setEditChargeForm() {
    this.editCashierForm = this.formBuilder.group({
      'staffId': [{value: this.cashierData.data.staffId, disabled: true}],
      'description': [this.cashierData.data.description],
      'startDate': [this.cashierData.data.startDate && new Date(this.cashierData.data.startDate), Validators.required],
      'endDate': [this.cashierData.data.endDate && new Date(this.cashierData.data.endDate), Validators.required],
      'isFullDay': [this.cashierData.data.isFullDay, Validators.required]
    });
  }

  /**
   * Submits edit cashier form.
   */
  submit() {
    const dateFormat = 'yyyy-MM-dd';
    const startDate = this.editCashierForm.value.startDate;
    const endDate = this.editCashierForm.value.endDate;
    this.editCashierForm.patchValue({
      'startDate': this.datePipe.transform(startDate, dateFormat),
      'endDate': this.datePipe.transform(endDate, dateFormat)
    });
    const editCashierForm = this.editCashierForm.value;
    editCashierForm.locale = 'en';
    editCashierForm.dateFormat = dateFormat;
    editCashierForm.staffId = this.cashierData.data.staffId;
    this.organizationService.updateCashier(this.cashierData.data.tellerId, this.cashierData.data.id, editCashierForm).subscribe((response: any) => {
      this.router.navigate(['../'], {relativeTo: this.route});
    });
  }

}
