/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit Employee Component.
 */
@Component({
  selector: 'mifosx-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditEmployeeComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private organizationService = inject(OrganizationService);
  private destroyRef = inject(DestroyRef);
  private settingsService = inject(SettingsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dateUtils = inject(Dates);

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

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { employee: any; offices: any }) => {
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
          Validators.pattern('(^[A-z]).*')
        ]
      ],
      lastname: [
        this.employeeData.lastname,
        [
          Validators.required,
          Validators.pattern('(^[A-z]).*')
        ]
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
    this.organizationService
      .updateEmployee(this.employeeData.id, data)
      .pipe(take(1))
      .subscribe((response: any) => {
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
