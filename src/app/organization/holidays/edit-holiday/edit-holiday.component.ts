/** Angular Imports. */
import { Component, OnInit, inject } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit Holiday component.
 */
@Component({
  selector: 'mifosx-edit-holiday',
  templateUrl: './edit-holiday.component.html',
  styleUrls: ['./edit-holiday.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class EditHolidayComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private route = inject(ActivatedRoute);
  private dateUtils = inject(Dates);
  private organizatioService = inject(OrganizationService);
  private settingsService = inject(SettingsService);
  private router = inject(Router);

  /** Edit Holiday form. */
  holidayForm: UntypedFormGroup;
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
  constructor() {
    this.route.data.subscribe((data: { holiday: any; holidayTemplate: any }) => {
      this.holidayData = data.holiday;
      this.holidayData.repaymentSchedulingTypes = data.holidayTemplate;
      this.reSchedulingType = this.holidayData.reschedulingType;
      if (this.holidayData.status.value === 'Active') {
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
      name: [
        this.holidayData.name,
        Validators.required
      ],
      description: [this.holidayData.description]
    });
    if (!this.isActiveHoliday) {
      this.holidayForm.addControl(
        'fromDate',
        new UntypedFormControl(this.holidayData.fromDate && new Date(this.holidayData.fromDate), Validators.required)
      );
      this.holidayForm.addControl(
        'toDate',
        new UntypedFormControl(this.holidayData.toDate && new Date(this.holidayData.toDate), Validators.required)
      );
      this.holidayForm.addControl(
        'reschedulingType',
        new UntypedFormControl(this.holidayData.reschedulingType, Validators.required)
      );
      if (this.reSchedulingType === 2) {
        this.holidayForm.addControl(
          'repaymentsRescheduledTo',
          new UntypedFormControl(
            this.holidayData.repaymentsRescheduledTo && new Date(this.holidayData.repaymentsRescheduledTo),
            Validators.required
          )
        );
      }
    }
  }

  /**
   * Get Rescheduling Type.
   */
  getReschedulingType() {
    this.holidayForm.get('reschedulingType').valueChanges.subscribe((option: any) => {
      this.reSchedulingType = option;
      if (option === 2) {
        this.holidayForm.addControl('repaymentsRescheduledTo', new UntypedFormControl(new Date(), Validators.required));
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
      const prevFromDate = this.holidayForm.value.fromDate;
      const prevToDate = this.holidayForm.value.toDate;

      if (prevFromDate instanceof Date) {
        holidayFormData.fromDate = this.dateUtils.formatDateAsString(prevFromDate, dateFormat);
      }
      if (prevToDate instanceof Date) {
        holidayFormData.toDate = this.dateUtils.formatDateAsString(prevToDate, dateFormat);
      }
      if (this.reSchedulingType === 2) {
        const repaymentScheduledTo = this.holidayForm.value.repaymentsRescheduledTo;
        if (repaymentScheduledTo instanceof Date) {
          holidayFormData.repaymentsRescheduledTo = this.dateUtils.formatDateAsString(repaymentScheduledTo, dateFormat);
        }
      }
    }
    const data = {
      ...holidayFormData,
      dateFormat,
      locale
    };
    this.organizatioService.updateHoliday(this.holidayData.id, data).subscribe((response) => {
      /** TODO Add Redirects to ViewMakerCheckerTask page. */
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
