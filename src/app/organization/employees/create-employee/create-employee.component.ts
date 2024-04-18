/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

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
  employeeForm: UntypedFormGroup;
  /** Office data. */
  officeData: any;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {Dates} dateUtils Date Utils to format date.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private organizationService: OrganizationService,
              private settingsService: SettingsService,
              private route: ActivatedRoute,
              private router: Router,
              private dateUtils: Dates) {
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
    const employeeFormData = this.employeeForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevJoiningDate: Date = this.employeeForm.value.joiningDate;
    if (employeeFormData.joiningDate instanceof Date) {
      employeeFormData.joiningDate = this.dateUtils.formatDate(prevJoiningDate, dateFormat);
    }
    const data = {
      ...employeeFormData,
      dateFormat,
      locale
    };
    this.organizationService.createEmployee(data).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
