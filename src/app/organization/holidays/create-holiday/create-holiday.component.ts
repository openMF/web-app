/** Angular Imports. */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';

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
  holidayForm: FormGroup;
  /** Repayment Scheduling data. */
  repaymentSchedulingTypes: any;
  /** Offices Data */
  officesData: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   * Get offices and holiday template from `Resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {DatePipe} datePipe Date Pipe.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {Router} router Router.
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private datePipe: DatePipe,
              private organizationService: OrganizationService,
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
        this.holidayForm.addControl('repaymentsRescheduledTo', new FormControl('', Validators.required));
      } else {
        this.holidayForm.removeControl('repaymentsRescheduledTo');
      }
    });
  }

  /**
   * Submits the create holiday Form.
   */
  submit() {
    const dateFormat = 'yyyy-MM-dd';
    const locale = 'en';
    this.holidayForm.patchValue({
      'fromDate': this.datePipe.transform(this.holidayForm.value.fromDate, dateFormat),
      'toDate': this.datePipe.transform(this.holidayForm.value.toDate, dateFormat),
    });
    if (this.holidayForm.contains('repaymentsRescheduledTo')) {
      this.holidayForm.patchValue({
        'repaymentsRescheduledTo': this.datePipe.transform(this.holidayForm.value.repaymentsRescheduledTo, dateFormat)
      });
    }
    const holiday = {
      ...this.holidayForm.value,
      dateFormat,
      locale
    };
    this.organizationService.createHoliday(holiday).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }

}
