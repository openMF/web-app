/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Edit Employee Component.
 */
@Component({
  selector: 'mifosx-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss']
})
export class EditEmployeeComponent implements OnInit {

  /** Employee data. */
  employeeData: any;
  /** Minimum joining date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum joining date allowed. */
  maxDate = new Date();
  /** Employee form. */
  editEmployeeForm: FormGroup;
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
    this.route.data.subscribe((data: { employee: any, offices: any  }) => {
      this.employeeData = data.employee;
      this.officeData = data.employee.allowedOffices;
    });
  }

  /**
   * Creates the edit employee form.
   */
  ngOnInit() {
    this.createEditEmployeeForm();
  }

  /**
   * Creates the employee form.
   */
  createEditEmployeeForm() {
    this.editEmployeeForm = this.formBuilder.group({
      'officeId': [this.employeeData.officeId, Validators.required],
      'firstname': [this.employeeData.firstname, [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'lastname': [this.employeeData.lastname, [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'isLoanOfficer': [this.employeeData.isLoanOfficer],
      'mobileNo': [this.employeeData.mobileNo],
      'isActive': [this.employeeData.isActive],
      'joiningDate': [this.employeeData.joiningDate  && new Date(this.employeeData.joiningDate), Validators.required]
    });
  }

  /**
   * Submits the employee form and edits employee,
   * if successful redirects to the employee edited.
   */
  submit() {
    const prevJoiningDate: Date = this.editEmployeeForm.value.joiningDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    this.editEmployeeForm.patchValue({
      joiningDate: this.datePipe.transform(prevJoiningDate, dateFormat)
    });
    const employee = this.editEmployeeForm.value;
    employee.locale = 'en';
    employee.dateFormat = dateFormat;
    this.organizationService.updateEmployee(this.employeeData.id, employee).subscribe((response: any) => {
      this.router.navigate(['../../', response.resourceId], { relativeTo: this.route });
    });
  }

}
