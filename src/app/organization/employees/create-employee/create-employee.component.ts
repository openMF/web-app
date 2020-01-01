/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Create employee component.
 */
@Component({
  selector: 'mifosx-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.scss']
})
export class CreateEmployeeComponent implements OnInit {

  /** Minimum joining date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum joining date allowed. */
  maxDate = new Date();
  /** Employee form. */
  employeeForm: FormGroup;
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
   * Creates the employee form.
   */
  ngOnInit() {
    this.createEmployeeForm();
  }

  /**
   * Creates the employee form.
   */
  createEmployeeForm() {
    this.employeeForm = this.formBuilder.group({
      'officeId': ['', Validators.required],
      'firstname': ['', [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'lastname': ['', [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'isLoanOfficer': [false],
      'mobileNo': [''],
      'joiningDate': ['', Validators.required],
    });
  }

  /**
   * Submits the employee form and creates employee,
   * if successful redirects to employees.
   */
  submit() {
    const prevJoiningDate: Date = this.employeeForm.value.joiningDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    this.employeeForm.patchValue({
      joiningDate: this.datePipe.transform(prevJoiningDate, dateFormat)
    });
    const employee = this.employeeForm.value;
    employee.locale = 'en';
    employee.dateFormat = dateFormat;
    this.organizationService.createEmployee(employee).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
