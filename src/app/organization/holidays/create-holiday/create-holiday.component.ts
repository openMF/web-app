/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Create holiday component.
 */
@Component({
  selector: 'mifosx-create-holiday',
  templateUrl: './create-holiday.component.html',
  styleUrls: ['./create-holiday.component.scss']
})
export class CreateHolidayComponent implements OnInit {

  /** Minimum start date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum end date allowed. */
  maxDate = new Date();
  /** Holiday form. */
  holidayForm: FormGroup;
  /** Office data. */
  officeData: any;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {DatePipe} datePipe Date Pipe to format date.
   */

  constructor(private formBuilder: FormBuilder,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  /**
  * Creates the holiday form.
  */
  ngOnInit() {
    this.createHolidayForm();
  }

  /**
  * Creates the holiday form.
  */
  createHolidayForm() {
    this.holidayForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'fromDate': ['', Validators.required],
      'toDate': ['', Validators.required],
      'repaymentSchedulingType': ['', Validators.required],
      'repaymentScheduledTo': ['', Validators.required],
      'description': ['', [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'applicableOffices': ['', Validators.required],
    });
  }

  /**
   * Submits the form and creates employee,
   * if successful redirects to holidays.
   */
  submit() {
    const prevJoiningDate: Date = this.holidayForm.value.joiningDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    this.holidayForm.patchValue({
      joiningDate: this.datePipe.transform(prevJoiningDate, dateFormat)
    });
    const holiday = this.holidayForm.value;
    holiday.locale = 'en';
    holiday.dateFormat = dateFormat;
    this.organizationService.createHoliday(holiday).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
