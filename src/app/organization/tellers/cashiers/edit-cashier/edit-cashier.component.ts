/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';

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
  editCashierForm: UntypedFormGroup;
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
   * @param {Dates} dateUtils Date Utils.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private dateUtils: Dates,
              private organizationService: OrganizationService,
              private settingsService: SettingsService ) {
    this.route.data.subscribe((data: { cashier: any, cashierTemplate: any }) => {
      this.cashierData.data = data.cashier;
      this.cashierData.template = data.cashierTemplate;
      this.isStaffId = this.cashierData.template.staffOptions.some((element: any) => element.id === this.cashierData.data.staffId);
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
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
    const editCashierFormData = this.editCashierForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevStartDate: Date = this.editCashierForm.value.startDate;
    const prevEndDate: Date = this.editCashierForm.value.endDate;
    if (editCashierFormData.startDate instanceof Date) {
      editCashierFormData.startDate = this.dateUtils.formatDate(prevStartDate, dateFormat);
    }
    if (editCashierFormData.endDate instanceof Date) {
      editCashierFormData.endDate = this.dateUtils.formatDate(prevEndDate, dateFormat);
    }
    const data = {
      ...editCashierFormData,
      staffId: this.cashierData.data.staffId,
      dateFormat,
      locale
    };
    this.organizationService.updateCashier(this.cashierData.data.tellerId, this.cashierData.data.id, data).subscribe((response: any) => {
      this.router.navigate(['../'], {relativeTo: this.route});
    });
  }

}
