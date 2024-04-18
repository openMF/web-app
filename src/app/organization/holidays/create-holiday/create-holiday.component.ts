/** Angular Imports. */
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Create Holiday component.
 * TODO: Develop a custom angular checkbox tree and replace offices select.
 */
@Component({
  selector: 'mifosx-create-holiday',
  templateUrl: './create-holiday.component.html',
  styleUrls: ['./create-holiday.component.scss']
})
export class CreateHolidayComponent implements OnInit {

  /** Create Holiday form. */
  holidayForm: UntypedFormGroup;
  /** Repayment Scheduling data. */
  repaymentSchedulingTypes: any;
  /** Offices Data */
  officesData: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date(2100, 0, 1);

  /**
   * Get offices and holiday template from `Resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dates} dateUtils Date Utils.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {Router} router Router.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private dateUtils: Dates,
              private organizationService: OrganizationService,
              private settings: SettingsService,
              private router: Router ) {
    this.route.data.subscribe((data: { offices: any, holidayTemplate: any }) => {
      this.officesData = data.offices;
      this.repaymentSchedulingTypes = data.holidayTemplate;
    });
  }

  ngOnInit() {
    this.setHolidayForm();
    this.buildDependencies();
  }

  /**
   * Sets Holiday Form.
   */
  setHolidayForm() {
    this.holidayForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'fromDate': ['', Validators.required],
      'toDate': ['', Validators.required],
      'reschedulingType': ['', Validators.required],
      'description': [''],
      'offices': ['', Validators.required]
    });
  }

  /**
   * Sets the conditional controls.
   */
  buildDependencies() {
    this.holidayForm.get('reschedulingType').valueChanges.subscribe((option: any) => {
      if (option === 2) {
        this.holidayForm.addControl('repaymentsRescheduledTo', new UntypedFormControl('', Validators.required));
      } else {
        this.holidayForm.removeControl('repaymentsRescheduledTo');
      }
    });
  }

  /**
   * Submits the create holiday Form.
   */
  submit() {
    const holidayFormData = this.holidayForm.value;
    const dateFormat = this.settings.dateFormat;
    const locale = this.settings.language.code;
    const prevFromDate: Date = this.holidayForm.value.fromDate;
    const prevToDate: Date = this.holidayForm.value.toDate;
    if (holidayFormData.closureDate instanceof Date) {
      holidayFormData.fromDate = this.dateUtils.formatDate(prevFromDate, dateFormat);
    }
    if (holidayFormData.closureDate instanceof Date) {
      holidayFormData.toDate = this.dateUtils.formatDate(prevToDate, dateFormat);
    }
    if (this.holidayForm.contains('repaymentsRescheduledTo')) {
      const prevRepaymentsRescheduledTo: Date = this.holidayForm.value.repaymentsRescheduledTo;
      holidayFormData.repaymentsRescheduledTo = this.dateUtils.formatDate(prevRepaymentsRescheduledTo, dateFormat);
    }
    const data = {
      ...holidayFormData,
      dateFormat,
      locale
    };
    this.organizationService.createHoliday(data).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }

}
