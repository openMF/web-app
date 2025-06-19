/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Edit Employee Component.
 */
@Component({
  selector: 'mifosx-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    NgFor,
    MatOption,
    NgIf,
    MatError,
    MatInput,
    MatCheckbox,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
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
  constructor(
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private settingsService: SettingsService,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates
  ) {
    this.route.data.subscribe((data: { employee: any; offices: any }) => {
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
      officeId: [
        this.employeeData.officeId,
        Validators.required
      ],
      firstname: [
        this.employeeData.firstname,
        [
          Validators.required,
          Validators.pattern('(^[A-z]).*')]
      ],
      lastname: [
        this.employeeData.lastname,
        [
          Validators.required,
          Validators.pattern('(^[A-z]).*')]
      ],
      isLoanOfficer: [this.employeeData.isLoanOfficer],
      mobileNo: [this.employeeData.mobileNo],
      isActive: [this.employeeData.isActive],
      joiningDate: [
        this.employeeData.joiningDate && new Date(this.employeeData.joiningDate),
        Validators.required
      ]
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
      this.router.navigate(
        [
          '../../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }
}
