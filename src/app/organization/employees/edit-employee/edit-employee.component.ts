/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

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
  editEmployeeForm: UntypedFormGroup;
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
    this.route.data.subscribe((data: { employee: any, offices: any  }) => {
      this.employeeData = data.employee;
      this.officeData = data.employee.allowedOffices;
    });
  }

  /**
   * Creates the edit employee form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
    const editEmployeeFormData = this.editEmployeeForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevJoiningDate: Date = this.editEmployeeForm.value.joiningDate;
    if (editEmployeeFormData.joiningDate instanceof Date) {
      editEmployeeFormData.joiningDate = this.dateUtils.formatDate(prevJoiningDate, dateFormat);
    }
    const data = {
      ...editEmployeeFormData,
      dateFormat,
      locale
    };
    this.organizationService.updateEmployee(this.employeeData.id, data).subscribe((response: any) => {
      this.router.navigate(['../../', response.resourceId], { relativeTo: this.route });
    });
  }

}
