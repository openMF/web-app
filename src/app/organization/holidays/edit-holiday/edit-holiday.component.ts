/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Edit Holiday component.
 */
@Component({
  selector: 'mifosx-edit-holiday',
  templateUrl: './edit-holiday.component.html',
  styleUrls: ['./edit-holiday.component.scss']
})
export class EditHolidayComponent implements OnInit {

  /** Edit Holiday form. */
  holidayForm: FormGroup;
  /** Holiday data. */
  holidayData: any;
  /** Rescheduling Type. */
  reSchedulingType: number;
  /** Is Active Holiday. */
  isActiveHoliday = true;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   * Get holiday and holiday template from `Resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dates} dateUtils Date Utils.
   * @param {OrganizationService} organizatioService Organization Service.
   * @param {Router} router Router.
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private dateUtils: Dates,
              private organizatioService: OrganizationService,
              private settingsService: SettingsService,
              private router: Router ) {
    this.route.data.subscribe((data: { holiday: any, holidayTemplate: any }) => {
      this.holidayData = data.holiday;
      this.holidayData.repaymentSchedulingTypes = data.holidayTemplate;
      this.reSchedulingType = this.holidayData.reschedulingType;
      if ( this.holidayData.status.value === 'Active' ) {
        this.isActiveHoliday = true;
      } else {
        this.isActiveHoliday = false;
      }
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setEditForm();
    if (!this.isActiveHoliday) {
      this.getReschedulingType();
    }
  }

  /**
   * Sets Edit Form.
   */
  setEditForm() {
    this.holidayForm = this.formBuilder.group({
      'name': [this.holidayData.name, Validators.required],
      'description': [this.holidayData.description]
    });
    if (!this.isActiveHoliday) {
      this.holidayForm.addControl('fromDate', new FormControl(this.holidayData.fromDate && new Date(this.holidayData.fromDate), Validators.required));
      this.holidayForm.addControl('toDate', new FormControl(this.holidayData.toDate && new Date(this.holidayData.toDate), Validators.required));
      this.holidayForm.addControl('reschedulingType', new FormControl(this.holidayData.reschedulingType, Validators.required));
      if (this.reSchedulingType === 2) {
        this.holidayForm.addControl('repaymentsRescheduledTo', new FormControl(this.holidayData.repaymentsRescheduledTo && new Date(this.holidayData.repaymentsRescheduledTo), Validators.required));
      }
    }
  }

  /**
   * Get Rescheduling Type.
   */
  getReschedulingType() {
    this.holidayForm.get('reschedulingType').valueChanges.subscribe( (option: any) => {
      this.reSchedulingType = option;
      if (option === 2) {
        this.holidayForm.addControl('repaymentsRescheduledTo', new FormControl(new Date(), Validators.required));
      } else {
        this.holidayForm.removeControl('repaymentsRescheduledTo');
      }
    });
  }

  /**
   * Submits Edit Holiday Form.
   */
  submit() {
    const holidayFormData = this.holidayForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    if (!this.isActiveHoliday) {
      if (this.reSchedulingType === 2 ) {
        const repaymentScheduledTo: Date = this.holidayForm.value.repaymentsRescheduledTo;
        holidayFormData.repaymentsRescheduledTo = this.dateUtils.formatDate(repaymentScheduledTo, dateFormat);
      }
      const prevFromDate: Date = this.holidayForm.value.fromDate;
      const prevToDate: Date = this.holidayForm.value.toDate;
      if (holidayFormData.closureDate instanceof Date) {
        holidayFormData.fromDate = this.dateUtils.formatDate(prevFromDate, dateFormat);
      }
      if (holidayFormData.closureDate instanceof Date) {
        holidayFormData.toDate = this.dateUtils.formatDate(prevToDate, dateFormat);
      }
    }
    const data = {
      ...holidayFormData,
      dateFormat,
      locale
    };
    this.organizatioService.updateHoliday(this.holidayData.id, data).subscribe(response => {
      /** TODO Add Redirects to ViewMakerCheckerTask page. */
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
