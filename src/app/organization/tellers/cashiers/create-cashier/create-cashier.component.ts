/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';

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
  createCashierForm: UntypedFormGroup;

  /**
   * Fetches cashier template from `resolve`
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
    this.route.data.subscribe((data: { cashierTemplate: any }) => {
      this.cashierTemplate = data.cashierTemplate;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
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
    const createCashierFormData = this.createCashierForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevStartDate: Date = this.createCashierForm.value.startDate;
    const prevEndDate: Date = this.createCashierForm.value.endDate;
    if (createCashierFormData.startDate instanceof Date) {
      createCashierFormData.startDate = this.dateUtils.formatDate(prevStartDate, dateFormat);
    }
    if (createCashierFormData.endDate instanceof Date) {
      createCashierFormData.endDate = this.dateUtils.formatDate(prevEndDate, dateFormat);
    }
    const data = {
      ...createCashierFormData,
      dateFormat,
      locale
    };
    this.organizationService.createCashier(this.cashierTemplate.tellerId, data).subscribe((response: any) => {
      this.router.navigate(['../'], {relativeTo: this.route});
    });
  }

}
